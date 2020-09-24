import { ContentsManager, Drive } from '@jupyterlab/services';
/**
 * Singleton contentsService class
 */
export class CodeSnippetContentsService {
    constructor() {
        const drive = new Drive({ name: 'snippetDrive ' });
        const contentsManager = new ContentsManager({ defaultDrive: drive });
        this.drive = drive;
        this.contentsManager = contentsManager;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new CodeSnippetContentsService();
        }
        return this.instance;
    }
    /**
     * Get the metadata information in the given path
     * @param path path to a file/directory
     */
    async getData(path, type) {
        const data = await this.contentsManager.get(path, {
            type: type,
            //   format: 'text',
            content: true
        });
        return data;
    }
    /**
     * Create a file/directory if it does not exist. Otherwise, save the change in a file/directory in the given path
     * @param path path to a file/directory
     * @param options options that specify if it's a file or directory and additial information
     * Usage: save('snippets', { type: 'directory' }) to create/save a directory
     *        save('snippets/test.json', {type: 'file', format: 'text', content: 'Lorem ipsum dolor sit amet'})
     */
    async save(path, options) {
        const changedModel = await this.contentsManager.save(path, options);
        return changedModel;
    }
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
    async rename(oldPath, newPath) {
        const changedModel = await this.contentsManager.rename(oldPath, newPath);
        return changedModel;
    }
    /**
     * Delete the file/directory in the given path
     * @param path path to a file/directory
     */
    async delete(path) {
        await this.contentsManager.delete(path);
    }
}
