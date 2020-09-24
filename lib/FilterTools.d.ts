import React from 'react';
interface IFilterSnippetProps {
    tags: string[];
    onFilter: (searchValue: string, filterTags: string[]) => void;
}
interface IFilterSnippetState {
    show: boolean;
    selectedTags: string[];
    searchValue: string;
}
export declare class FilterTools extends React.Component<IFilterSnippetProps, IFilterSnippetState> {
    constructor(props: IFilterSnippetProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: IFilterSnippetProps): void;
    createFilterBox(): void;
    renderTags(): JSX.Element;
    renderAppliedTag(tag: string, index: string): JSX.Element;
    renderUnappliedTag(tag: string, index: string): JSX.Element;
    handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
    handleClickHelper(parent: HTMLElement, currentTags: string[], clickedTag: string): string[];
    handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
    filterSnippets(): void;
    renderFilterOption(): JSX.Element;
    render(): JSX.Element;
}
export {};
