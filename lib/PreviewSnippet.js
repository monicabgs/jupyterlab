import { WidgetTracker, ReactWidget } from '@jupyterlab/apputils';
import { CodeEditor } from '@jupyterlab/codeeditor';
import { Widget, PanelLayout, Panel } from '@lumino/widgets';
import { MessageLoop } from '@lumino/messaging';
import { PromiseDelegate } from '@lumino/coreutils';
import { ArrayExt } from '@lumino/algorithm';
/**
 * The class name for preview box
 */
const PREVIEW_CLASS = 'jp-codeSnippet-preview';
const PREVIEW_CONTENT = 'jp-codeSnippet-preview-content';
const PREVIEW_BODY = 'jp-codeSnippet-preview-body';
/**
 * Create and show a preview.
 *
 * @param options - The preview setup options.
 *
 */
export function showPreview(options = {}, editorServices) {
    //Insert check method to see if the preview is already open
    const preview = new Preview(options, editorServices);
    if (preview.ready === false) {
        return;
    }
    return preview.launch();
}
/**
 * A widget used to show preview
 */
export class Preview extends Widget {
    constructor(options = {}, editorServices) {
        super();
        this.ready = true;
        this._title = options.title;
        this._id = options.id;
        this.codeSnippet = options.codeSnippet;
        this.editorServices = editorServices;
        this.addClass(PREVIEW_CLASS);
        const layout = (this.layout = new PanelLayout());
        const content = new Panel();
        content.addClass(PREVIEW_CONTENT);
        content.id = PREVIEW_CONTENT + this._id;
        layout.addWidget(content);
        if (Preview.tracker.size > 0) {
            const previous = Preview.tracker.currentWidget;
            previous.reject();
            Preview.tracker.dispose();
        }
        if (this.ready === true) {
            void Preview.tracker.add(this);
        }
    }
    /**
     * Launch the preview as a modal window.
     */
    launch() {
        // Return the existing preview if already open.
        if (this._promise) {
            return this._promise.promise;
        }
        const promise = (this._promise = new PromiseDelegate());
        const promises = Promise.all(Private.launchQueue);
        Private.launchQueue.push(this._promise.promise);
        return promises.then(() => {
            Widget.attach(this, document.getElementById('jp-main-dock-panel'));
            return promise.promise;
        });
    }
    /**
     * Reject the current preview with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the preview is not shown.
     */
    reject() {
        if (!this._promise) {
            return;
        }
        this._resolve();
    }
    /**
     * Resolve a button item.
     */
    _resolve() {
        // Prevent loopback.
        const promise = this._promise;
        if (!promise) {
            this.dispose();
            return;
        }
        this._promise = null;
        ArrayExt.removeFirstOf(Private.launchQueue, promise.promise);
        this.dispose();
        promise.resolve();
    }
    /**
     * Dispose of the resources used by the preview.
     */
    dispose() {
        const promise = this._promise;
        if (promise) {
            this._promise = null;
            promise.reject(void 0);
            ArrayExt.removeFirstOf(Private.launchQueue, promise.promise);
        }
        super.dispose();
    }
    /**
     *  A message handler invoked on an `'after-attach'` message.
     */
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        this._hasRefreshedSinceAttach = false;
        if (this.isVisible) {
            this.update();
        }
    }
    onAfterShow(msg) {
        if (!this._hasRefreshedSinceAttach) {
            this.update();
        }
    }
    onUpdateRequest(msg) {
        super.onUpdateRequest(msg);
        if (!this.editor && document.getElementById(PREVIEW_CONTENT + this._id)) {
            const editorFactory = this.editorServices.factoryService.newInlineEditor;
            const getMimeTypeByLanguage = this.editorServices.mimeTypeService
                .getMimeTypeByLanguage;
            this.editor = editorFactory({
                host: document.getElementById(PREVIEW_CONTENT + this._id),
                config: { readOnly: true, fontSize: 3 },
                model: new CodeEditor.Model({
                    value: this.codeSnippet.code.join('\n'),
                    mimeType: getMimeTypeByLanguage({
                        name: this.codeSnippet.language,
                        codemirror_mode: this.codeSnippet.language
                    })
                })
            });
        }
        if (this.isVisible) {
            this._hasRefreshedSinceAttach = true;
            this.editor.refresh();
        }
    }
}
(function (Preview) {
    class Renderer {
        /**
         * Create the body of the preview.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(value) {
            let body;
            if (typeof value === 'string') {
                body = new Widget({ node: document.createElement('span') });
                body.node.textContent = value;
            }
            else if (value instanceof Widget) {
                body = value;
            }
            else {
                body = ReactWidget.create(value);
                // Immediately update the body even though it has not yet attached in
                // order to trigger a render of the DOM nodes from the React element.
                MessageLoop.sendMessage(body, Widget.Msg.UpdateRequest);
            }
            body.addClass(PREVIEW_BODY);
            return body;
        }
    }
    Preview.Renderer = Renderer;
    /**
     * The default renderer instance.
     */
    Preview.defaultRenderer = new Renderer();
    /**
     * The preview widget tracker.
     */
    Preview.tracker = new WidgetTracker({
        namespace: '@jupyterlab/code_snippet:ConfirmWidget'
    });
})(Preview || (Preview = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The queue for launching previews.
     */
    Private.launchQueue = [];
})(Private || (Private = {}));
