# Notas de configuración
## Configuración de la base de datos
Modificar el archivo config.json con los datos de mongo. Un ejemplo podría ser:
```
"database": {
        "type": "mongodb",
        "name": "ontochain",
        "host": "localhost",
        "user": "root",
        "port": 27017,
        "password": "",
        "max_connections": 4
    }
```
Nueva versión del archivo config-example.json disponible (15-07-2021)