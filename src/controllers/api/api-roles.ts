"use strict"
import Express from "express"
import { Config } from "../../config";
import { Monitor } from "../../monitor";
import { BAD_REQUEST, expressSecurityMeasures, FORBIDDEN, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, OK, UNAUTHORIZED } from "../../utils/http-utils";
import { Controller } from "../controller";
import { Wallet } from "../../models/wallet";
import { User } from "../../models/user";


export class RolesController extends Controller{
    public registerAPI(prefix: string, application: Express.Express): any {
        
        application.post(prefix + "/roles/newRepresentative", expressSecurityMeasures(noCache(this.newRepresentative)));
        application.post(prefix + "/roles/revokeRepresentative", expressSecurityMeasures(noCache(this.RevokeRepresentative)));
        application.post(prefix + "/roles/newSupplier", expressSecurityMeasures(noCache(this.newSupplier)));
        application.post(prefix + "/roles/revokeSupplier", expressSecurityMeasures(noCache(this.RevokeSupplier)));
        
    }

    
    /**
    * @typedef NewRepresentativeRequest
    * @property {string} username - Username or email
    */

    /**
    * @typedef NewRepresentativeBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef NewRepresentativeErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Turns a user into a representative
    * @route POST /api/v1/roles/newRepresentative
    * @group Roles
    * @param {NewRepresentativeRequest.model} request.body - Username or email
    * @returns {NewRepresentativeErrorBadRequest.model} 400 - Bad request
    * @returns {NewRepresentativeErrorForbidden.model} 403 - Access denied to the account
    * @returns {NewRepresentativeResponse.model} 200 - Success
    */
    public async newRepresentative(request: Express.Request, response: Express.Response) {
        const auth = await this.auth(request);
        if (!auth.isRegisteredUser()) {
            response.status(UNAUTHORIZED);
            response.end();
            return;
        }

        const user = auth.user;

        if (user.role != 2){
            response.status(UNAUTHORIZED);
            response.end();
            return;
        }

        const userId = request.body.userId || "";
        const userToUpgrade = await User.findUserByUID(userId);

        if (userToUpgrade === null){
            response.status(BAD_REQUEST);
            response.send({error_code: "USER_NOT_FOUND"});
            return;
        }

        userToUpgrade.role = 1;

        try {
            await userToUpgrade.save();
        } catch (ex) {
            console.log("UPGRADE_ERROR ");
            response.status(BAD_REQUEST);
            response.json({ error_code: "UPGRADE_ERROR" });
            return;
        }


        response.status(OK);
        response.json({ "success": true });
        return;
    }


    /**
    * @typedef RevokeRepresentativeRequest
    * @property {string} username - Username or email
    */

    /**
    * @typedef RevokeRepresentativeBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef RevokeRepresentativeErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Revoke a user's representative role
    * @route POST /api/v1/roles/revokeRepresentative
    * @group Roles
    * @param {RevokeRepresentativeRequest.model} request.body - Username or email
    * @returns {RevokeRepresentativeErrorBadRequest.model} 400 - Bad request
    * @returns {RevokeRepresentativeErrorForbidden.model} 403 - Access denied to the account
    * @returns {RevokeRepresentativeResponse.model} 200 - Success
    */
    public async RevokeRepresentative(request: Express.Request, response: Express.Response) {
        const auth = await this.auth(request);
        if (!auth.isRegisteredUser()) {
            response.status(UNAUTHORIZED);
            response.end();
            return;
        }

        const user = auth.user;

        if (user.role != 2){
            response.status(UNAUTHORIZED);
            response.end();
            return;
        }

        const userId = request.body.userId || "";
        const userToDowngrade = await User.findUserByUID(userId);

        if (userToDowngrade === null){
            response.status(BAD_REQUEST);
            response.send({error_code: "USER_NOT_FOUND"});
            return;
        }

        userToDowngrade.role = 0;

        try {
            await userToDowngrade.save();
        } catch (ex) {
            console.log("UPGRADE_ERROR ");
            response.status(BAD_REQUEST);
            response.json({ error_code: "UPGRADE_ERROR" });
            return;
        }


        response.status(OK);
        response.json({ "success": true });
        return;
    }


    /**
    * @typedef NewSupplierRequest
    * @property {string} username - Username or email
    */

    /**
    * @typedef NewSupplierBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef NewSupplierErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Turns a user into a Supplier
    * @route POST /api/v1/roles/newSupplier
    * @group Roles
    * @param {NewSupplierRequest.model} request.body - Username or email
    * @returns {NewSupplierErrorBadRequest.model} 400 - Bad request
    * @returns {NewSupplierErrorForbidden.model} 403 - Access denied to the account
    * @returns {NewSupplierResponse.model} 200 - Success
    */
    public async newSupplier(request: Express.Request, response: Express.Response) {
        const auth = await this.auth(request);
        if (!auth.isRegisteredUser()) {
            response.status(UNAUTHORIZED);
            response.end();
            return;
        }

        const user = auth.user;

        if (user.role != 3){
            response.status(UNAUTHORIZED);
            response.end();
            return;
        }

        const userId = request.body.userId || "";
        const userToUpgrade = await User.findUserByUID(userId);

        if (userToUpgrade === null){
            response.status(BAD_REQUEST);
            response.send({error_code: "USER_NOT_FOUND"});
            return;
        }

        userToUpgrade.role = 2;

        try {
            await userToUpgrade.save();
        } catch (ex) {
            console.log("UPGRADE_ERROR ");
            response.status(BAD_REQUEST);
            response.json({ error_code: "UPGRADE_ERROR" });
            return;
        }


        response.status(OK);
        response.json({ "success": true });
        return;
    }


    /**
    * @typedef RevokeSupplierRequest
    * @property {string} username - Username or email
    */

    /**
    * @typedef RevokeSupplierBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef RevokeSupplierErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Revoke a user's Supplier role
    * @route POST /api/v1/roles/revokeSupplier
    * @group Roles
    * @param {SupplierRequest.model} request.body - Username or email
    * @returns {SupplierErrorBadRequest.model} 400 - Bad request
    * @returns {SupplierErrorForbidden.model} 403 - Access denied to the account
    * @returns {SupplierResponse.model} 200 - Success
    */
    public async RevokeSupplier(request: Express.Request, response: Express.Response) {
        
    }
}
