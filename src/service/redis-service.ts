// Reserved for license

"use strict";

import Events from "events";
import Redis from "redis";
import { Config, RedisConfiguration } from "../config";
import { Monitor } from "../monitor";
import { sha256 } from "../utils/text-utils";

/**
 * Redis client service
 */
export class RedisService {

    /* Singleton */

    public static instance: RedisService = null;

    public static getInstance(): RedisService {
        if (RedisService.instance !== null) {
            return RedisService.instance;
        } else {
            RedisService.instance = new RedisService();
            return RedisService.instance;
        }
    }

    /* Class */

    public pubClient: Redis.RedisClient;
    public subClient: Redis.RedisClient;
    public cacheClient: Redis.RedisClient;
    public config: RedisConfiguration;
    public events: Events.EventEmitter;
    public subscribers: number;

    constructor() {
        this.pubClient = null;
        this.subClient = null;
        this.config = Config.getInstance().redis;
        this.events = new Events.EventEmitter();
        this.events.setMaxListeners(65536);
        this.subscribers = 0;
    }

    public startSubscriptionService() {
        this.subClient = Redis.createClient({
            host: this.config.host,
            port: this.config.port,
            password: this.config.password || undefined,
        });

        this.subClient.on("message", this.onMessage.bind(this));

        this.subClient.subscribe(this.config.channel);
    }

    public stopSubscriptionService() {
        this.subClient.unsubscribe();
        this.subClient.quit();
        this.subClient = null;
    }

    public async onMessage(channel: string, str: string) {
        Monitor.debug("[PUB/SUB] Reveived message from channel '" + channel + "' -> " + str);

        if (channel !== this.config.channel) {
            return; // Ignore message
        }

        try {
            const message = JSON.parse(str);

            switch (message.event) {
            // Add here more events
            default:
                Monitor.error("Unexpected message received from Redis: " + str);
            }
        } catch (ex) {
            Monitor.error("Unexpected message received from Redis: " + str);
            return; // Ignore message
        }
    }

    public async publish(message: any): Promise<number> {
        if (this.pubClient === null) {
            this.pubClient = Redis.createClient({
                host: this.config.host,
                port: this.config.port,
                password: this.config.password || undefined,
            });
        }

        return new Promise<number>(function (resolve, reject) {
            this.pubClient.publish(this.config.channel, JSON.stringify(message), function (n: number) {
                resolve(n);
            });
        }.bind(this));
    }

    public async quit(): Promise<void> {
        if (this.pubClient !== null) {
            return new Promise<void>(function (resolve, reject) {
                this.pubClient.quit(function () {
                    this.pubClient = null;
                    resolve();
                }.bind(this));
            }.bind(this));
        }
    }

    public async publishOnce(message: any) {
        await this.publish(message);
        await this.quit();
    }

    public subscribe(event: string, listener: (...args: any[]) => void) {
        if (this.subClient === null) {
            this.startSubscriptionService();
        }
        this.events.addListener(event, listener);
        this.subscribers++;
    }

    public unsubscribe(event: string, listener: (...args: any[]) => void) {
        this.events.removeListener(event, listener);
        this.subscribers--;
        if (this.events.eventNames().length === 0) {
            this.stopSubscriptionService(); // No more listeners, no need to waste a connection
        }
    }

    public startCacheClient() {
        this.cacheClient = Redis.createClient({
            host: this.config.host,
            port: this.config.port,
            password: this.config.password || undefined,
        });
    }

    public async getFromCache(request: any): Promise<any> {
        if (!this.cacheClient) {
            return Promise.resolve(null);
        }

        const requestJSON = JSON.stringify(request);
        const requestHash = sha256(requestJSON);

        return new Promise<any>(function (resolve, reject) {

            let timedOut = false;
            const timeout = setTimeout(function () {
                timedOut = true;
                resolve(null);
            }.bind(this), 1000);

            this.cacheClient.get(requestHash, function (err, data) {
                if (timedOut) { return; }
                clearTimeout(timeout);
                if (err) {
                    console.warn("[ERROR FROM REDIS] " + err.code + ": " + err.message);
                    return resolve(null);
                }

                if (data !== null) {
                    let dataNoJSON;
                    try {
                        dataNoJSON = JSON.parse(data);

                        const receivedRequest = dataNoJSON.request;

                        if (JSON.stringify(receivedRequest) === requestHash) {
                            return resolve(dataNoJSON.response);
                        } else {
                            return resolve(null);
                        }
                    } catch (ex) {
                        Monitor.exception(ex);
                        this.cacheClient.del(requestHash);
                        return resolve(null);
                    }
                } else {
                    return resolve(null);
                }
            }.bind(this));
        }.bind(this));
    }

    public setCache(request: any, response: any) {
        if (!this.cacheClient) { return; }
        const requestHash = JSON.stringify(request);
        if (response) {
            this.cacheClient.setex(requestHash, 3600, JSON.stringify({
                request,
                response,
            }));
        }
    }
}
