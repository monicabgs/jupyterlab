import { IEditorServices } from '@jupyterlab/codeeditor';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { Cell, CodeCellModel, ICodeCellModel, CodeCell } from '@jupyterlab/cells';
import { Widget } from '@lumino/widgets';
import { Drag } from '@lumino/dragdrop';
import React from 'react';
import { CodeSnippetWidgetModel } from './CodeSnippetWidgetModel';
import { ICodeSnippet } from './CodeSnippetContentsService';
/**
 * CodeSnippetDisplay props.
 */
interface ICodeSnippetDisplayProps {
    codeSnippets: ICodeSnippet[];
    app: JupyterFrontEnd;
    getCurrentWidget: () => Widget;
    openCodeSnippetEditor: (args: any) => void;
    editorServices: IEditorServices;
    _codeSnippetWidgetModel: CodeSnippetWidgetModel;
    updateCodeSnippets: () => void;
}
/**
 * CodeSnippetDisplay state.
 */
interface ICodeSnippetDisplayState {
    codeSnippets: ICodeSnippet[];
    searchValue: string;
    filterTags: string[];
}
/**
 * A React Component for code-snippets display list.
 */
export declare class CodeSnippetDisplay extends React.Component<ICodeSnippetDisplayProps, ICodeSnippetDisplayState> {
    _drag: Drag;
    _dragData: {
        pressX: number;
        pressY: number;
        dragImage: HTMLElement;
    };
    constructor(props: ICodeSnippetDisplayProps);
    private insertCodeSnippet;
    private verifyLanguageAndInsert;
    private showWarnDialog;
    private showErrDialog;
    private dragHoverStyle;
    private dragHoverStyleRemove;
    private boldNameOnSearch;
    private handleDragSnippet;
    private _evtMouseUp;
    private handleDragMove;
    /**
     * Detect if a drag event should be started. This is down if the
     * mouse is moved beyond a certain distance (DRAG_THRESHOLD).
     *
     * @param prevX - X Coordinate of the mouse pointer during the mousedown event
     * @param prevY - Y Coordinate of the mouse pointer during the mousedown event
     * @param nextX - Current X Coordinate of the mouse pointer
     * @param nextY - Current Y Coordinate of the mouse pointer
     */
    private shouldStartDrag;
    private startDrag;
    private _evtMouseLeave;
    private _setPreviewPosition;
    private _setOptionsPosition;
    private renderLanguageIcon;
    private renderCodeSnippet;
    static getDerivedStateFromProps(props: ICodeSnippetDisplayProps, state: ICodeSnippetDisplayState): ICodeSnippetDisplayState;
    filterSnippets: (searchValue: string, filterTags: string[]) => void;
    getActiveTags(): string[];
    private deleteCommand;
    private removeOptionsNode;
    createOptionsNode(codeSnippet: ICodeSnippet): HTMLElement;
    render(): React.ReactElement;
}
/**
 * A content factory for console children.
 */
export interface IContentFactory extends Cell.IContentFactory {
    /**
     * Create a new code cell widget.
     */
    createCodeCell(options: CodeCell.IOptions): CodeCell;
}
/**
 * The default implementation of an `IModelFactory`.
 */
export declare class ModelFactory {
    /**
     * The factory for output area models.
     */
    readonly codeCellContentFactory: CodeCellModel.IContentFactory;
    /**
     * Create a new code cell.
     *
     * @param source - The data to use for the original source data.
     *
     * @returns A new code cell. If a source cell is provided, the
     *   new cell will be initialized with the data from the source.
     *   If the contentFactory is not provided, the instance
     *   `codeCellContentFactory` will be used.
     */
    createCodeCell(options: CodeCellModel.IOptions): ICodeCellModel;
}
export {};
