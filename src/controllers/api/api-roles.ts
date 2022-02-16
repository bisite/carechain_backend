"use strict"
import Express from "express"
import { Config } from "../../config";
import { Monitor } from "../../monitor";
import { BAD_REQUEST, expressSecurityMeasures, FORBIDDEN, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, OK } from "../../utils/http-utils";
import { Controller } from "../controller";
import { trigger,registerEventLogger, deployContract, addClaimProveedor, addClaimApoderado } from "../../utils/ethereum-utils";
import { Wallet } from "../../models/wallet";


export class RolesController extends Controller{
    public registerAPI(prefix: string, application: Express.Express): any {
        
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
    * @group roles
    * @param {NewRepresentativeRequest.model} request.body - Username or email
    * @returns {NewRepresentativeErrorBadRequest.model} 400 - Bad request
    * @returns {NewRepresentativeErrorForbidden.model} 403 - Access denied to the account
    * @returns {NewRepresentativeResponse.model} 200 - Success
    */
    public async newRepresentative(request: Express.Request, response: Express.Response) {
        
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
    * @group roles
    * @param {RevokeRepresentativeRequest.model} request.body - Username or email
    * @returns {RevokeRepresentativeErrorBadRequest.model} 400 - Bad request
    * @returns {RevokeRepresentativeErrorForbidden.model} 403 - Access denied to the account
    * @returns {RevokeRepresentativeResponse.model} 200 - Success
    */
    public async RevokeRepresentative(request: Express.Request, response: Express.Response) {
        
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
    * @group roles
    * @param {NewSupplierRequest.model} request.body - Username or email
    * @returns {NewSupplierErrorBadRequest.model} 400 - Bad request
    * @returns {NewSupplierErrorForbidden.model} 403 - Access denied to the account
    * @returns {NewSupplierResponse.model} 200 - Success
    */
     public async newSupplier(request: Express.Request, response: Express.Response) {
        
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
    * @group roles
    * @param {SupplierRequest.model} request.body - Username or email
    * @returns {SupplierErrorBadRequest.model} 400 - Bad request
    * @returns {SupplierErrorForbidden.model} 403 - Access denied to the account
    * @returns {SupplierResponse.model} 200 - Success
    */
    public async RevokeSupplier(request: Express.Request, response: Express.Response) {
        
    }
}
