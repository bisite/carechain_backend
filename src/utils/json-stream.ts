// JSON stream

"use strict";

import { createReadStream } from "fs";
import HTTP from "http";
import HTTPS from "https";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { ignore } from "stream-json/filters/Ignore";
import { pick } from "stream-json/filters/Pick";
import { streamValues } from "stream-json/streamers/StreamValues";
import { URL } from "url";
import { Monitor } from "../monitor";

export async function doRequestAndStreamJSON(url: string, method: string, headers: any, body: any, filterNodes: RegExp, each: (node: any) => Promise<void>) {
    const urlParsed = new URL(url);
    const finalHeaders: any = {};

    if (headers) {
        for (const k of Object.keys(headers)) {
            finalHeaders[k] = headers[k];
        }
    }

    if (body) {
        if (typeof body === "object") {
            finalHeaders["content-type"] = "application/json";
            body = JSON.stringify(body);
        }
    }

    const driver = (urlParsed.protocol === "https:") ? HTTPS : HTTP;

    return new Promise<void>(function(resolve, reject) {
        const request = driver.request(url, { method, headers: finalHeaders }, function(response) {
            response.setEncoding("utf8");

            if (response.statusCode !== 200) {
                reject("Request failed. Status code: " + response.statusCode);
                return;
            }

            const pipelineArray = [];

            pipelineArray.push(response);
            pipelineArray.push(parser());

            if (filterNodes) {
                pipelineArray.push(pick({ filter: filterNodes }));
            }

            pipelineArray.push(streamValues());

            const pipeline = chain(pipelineArray);
            let lastPromise: Promise<void> = null;

            pipeline.on("data", async function(data) {
                pipeline.pause();

                // Monitor.debug("Data from stream: " + JSON.stringify(data));

                try {
                    lastPromise = each(data.value);
                    await lastPromise;
                } catch (ex) {
                    pipeline.destroy();
                    reject(ex);
                    return;
                }

                pipeline.resume();
            }.bind(this));

            pipeline.on("end", async function() {
                if (lastPromise) {
                    try {
                        await lastPromise;
                    } catch (ex) {
                        reject(ex);
                        return;
                    }
                }
                resolve();
            }.bind(this));
        }.bind(this));

        request.on("error", function(e) {
            Monitor.debug("Request failed");
            reject(e);
        }.bind(this));

        if (body) {
            request.write(body);
        }

        request.end();
    }.bind(this));
}

export async function openFileAndStreamJSON(file: string, filterNodes: RegExp, each: (node: any) => Promise<void>) {
    return new Promise<void>(function(resolve, reject) {
        const pipelineArray = [];

        pipelineArray.push(createReadStream(file));
        pipelineArray.push(parser());

        if (filterNodes) {
            pipelineArray.push(pick({ filter: filterNodes }));
        }

        pipelineArray.push(streamValues());

        const pipeline = chain(pipelineArray);
        let lastPromise: Promise<void> = null;

        pipeline.on("data", async function(data) {
            pipeline.pause();

            // Monitor.debug("Data from stream: " + JSON.stringify(data));

            try {
                lastPromise = each(data.value);
                await lastPromise;
            } catch (ex) {
                pipeline.destroy();
                reject(ex);
                return;
            }

            pipeline.resume();
        }.bind(this));

        pipeline.on("end", async function() {
            if (lastPromise) {
                try {
                    await lastPromise;
                } catch (ex) {
                    reject(ex);
                    return;
                }
            }
            resolve();
        }.bind(this));
    }.bind(this));
}

/**
 * Groups data you receive 1 by 1
 * Call push to append data
 * Call end to indicate the date stream ended
 */
export class BatchGrouping {
    public size: number;
    public parse: (data: any[]) => Promise<void>;
    public buffer: any[];

    constructor(size: number, parse: (data: any[]) => Promise<void>) {
        this.size = size;
        this.parse = parse;
        this.buffer = [];
    }

    public async flush() {
        if (this.buffer.length > 0) {
            await this.parse(this.buffer);
            this.buffer = [];
        }
    }

    public async push(data: any) {
        this.buffer.push(data);

        if (this.buffer.length > this.size) {
            await this.parse(this.buffer);
            this.buffer = [];
        }
    }

    public async end() {
        await this.flush();
    }
}
