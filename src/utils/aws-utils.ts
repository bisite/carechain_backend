/* AWS utils */

"use strict";

import AWS from "aws-sdk";
import FS from "fs";
import { Config } from "../config";
import { Monitor } from "../monitor";
import { createRandomUID } from "./text-utils";
import { makeTempFile } from "./file-utils";

export async function uploadImageToS3(file: string): Promise<string> {
    Monitor.debug("Uploading to S3 bucket...");

    return new Promise<string>(function (resolve, reject) {
        // S3
        const s3 = new AWS.S3();
        const key = createRandomUID() + ".jpg";

        s3.upload({ Bucket: Config.getInstance().publicBucket, Key: key, Body: FS.readFileSync(file), ACL: "public-read", CacheControl: "max-age=31536000", ContentType: "image/jpg" }, async function (err2, data) {
            if (err2) {
                return reject(err2);
            }

            resolve(data.Location);
        }.bind(this));
    });
}

export async function uploadTempFileToS3(file: string): Promise<string> {
    // S3
    const s3 = new AWS.S3();
    const key = createRandomUID();

    Monitor.debug("Uploading file to S3: " + key);

    return new Promise<string>(function (resolve, reject) {
        s3.upload({ Bucket: Config.getInstance().tempFilesBucket, Key: key, Body: FS.readFileSync(file), ACL: "private" }, async function (err2, data) {
            if (err2) {
                Monitor.exception(err2);
                return reject(err2);
            }

            resolve(key);
        });
    });
}

export async function downloadFromS3(s3Bucket: string, s3Key: string): Promise<string> {
    const s3 = new AWS.S3();
    const file = makeTempFile(createRandomUID());

    Monitor.debug("Downloaded S3 file " + s3Key + " to temporal file: " + file);

    return new Promise<string>(function (resolve, reject) {
        const stream = s3.getObject({ Bucket: s3Bucket, Key: s3Key }).createReadStream();

        stream.on("error", function (e) {
            reject(e);
        });

        const writeStream = FS.createWriteStream(file);

        writeStream.on("error", function (e) {
            reject(e);
        });

        stream.pipe(writeStream).on("finish", function () {
            resolve(file);
        });
    });
}
