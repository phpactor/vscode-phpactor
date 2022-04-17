import {
    LanguageClient,
    ServerOptions,
    LanguageClientOptions,
} from "vscode-languageclient";

import * as vscode from "vscode";

const LanguageID = 'php';

let languageClient: LanguageClient;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    let workspaceConfig = vscode.workspace.getConfiguration();
    const config = workspaceConfig.get("phpactor") as any;
    const enable = config.enable;

    if (enable === false) return;

    languageClient = createClient(config);

    languageClient.start();
}

export function deactivate() {
	if (!languageClient) {
		return undefined;
	}
	return languageClient.stop();
}

function createClient(config: any): LanguageClient {
    let serverOptions: ServerOptions = {
        run: {
            command: config.path,
            args: [
                "language-server"
            ]
        },
        debug: {
            command: "phpactor",
            args: [
                "language-server"
            ]
        },
    };

    let clientOptions: LanguageClientOptions = {
        documentSelector: [
            { language: LanguageID, scheme: 'file' },
            { language: LanguageID, scheme: 'untitled' }
        ],
        initializationOptions: config.config
    };

    languageClient = new LanguageClient(
        "phpactor",
        "Phpactor Language Server",
        serverOptions,
        clientOptions
    );


    vscode.commands.registerCommand('phpactor.reindex', reindex);
    vscode.commands.registerCommand('phpactor.config.dump', dumpConfig);
    vscode.commands.registerCommand('phpactor.services.list', servicesList);
    vscode.commands.registerCommand('phpactor.status', status, vscode);

    return languageClient;
}

function reindex(): void {
	if(!languageClient) {
		return;
    }

    languageClient.sendRequest('indexer/reindex');
}

async function dumpConfig(): Promise<void> {
	if(!languageClient) {
		return;
    }

    const channel = vscode.window.createOutputChannel('Phpactor Config')
    const result = await languageClient.sendRequest<string>('phpactor/debug/config', {return: true});
    channel.append(result)
    channel.show()
}

function servicesList(): void {
	if(!languageClient) {
		return;
    }

    languageClient.sendRequest('service/running');
}

async function status(): Promise<any> {
	if(!languageClient) {
		return;
    }

    const channel = vscode.window.createOutputChannel('Phpactor Status')
    const result = await languageClient.sendRequest<string>('phpactor/status');
    channel.append(result)
    channel.show()
}
