# Phpactor VSCode Extension

![phpactor2sm](https://user-images.githubusercontent.com/530801/27995098-82e72c4c-64c0-11e7-96d2-f549c711ca8b.png)

Extension which integrates [Phpactor](https://github.com/phpactor/phpactor)
with [VSCode](https://github.com/neoclide/coc.nvim).

## Installation

### Normal Installation

Install from Marketplace or install manually.

1. Download the `phpactor.vsix` file from the [lastest release](https://github.com/phpactor/vscode-phpactor/releases/latest)
2. Run `code --install-extension /path/to/phpactor.vsix`

### Development

For development it is easier

1. Install [npm](https://www.npmjs.com/get-npm).
2. Install typescript: `npm install -g typescript`
3. Git clone this package
4. `npm install`
5. Run `composer install`
6. Open the folder in VSCode
7. Start watch compilation by selecting `Terminal / Run Build Task...`
8. Open the Run and Debug side menu, select `Launch Extension` from the debug configuration and hit run (`F5`)
9. Additionally you can also run `Listen for Xdebug` to debug the Language Server - but has to be run before the Language Server starts.

Note that the Phpactor Language Server currently only runs on Linux and macOS so if you are on Windows you might need to make use of WSL or a Linux VM combined with VSCode Remote.

Before submitting a PR also run `npm run lint` or `Terminal / Run Tasks... / npm: lint`.

## Commands

- `phpactor.status`: Show Phpactor's status
- `phpactor.reindex`: Reindex the project.
- `phpactor.services.list`: List Phpactor's currently running services.
- `phpactor.config.dump`: Dump Phpactor's configuratoin to the log window.

## Documentation

For full documentation see [the docs](https://phpactor.readthedocs.io/en/master/index.html).
