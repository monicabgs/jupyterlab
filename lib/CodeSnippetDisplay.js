import { Clipboard, Dialog, showDialog } from '@jupyterlab/apputils';
import { PathExt } from '@jupyterlab/coreutils';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { FileEditor } from '@jupyterlab/fileeditor';
import { NotebookPanel } from '@jupyterlab/notebook';
import { LabIcon, addIcon, pythonIcon, fileIcon, rKernelIcon } from '@jupyterlab/ui-components';
import { CodeCellModel, MarkdownCell, CodeCell } from '@jupyterlab/cells';
import { Widget } from '@lumino/widgets';
import { find } from '@lumino/algorithm';
import { Drag } from '@lumino/dragdrop';
import { MimeData } from '@lumino/coreutils';
import React from 'react';
import { FilterTools } from './FilterTools';
import { showPreview } from './PreviewSnippet';
import { showMoreOptions } from './MoreOptions';
import { CodeSnippetContentsService } from './CodeSnippetContentsService';
import moreSVGstr from '../style/icon/jupyter_moreicon.svg';
import { babelIcon, javaIcon, juliaIcon, matlabIcon, schemeIcon, processingIcon, scalaIcon, groovyIcon, forthIcon, haskellIcon, rubyIcon, typescriptIcon, javascriptIcon, coffeescriptIcon, livescriptIcon, csharpIcon, fsharpIcon, goIcon, erlangIcon, ocamlIcon, fortranIcon, perlIcon, phpIcon, clojureIcon, luaIcon, purescriptIcon, cppIcon, prologIcon, lispIcon, cIcon, kotlinIcon, nodejsIcon, coconutIcon, sbtIcon, rustIcon, qsharpIcon } from './CodeSnippetLanguages';
/**
 * The CSS class added to code snippet widget.
 */
const CODE_SNIPPETS_HEADER_CLASS = 'jp-codeSnippetsHeader';
const CODE_SNIPPET_TITLE = 'jp-codeSnippet-title';
const CODE_SNIPPETS_CONTAINER = 'jp-codeSnippetsContainer';
const DISPLAY_NAME_CLASS = 'jp-codeSnippetsContainer-name';
const BUTTON_CLASS = 'jp-codeSnippetsContainer-button';
const TITLE_CLASS = 'jp-codeSnippetsContainer-title';
const ACTION_BUTTONS_WRAPPER_CLASS = 'jp-codeSnippetsContainer-action-buttons';
const ACTION_BUTTON_CLASS = 'jp-codeSnippetsContainer-actionButton';
const SEARCH_BOLD = 'jp-codeSnippet-search-bolding';
const SNIPPET_DRAG_IMAGE = 'jp-codeSnippet-drag-image';
const CODE_SNIPPET_DRAG_HOVER = 'jp-codeSnippet-drag-hover';
const CODE_SNIPPET_DRAG_HOVER_SELECTED = 'jp-codeSnippet-drag-hover-selected';
const CODE_SNIPPET_METADATA = 'jp-codeSnippet-metadata';
const CODE_SNIPPET_DESC = 'jp-codeSnippet-description';
const CODE_SNIPPET_EDITOR = 'jp-codeSnippet-editor';
const CODE_SNIPPET_MORE_OPTIONS = 'jp-codeSnippet-options';
const CODE_SNIPPET_MORE_OTPIONS_CONTENT = 'jp-codeSnippet-more-options-content';
const CODE_SNIPPET_MORE_OTPIONS_COPY = 'jp-codeSnippet-more-options-copy';
const CODE_SNIPPET_MORE_OTPIONS_INSERT = 'jp-codeSnippet-more-options-insert';
const CODE_SNIPPET_MORE_OTPIONS_EDIT = 'jp-codeSnippet-more-options-edit';
const CODE_SNIPPET_MORE_OTPIONS_DELETE = 'jp-codeSnippet-more-options-delete';
const CODE_SNIPPET_CREATE_NEW_BTN = 'jp-createSnippetBtn';
/**
 * The threshold in pixels to start a drag event.
 */
const DRAG_THRESHOLD = 5;
/**
 * A class used to indicate a snippet item.
 */
const CODE_SNIPPET_ITEM = 'jp-codeSnippet-item';
/**
 * The mimetype used for Jupyter cell data.
 */
const JUPYTER_CELL_MIME = 'application/vnd.jupyter.cells';
/**
 * Icon for more options
 */
const moreOptionsIcon = new LabIcon({
    name: 'custom-ui-components:moreOptions',
    svgstr: moreSVGstr
});
/**
 * A React Component for code-snippets display list.
 */
export class CodeSnippetDisplay extends React.Component {
    constructor(props) {
        super(props);
        // Handle code snippet insert into an editor
        this.insertCodeSnippet = async (snippet) => {
            var _a, _b, _c;
            const widget = this.props.getCurrentWidget();
            const snippetStr = snippet.code.join('\n');
            if (widget instanceof DocumentWidget &&
                widget.content instanceof FileEditor) {
                const documentWidget = widget;
                // code editor
                const fileEditor = documentWidget.content.editor;
                const markdownRegex = /^\.(md|mkdn?|mdown|markdown)$/;
                if (PathExt.extname(widget.context.path).match(markdownRegex) !== null) {
                    // Wrap snippet into a code block when inserting it into a markdown file
                    fileEditor.replaceSelection('```' + snippet.language + '\n' + snippetStr + '\n```');
                }
                else if (widget.constructor.name === 'PythonFileEditor') {
                    this.verifyLanguageAndInsert(snippet, 'python', fileEditor);
                }
                else {
                    fileEditor.replaceSelection(snippetStr);
                }
            }
            else if (widget instanceof NotebookPanel) {
                const notebookWidget = widget;
                const notebookCell = notebookWidget.content.activeCell;
                // editor
                const notebookCellEditor = notebookCell.editor;
                if (notebookCell instanceof CodeCell) {
                    const kernelInfo = await ((_b = (_a = notebookWidget.sessionContext.session) === null || _a === void 0 ? void 0 : _a.kernel) === null || _b === void 0 ? void 0 : _b.info);
                    const kernelLanguage = ((_c = kernelInfo) === null || _c === void 0 ? void 0 : _c.language_info.name) || '';
                    this.verifyLanguageAndInsert(snippet, kernelLanguage, notebookCellEditor);
                }
                else if (notebookCell instanceof MarkdownCell) {
                    // Wrap snippet into a code block when inserting it into a markdown cell
                    notebookCellEditor.replaceSelection('```' + snippet.language + '\n' + snippetStr + '\n```');
                }
                else {
                    notebookCellEditor.replaceSelection(snippetStr);
                }
            }
            else {
                this.showErrDialog('Code snippet insert failed: Unsupported widget');
            }
        };
        // Handle language compatibility between code snippet and editor
        this.verifyLanguageAndInsert = async (snippet, editorLanguage, editor) => {
            const snippetStr = snippet.code.join('\n');
            if (editorLanguage &&
                snippet.language.toLowerCase() !== editorLanguage.toLowerCase()) {
                const result = await this.showWarnDialog(editorLanguage, snippet.name);
                if (result.button.accept) {
                    editor.replaceSelection(snippetStr);
                }
            }
            else {
                // Language match or editorLanguage is unavailable
                editor.replaceSelection(snippetStr);
            }
        };
        // Display warning dialog when inserting a code snippet incompatible with editor's language
        this.showWarnDialog = async (editorLanguage, snippetName) => {
            return showDialog({
                title: 'Warning',
                body: 'Code snippet "' +
                    snippetName +
                    '" is incompatible with ' +
                    editorLanguage +
                    '. Continue?',
                buttons: [Dialog.cancelButton(), Dialog.okButton()]
            });
        };
        // Display error dialog when inserting a code snippet into unsupported widget (i.e. not an editor)
        this.showErrDialog = (errMsg) => {
            return showDialog({
                title: 'Error',
                body: errMsg,
                buttons: [Dialog.okButton()]
            });
        };
        // Create 6 dots drag/drop image on hover
        this.dragHoverStyle = (id) => {
            const _id = parseInt(id, 10);
            document
                .getElementsByClassName(CODE_SNIPPET_DRAG_HOVER)[_id].classList.add(CODE_SNIPPET_DRAG_HOVER_SELECTED);
        };
        // Remove 6 dots off hover
        this.dragHoverStyleRemove = (id) => {
            const _id = parseInt(id, 10);
            if (document.getElementsByClassName(CODE_SNIPPET_DRAG_HOVER)) {
                document
                    .getElementsByClassName(CODE_SNIPPET_DRAG_HOVER)[_id].classList.remove(CODE_SNIPPET_DRAG_HOVER_SELECTED);
            }
        };
        // Bold text in snippet name based on search
        this.boldNameOnSearch = (searchValue, language, name) => {
            const displayName = language + name;
            if (searchValue !== '' &&
                displayName.toLowerCase().includes(searchValue.toLowerCase())) {
                const startIndex = displayName
                    .toLowerCase()
                    .indexOf(searchValue.toLowerCase());
                const endIndex = startIndex + searchValue.length;
                if (endIndex <= language.length) {
                    return React.createElement("span", null, name);
                }
                else {
                    const start = displayName.substring(language.length, startIndex);
                    const bolded = displayName.substring(startIndex, endIndex);
                    const end = displayName.substring(endIndex);
                    return (React.createElement("span", null,
                        start,
                        React.createElement("mark", { className: SEARCH_BOLD }, bolded),
                        end));
                }
            }
            return React.createElement("span", null, name);
        };
        // Render display of code snippet list
        this.renderCodeSnippet = (codeSnippet, id) => {
            const buttonClasses = BUTTON_CLASS;
            const displayName = '[' + codeSnippet.language + '] ' + codeSnippet.name;
            const name = codeSnippet.name;
            const language = codeSnippet.language;
            const actionButtons = [
                {
                    title: 'Insert, copy, edit, and delete',
                    icon: moreOptionsIcon,
                    onClick: (event) => {
                        showMoreOptions({ body: new OptionsHandler(this, codeSnippet) });
                        this._setOptionsPosition(event);
                    }
                }
            ];
            return (React.createElement("div", { key: codeSnippet.name, className: CODE_SNIPPET_ITEM, id: id, onMouseOver: () => {
                    this.dragHoverStyle(id);
                }, onMouseOut: () => {
                    this.dragHoverStyleRemove(id);
                } },
                React.createElement("div", { className: CODE_SNIPPET_DRAG_HOVER, title: "Drag to move", id: id, onMouseDown: (event) => {
                        this.handleDragSnippet(event);
                    } }),
                React.createElement("div", { className: CODE_SNIPPET_METADATA, onMouseEnter: () => {
                        showPreview({
                            id: parseInt(id, 10),
                            title: displayName,
                            body: new PreviewHandler(),
                            codeSnippet: codeSnippet
                        }, this.props.editorServices);
                        this._setPreviewPosition(id);
                    }, onMouseLeave: () => {
                        this._evtMouseLeave();
                    } },
                    React.createElement("div", { key: displayName, className: TITLE_CLASS, id: id },
                        React.createElement("div", { id: id, title: codeSnippet.name, className: DISPLAY_NAME_CLASS },
                            this.renderLanguageIcon(codeSnippet.language),
                            this.boldNameOnSearch(this.state.searchValue, language, name)),
                        React.createElement("div", { className: ACTION_BUTTONS_WRAPPER_CLASS, id: id }, actionButtons.map(btn => {
                            return (React.createElement("button", { key: btn.title, title: btn.title, className: buttonClasses + ' ' + ACTION_BUTTON_CLASS, onClick: (event) => {
                                    btn.onClick(event);
                                } },
                                React.createElement(btn.icon.react, { tag: "span", elementPosition: "center", width: "16px", height: "16px" })));
                        }))),
                    React.createElement("div", { className: CODE_SNIPPET_DESC, id: id },
                        React.createElement("p", { id: id }, `${codeSnippet.description}`)))));
        };
        this.filterSnippets = (searchValue, filterTags) => {
            // filter with search
            let filteredSnippets = this.props.codeSnippets.filter(codeSnippet => codeSnippet.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                codeSnippet.language.toLowerCase().includes(searchValue.toLowerCase()));
            // filter with tags
            if (filterTags.length !== 0) {
                filteredSnippets = filteredSnippets.filter(codeSnippet => {
                    return filterTags.some(tag => {
                        if (codeSnippet.tags) {
                            return codeSnippet.tags.includes(tag);
                        }
                        return false;
                    });
                });
            }
            this.setState({
                codeSnippets: filteredSnippets,
                searchValue: searchValue,
                filterTags: filterTags
            });
        };
        this.state = {
            codeSnippets: this.props.codeSnippets,
            searchValue: '',
            filterTags: []
        };
        this._drag = null;
        this._dragData = null;
        this.handleDragMove = this.handleDragMove.bind(this);
        this._evtMouseUp = this._evtMouseUp.bind(this);
    }
    handleDragSnippet(event) {
        const { button } = event;
        // if button is not the left click
        if (!(button === 0)) {
            return;
        }
        const target = event.target;
        this._dragData = {
            pressX: event.clientX,
            pressY: event.clientY,
            dragImage: target.nextSibling.firstChild.cloneNode(true)
        };
        const dragImageTextColor = getComputedStyle(document.body).getPropertyValue('--jp-content-font-color3');
        this._dragData.dragImage
            .children[0].style.color = dragImageTextColor;
        // add CSS style
        this._dragData.dragImage.classList.add(SNIPPET_DRAG_IMAGE);
        target.addEventListener('mouseup', this._evtMouseUp, true);
        target.addEventListener('mousemove', this.handleDragMove, true);
        event.preventDefault();
    }
    _evtMouseUp(event) {
        event.preventDefault();
        event.stopPropagation();
        const target = event.target;
        target.removeEventListener('mousemove', this.handleDragMove, true);
        target.removeEventListener('mouseup', this._evtMouseUp, true);
    }
    handleDragMove(event) {
        const data = this._dragData;
        if (data &&
            this.shouldStartDrag(data.pressX, data.pressY, event.clientX, event.clientY)) {
            const idx = event.target.id;
            const codeSnippet = this.state.codeSnippets[parseInt(idx)];
            this.startDrag(data.dragImage, codeSnippet, event.clientX, event.clientY);
        }
    }
    /**
     * Detect if a drag event should be started. This is down if the
     * mouse is moved beyond a certain distance (DRAG_THRESHOLD).
     *
     * @param prevX - X Coordinate of the mouse pointer during the mousedown event
     * @param prevY - Y Coordinate of the mouse pointer during the mousedown event
     * @param nextX - Current X Coordinate of the mouse pointer
     * @param nextY - Current Y Coordinate of the mouse pointer
     */
    shouldStartDrag(prevX, prevY, nextX, nextY) {
        const dx = Math.abs(nextX - prevX);
        const dy = Math.abs(nextY - prevY);
        return dx >= DRAG_THRESHOLD || dy >= DRAG_THRESHOLD;
    }
    async startDrag(dragImage, codeSnippet, clientX, clientY) {
        const target = event.target;
        const modelFactory = new ModelFactory();
        const model = modelFactory.createCodeCell({});
        model.value.text = codeSnippet.code.join('\n');
        model.metadata;
        const selected = [model.toJSON()];
        this._drag = new Drag({
            mimeData: new MimeData(),
            dragImage: dragImage,
            supportedActions: 'copy-move',
            proposedAction: 'copy',
            source: this
        });
        this._drag.mimeData.setData(JUPYTER_CELL_MIME, selected);
        const textContent = codeSnippet.code.join('\n');
        this._drag.mimeData.setData('text/plain', textContent);
        // Remove mousemove and mouseup listeners and start the drag.
        target.removeEventListener('mousemove', this.handleDragMove, true);
        target.removeEventListener('mouseup', this._evtMouseUp, true);
        return this._drag.start(clientX, clientY).then(() => {
            this.dragHoverStyleRemove(codeSnippet.id.toString());
            this._drag = null;
            this._dragData = null;
        });
    }
    _evtMouseLeave() {
        const preview = document.querySelector('.jp-codeSnippet-preview');
        if (preview) {
            if (!preview.classList.contains('inactive')) {
                preview.classList.add('inactive');
            }
        }
    }
    //Set the position of the preview to be next to the snippet title.
    _setPreviewPosition(id) {
        const intID = parseInt(id, 10);
        const realTarget = document.getElementsByClassName(TITLE_CLASS)[intID];
        // distDown is the number of pixels to shift the preview down
        let distDown = realTarget.getBoundingClientRect().top - 43;
        if (realTarget.getBoundingClientRect().top > window.screen.height / 2) {
            distDown = distDown - 66;
        }
        const final = distDown.toString(10) + 'px';
        document.documentElement.style.setProperty('--preview-distance', final);
    }
    //Set the position of the option to be under to the three dots on snippet.
    _setOptionsPosition(event) {
        const target = event.target;
        let top;
        if (target.tagName === 'path') {
            top = target.getBoundingClientRect().top + 10;
        }
        else {
            top = target.getBoundingClientRect().top + 18;
        }
        if (top > 0.7 * window.screen.height) {
            top -= 120;
        }
        const leftAsString = target.getBoundingClientRect().left.toString(10) + 'px';
        const topAsString = top.toString(10) + 'px';
        document.documentElement.style.setProperty('--more-options-top', topAsString);
        document.documentElement.style.setProperty('--more-options-left', leftAsString);
    }
    renderLanguageIcon(language) {
        switch (language) {
            case 'Python': {
                return (React.createElement(pythonIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Java': {
                return (React.createElement(javaIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'R': {
                return (React.createElement(rKernelIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Julia': {
                return (React.createElement(juliaIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Matlab': {
                return (React.createElement(matlabIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Scheme': {
                return (React.createElement(schemeIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Processing': {
                return (React.createElement(processingIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Scala': {
                return (React.createElement(scalaIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Groovy': {
                return (React.createElement(groovyIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Fortran': {
                return (React.createElement(fortranIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Haskell': {
                return (React.createElement(haskellIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Ruby': {
                return (React.createElement(rubyIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'TypeScript': {
                return (React.createElement(typescriptIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'JavaScript': {
                return (React.createElement(javascriptIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'CoffeeScript': {
                return (React.createElement(coffeescriptIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'LiveScript': {
                return (React.createElement(livescriptIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'C#': {
                return (React.createElement(csharpIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'F#': {
                return (React.createElement(fsharpIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Go': {
                return (React.createElement(goIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Erlang': {
                return (React.createElement(erlangIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'OCaml': {
                return (React.createElement(ocamlIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Forth': {
                return (React.createElement(forthIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Perl': {
                return (React.createElement(perlIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'PHP': {
                return (React.createElement(phpIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Clojure': {
                return (React.createElement(clojureIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Lua': {
                return (React.createElement(luaIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'PureScript': {
                return (React.createElement(purescriptIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'C++': {
                return (React.createElement(cppIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Prolog': {
                return (React.createElement(prologIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Common Lisp': {
                return (React.createElement(lispIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'C': {
                return (React.createElement(cIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Kotlin': {
                return (React.createElement(kotlinIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'NodeJS': {
                return (React.createElement(nodejsIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Coconut': {
                return (React.createElement(coconutIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Babel': {
                return (React.createElement(babelIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'sbt': {
                return (React.createElement(sbtIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Rust': {
                return (React.createElement(rustIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            case 'Q#': {
                return (React.createElement(qsharpIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
            default: {
                return (React.createElement(fileIcon.react, { tag: "span", height: "16px", width: "16px", right: "7px", top: "5px", "margin-right": "3px" }));
            }
        }
    }
    static getDerivedStateFromProps(props, state) {
        if (state.searchValue === '' && state.filterTags.length === 0) {
            return {
                codeSnippets: props.codeSnippets,
                searchValue: '',
                filterTags: []
            };
        }
        if (state.searchValue !== '' || state.filterTags.length !== 0) {
            const newSnippets = props.codeSnippets.filter(codeSnippet => {
                return ((state.searchValue !== '' &&
                    codeSnippet.name.toLowerCase().includes(state.searchValue)) ||
                    (state.searchValue !== '' &&
                        codeSnippet.language.toLowerCase().includes(state.searchValue)) ||
                    (codeSnippet.tags &&
                        codeSnippet.tags.some(tag => state.filterTags.includes(tag))));
            });
            return {
                codeSnippets: newSnippets,
                searchValue: state.searchValue,
                filterTags: state.filterTags
            };
        }
        return null;
    }
    getActiveTags() {
        const tags = [];
        for (const codeSnippet of this.props.codeSnippets) {
            if (codeSnippet.tags) {
                for (const tag of codeSnippet.tags) {
                    if (!tags.includes(tag)) {
                        tags.push(tag);
                    }
                }
            }
        }
        return tags;
    }
    deleteCommand(codeSnippet) {
        const contentsService = CodeSnippetContentsService.getInstance();
        showDialog({
            title: 'Delete snippet?',
            body: 'Are you sure you want to delete "' + codeSnippet.name + '"? ',
            buttons: [
                Dialog.okButton({
                    label: 'Delete',
                    displayType: 'warn'
                }),
                Dialog.cancelButton()
            ]
        }).then((response) => {
            if (response.button.accept) {
                const widgetId = `${CODE_SNIPPET_EDITOR}-${codeSnippet.id}`;
                const editor = find(this.props.app.shell.widgets('main'), (widget, _) => {
                    return widget.id === widgetId;
                });
                if (editor) {
                    editor.dispose();
                }
                // deleting snippets when there is one snippet active
                contentsService.delete('snippets/' + codeSnippet.name + '.json');
                this.props._codeSnippetWidgetModel.deleteSnippet(codeSnippet.id);
                this.props._codeSnippetWidgetModel.reorderSnippet();
                this.props._codeSnippetWidgetModel.updateSnippetContents();
                // active tags after delete
                const activeTags = this.getActiveTags();
                // filterTags: only the tags that are still being used
                this.setState(state => ({
                    codeSnippets: this.props._codeSnippetWidgetModel.snippets,
                    filterTags: state.filterTags.filter(tag => activeTags.includes(tag))
                }));
            }
        });
    }
    // remove dropdown menu
    removeOptionsNode() {
        const temp = document.getElementsByClassName(CODE_SNIPPET_MORE_OPTIONS)[0];
        if (!temp.classList.contains('inactive')) {
            temp.classList.add('inactive');
        }
    }
    // create dropdown menu
    createOptionsNode(codeSnippet) {
        const body = document.createElement('div');
        const optionsContainer = document.createElement('div');
        optionsContainer.className = CODE_SNIPPET_MORE_OTPIONS_CONTENT;
        const insertSnip = document.createElement('div');
        insertSnip.className = CODE_SNIPPET_MORE_OTPIONS_INSERT;
        insertSnip.textContent = 'Insert snippet';
        insertSnip.onclick = () => {
            this.insertCodeSnippet(codeSnippet);
            this.removeOptionsNode();
        };
        const copySnip = document.createElement('div');
        copySnip.className = CODE_SNIPPET_MORE_OTPIONS_COPY;
        copySnip.textContent = 'Copy snippet to clipboard';
        copySnip.onclick = () => {
            Clipboard.copyToSystem(codeSnippet.code.join('\n'));
            alert('saved to clipboard');
            this.removeOptionsNode();
        };
        const editSnip = document.createElement('div');
        editSnip.className = CODE_SNIPPET_MORE_OTPIONS_EDIT;
        editSnip.textContent = 'Edit snippet';
        editSnip.onclick = () => {
            const allTags = this.getActiveTags();
            this.props.openCodeSnippetEditor({
                name: codeSnippet.name,
                description: codeSnippet.description,
                language: codeSnippet.language,
                code: codeSnippet.code,
                id: codeSnippet.id,
                selectedTags: codeSnippet.tags,
                allTags: allTags,
                fromScratch: false
            });
            this.removeOptionsNode();
        };
        const deleteSnip = document.createElement('div');
        deleteSnip.className = CODE_SNIPPET_MORE_OTPIONS_DELETE;
        deleteSnip.textContent = 'Delete snippet';
        deleteSnip.onclick = () => {
            this.deleteCommand(codeSnippet);
            this.removeOptionsNode();
        };
        optionsContainer.appendChild(insertSnip);
        optionsContainer.appendChild(copySnip);
        optionsContainer.appendChild(editSnip);
        optionsContainer.appendChild(deleteSnip);
        body.append(optionsContainer);
        return body;
    }
    render() {
        return (React.createElement("div", null,
            React.createElement("header", { className: CODE_SNIPPETS_HEADER_CLASS },
                React.createElement("span", { className: CODE_SNIPPET_TITLE }, 'Snippets'),
                React.createElement("button", { className: CODE_SNIPPET_CREATE_NEW_BTN, onClick: () => {
                        this.props.openCodeSnippetEditor({
                            name: '',
                            description: '',
                            language: 'Python',
                            code: [],
                            id: -1,
                            allTags: this.getActiveTags(),
                            fromScratch: true
                        });
                    } },
                    React.createElement(addIcon.react, { tag: "span", right: "7px", top: "5px" }))),
            React.createElement(FilterTools, { tags: this.getActiveTags(), onFilter: this.filterSnippets }),
            React.createElement("div", { className: CODE_SNIPPETS_CONTAINER },
                React.createElement("div", null, this.state.codeSnippets.map((codeSnippet, id) => this.renderCodeSnippet(codeSnippet, id.toString()))))));
    }
}
class OptionsHandler extends Widget {
    constructor(display, codeSnippet) {
        super({ node: display.createOptionsNode(codeSnippet) });
    }
}
class PreviewHandler extends Widget {
    constructor() {
        super({ node: Private.createPreviewNode() });
    }
}
class Private {
    static createPreviewContent() {
        const body = document.createElement('div');
        return body;
    }
    /**
     * Create structure for preview of snippet data.
     */
    static createPreviewNode() {
        return this.createPreviewContent();
    }
}
/**
 * The default implementation of an `IModelFactory`.
 */
export class ModelFactory {
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
    createCodeCell(options) {
        if (!options.contentFactory) {
            options.contentFactory = this.codeCellContentFactory;
        }
        return new CodeCellModel(options);
    }
}
