import { InputGroup, checkIcon } from '@jupyterlab/ui-components';
import React from 'react';
const FILTER_ARROW_UP = 'jp-codeSnippet-filter-arrow-up';
const FILTER_OPTION = 'jp-codeSnippet-filter-option';
const FILTER_TAGS = 'jp-codeSnippet-filter-tags';
const FILTER_TAG = 'jp-codeSnippet-filter-tag';
const FILTER_CHECK = 'jp-codeSnippet-filter-check';
const FILTER_TITLE = 'jp-codeSnippet-filter-title';
const FILTER_TOOLS = 'jp-codeSnippet-filterTools';
const FILTER_SEARCHBAR = 'jp-codeSnippet-searchbar';
const FILTER_SEARCHWRAPPER = 'jp-codesnippet-searchwrapper';
const FILTER_CLASS = 'jp-codeSnippet-filter';
const FILTER_BUTTON = 'jp-codeSnippet-filter-btn';
export class FilterTools extends React.Component {
    constructor(props) {
        super(props);
        this.handleSearch = (event) => {
            this.setState({ searchValue: event.target.value }, this.filterSnippets);
        };
        this.state = { show: false, selectedTags: [], searchValue: '' };
        this.createFilterBox = this.createFilterBox.bind(this);
        this.renderFilterOption = this.renderFilterOption.bind(this);
        this.renderTags = this.renderTags.bind(this);
        this.renderAppliedTag = this.renderAppliedTag.bind(this);
        this.renderUnappliedTag = this.renderUnappliedTag.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.filterSnippets = this.filterSnippets.bind(this);
    }
    componentDidMount() {
        this.setState({
            show: false,
            selectedTags: [],
            searchValue: ''
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState(state => ({
                selectedTags: state.selectedTags
                    .filter(tag => this.props.tags.includes(tag))
                    .sort()
            }));
        }
    }
    createFilterBox() {
        const filterArrow = document.querySelector(`.${FILTER_ARROW_UP}`);
        const filterOption = document.querySelector(`.${FILTER_OPTION}`);
        filterArrow.classList.toggle('idle');
        filterOption.classList.toggle('idle');
    }
    renderTags() {
        return (React.createElement("div", { className: FILTER_TAGS }, this.props.tags.sort().map((tag, index) => {
            if (this.state.selectedTags.includes(tag)) {
                return this.renderAppliedTag(tag, index.toString());
            }
            else {
                return this.renderUnappliedTag(tag, index.toString());
            }
        })));
    }
    renderAppliedTag(tag, index) {
        return (React.createElement("div", { className: `${FILTER_TAG} tag applied-tag`, id: 'filter' + '-' + tag + '-' + index, key: 'filter' + '-' + tag + '-' + index },
            React.createElement("button", { onClick: this.handleClick }, tag),
            React.createElement(checkIcon.react, { className: FILTER_CHECK, tag: "span", elementPosition: "center", height: "18px", width: "18px", marginLeft: "5px", marginRight: "-3px" })));
    }
    renderUnappliedTag(tag, index) {
        return (React.createElement("div", { className: `${FILTER_TAG} tag unapplied-tag`, id: 'filter' + '-' + tag + '-' + index, key: 'filter' + '-' + tag + '-' + index },
            React.createElement("button", { onClick: this.handleClick }, tag)));
    }
    handleClick(event) {
        const target = event.target;
        const clickedTag = target.innerText;
        const parent = target.parentElement;
        this.setState(state => ({
            selectedTags: this.handleClickHelper(parent, state.selectedTags, clickedTag)
        }), this.filterSnippets);
    }
    handleClickHelper(parent, currentTags, clickedTag) {
        if (parent.classList.contains('unapplied-tag')) {
            parent.classList.replace('unapplied-tag', 'applied-tag');
            currentTags.splice(-1, 0, clickedTag);
        }
        else if (parent.classList.contains('applied-tag')) {
            parent.classList.replace('applied-tag', 'unapplied-tag');
            const idx = currentTags.indexOf(clickedTag);
            currentTags.splice(idx, 1);
        }
        return currentTags.sort();
    }
    filterSnippets() {
        this.props.onFilter(this.state.searchValue, this.state.selectedTags);
    }
    renderFilterOption() {
        return (React.createElement("div", { className: `${FILTER_OPTION} idle` },
            React.createElement("div", { className: FILTER_TITLE },
                React.createElement("span", null, "cell tags")),
            this.renderTags()));
    }
    render() {
        return (React.createElement("div", { className: FILTER_TOOLS },
            React.createElement("div", { className: FILTER_SEARCHBAR },
                React.createElement(InputGroup, { className: FILTER_SEARCHWRAPPER, type: "text", placeholder: "SEARCH SNIPPETS", onChange: this.handleSearch, rightIcon: "search", value: this.state.searchValue })),
            React.createElement("div", { className: FILTER_CLASS },
                React.createElement("button", { className: FILTER_BUTTON, onClick: this.createFilterBox }, "Filter By Tags"),
                React.createElement("div", { className: `${FILTER_ARROW_UP} idle` }),
                this.renderFilterOption())));
    }
}
