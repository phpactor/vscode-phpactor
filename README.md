# Phpactor VSCode Extension

![phpactor2sm](https://user-images.githubusercontent.com/530801/27995098-82e72c4c-64c0-11e7-96d2-f549c711ca8b.png)

[![vs marketplace](https://img.shields.io/vscode-marketplace/v/phpactor.vscode-phpactor.svg?label=vs%20marketplace)](https://marketplace.visualstudio.com/items?itemName=phpactor.vscode-phpactor) [![downloads](https://img.shields.io/vscode-marketplace/d/phpactor.vscode-phpactor.svg)](https://marketplace.visualstudio.com/items?itemName=phpactor.vscode-phpactor) [![rating](https://img.shields.io/vscode-marketplace/r/phpactor.vscode-phpactor.svg)](https://marketplace.visualstudio.com/items?itemName=phpactor.vscode-phpactor)

Extension which integrates [Phpactor](https://github.com/phpactor/phpactor)
with [VSCode](https://github.com/neoclide/coc.nvim).

## Feature

- **Completion**: Provides broad and accurate context aware code completion.
- **Navigation**: Jump to class and method definitions, find references, hover.
- **Refactoring**: Move classes, complete constructors, implement contracts, generate methods, etc.
- **Diagnostics**: Diagnostics related to code actions.
- **Extensions**: Integrates with popular tools and frameworks such as PHPunit, PHPcs, Symfony, PHPStan, etc.

## Installation

After installation from marketplace, it's recommended to disable VS Code's built-in PHP IntelliSense by setting `php.suggest.basic` to `false` to avoid duplicate suggestions.

Add glob patterns for non standard php file extensions, For example: `"files.associations": { "*.module": "php" }`.

Adapt configuration for the Phpactor indexer based on your project, for example:

```json
"phpactor.config": {
    "indexer.supported_extensions": [
        "php",
        "module"
    ],
    "indexer.include_patterns": [
        "/**/*.php",
        "/**/*.module"
    ],
    "indexer.exclude_patterns": [
        "**/vendor/**/Tests/**/*",
        "**/vendor/**/tests/**/*",
        "/vendor/composer/**/*",
        "**/vendor/**/vendor/**"
    ]
}
```

## Commands

- `phpactor.status`: Show Phpactor's status
- `phpactor.reindex`: Reindex the project.
- `phpactor.services.list`: List Phpactor's currently running services.
- `phpactor.config.dump`: Dump Phpactor's configuration to the log window.

## Configuration

Phpactor configuration can be done with the `phpactor.config` setting key.

See all [available configuration](https://phpactor.readthedocs.io/en/master/reference/configuration.html).

For example to enable/disable third party :

```json
{
  "phpactor.config": {
    "phpunit.enabled": true,
    "php_code_sniffer.enabled": true,
    "php_code_sniffer.bin": "%project_root%/vendor/bin/phpcs",
    "language_server_phpstan.enabled": true,
    "language_server_phpstan.bin": "%project_root%/vendor/bin/phpstan",
    "language_server_phpstan.config": "%project_root%/phpstan.neon",
    [...]
  }
}
```

To check settings run `phpactor.config.dump` command.

See [specific documentation](https://phpactor.readthedocs.io/en/master/integrations.html) for third party integration (ie: Behat, Drupal, PHP-CS-Fixer, PHP_CodeSniffer, PHPStan, PHPUnit, Prophecy, Psalm).

## Documentation

For full documentation see [the docs](https://phpactor.readthedocs.io/en/master/index.html).

## Manual installation

Install from Marketplace or install manually.

1. Download the `phpactor.vsix` file from the [latest release](https://github.com/phpactor/vscode-phpactor/releases/latest)
2. Run `code --install-extension /path/to/phpactor.vsix`

## Development

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
