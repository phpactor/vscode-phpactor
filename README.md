Phpactor CoC Extension
======================

![phpactor2sm](https://user-images.githubusercontent.com/530801/27995098-82e72c4c-64c0-11e7-96d2-f549c711ca8b.png)

Extension which integrates [Phpactor](https://github.com/phpactor/phpactor)
with [CoC](https://github.com/neoclide/coc.nvim).

Installation
------------

First, install [Phpactor](https://phpactor.readthedocs.io/en/develop/usage/standalone.html).

Then install this extension from Vim/Nvim:

```
:CocInstall coc-phpactor
```

**NOTE**: The Phpactor language server is a work-in-progress (see currently
[supported](https://phpactor.readthedocs.io/en/develop/lsp/support.html)
features). 

In order to have access to all of Phpactors functionality it is recommended to
install the standard [VIM
Plugin](https://phpactor.readthedocs.io/en/develop/usage/vim-plugin.html).

Commands
--------

- `phpactor.status`: Show Phpactor's status
- `phpactor.reindex`: Reindex the project.
- `phpactor.services.list`: List Phpactor's currently running services.
- `phpactor.config.dump`: Dump Phpactor's configuratoin to the log window.

Configuration
-------------

You can add any Phpactor
[configuration](https://phpactor.readthedocs.io/en/develop/reference/configuration.html)
using the `phpactor.config` key in `:CocConfig`.

Documentation
-------------

For full documentation see [the docs](https://phpactor.readthedocs.io/en/master/index.html).
