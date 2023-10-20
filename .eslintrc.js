module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "extends": [
        'eslint:recommended',
        //'plugin:jsdoc/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
    ],
    "plugins": [
        "eslint-plugin-jsdoc",
        "@typescript-eslint",
    ],
    "root": true,
    "rules": {
        '@typescript-eslint/no-unsafe-assignment': 'off',
    }
};
