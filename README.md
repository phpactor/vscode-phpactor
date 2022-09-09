Phpactor VSCode Extension
=========================

![phpactor2sm](https://user-images.githubusercontent.com/530801/27995098-82e72c4c-64c0-11e7-96d2-f549c711ca8b.png)

Extension which integrates [Phpactor](https://github.com/phpactor/phpactor)
with [VSCode](https://github.com/neoclide/coc.nvim).

Installation
------------

### Normal Installation

1. Download the `phpactor.vsix` file from the [lastest release](https://github.com/phpactor/vscode-phpactor/releases/latest) 
2. Run `code --install-extension /path/to/phpactor.vsix`

### Development Installation

For development it is easier 

1. Install [npm](https://www.npmjs.com/get-npm).
2. Install typescript: `npm install -g typescript`
3. Git clone this package
4. `npm install`
5. `cd ~/.vscode/extensions`. If running [VS Code server on WSL](https://code.visualstudio.com/docs/remote/wsl): `cd ~/.vscode-server/extensions`
6. `ln -s /path/to/vscode-phpactor`

Phpactor should then be enabled the next time you start VS code.

Commands
--------

- `phpactor.update`: Update Phpactor to the latest version
- `phpactor.status`: Show Phpactor's status
- `phpactor.reindex`: Reindex the project.
- `phpactor.services.list`: List Phpactor's currently running services.
- `phpactor.config.dump`: Dump Phpactor's configuratoin to the log window.

Documentation
-------------

For full documentation see [the docs](https://phpactor.readthedocs.io/en/master/index.html).
