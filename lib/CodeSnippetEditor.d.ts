import { IEditorServices } from '@jupyterlab/codeeditor';
import { ReactWidget, WidgetTracker } from '@jupyterlab/apputils';
import { Message } from '@lumino/messaging';
import React from 'react';
import { CodeSnippetContentsService } from './CodeSnippetContentsService';
import { CodeSnippetWidget } from './CodeSnippetWidget';
export interface ICodeSnippetEditorMetadata {
    name: string;
    description: string;
    language: string;
    code: string[];
    id: number;
    selectedTags: string[];
    allTags: string[];
    fromScratch: boolean;
}
export declare class CodeSnippetEditor extends ReactWidget {
    editorServices: IEditorServices;
    private editor;
    private saved;
    private oldCodeSnippetName;
    private _codeSnippetEditorMetaData;
    private _hasRefreshedSinceAttach;
    contentsService: CodeSnippetContentsService;
    codeSnippetWidget: CodeSnippetWidget;
    tracker: WidgetTracker;
    constructor(contentsService: CodeSnippetContentsService, editorServices: IEditorServices, tracker: WidgetTracker, codeSnippetWidget: CodeSnippetWidget, args: ICodeSnippetEditorMetadata);
    get codeSnippetEditorMetadata(): ICodeSnippetEditorMetadata;
    private deactivateEditor;
    private deactivateNameField;
    private deactivateDescriptionField;
    private activeFieldState;
    onUpdateRequest(msg: Message): void;
    onAfterAttach(msg: Message): void;
    onAfterShow(msg: Message): void;
    /**
     * Initial focus on the editor when it gets activated!
     * @param msg
     */
    onActivateRequest(msg: Message): void;
    onCloseRequest(msg: Message): void;
    /**
     * Visualize the editor more look like an editor
     * @param event
     */
    activateCodeMirror(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
    deactivateCodeMirror(editor: Element): void;
    handleInputFieldChange(event: React.ChangeEvent<HTMLInputElement>): void;
    saveChange(event: React.MouseEvent<HTMLElement, MouseEvent>): void;
    private validateInputs;
    updateSnippet(): Promise<void>;
    handleChangeOnTag(selectedTags: string[], allTags: string[]): void;
    handleOnBlur(event: React.FocusEvent<HTMLInputElement>): void;
    /**
     * TODO: clean CSS style class - "Use constant"
     */
    renderCodeInput(): React.ReactElement;
    renderLanguages(): React.ReactElement;
    renderLanguageOptions(option: string): JSX.Element;
    render(): React.ReactElement;
}
