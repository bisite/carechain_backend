// Translation file maker
// Search for uses of translation function and adds them to translation files

'use strict';

const FS = require("fs");
const Path = require("path");
const Ignore = require("ignore");

function removeEmptyLines(array) {
    const result = [];
    for (const e of array) {
        if (e) {
            result.push(e);
        }
    }
    return result;
}

const ignore = Ignore()
    .add(
        removeEmptyLines(
            FS.readFileSync(Path.resolve(__dirname, ".gitignore"))
                .toString()
                .split("\n")
        )
    ).add(
        removeEmptyLines(
            FS.readFileSync(Path.resolve(__dirname, ".sourceignore"))
                .toString()
                .split("\n")
        )
    );

function escapeSingleQuotes(raw) {
    return ("" + raw).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function generateTranslationConfigurationFile(lang, resources) {
    const file = [];

    file.push(`/* Language file(${lang}) */`);

    file.push(``);
    file.push(`'use strict';`);
    file.push(``);

    file.push(`/* --- Automatically generated (DO NOT TOUCH) --- */`);

    file.push(``);

    file.push(`const locale = {};`);
    file.push(`module.exports = locale;`);
    file.push(`function T(l,o){if(!o)return;l&&(locale[l]&&console.log("WARNING: Duplicated locale key '"+l+"'"),locale[l]=o)}`);

    file.push(``);

    file.push(`/* --- End of automatically generated / Modify the translations from here --- */`);

    file.push(``);

    file.push(`// Format: T('{english}', '{translation}')`);

    file.push(``);

    const keys = Object.keys(resources).sort();

    for (const key of keys) {
        file.push(`T(\n    '${escapeSingleQuotes(key)}',\n    '${escapeSingleQuotes(resources[key] || "")}'\n);`);
    }


    file.push(``);
    return file.join("\n");
}

function getResourcesFromTranslationsFile(file) {
    const locale = require(file);
    return locale;
}

function searchTranslationUsages(file) {
    const str = FS.readFileSync(file).toString();

    const matches = (str.match(/__\(\"([^\\"]*)\"\)/gi) || []).concat((str.match(/__\(\'[^\\']*\'\)/gi) || []));
    const usages = {};

    for (const match of matches) {
        const tKey = JSON.parse('"' + match.substr(4, match.length - 6) + '"');

        usages[tKey] = "";
    }

    return usages;
}

function mergeResources(resource1, resource2) {
    const result = {};

    for (let key in resource1) {
        result[key] = resource1[key] || resource2[key];
    }

    for (let key in resource2) {
        result[key] = resource1[key] || resource2[key];
    }

    return result;
}

function mergeResourcesFirstSide(resource1, resource2) {
    const result = {};

    for (let key in resource1) {
        result[key] = resource1[key] || resource2[key];
    }

    return result;
}

function findTranslationConfigFiles() {
    const files = FS.readdirSync(Path.resolve(__dirname, "locales/conf"));
    const result = [];
    for (let file of files) {
        if (file.endsWith(".js")) {
            result.push(Path.resolve(__dirname, "locales/conf", file));
        }
    }
    return result;
}

function getLangFromFile(file) {
    return Path.basename(file).split(".")[0];
}

function scanDirectories(root) {
    const files = [];
    const filesInDir = FS.readdirSync(root);

    for (const file of filesInDir) {
        const absFile = Path.resolve(root, file);
        const relFile = absFile.substr(Path.resolve(__dirname).length).substr(1);

        if (relFile === ".git" || ignore.ignores(relFile)) {
            // console.log("[IGNORED BY GITIGNORE] " + relFile);
            continue;
        }

        const stats = FS.lstatSync(absFile);
        if (stats.isDirectory()) {
            const subFiles = scanDirectories(absFile);
            for (const sf of subFiles) {
                files.push(sf);
            }
        } else if (stats.isFile()) {
            if (file.endsWith(".ts") || file.endsWith(".js")) {
                files.push(absFile);
            }
        }
    }

    return files;
}

function main() {
    console.log("Generating language files...");

    const translationFiles = findTranslationConfigFiles();
    const scanned = scanDirectories(Path.resolve(__dirname));

    // Scan directories looking for translation keys
    let usedKeys = Object.create(null);

    for (const file of scanned) {
        const fileKeys = searchTranslationUsages(file);
        if (Object.keys(fileKeys).length > 0) {
            // console.log("[REPORT] Found " + Object.keys(fileKeys).length + " translation keys in file " + file);
            // console.log("[KEYS-REPORT]" + JSON.stringify(Object.keys(fileKeys)));
            usedKeys = mergeResources(usedKeys, fileKeys);
        }
    }

    // console.log("[REPORT] Total used keys found: " + Object.keys(usedKeys).length);

    // Regenerate translations files
    for (const file of translationFiles) {
        const keysFixed = mergeResourcesFirstSide(usedKeys, getResourcesFromTranslationsFile(file));

        const content = generateTranslationConfigurationFile(Path.basename(file), keysFixed);

        FS.writeFileSync(file, content);
    }

    // Generate resources files
    for (const file of translationFiles) {
        const keysFixed = getResourcesFromTranslationsFile(file);
        const staticFileName = getLangFromFile(file) + ".js";
        const staticFile = Path.resolve(__dirname, "static", "lang", staticFileName);
        
        let contents = ''

        contents += '/* Lang file: ' + staticFileName + '*/\n';
        contents += 'window.LOCALE_DATA = ' + JSON.stringify(keysFixed) + ";\n";

        FS.writeFileSync(staticFile, contents);

        console.log("[DONE] Generated language file: " + staticFileName);
    }
}

main();
