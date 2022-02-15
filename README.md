# Express project template

Plantilla para desarrollar aplicaciones web usando NodeJS + Express.

Esta plantilla contiene:

 - La estructura del proyecto ya montada y configurada para su compilación.
 - Express junto con varios de sus módulos (subida de ficheros, cookies, multi-idioma) ya instalados y listos para usarse.
 - Bibliotecas ya importadas como Vue.JS, Boostrap, Font-Awesome, JQuery y Material Design.

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

## MVC

Esta plantilla se basa en una estructura MVC (Modelo-Vista-Controlador).

En cuanto a los modelos se incluye un DAO (Data Access Object) que permite conectarse a una base de datos sin tener que escribir SQL para buscar, actualizar, eliminar, etc. Si no se desea usar un modelo relacional o se necesita otro sistema, es necesario implementar una lógica de modelos personalizada.

Para crear la base de datos y sus tablas es necesario escribir el SQL para crear las tablas manualmente. Esto es así para evitar incompatibilidades y para un mejor control de los tipos. El SQL está en `sql/`. También se proporciona una carpeta `migrations` para gestionar los cambios en producción.

**Nota:** Gneralmente en SQL se usa la notación con barra baja (ejemplo: `status_id`). Sin embargo, cuando se use en los modelos siempre se usará la notación camel-case (ejemplo: `statusId`). El DAO hace la conversión por debajo de manera transparente.

Cualquier modelo que se desee crear debe ser una clase en `src/models` que extienda la clase DataModel (en `tsbean-orm`). Esta clase provee de los siguientes métodos al modelo:

 - `insert` -> Inserta un nuevo registro en la tabla
 - `save` -> Actualiza el registro con los cambios en el modelo. Solo actualiza aquellos que han cambiado desde que se instanció.
 - `delete` -> Borra la instancia de la tabla

El constructor de un modelo debe tomar como primer parámetro los datos en JSON de la fila de la tabla. Debe mapear lo que se recibe con los atributos del modelo (por ejemplo para convertir a número o para valores por defecto).

```ts
    constructor(data: any) {
        super(DataSource.DEFAULT, "table_name", "id");
    
        this.id = data.id || "";
        this.name = data.name || "";

        this.timestamp = parseInt(data.timestamp || "0", 10);

        this.init(); // Se debe llamar a init cuando se hayan cargado los campos
    }
```

Para operaciones de búsqueda u operaciones en masa se debe crear un buscados con la clase `DataFinder`, ejemplo:

```ts
    public static finder = new DataFinder<Modelo>(DataSource.DEFAULT, "table_name", "id", function (data) {
        return new Modelo(data);
    });
```

Ejemplos de consulta:

```ts
    const result = Modelo.finder.findByKey(id);
```

```ts
    const results = Modelo.finder.find(
        DataFilter.and( // Se debe usar la clase DataFilter para filtrar
            DataFilter.contains("name", "ejemplo"),
            DataFilter.greaterThan("timestamp", 1),
        ),
        OrderBy.desc("timestamp"), // Para ordenar se dee usar la clase OrderBy
        SelectOptions.configure().setMaxRows(200), // Para el resto de opciones usar la clase SelectOptions
    );
```

En cuanto a las vistas, son clases con un método `render` que permiten generar HTML para mostrar una interfaz de usuario. Se encuantran en la ruta `src/views`. El HTML se puede generar directamente (como en la vista que se da de ejemplo) o mediante algún framework de plantillas si se queire utilizar.

Los controladores son las clases que manejan las peticiones HTTP de los clientes y generan respuestas, ya sean vistas, ficheros, JSON o XML.
 - Todos los controladores deben tener un método `register` donde registren las diferentes rutas en la aplicación de Express. Documentación: [https://expressjs.com/es/guide/routing.html](https://expressjs.com/es/guide/routing.html)
 - Cada ruta debe ser manejada por una función o método manejedor, que, por lo general, será un método de la propia clase controlador. Este método recibe 2 argumentos, el primero del tipo [Request](http://expressjs.com/es/api.html#req) y el segundo de tipo [Response](http://expressjs.com/es/api.html#res). Con Request se pueden obtener todos los parámetros que envió el cliente con su petición y Response permite generar una respuesta.

```js
/**
 * Home controller.
 * Static views for all users.
 */
export class HomeController extends Controller {

    /**
     * Registers routes for this controller.
     * @param application Express application.
     */
    public register(application: Express.Express): any {
        application.get("/", this.home.bind(this));
    }

    /**
     * Home page (signup)
     */
    public async home(request: Express.Request | any, response: Express.Response) {
        response.status(OK);
        response.contentType(TEXT_HTML);
        response.send(await HomeView.render(response));
    }
}
```

**IMPORTANTE:** Los controladores debe ser registrados en la clase principal de la aplicación web, la cual se encuantra en el fichero `src/app.ts`. En el método `registerControllers` por orden de preferencia, dejando el `DefaultController` como último controlador para el comportamiento por defecto.

## Ficheros estáticos (scripts, estilos, imágenes)

Los ficheros estáticos se deben incluir en la carpeta `static`, con `js` para los scripts y `css` para los estilos.

Cuando se desee importar un archivo estático en una vista, se puede hacer uso de la clase `Assets`.

```js

// Ejemplo para un script
html.push(`<script src="${Assets.versioned("/js/lib/vue.min.js")}" type="text/javascript"></script>`);

// Ejemplo para un estilo
html.push(`<link rel="stylesheet" media="screen" href="${Assets.versioned("/css/lib/bootstrap.css")}">`);

```

# Multi-Idioma

Esta plantilla cuenta con una biblioteca de internacionalización llamada `i18n`.

Es conveniente escribir el texto en un único idiona, ya sea el inglés o el español.

Todo el texto que se desee traducir se debe hacer pasar por la función `__` (doble guión bajo). Esta función es una función global en el caso de los scripts alojados en `/static/js`. Y se trata de un método del objeto `Response` si se quiere utilizar en controladores o vistas.

```js
    public async hello(request: Express.Request | any, response: Express.Response) {
        response.status(OK);
        response.send(response.__("Hello"));
    }
```

Una vez escrita la aplicación en un idioma, podemos ir a la ruta `locales/conf` y especificar las traducciones que corresponden para cada frase.

```js
    SET('Hello', 'Hola');
```

Para incluir más idiomas, debemos modificar la configuración del componente situada en `src/app.ts`

```js
        // Internationalization
        I18N.configure({
            locales: ["en", "es"],
            directory: Path.resolve(__dirname, "..", "locales"),
            cookie: "locale",
            extension: ".json",
        });
```

Si queremos cambiar de idioma con un botón u otro control, debemos cambiar la cookie `locale`.

# Logs

Para presentar logs por consola, es conveniente utilizar la clase `Monitor`, alojada en el fichero `src/monitor.ts`.

## Configuración

La plantilla proporciona un gestor de configuración basado en ficheros JSON.

El fichero de configuración es `config.json`, tomando `config-example.json` por defecto si este no existe.

La clase `Config`, situada en la rura `src/config.ts` se encarga de leer el fichero de configuración, proporcionado estos parámetros al resto de componentes de la aplicación. Se debe modificar esta clase para añadir nuevos parámetros de configuración, como, por ejemplo, bases de datos, servicios externos, etc.

Por defecto se proporciona la siguiente configuración:

```json
{
    "production": false,
    "number_of_workers": 0,
    "redirect_secure": false,
    "http": {
        "port": 6001,
        "bind_address": ""
    },
    "https": {
        "port": 6002,
        "bind_address": "",
        "certificate_file": "",
        "private_key_file": ""
    }
}
```

Los parámetros de configuración por defecto son los siguientes:

 - **production**: Indica si se está usando el modo de producción. En modo de producción no se imprimen los mensajes de depuración y se utilizan scripts minificados.
 - **number_of_workers**: El número de procesos que se desea utilizar. Si se deja en 0, se crearán tantos procesos como procesadores lógicos tenga la máquina.
 - **redirect_secure**: Poner en `true` si se quiere forzar a utilizar HTTPS (producción).
 - **http**: Configuración del servidor HTTP, incluyendo el puerto (`port`) y la dirección de enlace (`bind_address`).
 - **https**: Configuración del servidor HTTPS, incluyendo el puerto (`port`), la dirección de enlace (`bind_address`) el certificado X.509 (`certificate_file`) y el fichero de clave privada (`private_key_file`).
 
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

