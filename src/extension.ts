import { LanguageClient, ServerOptions, LanguageClientOptions, StreamInfo } from 'vscode-languageclient/node'
import { EvaluatableExpressionRequest } from './protocol'

import { spawn } from 'child_process'

import * as vscode from 'vscode'
import { join } from 'path'
import * as net from 'net'
import * as fs from 'fs'

const LanguageID = 'php'

let languageClient: LanguageClient

interface PhpactorConfig {
    path: string
    executablePath: string
    enable: boolean
    config: object
    remote: {
        enabled: boolean
        host: string
        port: number
    }
    launchServerArgs: string[]
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    if (!checkPlatform()) {
        return
    }

    const workspaceConfig = vscode.workspace.getConfiguration()
    const config = workspaceConfig.get<PhpactorConfig>('phpactor') || <PhpactorConfig>{}
    const enable = config.enable

    if (!config.path) {
        config.path = context.asAbsolutePath(join('vendor', 'phpactor', 'phpactor', 'bin', 'phpactor'))
        if (!fs.existsSync(config.path)) {
            config.path = context.asAbsolutePath(join('phpactor.phar'))
        }
    }

    if (!config.executablePath) {
        const phpConfig = vscode.workspace.getConfiguration('php')
        config.executablePath =
            phpConfig.get<string>('executablePath') ||
            phpConfig.get<string>('validate.executablePath') ||
            (process.platform === 'win32' ? 'php.exe' : 'php')
    }

    if (enable === false) return

    languageClient = createClient(config)
    await languageClient.start()

    context.subscriptions.push(
        vscode.languages.registerEvaluatableExpressionProvider('php', {
            async provideEvaluatableExpression(
                document: vscode.TextDocument,
                position: vscode.Position,
                token: vscode.CancellationToken
            ): Promise<vscode.EvaluatableExpression | undefined> {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (languageClient.initializeResult?.capabilities.experimental?.xevaluatableExpressionProvider) {
                    const eer = await languageClient.sendRequest(
                        EvaluatableExpressionRequest.type,
                        languageClient.code2ProtocolConverter.asTextDocumentPositionParams(document, position),
                        token
                    )
                    if (eer && eer.expression) {
                        return new vscode.EvaluatableExpression(eer.range, eer.expression)
                    }
                }
                return undefined
            },
        })
    )
}

export function deactivate(): Promise<void> | undefined {
    if (!languageClient) {
        return undefined
    }
    return languageClient.stop()
}

function checkPlatform(): boolean {
    if (process.platform === 'win32') {
        void vscode.window.showWarningMessage('Phpactor support on Windows is experimental.')
    }
    return true
}

function getServerOptions(config: PhpactorConfig): ServerOptions {
    let serverOptions
    if (!config.remote.enabled && process.platform === 'win32') {
        // PHP on windows has problems with STDIO so we need special handling
        serverOptions = getWindowsServerOptions(config)
    } else if (!config.remote.enabled) {
        // launch language server via stdio
        serverOptions = <ServerOptions>{
            run: {
                command: config.executablePath,
                args: [config.path, 'language-server', ...config.launchServerArgs],
            },
            debug: {
                command: config.executablePath,
                args: ['-dxdebug.start_with_request=1', config.path, 'language-server', ...config.launchServerArgs],
                options: {
                    env: {
                        ...process.env,
                        XDEBUG_MODE: 'debug',
                        PHPACTOR_ALLOW_XDEBUG: '1',
                    },
                },
            },
        }
    } else {
        // credits: https://github.com/itemis/xtext-languageserver-example/blob/master/vscode-extension/src/extension.ts
        // launch language server via socket
        serverOptions = () => {
            const { host, port } = config.remote
            const socket = net.connect({
                host,
                port,
            })

            const result = <StreamInfo>{
                writer: socket,
                reader: socket,
            }

            return Promise.resolve(result)
        }
    }

    return serverOptions
}

function getWindowsServerOptions(config: PhpactorConfig): ServerOptions {
    // Find a free port, start PHPActor and connect to it
    const serverOptions = async () => {
        const findPort = new Promise<number>(resolve => {
            const server = net.createServer()
            server.listen(0, '127.0.0.1', () => {
                const freePort = (server.address()! as net.AddressInfo).port
                server.close()
                resolve(freePort)
            })
        })

        const freePort = await findPort

        const startServer = new Promise<void>((resolve, reject) => {
            const childProcess = spawn(
                config.executablePath,
                [config.path, 'language-server', `--address=127.0.0.1:${freePort}`, ...config.launchServerArgs],

                {
                    env: {
                        ...process.env,
                        XDEBUG_MODE: 'debug',
                        PHPACTOR_ALLOW_XDEBUG: '1',
                    },
                }
            )

            childProcess.stderr.on('data', (chunk: Buffer) => {
                const str = chunk.toString()
                languageClient.outputChannel.appendLine(str)

                // when we get the first line, the server is running
                resolve()
            })
            childProcess.on('exit', (code, signal) => {
                languageClient.outputChannel.appendLine(
                    `Language server exited ` + (signal ? `from signal ${signal}` : `with exit code ${code}`)
                )
                if (code !== 0) {
                    languageClient.outputChannel.show()
                }

                reject(new Error('Language Server exited'))
            })
        })

        await startServer

        const socket = net.connect({
            host: '127.0.0.1',
            port: freePort,
        })

        const result = <StreamInfo>{
            writer: socket,
            reader: socket,
        }

        return result
    }

    return serverOptions
}

function createClient(config: PhpactorConfig): LanguageClient {
    const serverOptions = getServerOptions(config)

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { language: LanguageID, scheme: 'file' },
            { language: 'blade', scheme: 'file' },
            { language: LanguageID, scheme: 'untitled' },
        ],
        initializationOptions: config.config,
    }

    languageClient = new LanguageClient('phpactor', 'Phpactor Language Server', serverOptions, clientOptions)

    vscode.commands.registerCommand('phpactor.reindex', reindex)
    vscode.commands.registerCommand('phpactor.config.dump', dumpConfig)
    vscode.commands.registerCommand('phpactor.services.list', servicesList)
    vscode.commands.registerCommand('phpactor.status', status)

    return languageClient
}

function reindex(): void {
    if (!checkPlatform() || !languageClient) {
        return
    }

    void languageClient.sendRequest('indexer/reindex')
}

async function dumpConfig(): Promise<void> {
    if (!checkPlatform() || !languageClient) {
        return
    }

    const channel = vscode.window.createOutputChannel('Phpactor Config')
    const result = await languageClient.sendRequest<string>('phpactor/debug/config', { return: true })
    channel.append(result)
    channel.show()
}

function servicesList(): void {
    if (!checkPlatform() || !languageClient) {
        return
    }

    void languageClient.sendRequest('service/running')
}

async function status(): Promise<void> {
    if (!checkPlatform() || !languageClient) {
        return
    }

    const channel = vscode.window.createOutputChannel('Phpactor Status')
    const result = await languageClient.sendRequest<string>('phpactor/status')
    channel.append(result)
    channel.show()
}
