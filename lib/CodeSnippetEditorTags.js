import { checkIcon, addIcon } from '@jupyterlab/ui-components';
import React from 'react';
/**
 * CSS STYLING
 */
const CODE_SNIPPET_EDITOR_TAG = 'jp-codeSnippet-editor-tag';
const CODE_SNIPPET_EDITOR_TAG_PLUS_ICON = 'jp-codeSnippet-editor-tag-plusIcon';
const CODE_SNIPPET_EDITOR_TAG_LIST = 'jp-codeSnippet-editor-tagList';
export class CodeSnippetEditorTags extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTags: [],
            tags: [],
            plusIconShouldHide: false,
            addingNewTag: false
        };
        this.renderTags = this.renderTags.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() {
        this.setState({
            selectedTags: this.props.selectedTags ? this.props.selectedTags : [],
            tags: this.props.tags ? this.props.tags : [],
            plusIconShouldHide: false,
            addingNewTag: false
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({
                selectedTags: this.props.selectedTags ? this.props.selectedTags : [],
                tags: this.props.tags ? this.props.tags : []
            });
        }
    }
    handleClick(event) {
        const target = event.target;
        const clickedTag = target.innerText;
        const parent = target.parentElement;
        this.setState(state => ({
            selectedTags: this.handleClickHelper(parent, state.selectedTags ? state.selectedTags : [], clickedTag)
        }), this.handleOnChange);
    }
    handleOnChange() {
        this.props.handleChange(this.state.selectedTags, this.state.tags);
    }
    handleClickHelper(parent, tags, clickedTag) {
        const currentTags = tags.slice();
        if (parent.classList.contains('unapplied-tag')) {
            parent.classList.replace('unapplied-tag', 'applied-tag');
            currentTags.splice(-1, 0, clickedTag);
        }
        else if (parent.classList.contains('applied-tag')) {
            parent.classList.replace('applied-tag', 'unapplied-tag');
            const idx = currentTags.indexOf(clickedTag);
            currentTags.splice(idx, 1);
        }
        return currentTags;
    }
    addTagOnClick(event) {
        this.setState({ plusIconShouldHide: true, addingNewTag: true });
        const inputElement = event.target;
        if (inputElement.value === 'Add Tag') {
            inputElement.value = '';
            inputElement.style.width = '62px';
            inputElement.style.minWidth = '62px';
        }
    }
    addTagOnKeyDown(event) {
        const inputElement = event.target;
        if (inputElement.value !== '' && event.keyCode === 13) {
            if (this.state.tags.includes(inputElement.value)) {
                alert('Duplicate Tag Name!');
                return;
            }
            const newTag = inputElement.value;
            // update state all tag and selected tag
            this.setState(state => ({
                selectedTags: [...state.selectedTags, newTag],
                tags: [...state.tags, newTag],
                plusIconShouldHide: false,
                addingNewTag: false
            }), this.handleOnChange);
        }
    }
    addTagOnBlur(event) {
        const inputElement = event.target;
        inputElement.value = 'Add Tag';
        inputElement.style.width = '50px';
        inputElement.style.minWidth = '50px';
        inputElement.blur();
        this.setState({ plusIconShouldHide: false, addingNewTag: false });
    }
    renderTags() {
        const hasTags = this.state.tags;
        const inputBox = this.state.addingNewTag === true ? (React.createElement("ul", { className: `${CODE_SNIPPET_EDITOR_TAG} tag unapplied-tag`, key: 'editor-new-tag' },
            React.createElement("input", { onClick: (event) => this.addTagOnClick(event), onKeyDown: (event) => this.addTagOnKeyDown(event), onBlur: (event) => this.addTagOnBlur(event), autoFocus: true }))) : (React.createElement("ul", { className: `${CODE_SNIPPET_EDITOR_TAG} tag unapplied-tag` },
            React.createElement("button", { onClick: () => this.setState({ addingNewTag: true }) }, "Add Tag"),
            React.createElement(addIcon.react, { tag: "span", className: CODE_SNIPPET_EDITOR_TAG_PLUS_ICON, elementPosition: "center", height: "16px", width: "16px", marginLeft: "2px" })));
        return (React.createElement("li", { className: CODE_SNIPPET_EDITOR_TAG_LIST },
            hasTags
                ? this.state.tags.map((tag, index) => (() => {
                    if (!this.state.selectedTags) {
                        return (React.createElement("ul", { className: `${CODE_SNIPPET_EDITOR_TAG} tag unapplied-tag`, id: 'editor' + '-' + tag + '-' + index, key: 'editor' + '-' + tag + '-' + index },
                            React.createElement("button", { onClick: this.handleClick }, tag)));
                    }
                    if (this.state.selectedTags.includes(tag)) {
                        return (React.createElement("ul", { className: `${CODE_SNIPPET_EDITOR_TAG} tag applied-tag`, id: 'editor' + '-' + tag + '-' + index, key: 'editor' + '-' + tag + '-' + index },
                            React.createElement("button", { onClick: this.handleClick }, tag),
                            React.createElement(checkIcon.react, { tag: "span", elementPosition: "center", height: "18px", width: "18px", marginLeft: "5px", marginRight: "-3px" })));
                    }
                    else {
                        return (React.createElement("ul", { className: `${CODE_SNIPPET_EDITOR_TAG} tag unapplied-tag`, id: 'editor' + '-' + tag + '-' + index, key: 'editor' + '-' + tag + '-' + index },
                            React.createElement("button", { onClick: this.handleClick }, tag)));
                    }
                })())
                : null,
            inputBox));
    }
    render() {
        return React.createElement("div", null, this.renderTags());
    }
}
