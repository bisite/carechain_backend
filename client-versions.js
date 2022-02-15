/* Generates versions for client files for production */

const md5File = require('md5-file');
const FS = require("fs");
const Path = require("path");

const rootPath = Path.resolve(__dirname, "static");

const clientData = {};

function scanPath(path, route) {
    route = route || [];


    const files = FS.readdirSync(path);

    for (let file of files) {
        const pathFile = Path.resolve(path, file);
        const stats = FS.lstatSync(pathFile);
        if (stats.isDirectory()) {
            scanPath(pathFile, route.concat(file));
        } else if (stats.isFile()) {
            checkFile(file, path, route);
        }
    }
}

function removeStartingSlash(key) {
    if (key.charAt(0) === "/") {
        return key.substr(1);
    } else {
        return key;
    }
}

function checkFile(file, path, route) {
    const routeFile = (route.length > 0 ? "/" : "") + route.join("/") + "/" + file;
    const absFile = Path.resolve(path, file);
    const hash = md5File.sync(absFile);

    clientData[routeFile] = {
        versioned: removeStartingSlash(route.join("/") + "/" + hash + "-" + file),
        flat:  removeStartingSlash(route.join("/") + "/" + file),
    }

    // console.log("FILE: " + routeFile + " -> " + hash);
}

console.log("Scanning files...");

scanPath(rootPath, []);

FS.writeFileSync(Path.resolve(__dirname, "client.json"), JSON.stringify(clientData, null, 2));

console.log("DONE. Total client files: " + Object.keys(clientData).length);

const version = md5File.sync(Path.resolve(__dirname, "client.json"));

FS.writeFileSync(Path.resolve(__dirname, "client.version"), version);

console.log("Client version: " + version);
