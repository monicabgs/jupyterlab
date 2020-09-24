import { WidgetTracker } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
/**
 * Create and show a code snippet options.
 *
 * @param options - The code snippet options setup options.
 *
 * @returns A promise that resolves with whether the code snippet options was accepted.
 */
export declare function showMoreOptions<T>(options?: Partial<OptionsMessage.IOptions<T>>): Promise<void>;
/**
 * A widget used to show options message.
 */
export declare class OptionsMessage<T> extends Widget {
    constructor(options?: Partial<OptionsMessage.IOptions<T>>);
    /**
     * Launch the code snippet options as a modal window.
     *
     * @returns a promise that resolves with the result of the code snippet options.
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
     * Handle the `'click'` event for a code snippet options button.
     *
     * @param event - The DOM event sent to the widget
     */
    protected _evtClick(event: MouseEvent): void;
    /**
     * Reject the current code snippet options with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the code snippet options is not shown.
     */
    reject(): void;
    /**
     * Resolve a button item.
     */
    private _resolve;
    /**
     * Dispose of the resources used by the code snippet options.
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
export declare namespace OptionsMessage {
    /**
     * The body input types.
     */
    type Body = Widget;
    interface IOptions<T> {
        /**
         * The main body element for the code snippet options or a message to display.
         * Defaults to an empty string.
         *
         * #### Notes
         * If a widget is given as the body, it will be disposed after the
         * code snippet options is resolved.  If the widget has a `getValue()` method,
         * the method will be called prior to disposal and the value
         * will be provided as part of the code snippet options result.
         * A string argument will be used as raw `textContent`.
         * All `input` and `select` nodes will be wrapped and styled.
         */
        body: Body;
        /**
         * The host element for the code snippet options. Defaults to `document.body`.
         */
        host: HTMLElement;
        /**
         * An optional renderer for code snippet options items.  Defaults to a shared
         * default renderer.
         */
        renderer: IRenderer;
    }
    interface IRenderer {
        /**
         * Create the body of the code snippet options.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(body: Body): Widget;
    }
    class Renderer {
        /**
         * Create the body of the code snippet options.
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
     * The code snippet options widget tracker.
     */
    const tracker: WidgetTracker<OptionsMessage<any>>;
}
