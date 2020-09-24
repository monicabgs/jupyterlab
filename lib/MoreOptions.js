import { WidgetTracker, ReactWidget } from '@jupyterlab/apputils';
import { Widget, PanelLayout, Panel } from '@lumino/widgets';
import { MessageLoop } from '@lumino/messaging';
import { PromiseDelegate } from '@lumino/coreutils';
import { ArrayExt } from '@lumino/algorithm';
/**
 * The class name for options box
 */
const OPTIONS_CLASS = 'jp-codeSnippet-options';
const OPTIONS_CONTENT = 'jp-codeSnippet-options-content';
const OPTIONS_BODY = 'jp-codeSnippet-options-body';
/**
 * Create and show a code snippet options.
 *
 * @param options - The code snippet options setup options.
 *
 * @returns A promise that resolves with whether the code snippet options was accepted.
 */
export function showMoreOptions(options = {}) {
    const optionsMessage = new OptionsMessage(options);
    return optionsMessage.launch();
}
/**
 * A widget used to show options message.
 */
export class OptionsMessage extends Widget {
    constructor(options = {}) {
        super();
        this.addClass(OPTIONS_CLASS);
        const renderer = OptionsMessage.defaultRenderer;
        this._host = options.host || document.body;
        const layout = (this.layout = new PanelLayout());
        const content = new Panel();
        content.addClass(OPTIONS_CONTENT);
        layout.addWidget(content);
        const body = renderer.createBody(options.body);
        content.addWidget(body);
        if (OptionsMessage.tracker.size > 0) {
            const previous = OptionsMessage.tracker.currentWidget;
            previous.reject();
            OptionsMessage.tracker.dispose();
        }
        void OptionsMessage.tracker.add(this);
    }
    /**
     * Launch the code snippet options as a modal window.
     *
     * @returns a promise that resolves with the result of the code snippet options.
     */
    launch() {
        // Return the existing code snippet options if already open.
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
            case 'click':
                this._evtClick(event);
                break;
            default:
                break;
        }
    }
    /**
     * Handle the `'click'` event for a code snippet options button.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtClick(event) {
        const content = this.node.getElementsByClassName(OPTIONS_CONTENT)[0];
        if (!content.contains(event.target)) {
            event.stopPropagation();
            event.preventDefault();
            this.reject();
            return;
        }
    }
    /**
     * Reject the current code snippet options with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the code snippet options is not shown.
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
     * Dispose of the resources used by the code snippet options.
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
        node.addEventListener('click', this, true);
    }
    /**
     *  A message handler invoked on an `'after-detach'` message.
     */
    onAfterDetach(msg) {
        const node = this.node;
        node.removeEventListener('click', this, true);
    }
}
(function (OptionsMessage) {
    class Renderer {
        /**
         * Create the body of the code snippet options.
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
            body.addClass(OPTIONS_BODY);
            return body;
        }
    }
    OptionsMessage.Renderer = Renderer;
    /**
     * The default renderer instance.
     */
    OptionsMessage.defaultRenderer = new Renderer();
    /**
     * The code snippet options widget tracker.
     */
    OptionsMessage.tracker = new WidgetTracker({
        namespace: '@jupyterlab/code_snippet:OptionsWidget'
    });
})(OptionsMessage || (OptionsMessage = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The queue for launching code snippet optionss.
     */
    Private.launchQueue = [];
})(Private || (Private = {}));
