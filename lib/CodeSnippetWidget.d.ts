import { ReactWidget } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
import { Signal } from '@lumino/signaling';
import { CodeSnippetContentsService, ICodeSnippet } from './CodeSnippetContentsService';
import { CodeSnippetWidgetModel } from './CodeSnippetWidgetModel';
import React from 'react';
/**
 * A widget for Code Snippets.
 */
export declare class CodeSnippetWidget extends ReactWidget {
    getCurrentWidget: () => Widget;
    private _codeSnippetWidgetModel;
    _codeSnippets: ICodeSnippet[];
    renderCodeSnippetsSignal: Signal<this, ICodeSnippet[]>;
    app: JupyterFrontEnd;
    codeSnippetManager: CodeSnippetContentsService;
    private editorServices;
    constructor(getCurrentWidget: () => Widget, app: JupyterFrontEnd, editorServices: IEditorServices);
    get codeSnippetWidgetModel(): CodeSnippetWidgetModel;
    set codeSnippets(codeSnippets: ICodeSnippet[]);
    fetchData(): Promise<ICodeSnippet[]>;
    updateCodeSnippets(): void;
    onAfterShow(msg: Message): void;
    openCodeSnippetEditor(args: any): void;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the notebook panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * A message handler invoked on an `'after-attach'` message.
     * @param msg
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     * @param msg
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Find the snippet containing the target html element.
     *
     * #### Notes
     * Returns undefined if the cell is not found.
     */
    private _findSnippet;
    /**
     * Handle the `'lm-dragenter'` event for the widget.
     */
    private _evtDragEnter;
    /**
     * Handle the `'lm-dragleave'` event for the widget.
     */
    private _evtDragLeave;
    /**
     * Handle the `'lm-dragover'` event for the widget.
     */
    private _evtDragOver;
    private findCellData;
    /**
     * Handle the `'lm-drop'` event for the widget.
     */
    private _evtDrop;
    moveCodeSnippet(srcIdx: number, targetIdx: number): void;
    render(): React.ReactElement;
}
