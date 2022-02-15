/* Upload client to S3 bucket (Only hot files, /js/ and /css/) */

const Path = require("path");
const AWS = require("aws-sdk");

const Config = require(Path.resolve(__dirname, "config.json"));
const ClientData = require(Path.resolve(__dirname, "client.json"));

const currentKeys = {};

for (const obj of Object.values(ClientData)) {
    currentKeys[obj.versioned] = true;
    currentKeys[obj.flat] = true;
}

const bucket = Config.cdn.bucket;

const s3 = new AWS.S3();

var allKeys = [];
async function listAllKeys(token, cb) {
    var opts = { Bucket: bucket };
    if (token) opts.ContinuationToken = token;

    s3.listObjectsV2(opts, async function (err, data) {
        allKeys = allKeys.concat(data.Contents);

        for (const content of data.Contents) {
            await cb(content.Key);
        }

        if (data.IsTruncated) {
            await listAllKeys(data.NextContinuationToken, cb);
        }
    });
}

console.log("Collecting garbage from client bucket... (Bucket: " + bucket + ")");

listAllKeys(null, async function (key) {
    if (!currentKeys[key]) {
        // Garbage detected
        console.log("[GARBAGE COLLECTOR] Found unused file: " + key);
        return new Promise(function (resolve) {
            s3.deleteObject({Bucket: bucket, Key: key}, function(err3, data2) {
                if (err3) {
                    console.log("[ERROR] Could not delete object " + key + " | Reason: " + err3.message)
                } else {
                    console.log("[GARBAGE COLLECTOR] Deleted file from S3: " + key);
                }
                resolve();
            });
        });
    }
});
