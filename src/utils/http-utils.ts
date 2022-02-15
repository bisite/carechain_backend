// Reserved for license

"use strict";

import Express from "express";
import { createWriteStream } from "fs";
import HTTP from "http";
import HTTPS from "https";
import { URL } from "url";
import { Monitor } from "../monitor";

export const OK = 200;

export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;

export const INTERNAL_SERVER_ERROR = 500;

export const TEXT_HTML = "text/html; charset=utf-8";
export const TEXT_PLAIN = "text/plain; charset=utf-8";
export const APPLICATION_JSON = "application/json; charset=utf-8";
export const APPLICATION_XML = "application/xml; charset=utf-8";

export const SUCCESS = "success";
export const ERROR = "error";

export function noCache(callback: any) {
    return async function(request: Express.Request | any, response: Express.Response) {
        response.setHeader("Cache-Control", "no-cache");
        return callback(request, response);
    };
}

export function expressSecurityMeasures(callback: any) {
    return async function(request: Express.Request | any, response: Express.Response) {
        // Make sure query is map string -> string
        if (request.query) {
            for (const key of Object.keys(request.query)) {
                request.query[key] = "" + request.query[key];
            }
        }

        // Make sure body is map string -> string
        if (request.body) {
            for (const key of Object.keys(request.body)) {
                request.body[key] = "" + request.body[key];
            }
        }

        return callback(request, response);
    };
}

export async function doGetAdvanced(url: string, headers: any, maxSize: number): Promise<any> {
    Monitor.info("GET: " + url);

    return new Promise<any>((resolve, reject) => {
        let urlO: URL;

        try {
            urlO = new URL(url);
        } catch (ex) {
            reject(ex);
        }

        const options = {
            method: "GET",
            headers: headers || {},
        };

        let request;

        const responseHandler = function(response) {
            let data = "";

            if (response.statusCode !== 200) {
                const error2 = new Error("Expected status code 200 but received status code " + response.statusCode);
                error2.name = "" + response.statusCode;
                reject(error2);
            }

            response.on("data", function(chunk) {
                data += chunk;

                if (maxSize >= 0 && data.length > maxSize) {
                    reject(new Error("Data received from remote host was too large."));
                    request.abort();
                }
            });

            response.on("end", function() {
                resolve({ body: data, type: response.headers["content-type"] });
            });
        };

        if (urlO.protocol === "https:") {
            request = HTTPS.request(url, options, responseHandler).on("error", reject).end();
        } else {
            request = HTTP.request(url, options, responseHandler).on("error", reject).end();
        }
    });
}

export async function doGetAdvancedStream(url: string, headers: any, maxSize: number, file: string): Promise<any> {
    Monitor.info("GET: " + url);

    return new Promise<any>((resolve, reject) => {
        let urlO: URL;

        try {
            urlO = new URL(url);
        } catch (ex) {
            reject(ex);
        }

        const options = {
            method: "GET",
            headers: headers || {},
        };

        let request;

        const responseHandler = function(response) {
            response.setEncoding("utf8");
            const writeStream = createWriteStream(file);
            let length = 0;

            if (response.statusCode !== 200) {
                const error2 = new Error("Expected status code 200 but received status code " + response.statusCode);
                error2.name = "" + response.statusCode;
                reject(error2);
            }

            response.on("data", function(chunk) {
                writeStream.write(chunk);

                length += chunk.length;

                if (maxSize >= 0 && length > maxSize) {
                    reject(new Error("Data received from remote host was too large."));
                    request.abort();
                }
            });

            response.on("end", function() {
                writeStream.close();
                resolve({ length, type: response.headers["content-type"] });
            });
        };

        if (urlO.protocol === "https:") {
            request = HTTPS.request(url, options, responseHandler).on("error", reject).end();
        } else {
            request = HTTP.request(url, options, responseHandler).on("error", reject).end();
        }
    });
}

export function parseHttpHeadersFromText(txt: string): Array<{ key: string; value: string }> {
    const result = [];

    const lines = txt.split("\n");

    for (const line of lines) {
        const kv = line.split(":");
        if (kv.length >= 2) {
            result.push({
                key: kv[0].trim(),
                value: kv.slice(1).join(":").trim(),
            });
        }
    }

    return result;
}

export function extractHostname(url: string): string {
    try {
        return (new URL(url)).hostname;
    } catch (ex) {
        return "*";
    }
}
