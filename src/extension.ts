import { LanguageClient, ServerOptions, LanguageClientOptions, StreamInfo } from 'vscode-languageclient'

import * as vscode from 'vscode'
import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import * as net from 'net'

const LanguageID = 'php'

let languageClient: LanguageClient

interface PhpactorConfig {
    path?: string
    enable: boolean
    config: any
    remote: {
        enabled: boolean
        host: string
        port: number
    }
    launchServerArgs: string[]
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const workspaceConfig = vscode.workspace.getConfiguration()
    const config = workspaceConfig.get<PhpactorConfig>('phpactor')!
    const enable = config.enable

    if (!config.path) {
        config.path = await installPhpactor(context.globalStoragePath)
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
        serverOptions = {
            run: {
                command: config.path!,
                args: ['language-server', ...config.launchServerArgs],
            },
            debug: {
                command: 'phpactor',
                args: ['language-server', ...config.launchServerArgs],
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
    const updateConfig = { cwd: dirname(dirname(config.path!)) }
    vscode.commands.registerCommand('phpactor.update', updatePhpactor, updateConfig)

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

async function status(): Promise<any> {
    if (!languageClient) {
        return
    }

    const channel = vscode.window.createOutputChannel('Phpactor Status')
    const result = await languageClient.sendRequest<string>('phpactor/status')
    channel.append(result)
    channel.show()
}

async function installPhpactor(storagePath: string): Promise<string> {
    if (!existsSync(storagePath)) {
        mkdirSync(storagePath)
    }

    const path = `${storagePath}/phpactor`

    if (!existsSync(path)) {
        const channel = vscode.window.createOutputChannel('Phpactor Installation')
        void vscode.window.showInformationMessage('Installing Phpactor')
        await exec(channel, 'git', ['clone', 'https://github.com/phpactor/phpactor', '--depth=1'], storagePath)
        await exec(channel, 'composer', ['install', '--no-dev'], path)
        void vscode.window.showInformationMessage(`Phpactor installed at ${path}`)
    }

    return `${storagePath}/phpactor/bin/phpactor`
}

export async function updatePhpactor(this: { cwd: string }): Promise<void> {
    const channel = vscode.window.createOutputChannel('Phpactor Update')
    channel.appendLine(this.cwd)
    await exec(channel, 'git', ['pull'], this.cwd)
    await exec(channel, 'composer', ['install', '--no-dev'], this.cwd)
    channel.appendLine('Phpactor updated')
    void vscode.window.showInformationMessage('Phpactor updated')
}

function exec(channel: vscode.OutputChannel, command: string, args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            timeout: 30000,
        })
        child.stdout.on('data', (data: Buffer) => {
            channel.append(data.toString('utf8'))
        })
        child.stderr.on('data', (data: Buffer) => {
            channel.append(data.toString('utf8'))
        })
        child.on('close', code => {
            if (code !== 0) {
                reject(`Expected git to exit with code 0 got "${code}"`)
            }
            resolve()
        })

        child.on('error', err => {
            reject(err)
        })
    })
}
