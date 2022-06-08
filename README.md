# Carechain backend for ADOS integration

## Instalación

Para instalar las dependencias utilizar:
```
$ npm install
```

Cuando se necesite instalar una dependencia que no esté instalada, utilizar:
```
$ npm install --save dependencia 
```

Si la dependencia es una utilidad de compilación o also similar, utilizar:
```
$ npm install --save-dev dependencia 
```

## Compilación

Para compilar el código fuente, se debe utilizar:
```
$ npm run build
```

Este comando hace 3 cosas:

 - Comprueba la calidad del código (Lint) y genera errores en caso de potenciales fallos (variables no declaradas, uso incorrecto de operadores, etc).
 - Transforma el código, que se encuentra en Typescript a Javascript, que es lo que interpreta NodeJS.
 - Minimiza el código de los scripts de la interfaz de usuario en un solo fichero, para agilizar su carga en producción.

La configuración del linter se encuentra en el fichero `.eslintrc`. Documentación: [https://eslint.org/docs/user-guide/configuring](https://eslint.org/docs/user-guide/configuring)

La configuración del compilador se encuentra en el fichero `tsconfig.json`. Documentación: [https://www.typescriptlang.org/docs/handbook/tsconfig-json.html](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

Una vez compilado, se puede ejecutar, haciendo uso del siguiente comando:
```
$ npm start
```

Es importante tener en cuenta que los cambios que se hagan en el código no se reflejarán en la aplicación hasta que recompilemos.

## Documentación

- [Typescript](https://www.typescriptlang.org/docs/home.html)
- [NodeJS](https://nodejs.org/es/docs/)
- [Express](http://expressjs.com/es/api.html)
- [tsbean-orm](https://github.com/AgustinSRG/tsbean-orm)
- [Boostrap](https://getbootstrap.com/docs/4.1/getting-started/introduction/)
- [JQuery](https://api.jquery.com/)
- [Vue.JS](https://vuejs.org/v2/guide/)
- [Font-Awesome](https://fontawesome.com/how-to-use/on-the-web/referencing-icons/basic-use)
- [Material Design](https://material.io/)

