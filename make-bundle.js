// Bundle Maker for Javascript
// Concats Javascript files before minifying

"use strict";

const Path = require("path");
const FileSystem = require("fs");

function bundleFiles(config) {
    const path = Path.resolve(__dirname, config.path);
    const outOutStream = FileSystem.createWriteStream(Path.resolve(path, config.target));

    if (config.requires) {
        for (let req of config.requires) {
            outOutStream.write(FileSystem.readFileSync(Path.resolve(path, req)));
        }
    }

    outOutStream.write(FileSystem.readFileSync(Path.resolve(path, config.entry)));

    outOutStream.close();
    console.log("Created bundle: " + config.name + " / Output: " + config.target);
}

function main() {
    const config = JSON.parse(FileSystem.readFileSync(Path.resolve(__dirname, "bundle.config.json")).toString());

    for (let entry of config) {
        bundleFiles(entry);
    }
}

main();
