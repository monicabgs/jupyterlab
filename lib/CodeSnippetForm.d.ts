import { WidgetTracker } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
import * as React from 'react';
/**
 * Create and show a code snippet form.
 *
 * @param options - The code snippet form setup options.
 *
 * @returns A promise that resolves with whether the form was accepted.
 */
export declare function showCodeSnippetForm<T>(options?: Partial<CodeSnippetForm.IOptions<T>>): Promise<CodeSnippetForm.IResult<T>>;
/**
 * A widget used to show code snippet form
 */
export declare class CodeSnippetForm<T> extends Widget {
    constructor(options?: Partial<CodeSnippetForm.IOptions<T>>);
    /**
     * Dispose of the resources used by the code snippet form.
     */
    dispose(): void;
    /**
     * Launch the code snippet form as a modal window.
     *
     * @returns a promise that resolves with the result of the code snippet form.
     */
    launch(): Promise<CodeSnippetForm.IResult<T>>;
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
    resolve(index?: number): void;
    /**
     * Reject the current code snippet form with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the code snippet form is not shown.
     */
    reject(): void;
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
    handleEvent(event: Event): void;
    /**
     *  A message handler invoked on an `'after-attach'` message.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     *  A message handler invoked on an `'after-detach'` message.
     */
    protected onAfterDetach(msg: Message): void;
    /**
     * A message handler invoked on a `'close-request'` message.
     */
    protected onCloseRequest(msg: Message): void;
    /**
     * Handle the `'click'` event for a code snippet form button.
     *
     * @param event - The DOM event sent to the widget
     */
    protected _evtClick(event: MouseEvent): void;
    /**
     * Handle the `'keydown'` event for the widget.
     *
     * @param event - The DOM event sent to the widget
     */
    protected _evtKeydown(event: KeyboardEvent): void;
    /**
     * Handle the `'focus'` event for the widget.
     *
     * @param event - The DOM event sent to the widget
     */
    protected _evtFocus(event: FocusEvent): void;
    /**
     * Resolve a button item.
     */
    private _resolve;
    private _buttonNodes;
    private _buttons;
    private _original;
    private _first;
    private _primary;
    private _promise;
    private _defaultButton;
    private _host;
    private _body;
    private _focusNodeSelector;
}
export declare namespace CodeSnippetForm {
    /**
     * The body input types.
     */
    type Body<T> = IBodyWidget<T> | React.ReactElement<any> | string;
    /**
     * The header input types.
     */
    type Header = React.ReactElement<any> | string;
    /**
     * A widget used as a code snippet form body.
     */
    interface IBodyWidget<T = string> extends Widget {
        /**
         * Get the serialized value of the widget.
         */
        getValue?(): T;
    }
    /**
     * The options used to make a button item.
     */
    interface IButton {
        /**
         * The label for the button.
         */
        label: string;
        /**
         * The icon class for the button.
         */
        iconClass: string;
        /**
         * The icon label for the button.
         */
        iconLabel: string;
        /**
         * The caption for the button.
         */
        caption: string;
        /**
         * The extra class name for the button.
         */
        className: string;
        /**
         * The code snippet form action to perform when the button is clicked.
         */
        accept: boolean;
        /**
         * The additional code snippet form actions to perform when the button is clicked.
         */
        actions: Array<string>;
        /**
         * The button display type.
         */
        displayType: 'default' | 'warn';
    }
    interface IOptions<T> {
        /**
         * The top level text for the code snippet form.  Defaults to an empty string.
         */
        title: Header;
        /**
         * The main body element for the code snippet form to display.
         * Defaults to an empty string.
         *
         * #### Notes
         * If a widget is given as the body, it will be disposed after the
         * code snippet form is resolved.  If the widget has a `getValue()` method,
         * the method will be called prior to disposal and the value
         * will be provided as part of the code snippet form result.
         * A string argument will be used as raw `textContent`.
         * All `input` and `select` nodes will be wrapped and styled.
         */
        body: Body<T>;
        /**
         * The host element for the code snippet form. Defaults to `document.body`.
         */
        host: HTMLElement;
        /**
         * The buttons to display. Defaults to cancel and accept buttons.
         */
        buttons: ReadonlyArray<IButton>;
        /**
         * The index of the default button.  Defaults to the last button.
         */
        defaultButton: number;
        /**
         * A selector for the primary element that should take focus in the code snippet form.
         * Defaults to an empty string, causing the [[defaultButton]] to take
         * focus.
         */
        focusNodeSelector: string;
        /**
         * When "true", renders a close button for the code snippet form
         */
        hasClose: boolean;
        /**
         * An optional renderer for code snippet form items.  Defaults to a shared
         * default renderer.
         */
        renderer: IRenderer;
    }
    /**
     * A code snippet form renderer.
     */
    interface IRenderer {
        /**
         * Create the header of the code snippet form.
         *
         * @param title - The title of the code snippet form.
         *
         * @returns A widget for the code snippet form header.
         */
        createHeader<T>(title: Header, reject: () => void, options: Partial<CodeSnippetForm.IOptions<T>>): Widget;
        /**
         * Create the body of the code snippet form.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(body: Body<any>): Widget;
        /**
         * Create the footer of the code snippet form.
         *
         * @param buttons - The button nodes to add to the footer.
         *
         * @returns A widget for the footer.
         */
        createFooter(buttons: ReadonlyArray<HTMLElement>): Widget;
        /**
         * Create a button node for the code snippet form.
         *
         * @param button - The button data.
         *
         * @returns A node for the button.
         */
        createButtonNode(button: IButton): HTMLElement;
    }
    /**
     * The result of a code snippet form.
     */
    interface IResult<T> {
        /**
         * The button that was pressed.
         */
        button: IButton;
        /**
         * The value retrieved from `.getValue()` if given on the widget.
         */
        value: T | null;
    }
    /**
     * Create a button item.
     */
    function createButton(value: Partial<IButton>): Readonly<IButton>;
    /**
     * Create a reject button.
     */
    function cancelButton(options?: Partial<IButton>): Readonly<IButton>;
    /**
     * Create an accept button.
     */
    function okButton(options?: Partial<IButton>): Readonly<IButton>;
    /**
     * Create a warn button.
     */
    function warnButton(options?: Partial<IButton>): Readonly<IButton>;
    /**
     * Disposes all code snippet form instances.
     *
     * #### Notes
     * This function should only be used in tests or cases where application state
     * may be discarded.
     */
    function flush(): void;
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
        createHeader<T>(title: Header, reject?: () => void, options?: Partial<CodeSnippetForm.IOptions<T>>): Widget;
        /**
         * Create the body of the code snippet form.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(value: Body<any>): Widget;
        /**
         * Create the footer of the code snippet form.
         *
         * @param buttonNodes - The buttons nodes to add to the footer.
         *
         * @returns A widget for the footer.
         */
        createFooter(buttons: ReadonlyArray<HTMLElement>): Widget;
        /**
         * Create a button node for the code snippet form.
         *
         * @param button - The button data.
         *
         * @returns A node for the button.
         */
        createButtonNode(button: IButton): HTMLElement;
        /**
         * Create the class name for the button.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the button.
         */
        createItemClass(data: IButton): string;
        /**
         * Render an icon element for a code snippet form item.
         *
         * @param data - The data to use for rendering the icon.
         *
         * @returns An HTML element representing the icon.
         */
        renderIcon(data: IButton): HTMLElement;
        /**
         * Create the class name for the button icon.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the item icon.
         */
        createIconClass(data: IButton): string;
        /**
         * Render the label element for a button.
         *
         * @param data - The data to use for rendering the label.
         *
         * @returns An HTML element representing the item label.
         */
        renderLabel(data: IButton): HTMLElement;
    }
    /**
     * The default renderer instance.
     */
    const defaultRenderer: Renderer;
    /**
     * The code snippet form widget tracker.
     */
    const tracker: WidgetTracker<CodeSnippetForm<any>>;
}
