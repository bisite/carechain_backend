// Reserved for license

"use strict";

import Express from "express";
import { Config } from "../../../config";
import { NOT_FOUND } from "../../../utils/http-utils";
import { Controller } from "../../controller";
import { BlockchainController } from "../api-blockchain";
import { OracleController } from "../api-oracle";
import { RolesController } from "../api-roles";
import { SensorsController } from "../api-sensors";

const API_PREFIX = "/api/v1";

/**
 * API (Version 1.0)
 */
export class ApiVersion1Controller extends Controller {

    /**
     * Registers routes for this controller.
     * @param application Express application.
     */
    public register(application: Express.Express): any {
    

        // Register API controllers
        const apiBlockchainController = new BlockchainController();
        apiBlockchainController.registerAPI(API_PREFIX, application);

        const apiRolesController = new RolesController();
        apiRolesController.registerAPI(API_PREFIX, application);

        const apiSensorsController = new SensorsController();
        apiSensorsController.registerAPI(API_PREFIX, application);

        const apiOracleContoller = new OracleController();
        apiOracleContoller.registerAPI(API_PREFIX, application);


        // Documentation
        if (!Config.getInstance().isProduction) {
            application.get(API_PREFIX + "/", this.redirectToDoc.bind(this));
        }

        // Not found (default)
        application.all("/api/v1/*", this.notFound.bind(this));
    }

    public async redirectToDoc(request: Express.Request | any, response: Express.Response) {
        response.redirect("/api-docs");
    }

    public async notFound(request: Express.Request | any, response: Express.Response) {
        response.status(NOT_FOUND);
        response.json({ result: "error", code: "API_NOT_FOUND", message: "The requested URL does not match with any of the API endpoints. Please read the documentation in order to use the API properly. Documentation: " + Config.getInstance().getAbsoluteURI("/api/v1/documentation") });
    }
}
