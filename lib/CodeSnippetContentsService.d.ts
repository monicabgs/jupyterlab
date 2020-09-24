import { ContentsManager, Drive, Contents } from '@jupyterlab/services';
export interface ICodeSnippet {
    name: string;
    description: string;
    language: string;
    code: string[];
    id: number;
    tags?: string[];
}
/**
 * Singleton contentsService class
 */
export declare class CodeSnippetContentsService {
    drive: Drive;
    contentsManager: ContentsManager;
    private static instance;
    private constructor();
    static getInstance(): CodeSnippetContentsService;
    /**
     * Get the metadata information in the given path
     * @param path path to a file/directory
     */
    getData(path: string, type: Contents.ContentType): Promise<Contents.IModel>;
    /**
     * Create a file/directory if it does not exist. Otherwise, save the change in a file/directory in the given path
     * @param path path to a file/directory
     * @param options options that specify if it's a file or directory and additial information
     * Usage: save('snippets', { type: 'directory' }) to create/save a directory
     *        save('snippets/test.json', {type: 'file', format: 'text', content: 'Lorem ipsum dolor sit amet'})
     */
    save(path: string, options?: Partial<Contents.IModel>): Promise<Contents.IModel>;
    /**
     * Change the order of snippets
     * @param oldPath
     * @param newPath
     */
    /**
     * Rename the file or directory (not case sensitive)
     * @param oldPath change from
     * @param newPath change to
     */
    rename(oldPath: string, newPath: string): Promise<Contents.IModel>;
    /**
     * Delete the file/directory in the given path
     * @param path path to a file/directory
     */
    delete(path: string): Promise<void>;
}
