import React from 'react';
interface ICodeSnippetEditorTagProps {
    selectedTags: string[];
    tags: string[];
    handleChange: (selectedTags: string[], allTags: string[]) => void;
}
interface ICodeSnippetEditorTagState {
    selectedTags: string[];
    tags: string[];
    plusIconShouldHide: boolean;
    addingNewTag: boolean;
}
export declare class CodeSnippetEditorTags extends React.Component<ICodeSnippetEditorTagProps, ICodeSnippetEditorTagState> {
    constructor(props: ICodeSnippetEditorTagProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: ICodeSnippetEditorTagProps): void;
    handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
    handleOnChange(): void;
    handleClickHelper(parent: HTMLElement, tags: string[], clickedTag: string): string[];
    addTagOnClick(event: React.MouseEvent<HTMLInputElement>): void;
    addTagOnKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void;
    addTagOnBlur(event: React.FocusEvent<HTMLInputElement>): void;
    renderTags(): JSX.Element;
    render(): JSX.Element;
}
export {};
