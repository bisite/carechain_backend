/* Minify scripts */

'use strict';

const Path = require('path');
const FS = require('fs');
const minify = require('@node-minify/core');

const uglifyJS = require('@node-minify/uglify-js');
const cleanCSS = require('@node-minify/clean-css');

const JS_Files_Path = Path.resolve(__dirname, 'static/js/');
const CSS_Files_Path = Path.resolve(__dirname, 'static/css/');

function scanDirectories(root) {
    const files = [];
    const filesInDir = FS.readdirSync(root);

    for (const file of filesInDir) {
        const absFile = Path.resolve(root, file);

        const stats = FS.lstatSync(absFile);
        if (stats.isDirectory()) {
            const subFiles = scanDirectories(absFile);
            for (const sf of subFiles) {
                files.push(sf);
            }
        } else if (stats.isFile()) {
            files.push(absFile);
        }
    }

    return files;
}

let files;

files = scanDirectories(JS_Files_Path);

for (let file of files) {
	if ((/\.js$/).test(file) && !((/\.min\.js$/).test(file))) {
		let newfile = file.substr(0, file.length - 3) + ".min.js";
		minify({
			compressor: uglifyJS,
			input: Path.resolve(JS_Files_Path, file),
			output: Path.resolve(JS_Files_Path, newfile),
			callback: function (err, min) {
				if (err) {
                    console.error(err);
					console.log("ERROR: Could not parse javascript file: " + file + " | See above for details.");
					process.exit(1);
				}
			}
		});
	}
}

files = scanDirectories(CSS_Files_Path);

for (let file of files) {
	if ((/\.css$/).test(file) && !((/\.min\.css$/).test(file))) {
		let newfile = file.substr(0, file.length - 4) + ".min.css";
		minify({
			compressor: cleanCSS,
			input: Path.resolve(CSS_Files_Path, file),
			output: Path.resolve(CSS_Files_Path, newfile),
			callback: function (err, min) {
				if (err) {
                    console.error(err);
					console.log("ERROR: Could not parse stylesheet file: " + file + " | See above for details.");
					process.exit(1);
				}
			}
        });
	}
}
