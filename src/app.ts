// Reserved for license

"use strict";

import BodyParser from "body-parser";
import compression from "compression";
import CookieParser from "cookie-parser";
import Express from "express";
import FileUpload from "express-fileupload";
import ExpressUserAgent from "express-useragent";
import FS from "fs";
import HTTP from "http";
import I18N from "i18n";
import HTTPS from "https";
import Path from "path";
import SPDY from "spdy";
import WebSocket from "ws";
import { Assets } from "./assets";
import { Config } from "./config";
import { ApiVersion1Controller } from "./controllers/api/v1/api-main";
import { Monitor } from "./monitor";
import { INTERNAL_SERVER_ERROR } from "./utils/http-utils";
import { Sensors } from "./models/sensor";
import { SensorsData } from "./models/sensorData";
import { createRandomUID } from "./utils/text-utils";


// Express async errors
require("express-async-errors");

/**
 * Web Application.
 */
export class MainWebApplication {
    private application: Express.Express | any;

    constructor() {
        // Create and configure express aplication
        this.application = Express();

        // Firewall
        this.application.get("*", this.firewall.bind(this));
        this.application.post("*", this.firewall.bind(this));

        // Middleware
        this.application.use(compression());
        this.application.use(BodyParser.json({ limit: "16mb" }));
        this.application.use(BodyParser.urlencoded({ limit: "16mb", extended: true }));
        this.application.use(FileUpload({
            limits: { fileSize: Config.getInstance().maxUploadFileSize },
        }));
        this.application.use(CookieParser());
        this.application.use(ExpressUserAgent.express());

        // Internationalization
        I18N.configure({
            locales: ["en", "es"],
            directory: Path.resolve(__dirname, "..", "locales"),
            header: 'accept-language',
            cookie: "locale",
            extension: ".json",
        });

        this.application.use(I18N.init);

        // Static files
        this.application.use("/static", Assets.statify.middleware);
        this.application.use("/favicon.ico", Express.static(Path.resolve(__dirname, "../static/images/favicon.ico")));
        this.application.use("/robots.txt", Express.static(Path.resolve(__dirname, "../static/robots.txt")));

        // Swagger
        if (!Config.getInstance().isProduction) {
            try {
                const expressSwagger = require('express-swagger-generator')(this.application);
                expressSwagger({
                    swaggerDefinition: {
                        info: {
                            description: 'API documentation',
                            title: 'Carechain',
                            version: '1.0.0',
                        },
                        host: Config.getInstance().getHost(),
                        basePath: '/api/v1',
                        produces: [
                            "application/json"
                        ],
                        schemes: ['http', 'https'],
                        securityDefinitions: {
                            SessionIdAuth: {
                                type: "apiKey",
                                in: "header",
                                name: "x-session-id",
                            },
                            AnonUserAuth: {
                                type: "apiKey",
                                in: "header",
                                name: "x-anon-token",
                            }
                        },
                    },
                    basedir: __dirname, //app absolute path
                    files: ['./controllers/api/**/*.js'] //Path to the API handle folder
                });
            } catch (ex) {
                Monitor.error("Cannot load module express-swagger-generator | DO NOT SET production=false when working on production!");
            }
        }


        const mqtt = require("mqtt");

        const client = mqtt.connect("mqtt://127.0.0.1:1883");

        client.on("connect", function() {
            console.log("La conexión al servidor es exitosa");
            client.subscribe('#', { qos: 1 });
        });

        client.on("message", async function(top, message) {
            const sensorID = top;
            console.log(top);
            const sensor: Sensors = await Sensors.findSensorByID(sensorID);
            if (sensor === null){
                return;
            }

            const sensorDataCreated: SensorsData = new SensorsData({
                id: createRandomUID(),
                sensorId: sensorID,
                data: message.toString(),
                timestamp: Date.now()
            });
    
            try {
                await sensorDataCreated.insert();
            } catch (ex) {
                console.log("Error creating the new sensor data");
                return;
            }
        });
            

        // Controllers
        this.registerControllers();

        // Error handler
        this.application.use("*", this.errorHandler.bind(this));

        
    }

    /**
     * Starts the web application.
     */
    public start() {
        //RedisService.getInstance().startCacheClient(); // TODO: Use redis if needed

        if (Config.getInstance().http.port) {
            const http = HTTP.createServer(this.application).on("error", (e: any) => {
                if (e.code === "EADDRINUSE") {
                    Monitor.error(`[HTTP] [FATAL] [EADDRINUSE] Address is in use, cannot bind to port ${Config.getInstance().http.port}`);
                }
            });

            this.configureMonitor(new WebSocket.Server({ server: http, path: "/websocket" }));

            http.listen(Config.getInstance().http.port, Config.getInstance().http.bindAddress, () => {
                Monitor.status(`[HTTP] Application listening on ${Config.getInstance().http.bindAddress}:${Config.getInstance().http.port}`);
            });
        }

        /// HTTPS
        if (Config.getInstance().https.port && Config.getInstance().https.certFile && Config.getInstance().https.keyFile) {
            if (Config.getInstance().https.spdy) {
                const spdy = SPDY.createServer({
                    cert: FS.readFileSync(Config.getInstance().https.certFile),
                    key: FS.readFileSync(Config.getInstance().https.keyFile),
                }, this.application).on("error", (e: any) => {
                    if (e.code === "EADDRINUSE") {
                        Monitor.error(`[SPDY] [FATAL] [EADDRINUSE] Address is in use, cannot bind to port ${Config.getInstance().https.port}`);
                    }
                });

                this.configureMonitor(new WebSocket.Server({ server: spdy, path: "/websocket" }));

                spdy.listen(Config.getInstance().https.port, Config.getInstance().https.bindAddress, () => {
                    Monitor.status(`[SPDY] Application listening on ${Config.getInstance().https.bindAddress}:${Config.getInstance().https.port}`);
                });
            } else {
                const https = HTTPS.createServer({
                    cert: FS.readFileSync(Config.getInstance().https.certFile),
                    key: FS.readFileSync(Config.getInstance().https.keyFile),
                }, this.application).on("error", (e: any) => {
                    if (e.code === "EADDRINUSE") {
                        Monitor.error(`[HTTPS] [FATAL] [EADDRINUSE] Address is in use, cannot bind to port ${Config.getInstance().https.port}`);
                    }
                });

                this.configureMonitor(new WebSocket.Server({ server: https, path: "/websocket" }));

                https.listen(Config.getInstance().https.port, Config.getInstance().https.bindAddress, function() {
                    Monitor.status(`[HTTPS] Application listening on ${Config.getInstance().https.bindAddress}:${Config.getInstance().https.port}`);
                }.bind(this));
            }
        }
    }

    public async configureMonitor(ws: WebSocket.Server) {
        ws.on("connection", function (socket: WebSocket, req) {
            Monitor.info("WEBSOCKET /websocket FOR " + req.connection.remoteAddress);

            req.connection.destroy(); // Destroy the connection for now
        }.bind(this));
    }

    /**
     * Registers the controllers.
     */
    private registerControllers() {
        // Register here the application controllers

        const apiV1Controller = new ApiVersion1Controller();
        apiV1Controller.register(this.application);

        // HERE: Register controllers

        Monitor.log('Controllers succesfully registered');
    }

    /**
     * Firewall. All requests go throught this method before being handled.
     * @param request The request object.
     * @param response The response object.
     * @param next The callback.
     */
    private firewall(request: Express.Request | any, response: Express.Response, next) {
        Monitor.info(request.method.toUpperCase() + " " + JSON.stringify(request.path) + " FOR " + request.ip);
        if (request.protocol === "http" && Config.getInstance().redirectSecure) {
            // Redirect to https
            response.writeHead(301, { Location: "https://" + request.headers.host + ":" + Config.getInstance().https.port + request.url });
            response.end();
            return;
        }
        // CORS
        const origin = "" + request.headers.origin;
        if (Config.getInstance().allowedOrigins.indexOf(origin) > -1) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        next();
    }

    /**
     * Error handler. All requests that resulted in error go to this method.
     * @param error Error thrown.
     * @param request The request object.
     * @param response The response object.
     * @param next The callback.
     */
    private errorHandler(error: Error, request: Express.Request | any, response: Express.Response, next) {
        if (error) {
            Monitor.exception(error);
            response.status(INTERNAL_SERVER_ERROR);
            response.send("An internal server error ocurred. Check console for details.");
            return;
        }
        next();
    }
}
