import { WidgetTracker } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
/**
 * Create and show a dialog.
 *
 * @param options - The dialog setup options.
 *
 * @returns A promise that resolves with whether the dialog was accepted.
 */
export declare function showMessage<T>(options?: Partial<ConfirmMessage.IOptions<T>>): Promise<void>;
/**
 * A widget used to show confirmation message.
 */
export declare class ConfirmMessage<T> extends Widget {
    constructor(options?: Partial<ConfirmMessage.IOptions<T>>);
    /**
     * Launch the dialog as a modal window.
     *
     * @returns a promise that resolves with the result of the dialog.
     */
    launch(): Promise<void>;
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
     * Handle the `'click'` event for a dialog button.
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
     * Reject the current dialog with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the dialog is not shown.
     */
    reject(): void;
    /**
     * Resolve a button item.
     */
    private _resolve;
    /**
     * Dispose of the resources used by the dialog.
     */
    dispose(): void;
    /**
     *  A message handler invoked on an `'after-attach'` message.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     *  A message handler invoked on an `'after-detach'` message.
     */
    protected onAfterDetach(msg: Message): void;
    private _promise;
    private _host;
}
export declare namespace ConfirmMessage {
    /**
     * The body input types.
     */
    type Body = Widget;
    interface IOptions<T> {
        /**
         * The main body element for the dialog or a message to display.
         * Defaults to an empty string.
         *
         * #### Notes
         * If a widget is given as the body, it will be disposed after the
         * dialog is resolved.  If the widget has a `getValue()` method,
         * the method will be called prior to disposal and the value
         * will be provided as part of the dialog result.
         * A string argument will be used as raw `textContent`.
         * All `input` and `select` nodes will be wrapped and styled.
         */
        body: Body;
        /**
         * The host element for the dialog. Defaults to `document.body`.
         */
        host: HTMLElement;
        /**
         * When "true", renders a close button for the dialog
         */
        hasClose: boolean;
        /**
         * An optional renderer for dialog items.  Defaults to a shared
         * default renderer.
         */
        renderer: IRenderer;
    }
    interface IRenderer {
        /**
         * Create the body of the dialog.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(body: Body): Widget;
        createIcon(): Widget;
    }
    class Renderer {
        /**
         * Create the body of the dialog.
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
     * The confirm message widget tracker.
     */
    const tracker: WidgetTracker<ConfirmMessage<any>>;
}
