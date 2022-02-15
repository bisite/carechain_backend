// Assets management system

"use strict";

import FS from "fs";
import Path from "path";
import Statify from "staticify";
import { Config } from "./config";

/**
 * Assets management class.
 */
export class Assets {
    public static statify = Statify(Path.resolve(__dirname, "..", "static"), { pathPrefix: "/static" });

    public static clientData = JSON.parse(FS.readFileSync(Path.resolve(__dirname, "..", "client.json")).toString());

    public static clientVersion = FS.readFileSync(Path.resolve(__dirname, "..", "client.version")).toString().trim();

    public static cloudFrontData = {};

    public static build() {
        for (const k of Object.keys(Assets.clientData)) {
            Assets.cloudFrontData[k] = Assets.versioned(k);
        }
    }

    /**
     * Returns a versioned asset url.
     * @param path The original asset path.
     */
    public static versioned(path: string): string {
        if (Config.getInstance().isProduction && Config.getInstance().cdn) {
            if (Assets.clientData[path]) {
                return Config.getInstance().getCloudFromAsset(Assets.clientData[path].versioned);
            } else {
                return Assets.statify.getVersionedPath(path);
            }
        } else {
            return Assets.statify.getVersionedPath(path);
        }
    }

    public static raw(path: string): string {
        if (Config.getInstance().isProduction && Config.getInstance().cdn) {
            if (Assets.clientData[path]) {
                return Config.getInstance().getCloudFromAsset(Assets.clientData[path].flat);
            } else {
                return "/static" + path;
            }
        } else {
            return "/static" + path;
        }
    }
}

Assets.build();
