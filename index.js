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


/* Program start point */
require(Path.resolve(__dirname, "dist", "index.js")); 
