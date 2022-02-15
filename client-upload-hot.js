/* Upload client to S3 bucket (Only hot files, /js/ and /css/) */

const FS = require("fs");
const Path = require("path");
const AWS = require("aws-sdk");

const Config = require(Path.resolve(__dirname, "config.json"));
const ClientData = require(Path.resolve(__dirname, "client.json"));

let ClientCache;

try {
    ClientCache = require(Path.resolve(__dirname, "client-cache.json"));
} catch (ex) {
    ClientCache = {};
}


const bucket = Config.cdn.bucket;

async function uploadTempFileToS3(key, file){
    // S3
    const s3 = new AWS.S3();

    let mime = "";

    if (file.endsWith(".js")) {
        mime = "text/javascript";
    } else if (file.endsWith(".css")) {
        mime = "text/css";
    } else if (file.endsWith(".png")) {
        mime = "image/png";
    } else if (file.endsWith(".jpg")) {
        mime = "image/jpg";
    } else if (file.endsWith(".webp")) {
        mime = "image/webp";
    } else if (file.endsWith(".json")) {
        mime = "application/json";
    } else if (file.endsWith(".svg")) {
        mime = "image/svg";
    } else if (file.endsWith(".html")) {
        mime = "text/html";
    } else {
        mime = "text/plain";
    }

    return new Promise(function(resolve, reject) {
        s3.upload({ Bucket: bucket, Key: key, Body: FS.readFileSync(file), ContentType: mime, CacheControl: 'max-age=31536000' }, async function(err2, data) {
            if (err2) {
                return reject(err2);
            }

            ClientCache[key] = true;

            resolve();
        });
    });
}

async function checkFileExists(key) {
    if (ClientCache[key]) {
        return true;
    }
    // S3
    const s3 = new AWS.S3();

    return new Promise(function(resolve, reject) {
        s3.headObject({ Bucket: bucket, Key: key }, async function(err2, data) {
            if (err2) {
                return resolve(false);
            }

            ClientCache[key] = true;

            resolve(true);
        });
    });
}

async function checkAndUpload(route, key) {
    const file = Path.resolve(__dirname, "static", route.substr(1));

    const exists = await checkFileExists(key);

    if (!exists) {
        console.log("UPLOAD " + key);
        await uploadTempFileToS3(key, file)
    } else {
        console.log("EXISTS " + key);
    }
}

async function checkAndUploadRoute(route, keyVersioned, keyFlat) {
    await checkAndUpload(route, keyFlat);
    await checkAndUpload(route, keyVersioned);
}

async function uploadAll() {
    for (const file in ClientData) {
        await checkAndUploadRoute(file, ClientData[file].versioned, ClientData[file].flat);
    }

    updateCache();
}

function updateCache() {
    FS.writeFileSync(Path.resolve(__dirname, "client-cache.json"), JSON.stringify(ClientCache));
    console.log("Client cache saved!");
}

uploadAll();

process.on('SIGINT', function () {
    try {
        updateCache();
    } catch (ex) {}
    process.exit(0);
});

