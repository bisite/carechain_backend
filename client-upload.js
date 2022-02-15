/* Upload client to S3 bucket */

const FS = require("fs");
const Path = require("path");
const AWS = require("aws-sdk");

const Config = require(Path.resolve(__dirname, "config.json"));
const ClientData = require(Path.resolve(__dirname, "client.json"));

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
        mime = "image/svg+xml";
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

            resolve();
        });
    });
}

async function checkAndUpload(route, key) {
    const file = Path.resolve(__dirname, "static", route.substr(1));

    console.log("UPLOAD " + key);
    await uploadTempFileToS3(key, file);
}

async function checkAndUploadRoute(route, keyVersioned, keyFlat) {
    await checkAndUpload(route, keyFlat);
    await checkAndUpload(route, keyVersioned);
}

async function uploadAll() {
    for (const file in ClientData) {
        await checkAndUploadRoute(file, ClientData[file].versioned, ClientData[file].flat);
    }
}

uploadAll();

