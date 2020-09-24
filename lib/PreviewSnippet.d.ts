import { WidgetTracker } from '@jupyterlab/apputils';
import { CodeEditor, IEditorServices } from '@jupyterlab/codeeditor';
import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
import { ICodeSnippet } from './CodeSnippetContentsService';
/**
 * Create and show a preview.
 *
 * @param options - The preview setup options.
 *
 */
export declare function showPreview<T>(options: Partial<Preview.IOptions<T>>, editorServices: IEditorServices): Promise<void>;
/**
 * A widget used to show preview
 */
export declare class Preview<T> extends Widget {
    ready: boolean;
    _title: string;
    _id: number;
    editor: CodeEditor.IEditor;
    codeSnippet: ICodeSnippet;
    editorServices: IEditorServices;
    private _hasRefreshedSinceAttach;
    constructor(options: Partial<Preview.IOptions<T>>, editorServices: IEditorServices);
    /**
     * Launch the preview as a modal window.
     */
    launch(): Promise<void>;
    /**
     * Reject the current preview with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the preview is not shown.
     */
    reject(): void;
    /**
     * Resolve a button item.
     */
    private _resolve;
    /**
     * Dispose of the resources used by the preview.
     */
    dispose(): void;
    /**
     *  A message handler invoked on an `'after-attach'` message.
     */
    protected onAfterAttach(msg: Message): void;
    onAfterShow(msg: Message): void;
    onUpdateRequest(msg: Message): void;
    private _promise;
}
export declare namespace Preview {
    /**
     * The body input types.
     */
    type Body = Widget;
    interface IOptions<T> {
        title: string;
        id: number;
        /**
         * The main body element for the preview or a message to display.
         * Defaults to an empty string.
         *
         * #### Notes
         * If a widget is given as the body, it will be disposed after the
         * preview is resolved.  If the widget has a `getValue()` method,
         * the method will be called prior to disposal and the value
         * will be provided as part of the preview result.
         * A string argument will be used as raw `textContent`.
         * All `input` and `select` nodes will be wrapped and styled.
         */
        body: Body;
        codeSnippet: ICodeSnippet;
    }
    interface IRenderer {
        /**
         * Create the body of the preview.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(body: Body): Widget;
    }
    class Renderer {
        /**
         * Create the body of the preview.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(value: Body): Widget;
    }
    /**
     * The default renderer instance.
     */
    const defaultRenderer: Renderer;
    /**
     * The preview widget tracker.
     */
    const tracker: WidgetTracker<Preview<any>>;
}
