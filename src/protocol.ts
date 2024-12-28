/* eslint @typescript-eslint/no-empty-object-type: 0 */
/* eslint @typescript-eslint/no-namespace: 0 */
import { Range } from 'vscode'
// import { Range } from 'vscode-languageserver-types'
import { ProtocolRequestType } from 'vscode-languageserver-protocol/lib/messages'
import {
    TextDocumentPositionParams,
    TextDocumentRegistrationOptions,
    WorkDoneProgressOptions,
    WorkDoneProgressParams,
} from 'vscode-languageclient'

interface EvaluatableExpression {
    expression?: string
    range: Range
}

export interface EvaluatableExpressionOptions extends WorkDoneProgressOptions {}

interface EvaluatableExpressionParams extends TextDocumentPositionParams, WorkDoneProgressParams {}

interface EvaluatableExpressionRegistrationOptions
    extends TextDocumentRegistrationOptions,
        EvaluatableExpressionOptions {}

export namespace EvaluatableExpressionRequest {
    export const method = 'textDocument/xevaluatableExpression'
    export const type = new ProtocolRequestType<
        EvaluatableExpressionParams,
        EvaluatableExpression | null,
        never,
        void,
        EvaluatableExpressionRegistrationOptions
    >(method)
}
