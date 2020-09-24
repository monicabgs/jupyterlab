import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { Signal } from '@lumino/signaling';
import { CodeSnippetContentsService } from './CodeSnippetContentsService';
import { CodeSnippetWidgetModel } from './CodeSnippetWidgetModel';
import { CodeSnippetDisplay } from './CodeSnippetDisplay';
import { CodeSnippetInputDialog } from './CodeSnippetInputDialog';
import React from 'react';
/**
 * A class used to indicate a snippet item.
 */
const CODE_SNIPPET_ITEM = 'jp-codeSnippet-item';
/**
 * The mimetype used for Jupyter cell data.
 */
const JUPYTER_CELL_MIME = 'application/vnd.jupyter.cells';
/**
 * A class used to indicate a drop target.
 */
const DROP_TARGET_CLASS = 'jp-codeSnippet-dropTarget';
const CODE_SNIPPET_EDITOR = 'jp-codeSnippet-editor';
const commands = {
    OPEN_CODE_SNIPPET_EDITOR: `${CODE_SNIPPET_EDITOR}:open`
};
/**
 * A widget for Code Snippets.
 */
export class CodeSnippetWidget extends ReactWidget {
    constructor(getCurrentWidget, app, editorServices) {
        super();
        this.app = app;
        this.editorServices = editorServices;
        this.getCurrentWidget = getCurrentWidget;
        this._codeSnippetWidgetModel = new CodeSnippetWidgetModel([]);
        this._codeSnippets = this._codeSnippetWidgetModel.snippets;
        this.renderCodeSnippetsSignal = new Signal(this);
        this.moveCodeSnippet.bind(this);
        this.openCodeSnippetEditor.bind(this);
        this.updateCodeSnippets.bind(this);
        this.codeSnippetManager = CodeSnippetContentsService.getInstance();
    }
    get codeSnippetWidgetModel() {
        return this._codeSnippetWidgetModel;
    }
    set codeSnippets(codeSnippets) {
        this._codeSnippets = codeSnippets;
    }
    // Request code snippets from contents service
    async fetchData() {
        const fileModels = [];
        const paths = [];
        // Clear the current snippets
        this._codeSnippetWidgetModel.clearSnippets();
        await this.codeSnippetManager
            .getData('snippets', 'directory')
            .then(model => {
            fileModels.push(...model.content);
        });
        fileModels.forEach(fileModel => paths.push(fileModel.path));
        let newSnippet = {
            name: '',
            description: '',
            language: '',
            code: [],
            id: -1
        };
        const codeSnippetList = [];
        for (let i = 0; i < paths.length; i++) {
            await this.codeSnippetManager.getData(paths[i], 'file').then(model => {
                const codeSnippet = JSON.parse(model.content);
                // append a new snippet created from scratch to the end
                if (codeSnippet.id === -1) {
                    codeSnippet.id = paths.length - 1;
                    newSnippet = codeSnippet;
                }
                codeSnippetList.push(codeSnippet);
            });
        }
        // new list of snippets
        this._codeSnippetWidgetModel.snippets = codeSnippetList;
        // sort codeSnippetList by ID
        this._codeSnippetWidgetModel.sortSnippets();
        // update the content of the new snippet
        if (newSnippet.name !== '') {
            this.codeSnippetManager.save('snippets/' + newSnippet.name + '.json', {
                type: 'file',
                format: 'text',
                content: JSON.stringify(newSnippet)
            });
        }
        this._codeSnippets = this._codeSnippetWidgetModel.snippets;
        return this._codeSnippetWidgetModel.snippets;
    }
    updateCodeSnippets() {
        this.fetchData().then((codeSnippets) => {
            if (codeSnippets !== null) {
                this.renderCodeSnippetsSignal.emit(codeSnippets);
            }
        });
    }
    onAfterShow(msg) {
        this.updateCodeSnippets();
    }
    openCodeSnippetEditor(args) {
        this.app.commands.execute(commands.OPEN_CODE_SNIPPET_EDITOR, args);
    }
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
    handleEvent(event) {
        switch (event.type) {
            case 'lm-dragenter':
                this._evtDragEnter(event);
                break;
            case 'lm-dragleave':
                this._evtDragLeave(event);
                break;
            case 'lm-dragover':
                this._evtDragOver(event);
                break;
            case 'lm-drop':
                this._evtDrop(event);
                break;
            default:
                break;
        }
    }
    /**
     * A message handler invoked on an `'after-attach'` message.
     * @param msg
     */
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        const node = this.node;
        node.addEventListener('lm-dragenter', this);
        node.addEventListener('lm-dragleave', this);
        node.addEventListener('lm-dragover', this);
        node.addEventListener('lm-drop', this);
    }
    /**
     * Handle `before-detach` messages for the widget.
     * @param msg
     */
    onBeforeDetach(msg) {
        const node = this.node;
        node.removeEventListener('lm-dragenter', this);
        node.removeEventListener('lm-dragleave', this);
        node.removeEventListener('lm-dragover', this);
        node.removeEventListener('lm-drop', this);
    }
    /**
     * Find the snippet containing the target html element.
     *
     * #### Notes
     * Returns undefined if the cell is not found.
     */
    _findSnippet(node) {
        // Trace up the DOM hierarchy to find the root cell node.
        // Then find the corresponding child and select it.
        let n = node;
        while (n && n !== this.node) {
            if (n.classList.contains(CODE_SNIPPET_ITEM)) {
                return n;
            }
            n = n.parentElement;
        }
        return undefined;
    }
    /**
     * Handle the `'lm-dragenter'` event for the widget.
     */
    _evtDragEnter(event) {
        if (!event.mimeData.hasData(JUPYTER_CELL_MIME)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const target = event.target;
        if (!event.mimeData.hasData('snippet/id')) {
            event.mimeData.setData('snippet/id', parseInt(target.id));
        }
        const snippet = this._findSnippet(target);
        if (snippet === undefined) {
            return;
        }
        const snippetNode = snippet;
        snippetNode.classList.add(DROP_TARGET_CLASS);
    }
    /**
     * Handle the `'lm-dragleave'` event for the widget.
     */
    _evtDragLeave(event) {
        if (!event.mimeData.hasData(JUPYTER_CELL_MIME)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const elements = this.node.getElementsByClassName(DROP_TARGET_CLASS);
        if (elements.length) {
            elements[0].classList.remove(DROP_TARGET_CLASS);
        }
    }
    /**
     * Handle the `'lm-dragover'` event for the widget.
     */
    _evtDragOver(event) {
        const data = this.findCellData(event.mimeData);
        if (data === undefined) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.dropAction = event.proposedAction;
        const elements = this.node.getElementsByClassName(DROP_TARGET_CLASS);
        if (elements.length) {
            elements[0].classList.remove(DROP_TARGET_CLASS);
        }
        const target = event.target;
        const snippet = this._findSnippet(target);
        if (snippet === undefined) {
            return;
        }
        const snippetNode = snippet;
        snippetNode.classList.add(DROP_TARGET_CLASS);
    }
    findCellData(mime) {
        const code = mime.getData('text/plain');
        return code.split('\n');
    }
    /**
     * Handle the `'lm-drop'` event for the widget.
     */
    async _evtDrop(event) {
        const data = this.findCellData(event.mimeData);
        if (data === undefined) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (event.proposedAction === 'none') {
            event.dropAction = 'none';
            return;
        }
        let target = event.target;
        while (target && target.parentElement) {
            if (target.classList.contains(DROP_TARGET_CLASS)) {
                target.classList.remove(DROP_TARGET_CLASS);
                break;
            }
            target = target.parentElement;
        }
        const snippet = this._findSnippet(target);
        // if target is CodeSnippetWidget, then snippet is undefined
        let idx = -1;
        if (snippet !== undefined) {
            idx = parseInt(snippet.id);
        }
        /**
         * moving snippets inside the snippet panel
         */
        const source = event.source;
        if (source instanceof CodeSnippetDisplay) {
            if (source.state.searchValue !== '' ||
                source.state.filterTags.length !== 0) {
                alert("Sorry, in the current version, you can't move snippets within explorer while filtering or searching");
                return;
            }
            event.dropAction = 'move';
            if (event.mimeData.hasData('snippet/id')) {
                const srcIdx = event.mimeData.getData('snippet/id');
                if (idx === -1) {
                    idx = this._codeSnippets.length;
                }
                this.moveCodeSnippet(srcIdx, idx);
            }
        }
        else {
            // Handle the case where we are copying cells
            event.dropAction = 'copy';
            CodeSnippetInputDialog(this, data, idx);
        }
        // Reorder snippet just to make sure id's are in order.
        this._codeSnippetWidgetModel.reorderSnippet();
    }
    // move code snippet within code snippet explorer
    moveCodeSnippet(srcIdx, targetIdx) {
        this._codeSnippetWidgetModel.moveSnippet(srcIdx, targetIdx);
        const newSnippets = this._codeSnippetWidgetModel.snippets;
        this.renderCodeSnippetsSignal.emit(newSnippets);
    }
    render() {
        return (React.createElement(UseSignal, { signal: this.renderCodeSnippetsSignal, initialArgs: [] }, (_, codeSnippets) => (React.createElement("div", null,
            React.createElement(CodeSnippetDisplay, { codeSnippets: codeSnippets, app: this.app, getCurrentWidget: this.getCurrentWidget, openCodeSnippetEditor: this.openCodeSnippetEditor.bind(this), editorServices: this.editorServices, _codeSnippetWidgetModel: this._codeSnippetWidgetModel, updateCodeSnippets: this.updateCodeSnippets })))));
    }
}
