# JupyterLab Code Snippet

## Requirements
- Jupyter notebook
- JupyterLab >= 2.0

## Install
```bash
sudo apt update
sudo apt install nodejs 
sudo apt install npm
sudo jupyter labextension install jupyterlab-code-snippets
sudo jlpm install
```

## Troubleshoot

If it is installed, try:

```bash
jupyter lab clean
jupyter lab build
```

```bash
# Clone the repo to your local environment
git clone https://github.com/jupytercalpoly/jupyterlab-code-snippets.git
cd jupyterlab-code-snippets
# Install project's dependencies
sudo jlpm
# Build Typescript source
sudo jlpm build
# Link your development version of the extension with JupyterLab
sudo jupyter labextension link
sudo jupyter labextension install .
# Rebuild Typescript source after making changes
sudo jlpm build
# Rebuild JupyterLab after making any changes
sudo jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
sudo jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch --allow-root
```

Now every change will be built locally and bundled into JupyterLab. Be sure to refresh your browser page after saving file changes to reload the extension (note: you'll need to wait for webpack to finish, which can take 10s+ at times).

### Uninstall

```bash
jupyter labextension uninstall jupyterlab-code-snippets
```
