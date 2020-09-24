import { WidgetTracker, ReactWidget } from '@jupyterlab/apputils';
import { Widget, PanelLayout, Panel } from '@lumino/widgets';
import { MessageLoop } from '@lumino/messaging';
import { PromiseDelegate } from '@lumino/coreutils';
import { ArrayExt } from '@lumino/algorithm';
/**
 * The class name for confirmation box
 */
const CONFIRM_CLASS = 'jp-codeSnippet-confirm';
const CONFIRM_CONTENT = 'jp-codeSnippet-Message-content';
const CONFIRM_BODY = 'jp-codeSnippet-Message-body';
/**
 * Create and show a dialog.
 *
 * @param options - The dialog setup options.
 *
 * @returns A promise that resolves with whether the dialog was accepted.
 */
export function showMessage(options = {}) {
    const confirmMessage = new ConfirmMessage(options);
    return confirmMessage.launch();
}
/**
 * A widget used to show confirmation message.
 */
export class ConfirmMessage extends Widget {
    constructor(options = {}) {
        super();
        this.addClass(CONFIRM_CLASS);
        const renderer = ConfirmMessage.defaultRenderer;
        this._host = options.host || document.body;
        const layout = (this.layout = new PanelLayout());
        const content = new Panel();
        content.addClass(CONFIRM_CONTENT);
        layout.addWidget(content);
        const body = renderer.createBody(options.body);
        content.addWidget(body);
        void ConfirmMessage.tracker.add(this);
    }
    /**
     * Launch the dialog as a modal window.
     *
     * @returns a promise that resolves with the result of the dialog.
     */
    launch() {
        // Return the existing dialog if already open.
        if (this._promise) {
            return this._promise.promise;
        }
        const promise = (this._promise = new PromiseDelegate());
        const promises = Promise.all(Private.launchQueue);
        Private.launchQueue.push(this._promise.promise);
        return promises.then(() => {
            Widget.attach(this, this._host);
            return promise.promise;
        });
    }
    /**
     * Handle the DOM events for the directory listing.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the panel's DOM node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'keydown':
                this._evtKeydown(event);
                break;
            case 'click':
                this._evtClick(event);
                break;
            default:
                break;
        }
    }
    /**
     * Handle the `'click'` event for a dialog button.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtClick(event) {
        const content = this.node.getElementsByClassName(CONFIRM_CONTENT)[0];
        if (!content.contains(event.target)) {
            event.stopPropagation();
            event.preventDefault();
            this.reject();
            return;
        }
    }
    /**
     * Handle the `'keydown'` event for the widget.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtKeydown(event) {
        // Check for escape key
        switch (event.keyCode) {
            case 27: // Escape.
                event.stopPropagation();
                event.preventDefault();
                this.reject();
                break;
            default:
                break;
        }
    }
    /**
     * Reject the current dialog with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the dialog is not shown.
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
     * Dispose of the resources used by the dialog.
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
        const node = this.node;
        node.addEventListener('keydown', this, true);
        node.addEventListener('click', this, true);
    }
    /**
     *  A message handler invoked on an `'after-detach'` message.
     */
    onAfterDetach(msg) {
        const node = this.node;
        node.removeEventListener('keydown', this, true);
        node.removeEventListener('click', this, true);
    }
}
(function (ConfirmMessage) {
    class Renderer {
        /**
         * Create the body of the dialog.
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
            body.addClass(CONFIRM_BODY);
            return body;
        }
    }
    ConfirmMessage.Renderer = Renderer;
    /**
     * The default renderer instance.
     */
    ConfirmMessage.defaultRenderer = new Renderer();
    /**
     * The confirm message widget tracker.
     */
    ConfirmMessage.tracker = new WidgetTracker({
        namespace: '@jupyterlab/code_snippet:ConfirmWidget'
    });
})(ConfirmMessage || (ConfirmMessage = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The queue for launching confirm message.
     */
    Private.launchQueue = [];
})(Private || (Private = {}));
