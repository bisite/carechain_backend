# Carechain

## Install

For install the dependencies:
```
$ npm install
```

When you need to install a dependency that is not installed, use:
```
$ npm install --save dependencia 
```

If the dependency is a compiler utility or similar, use:
```
$ npm install --save-dev dependencia 
```

## Compilation

To compile the source code, you should use:
```
$ npm run build
```

This command does 3 things:

 -	Checks the quality of the code (Lint) and generates errors in case of potential bugs (undeclared variables, incorrect use of operators, etc).
 -	It transforms the code, which is in Typescript to Javascript, which is what NodeJS interprets.
 - Minimizes the code of the user interface scripts in a single file, to speed up its loading in production.

The linter configuration is in the .eslintrc file. Documentation: https://eslint.org/docs/user-guide/configuring

The compiler configuration is in the tsconfig.json file. Documentation: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

Once compiled, it can be run, using the following command:
```
$ npm start
```

It is important to note that changes made to the code will not be reflected in the application until we recompile.

## Documentation

- [Typescript](https://www.typescriptlang.org/docs/home.html)
- [NodeJS](https://nodejs.org/es/docs/)
- [Express](http://expressjs.com/es/api.html)
- [tsbean-orm](https://github.com/AgustinSRG/tsbean-orm)
- [Boostrap](https://getbootstrap.com/docs/4.1/getting-started/introduction/)
- [JQuery](https://api.jquery.com/)
- [Vue.JS](https://vuejs.org/v2/guide/)
- [Font-Awesome](https://fontawesome.com/how-to-use/on-the-web/referencing-icons/basic-use)
- [Material Design](https://material.io/)

