import { ICodeSnippet } from './CodeSnippetContentsService';
export interface ICodeSnippetWidgetModel {
    /**
     * The list of code snippets in the code snippet explorer
     */
    readonly _snippets: ICodeSnippet[];
}
export declare class CodeSnippetWidgetModel implements ICodeSnippetWidgetModel {
    _snippets: ICodeSnippet[];
    constructor(snippets: ICodeSnippet[]);
    get snippets(): ICodeSnippet[];
    set snippets(snippetList: ICodeSnippet[]);
    reorderSnippet(): void;
    addSnippet(newSnippet: ICodeSnippet, index: number): void;
    sortSnippets(): void;
    moveSnippet(fromIdx: number, toIdx: number): void;
    /**
     * Delete a snippet from the list
     * @param index index to delete. If it's not given, the last one gets deleted.
     */
    deleteSnippet(index?: number): void;
    clearSnippets(): void;
    updateSnippetContents(): void;
    /**
     * insert a snippet to the certain index of the snippet list
     * @param newSnippet new snippet to insert
     * @param index index to insert. If it's not given, the snippet is added at the end of the list.
     */
    private insertSnippet;
}
