// Reserved for license

"use strict";

import Cluster from "cluster";
import FS from "fs";
import Path from "path";
import { Config } from "./config";
import { CrashGuard } from "./crash-guard";
import { Monitor } from "./monitor";
import { createDataSyncProcess } from "./service/data-sync";
import { WorkerProcess } from "./worker";

CrashGuard.enable();

const processMap: any = {};

async function main() {
    if (Cluster.isMaster) {
        await Monitor.start();
        Monitor.status(`Master process started. PID = ${process.pid}`);

        // Clear temp dir

        try {
            FS.mkdirSync(Path.resolve(__dirname, "..", "temp"));
        } catch (ex) {}

        const tempFiles = FS.readdirSync(Path.resolve(__dirname, "..", "temp"));

        for (const tempFile of tempFiles) {
            try {
                FS.unlinkSync(Path.resolve(__dirname, "..", "temp", tempFile));
            } catch (e) {}
        }

        Monitor.status(`Spawning workers...`);
        const numWorkers = Config.getInstance().numberOfWorkers;
        for (let i = 0; i < numWorkers; i++) {
            const pid = Cluster.fork({ WorkerType: "server" }).id;
            Monitor.debug(`Spawned ${pid}`);
            processMap[pid] = "server";
        }

        // Messages
        Cluster.on("message", (worker, message, handle) => {
            // Ignore messages
        });

        // Watch for workers
        Cluster.on("exit", function(worker, code, signal) {
            const type = processMap[worker.id];

            delete processMap[worker.id];

            if (type === "server") {
                Monitor.error(`Server worker ${worker.id} (PID=${worker.process.pid}) died (${signal || code}). Spawning new worker to replace it...`);
                const pid = Cluster.fork({ WorkerType: "server" }).id;
                Monitor.debug(`Spawned ${pid}`);
                processMap[pid] = "server";
            } else {
                Monitor.status(`Worker ${worker.id} (PID=${worker.process.pid}) died (${signal || code}).`);
            }
        });

        // Master processes
        if (!Config.getInstance().isSlave) {
            createDataSyncProcess();
        }
    } else {
        Monitor.status(`Worker started. PID = ${process.pid} / WORKER ${Cluster.worker.id} / TYPE = ${process.env.WorkerType}`);

        if (process.env.WorkerType === "server") {
            const worker: WorkerProcess = new WorkerProcess();
            worker.run();
        } else {
            Monitor.error(`Environment variable WorkerType expected to be 'server', but found '${process.env.WorkerType}' | The worker cannot be started.`);
            process.exit(1);
        }
    }
}

main().catch(function(ex) {
    console.error(ex);
    process.exit(1);
});
