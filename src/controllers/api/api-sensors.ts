"use strict"
import Express from "express"
import { Config } from "../../config";
import { Monitor } from "../../monitor";
import { BAD_REQUEST, expressSecurityMeasures, FORBIDDEN, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, OK } from "../../utils/http-utils";
import { Controller } from "../controller";


export class SensorsController extends Controller{
    public registerAPI(prefix: string, application: Express.Express): any {
        
        application.post(prefix + "/sensors/register", expressSecurityMeasures(noCache(this.registerSensor)));
        application.post(prefix + "/sensors/deploy", expressSecurityMeasures(noCache(this.deploySensor)));
        
    }

    
    /**
    * @typedef RegisterSensorRequest
    * @property {string} claimID - The identifier of the associated claim
    * @property {string} WoTTDDJson - The data JSON
    */

    /**
    * @typedef RegisterSensorResponse
    * @property {string} sensorID - The sensor id
    */

    /**
    * @typedef RegisterSensorBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef RegisterSensorErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Register a new sensor
    * @route POST /api/v1/sensors/register
    * @group Sensor
    * @param {RegisterSensorRequest.model} request.body
    * @returns {RegisterSensorBadRequest.model} 400 - Bad request
    * @returns {RegisterSensorErrorForbidden.model} 403 - Access denied to the account
    * @returns {RegisterSensorResponse.model} 200 - Success
    */
    public async registerSensor(request: Express.Request, response: Express.Response) {
        
    }


    /**
    * @typedef DeploySensorRequest
    * @property {string} sensorID - The sensor id
    */



    /**
    * @typedef DeploySensorBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef DeploySensorErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Deploy a sensor
    * @route POST /api/v1/sensors/deploy
    * @group Sensor
    * @param {DeploySensorRequest.model} request.body - Username or email
    * @returns {DeploySensorBadRequest.model} 400 - Bad request
    * @returns {DeploySensorErrorForbidden.model} 403 - Access denied to the account
    * @returns 200 - Success
    */
    public async deploySensor(request: Express.Request, response: Express.Response) {
        
    }

}
