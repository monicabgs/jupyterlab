import { CodeEditor } from '@jupyterlab/codeeditor';
import { ReactWidget, showDialog, Dialog } from '@jupyterlab/apputils';
import { Button } from '@jupyterlab/ui-components';
import React from 'react';
import { SUPPORTED_LANGUAGES } from './CodeSnippetLanguages';
import { CodeSnippetEditorTags } from './CodeSnippetEditorTags';
/**
 * CSS style classes
 */
const CODE_SNIPPET_EDITOR = 'jp-codeSnippet-editor';
const CODE_SNIPPET_EDITOR_TITLE = 'jp-codeSnippet-editor-title';
const CODE_SNIPPET_EDITOR_METADATA = 'jp-codeSnippet-editor-metadata';
const CODE_SNIPPET_EDITOR_INPUT_ACTIVE = 'jp-codeSnippet-editor-active';
const CODE_SNIPPET_EDITOR_NAME_INPUT = 'jp-codeSnippet-editor-name';
const CODE_SNIPPET_EDITOR_LABEL = 'jp-codeSnippet-editor-label';
const CODE_SNIPPET_EDITOR_DESC_INPUT = 'jp-codeSnippet-editor-description';
const CODE_SNIPPET_EDITOR_LANG_INPUT = 'jp-codeSnippet-editor-language';
const CODE_SNIPPET_EDITOR_MIRROR = 'jp-codeSnippetInput-editor';
const CODE_SNIPPET_EDITOR_INPUTAREA = 'jp-codeSnippetInputArea';
const CODE_SNIPPET_EDITOR_INPUTAREA_MIRROR = 'jp-codeSnippetInputArea-editor';
const CODE_SNIPPET_EDITOR_INPUTNAME_VALIDITY = 'jp-codeSnippet-inputName-validity';
const CODE_SNIPPET_EDITOR_INPUTDESC_VALIDITY = 'jp-codeSnippet-inputDesc-validity';
const EDITOR_DIRTY_CLASS = 'jp-mod-dirty';
export class CodeSnippetEditor extends ReactWidget {
    constructor(contentsService, editorServices, tracker, codeSnippetWidget, args) {
        super();
        this.addClass(CODE_SNIPPET_EDITOR);
        this.contentsService = contentsService;
        this.editorServices = editorServices;
        this.tracker = tracker;
        this._codeSnippetEditorMetaData = args;
        this.oldCodeSnippetName = args.name;
        this.saved = true;
        this._hasRefreshedSinceAttach = false;
        this.codeSnippetWidget = codeSnippetWidget;
        this.renderCodeInput = this.renderCodeInput.bind(this);
        this.handleInputFieldChange = this.handleInputFieldChange.bind(this);
        this.activateCodeMirror = this.activateCodeMirror.bind(this);
        this.saveChange = this.saveChange.bind(this);
        this.updateSnippet = this.updateSnippet.bind(this);
        this.handleChangeOnTag = this.handleChangeOnTag.bind(this);
    }
    get codeSnippetEditorMetadata() {
        return this._codeSnippetEditorMetaData;
    }
    deactivateEditor(event) {
        let target = event.target;
        while (target && target.parentElement) {
            if (target.classList.contains(CODE_SNIPPET_EDITOR_MIRROR) ||
                target.classList.contains(CODE_SNIPPET_EDITOR_NAME_INPUT) ||
                target.classList.contains(CODE_SNIPPET_EDITOR_DESC_INPUT)) {
                break;
            }
            target = target.parentElement;
        }
        const nameInput = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} .${CODE_SNIPPET_EDITOR_NAME_INPUT}`);
        const descriptionInput = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} .${CODE_SNIPPET_EDITOR_DESC_INPUT}`);
        const editor = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} #code-${this._codeSnippetEditorMetaData.id}`);
        if (target.classList.contains(CODE_SNIPPET_EDITOR_NAME_INPUT)) {
            this.deactivateDescriptionField(descriptionInput);
            this.deactivateCodeMirror(editor);
        }
        else if (target.classList.contains(CODE_SNIPPET_EDITOR_DESC_INPUT)) {
            this.deactivateNameField(nameInput);
            this.deactivateCodeMirror(editor);
        }
        else if (target.classList.contains(CODE_SNIPPET_EDITOR_MIRROR)) {
            this.deactivateNameField(nameInput);
            this.deactivateDescriptionField(descriptionInput);
        }
        else {
            this.deactivateNameField(nameInput);
            this.deactivateDescriptionField(descriptionInput);
            this.deactivateCodeMirror(editor);
        }
    }
    deactivateNameField(nameInput) {
        if (nameInput.classList.contains(CODE_SNIPPET_EDITOR_INPUT_ACTIVE)) {
            nameInput.classList.remove(CODE_SNIPPET_EDITOR_INPUT_ACTIVE);
        }
    }
    deactivateDescriptionField(descriptionInput) {
        if (descriptionInput.classList.contains(CODE_SNIPPET_EDITOR_INPUT_ACTIVE)) {
            descriptionInput.classList.remove(CODE_SNIPPET_EDITOR_INPUT_ACTIVE);
        }
    }
    activeFieldState(event) {
        const target = event.target;
        if (!target.classList.contains(CODE_SNIPPET_EDITOR_INPUT_ACTIVE)) {
            target.classList.add(CODE_SNIPPET_EDITOR_INPUT_ACTIVE);
        }
    }
    onUpdateRequest(msg) {
        super.onUpdateRequest(msg);
        if (!this.editor &&
            document.getElementById('code-' + this._codeSnippetEditorMetaData.id)) {
            const editorFactory = this.editorServices.factoryService.newInlineEditor;
            const getMimeTypeByLanguage = this.editorServices.mimeTypeService
                .getMimeTypeByLanguage;
            this.editor = editorFactory({
                host: document.getElementById('code-' + this._codeSnippetEditorMetaData.id),
                model: new CodeEditor.Model({
                    value: this._codeSnippetEditorMetaData.code.join('\n'),
                    mimeType: getMimeTypeByLanguage({
                        name: this._codeSnippetEditorMetaData.language,
                        codemirror_mode: this._codeSnippetEditorMetaData.language
                    })
                })
            });
            this.editor.model.value.changed.connect((args) => {
                this._codeSnippetEditorMetaData.code = args.text.split('\n');
                if (!this.title.className.includes(EDITOR_DIRTY_CLASS)) {
                    this.title.className += ` ${EDITOR_DIRTY_CLASS}`;
                }
                this.saved = false;
            });
        }
        if (this.isVisible) {
            this._hasRefreshedSinceAttach = true;
            this.editor.refresh();
        }
    }
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        this._hasRefreshedSinceAttach = false;
        if (this.isVisible) {
            this.update();
        }
        window.addEventListener('beforeunload', e => {
            if (!this.saved) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    onAfterShow(msg) {
        if (!this._hasRefreshedSinceAttach) {
            this.update();
        }
    }
    /**
     * Initial focus on the editor when it gets activated!
     * @param msg
     */
    onActivateRequest(msg) {
        this.editor.focus();
    }
    onCloseRequest(msg) {
        if (!this.saved) {
            showDialog({
                title: 'Close without saving?',
                body: (React.createElement("p", null,
                    ' ',
                    `"${this._codeSnippetEditorMetaData.name}" has unsaved changes, close without saving?`,
                    ' ')),
                buttons: [Dialog.cancelButton(), Dialog.okButton()]
            }).then((response) => {
                if (response.button.accept) {
                    this.dispose();
                    super.onCloseRequest(msg);
                }
            });
        }
        else {
            this.dispose();
            super.onCloseRequest(msg);
        }
    }
    /**
     * Visualize the editor more look like an editor
     * @param event
     */
    activateCodeMirror(event) {
        let target = event.target;
        while (target && target.parentElement) {
            if (target.classList.contains(CODE_SNIPPET_EDITOR_MIRROR)) {
                break;
            }
            target = target.parentElement;
        }
        const editor = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} #code-${this._codeSnippetEditorMetaData.id}`);
        if (target.classList.contains(CODE_SNIPPET_EDITOR_MIRROR)) {
            if (!editor.classList.contains('active')) {
                editor.classList.add('active');
            }
        }
    }
    deactivateCodeMirror(editor) {
        if (editor.classList.contains('active')) {
            editor.classList.remove('active');
        }
    }
    handleInputFieldChange(event) {
        if (!this.title.className.includes(EDITOR_DIRTY_CLASS)) {
            this.title.className += ` ${EDITOR_DIRTY_CLASS}`;
        }
        const target = event.target;
        if (!target.classList.contains('FieldChanged')) {
            target.classList.add('FieldChanged');
        }
        this.saved = false;
    }
    saveChange(event) {
        const name = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} .${CODE_SNIPPET_EDITOR_NAME_INPUT}`).value;
        const description = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} .${CODE_SNIPPET_EDITOR_DESC_INPUT}`).value;
        const language = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} .${CODE_SNIPPET_EDITOR_LANG_INPUT}`).value;
        const validity = this.validateInputs(name, description, language);
        if (validity) {
            this.updateSnippet();
        }
    }
    validateInputs(name, description, language) {
        let status = true;
        let message = '';
        if (name === '') {
            message += 'Name must be filled out\n';
            status = false;
        }
        if (name.match(/[^a-z0-9_]+/)) {
            message += 'Wrong format of the name\n';
            status = false;
        }
        if (description === '') {
            message += 'Description must be filled out\n';
            status = false;
        }
        if (description.match(/[^a-zA-Z0-9_ ,.?!]+/)) {
            message += 'Wrong format of the description\n';
            status = false;
        }
        if (language === '') {
            message += 'Language must be filled out';
            status = false;
        }
        if (!SUPPORTED_LANGUAGES.includes(language)) {
            message += 'Language must be one of the options';
            status = false;
        }
        if (status === false) {
            alert(message);
        }
        return status;
    }
    async updateSnippet() {
        const name = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} .${CODE_SNIPPET_EDITOR_NAME_INPUT}`).value;
        const description = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} .${CODE_SNIPPET_EDITOR_DESC_INPUT}`).value;
        const language = document.querySelector(`.${CODE_SNIPPET_EDITOR}-${this._codeSnippetEditorMetaData.id} .${CODE_SNIPPET_EDITOR_LANG_INPUT}`).value;
        this._codeSnippetEditorMetaData.name = name;
        this._codeSnippetEditorMetaData.description = description;
        this._codeSnippetEditorMetaData.language = language;
        this.saved = true;
        const newPath = 'snippets/' + this._codeSnippetEditorMetaData.name + '.json';
        if (!this._codeSnippetEditorMetaData.fromScratch) {
            const oldPath = 'snippets/' + this.oldCodeSnippetName + '.json';
            if (newPath !== oldPath) {
                // renaming code snippet
                try {
                    await this.contentsService.rename(oldPath, newPath);
                }
                catch (error) {
                    await showDialog({
                        title: 'Duplicate Name of Code Snippet',
                        body: React.createElement("p", null,
                            " ",
                            `"${newPath}" already exists.`,
                            " "),
                        buttons: [Dialog.cancelButton()]
                    });
                    return;
                }
                // set new name as an old name
                this.oldCodeSnippetName = this._codeSnippetEditorMetaData.name;
            }
        }
        else {
            let nameCheck = false;
            await this.contentsService
                .getData(newPath, 'file')
                .then(async (value) => {
                if (value.name) {
                    await showDialog({
                        title: 'Duplicate Name of Code Snippet',
                        body: React.createElement("p", null,
                            " ",
                            `"${newPath}" already exists.`,
                            " "),
                        buttons: [Dialog.cancelButton()]
                    });
                }
            })
                .catch(() => {
                nameCheck = true;
            });
            if (!nameCheck) {
                return;
            }
        }
        await this.contentsService.save(newPath, {
            type: 'file',
            format: 'text',
            content: JSON.stringify({
                name: this._codeSnippetEditorMetaData.name,
                description: this._codeSnippetEditorMetaData.description,
                language: this._codeSnippetEditorMetaData.language,
                code: this._codeSnippetEditorMetaData.code,
                id: this._codeSnippetEditorMetaData.id,
                tags: this._codeSnippetEditorMetaData.selectedTags
            })
        });
        // remove the dirty state
        this.title.className = this.title.className.replace(` ${EDITOR_DIRTY_CLASS}`, '');
        // change label
        this.title.label =
            '[' +
                this._codeSnippetEditorMetaData.language +
                '] ' +
                this._codeSnippetEditorMetaData.name;
        if (!this._codeSnippetEditorMetaData.fromScratch) {
            // update tracker
            this.tracker.save(this);
        }
        // update the display in code snippet explorer
        this.codeSnippetWidget.updateCodeSnippets();
        // close editor if it's from scratch
        if (this._codeSnippetEditorMetaData.fromScratch) {
            this.dispose();
        }
    }
    handleChangeOnTag(selectedTags, allTags) {
        if (!this.title.className.includes(EDITOR_DIRTY_CLASS)) {
            this.title.className += ` ${EDITOR_DIRTY_CLASS}`;
        }
        this._codeSnippetEditorMetaData.selectedTags = selectedTags;
        this._codeSnippetEditorMetaData.allTags = allTags;
        this.saved = false;
    }
    handleOnBlur(event) {
        const target = event.target;
        if (!target.classList.contains('touched')) {
            target.classList.add('touched');
        }
    }
    /**
     * TODO: clean CSS style class - "Use constant"
     */
    renderCodeInput() {
        return (React.createElement("section", { className: CODE_SNIPPET_EDITOR_INPUTAREA_MIRROR, onMouseDown: this.activateCodeMirror },
            React.createElement("div", { className: CODE_SNIPPET_EDITOR_MIRROR, id: 'code-' + this._codeSnippetEditorMetaData.id.toString() })));
    }
    renderLanguages() {
        SUPPORTED_LANGUAGES.sort();
        return (React.createElement("div", null,
            React.createElement("input", { className: CODE_SNIPPET_EDITOR_LANG_INPUT, list: "languages", name: "language", defaultValue: this._codeSnippetEditorMetaData.language, onChange: this.handleInputFieldChange, required: true }),
            React.createElement("datalist", { id: "languages" }, SUPPORTED_LANGUAGES.map(lang => this.renderLanguageOptions(lang)))));
    }
    renderLanguageOptions(option) {
        return React.createElement("option", { key: option, value: option });
    }
    render() {
        const fromScratch = this._codeSnippetEditorMetaData.fromScratch;
        return (React.createElement("div", { className: CODE_SNIPPET_EDITOR_INPUTAREA, onMouseDown: (event) => {
                this.deactivateEditor(event);
            } },
            React.createElement("span", { className: CODE_SNIPPET_EDITOR_TITLE }, fromScratch ? 'New Code Snippet' : 'Edit Code Snippet'),
            React.createElement("section", { className: CODE_SNIPPET_EDITOR_METADATA },
                React.createElement("label", { className: CODE_SNIPPET_EDITOR_LABEL }, "Name (required)"),
                React.createElement("input", { className: CODE_SNIPPET_EDITOR_NAME_INPUT, defaultValue: this._codeSnippetEditorMetaData.name, placeholder: 'Ex. starter_code', type: "text", required: true, pattern: '[a-zA-Z0-9_]+', onMouseDown: (event) => this.activeFieldState(event), onChange: (event) => {
                        this.handleInputFieldChange(event);
                    }, onBlur: this.handleOnBlur }),
                React.createElement("p", { className: CODE_SNIPPET_EDITOR_INPUTNAME_VALIDITY }, 'Name of the code snippet MUST be lowercased, alphanumeric or composed of underscore(_)'),
                React.createElement("label", { className: CODE_SNIPPET_EDITOR_LABEL }, "Description (required)"),
                React.createElement("input", { className: CODE_SNIPPET_EDITOR_DESC_INPUT, defaultValue: this._codeSnippetEditorMetaData.description, placeholder: 'Description', type: "text", required: true, pattern: '[a-zA-Z0-9_ ,.?!]+', onMouseDown: (event) => this.activeFieldState(event), onChange: (event) => {
                        this.handleInputFieldChange(event);
                    }, onBlur: this.handleOnBlur }),
                React.createElement("p", { className: CODE_SNIPPET_EDITOR_INPUTDESC_VALIDITY }, 'Description of the code snippet MUST be alphanumeric but can include space or punctuation'),
                React.createElement("label", { className: CODE_SNIPPET_EDITOR_LABEL }, "Language (required)"),
                this.renderLanguages(),
                React.createElement("label", { className: CODE_SNIPPET_EDITOR_LABEL }, "Tags"),
                React.createElement(CodeSnippetEditorTags, { selectedTags: this.codeSnippetEditorMetadata.selectedTags, tags: this.codeSnippetEditorMetadata.allTags, handleChange: this.handleChangeOnTag })),
            React.createElement("span", { className: CODE_SNIPPET_EDITOR_LABEL }, "Code"),
            this.renderCodeInput(),
            React.createElement(Button, { className: "saveBtn", onClick: this.saveChange }, fromScratch ? 'Create & Close' : 'Save')));
    }
}
