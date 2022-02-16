"use strict"
import Express from "express"
import { Config } from "../../config";
import { Monitor } from "../../monitor";
import { BAD_REQUEST, expressSecurityMeasures, FORBIDDEN, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, OK } from "../../utils/http-utils";
import { Controller } from "../controller";


export class OracleController extends Controller{
    public registerAPI(prefix: string, application: Express.Express): any {
        
        application.post(prefix + "/oracle/register", expressSecurityMeasures(noCache(this.registerOracle)));
        
    }

    
    /**
    * @typedef RegisterOracleRequest
    * @property {string} name - The name of the oracle
    * @property {boolean} apikey - The api key
    * @property {boolean} public - The visibility of the method
    * @property {string} typeOfMethod - Type of the method (Get, post, ...)
    * @property {string} apiURL - The api URL
    * @property {string} headerHttpKey - The key of the http header
    * @property {string} headerHttp - The http header
    * @property {string} jsonPath - The JSON path
    * @property {string} valueReturnedType - The type of the value returned
    * 
    */

    /**
    * @typedef RegisterOracleResponse
    * @property {string} oracleID - The oracle id
    */

    /**
    * @typedef RegisterOracleBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef RegisterOracleErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Register a new oracle
    * @route POST /api/v1/oracle/register
    * @group Oracle
    * @param {RegisterOracleRequest.model} request.body
    * @returns {RegisterOracleBadRequest.model} 400 - Bad request
    * @returns {RegisterOracleErrorForbidden.model} 403 - Access denied to the account
    * @returns {RegisterOracleResponse.model} 200 - Success
    */
    public async registerOracle(request: Express.Request, response: Express.Response) {
        
    }
}
