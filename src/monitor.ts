// Reserved for license

"use strict";

import Cluster from "cluster";
import LockFile from "lockfile";
import Path from "path";
import { Config } from "./config";
import { formatDate } from "./utils/text-utils";

const LOCK_FILE = Path.resolve(__dirname, "..", "monitor.lock");

async function lockMonitor() {
    return new Promise<void>(function(resolve, reject) {
        LockFile.lock(LOCK_FILE, function(er) {
            if (er) {
                return reject(new Error("Could not start the appication because it is already started. Lockfile could not be acquired. Remove the file 'monitor.lock' to fix this exception."));
            }
            resolve();
        });
    });
}

function exitHandler(options, exitCode) {
    LockFile.unlock(LOCK_FILE, function(er) {
        if (er) {
            Monitor.exception(er);
            if (options.exit) {
                process.exit(exitCode);
            }
        } else {
            Monitor.status("Shutdown...");
            if (options.exit) {
                process.exit();
            }
        }
    });
}

/**
 * Monitor. Logs messages to the standard output.
 */
export class Monitor {

    /**
     * Starts the monitor process.
     */
    public static async start() {
        if (Cluster.isMaster) {
            await lockMonitor();

            // do something when app is closing
            process.on("exit", exitHandler.bind(null, { cleanup: true }));

            // catches ctrl+c event
            process.on("SIGINT", exitHandler.bind(null, { exit: true }));

            // catches "kill pid" (for example: nodemon restart)
            process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
            process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

            Cluster.on("message", (worker, message, handle) => {
                if (message.type === "log") {
                    Monitor.log(`[Worker ${worker.id}] ${message.msg}`);
                }
            });
        } else {
            throw new Error("This method must be called only by the master process.");
        }
    }

    /**
     * Logs a message.
     * @param msg The message to log.
     */
    public static log(msg: string) {
        if (Cluster.isMaster) {
            console.log(`[${formatDate(Date.now())}] ${msg}`);
        } else {
            process.send({ type: "log", msg });
        }
    }

    /**
     * Logs an information message.
     * @param msg The message to log.
     */
    public static status(msg: string) {
        Monitor.log(`[STATUS] ${msg}`);
    }

    /**
     * Logs an information message.
     * @param msg The message to log.
     */
    public static info(msg: string) {
        if (Config.getInstance().isProduction) {
            return;
        }
        Monitor.log(`[INFO] ${msg}`);
    }

    /**
     * Logs a debug message.
     * @param msg The message to log.
     */
    public static debug(msg: string) {
        if (Config.getInstance().isProduction) {
            return;
        }
        Monitor.log(`[DEBUG] ${msg}`);
    }

    /**
     * Logs an error message.
     * @param err The error to log.
     */
    public static debugException(err: Error) {
        if (Config.getInstance().isProduction) {
            return;
        }
        Monitor.log(`[ERROR] ${err.message} \n ${err.stack}`);
    }

    /**
     * Logs a warning message.
     * @param msg The message to log.
     */
    public static warning(msg: string) {
        Monitor.log(`[WARNING] ${msg}`);
    }

    /**
     * Logs an error message.
     * @param msg The message to log.
     */
    public static error(msg: string) {
        Monitor.log(`[ERROR] ${msg}`);
    }

    /**
     * Logs an error message.
     * @param err The error to log.
     */
    public static exception(err: Error) {
        Monitor.log(`[ERROR] ${err.message} \n ${err.stack}`);
    }
}
