import * as path from 'path'

import { runTests } from '@vscode/test-electron'

async function main(): Promise<void> {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = path.resolve(__dirname, '../../')

        // The path to the extension test script
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './suite/index')

        // Download VS Code, unzip it and run the integration test
        await runTests({ extensionDevelopmentPath, extensionTestsPath })
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // tslint:disable-next-line: no-console
        console.error('Failed to run tests')
        process.exit(1)
    }
}

void main()
