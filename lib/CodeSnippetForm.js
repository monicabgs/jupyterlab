import { closeIcon, Button, LabIcon } from '@jupyterlab/ui-components';
import { WidgetTracker, ReactWidget, Styling } from '@jupyterlab/apputils';
import { Widget, PanelLayout, Panel } from '@lumino/widgets';
import { MessageLoop } from '@lumino/messaging';
import { PromiseDelegate } from '@lumino/coreutils';
import { ArrayExt, each, map, toArray } from '@lumino/algorithm';
import * as React from 'react';
/**
 * CSS styling
 */
const CODE_SNIPPET_FORM = 'jp-codeSnippet-form';
const DIALOG_CONTENT = 'jp-Dialog-content';
/**
 * Create and show a code snippet form.
 *
 * @param options - The code snippet form setup options.
 *
 * @returns A promise that resolves with whether the form was accepted.
 */
export function showCodeSnippetForm(options = {}) {
    const codeSnippetForm = new CodeSnippetForm(options);
    return codeSnippetForm.launch();
}
/**
 * A widget used to show code snippet form
 */
export class CodeSnippetForm extends Widget {
    constructor(options = {}) {
        super();
        this._focusNodeSelector = '';
        this.addClass(CODE_SNIPPET_FORM);
        const normalized = Private.handleOptions(options);
        const renderer = normalized.renderer;
        this._host = normalized.host;
        this._defaultButton = normalized.defaultButton;
        this._buttons = normalized.buttons;
        this._buttonNodes = toArray(map(this._buttons, button => {
            return renderer.createButtonNode(button);
        }));
        const layout = (this.layout = new PanelLayout());
        const content = new Panel();
        content.addClass(DIALOG_CONTENT);
        layout.addWidget(content);
        this._body = normalized.body;
        const header = renderer.createHeader(normalized.title, () => this.reject(), options);
        const body = renderer.createBody(normalized.body);
        const footer = renderer.createFooter(this._buttonNodes);
        content.addWidget(header);
        content.addWidget(body);
        content.addWidget(footer);
        this._primary = this._buttonNodes[this._defaultButton];
        this._focusNodeSelector = options.focusNodeSelector;
        // Add new code snippet form to the tracker.
        void CodeSnippetForm.tracker.add(this);
    }
    /**
     * Dispose of the resources used by the code snippet form.
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
     * Launch the code snippet form as a modal window.
     *
     * @returns a promise that resolves with the result of the code snippet form.
     */
    launch() {
        // Return the existing code snippet form if already open.
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
     * Resolve the current code snippet form.
     *
     * @param index - An optional index to the button to resolve.
     *
     * #### Notes
     * Will default to the defaultIndex.
     * Will resolve the current `show()` with the button value.
     * Will be a no-op if the code snippet form is not shown.
     */
    resolve(index) {
        if (!this._promise) {
            return;
        }
        if (index === undefined) {
            index = this._defaultButton;
        }
        this._resolve(this._buttons[index]);
    }
    /**
     * Reject the current code snippet form with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the code snippet form is not shown.
     */
    reject() {
        if (!this._promise) {
            return;
        }
        this._resolve(CodeSnippetForm.cancelButton());
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
            case 'focus':
                this._evtFocus(event);
                break;
            default:
                break;
        }
    }
    /**
     *  A message handler invoked on an `'after-attach'` message.
     */
    onAfterAttach(msg) {
        var _a;
        const node = this.node;
        node.addEventListener('keydown', this, true);
        node.addEventListener('click', this, true);
        document.addEventListener('focus', this, true);
        this._first = Private.findFirstFocusable(this.node);
        this._original = document.activeElement;
        if (this._focusNodeSelector) {
            const body = this.node.querySelector('.jp-Dialog-body');
            const el = (_a = body) === null || _a === void 0 ? void 0 : _a.querySelector(this._focusNodeSelector);
            if (el) {
                this._primary = el;
            }
        }
        this._primary.focus();
    }
    /**
     *  A message handler invoked on an `'after-detach'` message.
     */
    onAfterDetach(msg) {
        const node = this.node;
        node.removeEventListener('keydown', this, true);
        node.removeEventListener('click', this, true);
        document.removeEventListener('focus', this, true);
        this._original.focus();
    }
    /**
     * A message handler invoked on a `'close-request'` message.
     */
    onCloseRequest(msg) {
        if (this._promise) {
            this.reject();
        }
        super.onCloseRequest(msg);
    }
    /**
     * Handle the `'click'` event for a code snippet form button.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtClick(event) {
        const content = this.node.getElementsByClassName('jp-Dialog-content')[0];
        if (!content.contains(event.target)) {
            event.stopPropagation();
            event.preventDefault();
            this.reject();
            return;
        }
        for (const buttonNode of this._buttonNodes) {
            if (buttonNode.contains(event.target)) {
                const index = this._buttonNodes.indexOf(buttonNode);
                this.resolve(index);
            }
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
            case 9: {
                // Tab.
                // Handle a tab on the last button.
                const node = this._buttonNodes[this._buttons.length - 1];
                if (document.activeElement === node && !event.shiftKey) {
                    event.stopPropagation();
                    event.preventDefault();
                    this._first.focus();
                }
                break;
            }
            default:
                break;
        }
    }
    /**
     * Handle the `'focus'` event for the widget.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtFocus(event) {
        const target = event.target;
        if (!this.node.contains(target)) {
            event.stopPropagation();
            this._buttonNodes[this._defaultButton].focus();
        }
    }
    /**
     * Resolve a button item.
     */
    _resolve(button) {
        // Prevent loopback.
        const promise = this._promise;
        if (!promise) {
            this.dispose();
            return;
        }
        this._promise = null;
        ArrayExt.removeFirstOf(Private.launchQueue, promise.promise);
        const body = this._body;
        let value = null;
        if (button.accept &&
            body instanceof Widget &&
            typeof body.getValue === 'function') {
            value = body.getValue();
        }
        this.dispose();
        promise.resolve({ button, value });
    }
}
(function (CodeSnippetForm) {
    /**
     * Create a button item.
     */
    function createButton(value) {
        value.accept = value.accept !== false;
        const defaultLabel = value.accept ? 'OK' : 'Cancel';
        return {
            label: value.label || defaultLabel,
            iconClass: value.iconClass || '',
            iconLabel: value.iconLabel || '',
            caption: value.caption || '',
            className: value.className || '',
            accept: value.accept,
            actions: value.actions || [],
            displayType: value.displayType || 'default'
        };
    }
    CodeSnippetForm.createButton = createButton;
    /**
     * Create a reject button.
     */
    function cancelButton(options = {}) {
        options.accept = false;
        return createButton(options);
    }
    CodeSnippetForm.cancelButton = cancelButton;
    /**
     * Create an accept button.
     */
    function okButton(options = {}) {
        options.accept = true;
        return createButton(options);
    }
    CodeSnippetForm.okButton = okButton;
    /**
     * Create a warn button.
     */
    function warnButton(options = {}) {
        options.displayType = 'warn';
        return createButton(options);
    }
    CodeSnippetForm.warnButton = warnButton;
    /**
     * Disposes all code snippet form instances.
     *
     * #### Notes
     * This function should only be used in tests or cases where application state
     * may be discarded.
     */
    function flush() {
        CodeSnippetForm.tracker.forEach(form => {
            form.dispose();
        });
    }
    CodeSnippetForm.flush = flush;
    /**
     * The default implementation of a code snippet form renderer.
     */
    class Renderer {
        /**
         * Create the header of the code snippet form.
         *
         * @param title - The title of the code snippet form.
         *
         * @returns A widget for the code snippet form header.
         */
        createHeader(title, reject = () => {
            /* empty */
        }, options = {}) {
            let header;
            const handleMouseDown = (event) => {
                // Fire action only when left button is pressed.
                if (event.button === 0) {
                    event.preventDefault();
                    reject();
                }
            };
            const handleKeyDown = (event) => {
                const { key } = event;
                if (key === 'Enter' || key === ' ') {
                    reject();
                }
            };
            if (typeof title === 'string') {
                header = ReactWidget.create(React.createElement(React.Fragment, null,
                    title,
                    options.hasClose && (React.createElement(Button, { className: "jp-Dialog-close-button", onMouseDown: handleMouseDown, onKeyDown: handleKeyDown, title: "Cancel", minimal: true },
                        React.createElement(LabIcon.resolveReact, { icon: closeIcon, iconClass: "jp-Icon", className: "jp-ToolbarButtonComponent-icon", tag: "span" })))));
            }
            else {
                header = ReactWidget.create(title);
            }
            header.addClass('jp-Dialog-header');
            Styling.styleNode(header.node);
            return header;
        }
        /**
         * Create the body of the code snippet form.
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
            body.addClass('jp-Dialog-body');
            Styling.styleNode(body.node);
            return body;
        }
        /**
         * Create the footer of the code snippet form.
         *
         * @param buttonNodes - The buttons nodes to add to the footer.
         *
         * @returns A widget for the footer.
         */
        createFooter(buttons) {
            const footer = new Widget();
            footer.addClass('jp-Dialog-footer');
            each(buttons, button => {
                footer.node.appendChild(button);
            });
            Styling.styleNode(footer.node);
            return footer;
        }
        /**
         * Create a button node for the code snippet form.
         *
         * @param button - The button data.
         *
         * @returns A node for the button.
         */
        createButtonNode(button) {
            const e = document.createElement('button');
            e.className = this.createItemClass(button);
            e.appendChild(this.renderIcon(button));
            e.appendChild(this.renderLabel(button));
            return e;
        }
        /**
         * Create the class name for the button.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the button.
         */
        createItemClass(data) {
            // Setup the initial class name.
            let name = 'jp-Dialog-button';
            // Add the other state classes.
            if (data.accept) {
                name += ' jp-mod-accept';
            }
            else {
                name += ' jp-mod-reject';
            }
            if (data.displayType === 'warn') {
                name += ' jp-mod-warn';
            }
            // Add the extra class.
            const extra = data.className;
            if (extra) {
                name += ` ${extra}`;
            }
            // Return the complete class name.
            return name;
        }
        /**
         * Render an icon element for a code snippet form item.
         *
         * @param data - The data to use for rendering the icon.
         *
         * @returns An HTML element representing the icon.
         */
        renderIcon(data) {
            const e = document.createElement('div');
            e.className = this.createIconClass(data);
            e.appendChild(document.createTextNode(data.iconLabel));
            return e;
        }
        /**
         * Create the class name for the button icon.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the item icon.
         */
        createIconClass(data) {
            const name = 'jp-Dialog-buttonIcon';
            const extra = data.iconClass;
            return extra ? `${name} ${extra}` : name;
        }
        /**
         * Render the label element for a button.
         *
         * @param data - The data to use for rendering the label.
         *
         * @returns An HTML element representing the item label.
         */
        renderLabel(data) {
            const e = document.createElement('div');
            e.className = 'jp-Dialog-buttonLabel';
            e.title = data.caption;
            e.appendChild(document.createTextNode(data.label));
            return e;
        }
    }
    CodeSnippetForm.Renderer = Renderer;
    /**
     * The default renderer instance.
     */
    CodeSnippetForm.defaultRenderer = new Renderer();
    /**
     * The code snippet form widget tracker.
     */
    CodeSnippetForm.tracker = new WidgetTracker({
        namespace: '@jupyterlab/apputils:CodeSnippetForm'
    });
})(CodeSnippetForm || (CodeSnippetForm = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The queue for launching code snippet forms.
     */
    Private.launchQueue = [];
    Private.errorMessagePromiseCache = new Map();
    /**
     * Handle the input options for a code snippet form.
     *
     * @param options - The input options.
     *
     * @returns A new options object with defaults applied.
     */
    function handleOptions(options = {}) {
        const buttons = options.buttons || [
            CodeSnippetForm.cancelButton(),
            CodeSnippetForm.okButton()
        ];
        let defaultButton = buttons.length - 1;
        if (options.defaultButton !== undefined) {
            defaultButton = options.defaultButton;
        }
        return {
            title: options.title || '',
            body: options.body || '',
            host: options.host || document.body,
            buttons,
            defaultButton,
            renderer: options.renderer || CodeSnippetForm.defaultRenderer,
            focusNodeSelector: options.focusNodeSelector || '',
            hasClose: options.hasClose || false
        };
    }
    Private.handleOptions = handleOptions;
    /**
     *  Find the first focusable item in the code snippet form.
     */
    function findFirstFocusable(node) {
        const candidateSelectors = [
            'input',
            'select',
            'a[href]',
            'textarea',
            'button',
            '[tabindex]'
        ].join(',');
        return node.querySelectorAll(candidateSelectors)[0];
    }
    Private.findFirstFocusable = findFirstFocusable;
})(Private || (Private = {}));
