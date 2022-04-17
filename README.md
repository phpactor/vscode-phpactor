Phpactor VSCode Extension
=========================

![phpactor2sm](https://user-images.githubusercontent.com/530801/27995098-82e72c4c-64c0-11e7-96d2-f549c711ca8b.png)

Extension which integrates [Phpactor](https://github.com/phpactor/phpactor)
with [VSCode](https://github.com/neoclide/coc.nvim).

Installation
------------

First, install [Phpactor](https://phpactor.readthedocs.io/en/develop/usage/standalone.html).

The package isn't published yet on the "marketplace" so:

1. Install [yarn](https://classic.yarnpkg.com/en/docs/install) and [npm](https://www.npmjs.com/get-npm).
2. Install typescript: `npm install -g typescript`
3. Git clone this package
4. `npm install`
5. `yarn build`
6. `cd ~/.vscode/extensions`. If running [VS Code server on WSL](https://code.visualstudio.com/docs/remote/wsl): `cd ~/.vscode-server/extensions`
7. `ln -s /path/to/vscode-phpactor`

Phpactor should then be enabled the next time you start VS code.

Commands
--------

- `phpactor.status`: Show Phpactor's status
- `phpactor.reindex`: Reindex the project.
- `phpactor.services.list`: List Phpactor's currently running services.
- `phpactor.config.dump`: Dump Phpactor's configuratoin to the log window.

Documentation
-------------

For full documentation see [the docs](https://phpactor.readthedocs.io/en/master/index.html).
