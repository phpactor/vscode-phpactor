import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'

suite('Extension Test Suite', () => {
    test('Extension is present', () => {
        assert.ok(vscode.extensions.getExtension('dantleech.vscode-phpactor'))
    })
    test('Extension activates', async () => {
        await vscode.extensions.getExtension('dantleech.vscode-phpactor')?.activate()
    })
})
