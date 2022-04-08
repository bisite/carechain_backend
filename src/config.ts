// Reserved for license

"use strict";

import FileSystem from "fs";
import OS from "os";
import Path from "path";
import { URL } from "url";
import { Monitor } from "./monitor";
import { DataSource } from "tsbean-orm";
import { MySQLDriver } from "tsbean-driver-mysql";
import { MongoDriver } from "tsbean-driver-mongo"

const CONFIG_FILE = "config.json";
const CONFIG_EXAMPLE_FILE = "config-example.json";

/**
 * Http configuration.
 */
export class HttpConfig {
    public port: number;
    public bindAddress: string;

    constructor() {
        this.port = 8080;
        this.bindAddress = "";
    }
}

/**
 * Https configuration.
 */
export class HttpsConfig extends HttpConfig {
    public certFile: string;
    public keyFile: string;
    public spdy: boolean;

    constructor() {
        super();
        this.certFile = "";
        this.keyFile = "";
        this.spdy = false;
    }
}

/**
 * Mongo DB configuration.
 */
export class DatabaseConfig {
    public type: string;
    public databaseName: string;
    public host: string;
    public port: number;
    public user: string;
    public password: string;
    public connections: number;

    constructor() {
        this.type = "mongodb";
        this.databaseName = "ontochain";
        this.host = "localhost";
        this.port = 27017;
        this.user = "";
        this.password = "";
        this.connections = 4;
    }
}

/**
 * Open auth configuration.
 */
export class OAuthConfiguration {
    public clientId: string;
    public clientSecret: string;
    public endpointSecret: string;

    constructor() {
        this.clientId = "";
        this.clientSecret = "";
        this.endpointSecret = "";
    }
}

/**
 * Google reCaptcha configuration.
 */
export class ReCaptchaConfiguration {
    public siteId: string;
    public secret: string;

    constructor() {
        this.siteId = "";
        this.secret = "";
    }
}

export class RedisConfiguration {
    public host: string;
    public port: number;
    public password: string;
    public channel: string;

    constructor() {
        this.host = "127.0.0.1";
        this.port = 6379;
        this.password = "";
        this.channel = "lobby";
    }
}

/**
 * Application configuration.
 */
export class Config {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): Config {
        if (Config.instance) {
            return Config.instance;
        }

        const config: Config = new Config();
        const configPath = Path.resolve(__dirname, "..", CONFIG_FILE);
        const configExamplePath = Path.resolve(__dirname, "..", CONFIG_EXAMPLE_FILE);

        let rawConfig: any = {};
        try {
            if (FileSystem.existsSync(configPath)) {
                rawConfig = JSON.parse(FileSystem.readFileSync(configPath).toString());
            } else {
                Monitor.warning("Using default configuration file.");
                rawConfig = JSON.parse(FileSystem.readFileSync(configExamplePath).toString());
            }
        } catch (e) {
            Monitor.error("Invalid configuration: " + e.message);
        }

        config.isProduction = !!rawConfig.production;
        config.uri = rawConfig.external_uri || "https://localhost";
        config.numberOfWorkers = rawConfig.number_of_workers || OS.cpus().length;
        config.redirectSecure = !!rawConfig.redirect_secure;
        config.emailValidationDisabled = !!rawConfig.disable_email_validation;
        config.sessionBindingDisabled = !!rawConfig.disable_session_address_binding;

        // Set HTTP config
        config.http = new HttpConfig();
        if (typeof rawConfig === "object" && typeof rawConfig.http === "object") {
            config.http.port = rawConfig.http.port;
            config.http.bindAddress = rawConfig.http.bind_address;
        }

        // Set https config
        config.https = new HttpsConfig();
        if (typeof rawConfig === "object" && typeof rawConfig.https === "object") {
            config.https.port = rawConfig.https.port;
            config.https.bindAddress = rawConfig.https.bind_address;
            config.https.certFile = rawConfig.https.certificate_file;
            config.https.keyFile = rawConfig.https.private_key_file;
            config.https.spdy = !!rawConfig.https.spdy;
        }

        // Set database config
        config.db = new DatabaseConfig();
        if (typeof rawConfig === "object" && typeof rawConfig.database === "object") {
            config.db.type = rawConfig.database.type;
            config.db.databaseName = rawConfig.database.name;

            config.db.host = rawConfig.database.host || "localhost";
            config.db.port = rawConfig.database.port || 3306;
            config.db.user = rawConfig.database.user || "";
            config.db.password = rawConfig.database.password || "";
            config.db.connections = rawConfig.database.max_connections || 4;
        }

        console.log('EN config')
        console.log(config.db)
        switch (config.db.type) {
        case "mongodb":
        {
            const dataSource = MongoDriver.createDataSource("mongodb://" + config.db.host + ':' + config.db.port +'/' + config.db.databaseName);
            DataSource.set(DataSource.DEFAULT, dataSource);
            console.log("Database source " + DataSource.get(DataSource.DEFAULT));
            break;
        }
            
        case "mysql":
            {
                const dataSource = MySQLDriver.createDataSource({
                    host: config.db.host,
                    port: config.db.port,
                    user: config.db.user,
                    password: config.db.password,
                    connections: (process.env.WorkerType !== "server") ? 1 : config.db.connections,
                    database: config.db.databaseName,
                    debug: rawConfig.trace ? Monitor.debug : null,
                });

                DataSource.set(DataSource.DEFAULT, dataSource);
            }
            break;
        default:
            throw new Error("Unknown data source type");
        }

        config.mailerConfiguration = rawConfig.mail || {};
        config.aws = rawConfig.aws || {};

        config.reCaptcha = new ReCaptchaConfiguration();
        if (typeof rawConfig === "object" && typeof rawConfig.reCaptcha === "object") {
            config.reCaptcha.siteId = rawConfig.reCaptcha.site_id;
            config.reCaptcha.secret = rawConfig.reCaptcha.secret;
        }

        config.publicBucket = rawConfig.public_upload_bucket || "";
        config.tempFilesBucket = rawConfig.temp_files_bucket || "";
        config.supportMail = rawConfig.support_mail || "";
        config.maxUploadFileSize = rawConfig.max_upload_file_size || (1073741824); // 1 GB by default
        config.isSlave = !!rawConfig.slave;

        config.redis = new RedisConfiguration();
        if (typeof rawConfig === "object" && typeof rawConfig.redis === "object") {
            config.redis.host = rawConfig.redis.host;
            config.redis.port = rawConfig.redis.port;
            config.redis.password = rawConfig.redis.password;
            config.redis.channel = rawConfig.redis.channel;
        }

        if (typeof rawConfig === "object" && typeof rawConfig.cdn === "object") {
            if (rawConfig.cdn.domain) {
                config.cdn = "https://" + rawConfig.cdn.domain + "/";
            } else {
                config.cdn = "";
            }
        } else {
            config.cdn = "";
        }

        config.facebook = new OAuthConfiguration();
        if (typeof rawConfig === "object" && typeof rawConfig.facebook === "object") {
            config.facebook.clientId = rawConfig.facebook.client_id;
            config.facebook.clientSecret = rawConfig.facebook.client_secret;
        }

        config.google = new OAuthConfiguration();
        if (typeof rawConfig === "object" && typeof rawConfig.google === "object") {
            config.google.clientId = rawConfig.google.client_id;
            config.google.clientSecret = rawConfig.google.client_secret;
        }

        config.languages = rawConfig.languages || [
            { locale: "en", name: "English" },
            { locale: "es", name: "Español" }
        ];

        config.allowedOrigins = rawConfig.allowed_origins || [];

        config.usingProxy = !!rawConfig.using_proxy;

        config.id = rawConfig.node_id || "ONE";

        config.adminMail = rawConfig.admin_mail || "";

        Config.instance = config;

        return config;
    }
    private static instance: Config = null;

    public isProduction: boolean;
    public isSlave: boolean;
    public uri: string;
    public http: HttpConfig;
    public https: HttpsConfig;
    public db: DatabaseConfig;
    public aws: any;
    public numberOfWorkers: number;
    public redirectSecure: boolean;
    public emailValidationDisabled: boolean;
    public sessionBindingDisabled: boolean;
    public mailerConfiguration: any;

    public reCaptcha: ReCaptchaConfiguration;
    public supportMail: string;
    public maxUploadFileSize: number;
    public publicBucket: string;
    public tempFilesBucket: string;

    public adminMail: string;

    public usingProxy: boolean;

    public redis: RedisConfiguration;

    public allowedOrigins: string[];

    public cdn: string;

    public facebook: OAuthConfiguration;
    public google: OAuthConfiguration;

    public id: string;

    public languages: {
        locale: string,
        name: string,
    }[];

    public getHost() {
        return (new URL(this.uri)).hostname;
    }
    
    public getAbsoluteURI(path) {
        return (new URL(path, this.uri)).toString();
    }

    public getCloudFromAsset(path) {
        return (new URL(path, this.cdn)).toString();
    }

    public fixDocJSON(json: any): any {
        json.servers = [
            { url: this.uri },
        ];
        return json;
    }

    /**
     * Gets the URL for login with facebook.
     */
    public getFacebookOAuthURL(): string {
        return `https://www.facebook.com/v3.2/dialog/oauth?client_id=${encodeURIComponent(this.facebook.clientId)}&redirect_uri=${encodeURIComponent(this.uri + "/facebook/callback")}`;
    }

    /**
     * Gets the URL for login with google.
     */
    public getGoogleOAuthURL(): string {
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(this.google.clientId)}&scope=${encodeURIComponent("email profile openid")}&response_type=code&redirect_uri=${encodeURIComponent(this.uri + "/google/callback")}`;
    }

    public blockchainConfiguration: BlockchainConfiguration;
}

export class BlockchainConfiguration{
    public ws_provider: string;
    public network: string;
    public address: string;
    public private_key: string;
    public password_wallet: string;
    public contract_address: string;
    public contract_address_implementation: string;

   
   
    constructor() {
        this.ws_provider = "wss://rinkeby.infura.io/ws/v3/faddb75addcb40638193ca610aed4830";
        this.network = "rinkeby";
        this.address = "0xBEd6748bFF42725e0682A34A17E59a45AB224471";
        this.private_key = "384d030f3e98dacf479de02c3553c0f44ac6bdd492d9b178e194ea8f15f132bc";
        this.password_wallet = "ontochain_2022";
        this.contract_address = "0xEcb991d836E2CF503Add125c7ddB18cdA6898F15";
        this.contract_address_implementation = "0x5BffE809c955a7b8a46c5E84f080eD9bA3304DfC";
    }
    
}
