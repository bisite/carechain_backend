// Reserved for license

'use strict';

const Path = require("path");
const FS = require("fs");
const rimraf = require("rimraf");

/* Check for updated version */

if (FS.existsSync(Path.resolve(__dirname, "dist-next"))) {
    console.log("Updating...");
    rimraf.sync(Path.resolve(__dirname, "dist"));
    FS.renameSync(Path.resolve(__dirname, "dist-next"), Path.resolve(__dirname, "dist"));
}

/* Add trusted certificates */

const rootCas = require('ssl-root-cas').create();

const filesCert = FS.readdirSync(Path.resolve(__dirname, "certificates"));

for (let fileName of filesCert) {
    if ((/^.+\.crt$/i).test(fileName)) {
        rootCas.addFile(Path.resolve(__dirname, "certificates", fileName));
    }
    
}

require('https').globalAgent.options.ca = rootCas;

/* Compile languages */

const files = FS.readdirSync(Path.resolve(__dirname, "locales/conf"));

const localesData = {};

for (let file of files) {
    if (file.endsWith(".js")) {
        const localeName = file.substr(0, file.length - 3);
        const localeData = require(Path.resolve(__dirname, "locales/conf", file));

        localesData[localeName] = localeData;

        FS.writeFileSync(Path.resolve(__dirname, "locales", localeName + ".json"), JSON.stringify(localeData));
    }
}

module.exports = localesData;

/* Program start point */
require(Path.resolve(__dirname, "dist", "index.js")); 
