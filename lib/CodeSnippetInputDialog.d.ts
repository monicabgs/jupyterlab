import { Contents } from '@jupyterlab/services';
import { JSONObject } from '@lumino/coreutils';
import { CodeSnippetWidget } from './CodeSnippetWidget';
import { CodeSnippetForm } from './CodeSnippetForm';
/**
 * A stripped-down interface for a file container.
 */
export interface IFileContainer extends JSONObject {
    /**
     * The list of item names in the current working directory.
     */
    items: string[];
    /**
     * The current working directory of the file container.
     */
    path: string;
}
/**
 * Save an input with a dialog. This is what actually displays everything.
 * Result.value is the value retrieved from .getValue(). ---> .getValue() returns an array of inputs.
 */
export declare function CodeSnippetInputDialog(codeSnippetWidget: CodeSnippetWidget, code: string[], idx: number): Promise<Contents.IModel | null>;
/**
 * Test whether a name is a valid file name
 *
 * Disallows "/", "\", and ":" in file names, as well as names with zero length.
 */
export declare function isValidFileName(name: string): boolean;
/**
 * Test whether user typed in all required inputs.
 */
export declare function validateForm(input: CodeSnippetForm.IResult<string[]>): boolean;
