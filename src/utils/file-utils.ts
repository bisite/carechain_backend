/* File utils */

"use strict";

import fileUpload from "express-fileupload";
import Path from "path";
import { createRandomUID } from "./text-utils";

export function makeTempFile(fileName: string) {
    return Path.resolve(__dirname, "..", "..", "data", fileName);
}

/**
 * Gets path to temp file
 * @param file Temp file name
 * @returns Temp file full path
 */
export function getTempFilePath(file: string) {
    return Path.resolve(__dirname, "..", "..", "data", file);
}

/**
 * Moves uploaded file to temp file
 * @param file Uploaded file
 * @returns Temp file path
 */
export async function moveUploadedFileToTempFile(file: fileUpload.UploadedFile, fileName: string): Promise<string> {
    const tmpFile = makeTempFile(fileName);
    return new Promise<string>(function (resolve, reject) {
        file.mv(tmpFile, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(tmpFile);
        });
    });
}