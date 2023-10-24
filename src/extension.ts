import { LanguageClient, ServerOptions, LanguageClientOptions, StreamInfo } from 'vscode-languageclient'

import * as vscode from 'vscode'
import { join } from 'path'
import * as net from 'net'

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

export function activate(context: vscode.ExtensionContext): void {
    const workspaceConfig = vscode.workspace.getConfiguration()
    const config = workspaceConfig.get<PhpactorConfig>('phpactor') || <PhpactorConfig>{}
    const enable = config.enable

    if (!config.path) {
        config.path = context.asAbsolutePath(join('vendor', 'phpactor', 'phpactor', 'bin', 'phpactor'))
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
    languageClient.start()
}

export function deactivate(): Promise<void> | undefined {
    if (!languageClient) {
        return undefined
    }
    return languageClient.stop()
}

function getServerOptions(config: PhpactorConfig): ServerOptions {
    let serverOptions
    if (!config.remote.enabled) {
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
    if (!languageClient) {
        return
    }

    void languageClient.sendRequest('indexer/reindex')
}

async function dumpConfig(): Promise<void> {
    if (!languageClient) {
        return
    }

    const channel = vscode.window.createOutputChannel('Phpactor Config')
    const result = await languageClient.sendRequest<string>('phpactor/debug/config', { return: true })
    channel.append(result)
    channel.show()
}

function servicesList(): void {
    if (!languageClient) {
        return
    }

    void languageClient.sendRequest('service/running')
}

async function status(): Promise<void> {
    if (!languageClient) {
        return
    }

    const channel = vscode.window.createOutputChannel('Phpactor Status')
    const result = await languageClient.sendRequest<string>('phpactor/status')
    channel.append(result)
    channel.show()
}
