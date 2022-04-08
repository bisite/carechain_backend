"use strict"
import { json } from "body-parser";
import Express from "express"
import { Config } from "../../config";
import { Sensors } from "../../models/sensor";
import { SensorsData } from "../../models/sensorData";
import { Monitor } from "../../monitor";
import { BAD_REQUEST, expressSecurityMeasures, FORBIDDEN, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, OK } from "../../utils/http-utils";
import { createRandomUID } from "../../utils/text-utils";
import { Controller } from "../controller";


export class SensorsController extends Controller{
    public registerAPI(prefix: string, application: Express.Express): any {
        
        application.post(prefix + "/sensors/register", expressSecurityMeasures(noCache(this.registerSensor)));
        application.post(prefix + "/sensors/deploy", expressSecurityMeasures(noCache(this.deploySensor)));
        application.post(prefix + "/sensors/addData", expressSecurityMeasures(noCache(this.addSensorData)));
        
        
        application.get(prefix + "/sensors/get/:sensorID", expressSecurityMeasures(noCache(this.getSensor)));
        
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
        const WoTTDDJson = request.body.WoTTDDJson || "";

        if (!WoTTDDJson) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        let jsonParsed = null;

        try {
            jsonParsed = JSON.parse(WoTTDDJson);
            console.log(jsonParsed);
        } catch (ex) {
            console.log("Error in the WoTTDDJson");
            response.status(BAD_REQUEST);
            response.json({ error_code: "WoTTDDJson_ERROR" });
            return;
        }


        if ((!('url' in jsonParsed)) || (!('name' in jsonParsed)) || (!('dataType' in jsonParsed)) || (!('auth' in jsonParsed))){
            console.log("Error in the WoTTDDJson");
            response.status(BAD_REQUEST);
            response.json({ error_code: "WoTTDDJson_ERROR" });
            return;
        }


        //Url, nombre, tipo de datos, datos(variable, array), autentificacion

        const sensorCreated: Sensors = new Sensors({
            id: createRandomUID(),
            WoTTDDJson: WoTTDDJson,
            deployed: false,
            url: jsonParsed.url,
            name: jsonParsed.name,
            dataType: jsonParsed.dataType,
            auth: jsonParsed.auth
        });

        try {
            await sensorCreated.insert();
        } catch (ex) {
            console.log("Error creating the new sensor");
            response.status(BAD_REQUEST);
            response.json({ error_code: "SENSOR_ERROR" });
            return;
        }
        response.status(OK);
        response.json({ claimID: sensorCreated.id });
        return;
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
        const sensorID = request.body.sensorID || "";

        if (!sensorID) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const sensor: Sensors = await Sensors.findSensorByID(sensorID);

        if (sensor === null){
            response.status(BAD_REQUEST);
            response.json({ error_code: "SENSOR_NOT_FOUND" });
            return;
        }
        
        
        sensor.deployed = true;
        
        
        try {
            await sensor.save();
        } catch (ex) {
            console.log("Error creating the new sensor");
            response.status(BAD_REQUEST);
            response.json({ error_code: "SENSOR_ERROR" });
            return;
        }


        response.status(OK);
        response.json({ "success": true });
        return;
    }


    /**
    * @typedef GetSensorRequest
    * @property {string} sensorID - The sensor id
    */



    /**
    * @typedef GetSensorBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef GetSensorErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Get a sensor data
    * @route GET /api/v1/sensors/get
    * @group Sensor
    * @param {DeploySensorRequest.model} request.body - Username or email
    * @returns {DeploySensorBadRequest.model} 400 - Bad request
    * @returns {DeploySensorErrorForbidden.model} 403 - Access denied to the account
    * @returns 200 - Success
    */
    public async getSensor(request: Express.Request, response: Express.Response) {
        console.log(request.params);
        console.log(request.body);
        const sensorID = request.params.sensorID || "";

        if (!sensorID) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const sensor: Sensors = await Sensors.findSensorByID(sensorID);

        if (sensor === null){
            response.status(BAD_REQUEST);
            response.json({ error_code: "SENSOR_NOT_FOUND" });
            return;
        }

        response.status(OK);
        response.json({ "sensorID": sensor.id, "WoTTDDJson": sensor.WoTTDDJson, "deployed": sensor.deployed });
        return;
    }


    /**
    * @typedef addSensorDataRequest
    * @property {string} sensorID - The identifier of the associated claim
    * @property {string} data - The data JSON
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
    * @route POST /api/v1/sensors/addData
    * @group Sensor
    * @param {RegisterSensorRequest.model} request.body
    * @returns {RegisterSensorBadRequest.model} 400 - Bad request
    * @returns {RegisterSensorErrorForbidden.model} 403 - Access denied to the account
    * @returns {RegisterSensorResponse.model} 200 - Success
    */
    public async addSensorData(request: Express.Request, response: Express.Response) {
        const sensorID = request.body.sensorID || "";
        const data = request.body.data || "";

        if (!sensorID || !data) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const sensor: Sensors = await Sensors.findSensorByID(sensorID);

        if (sensor === null){
            response.status(BAD_REQUEST);
            response.json({ error_code: "SENSOR_NOT_FOUND" });
            return;
        }

        const sensorDataCreated: SensorsData = new SensorsData({
            id: createRandomUID(),
            sensorID: sensorID,
            data: data,
            timestamp: Date.now()
        });

        try {
            await sensorDataCreated.insert();
        } catch (ex) {
            console.log("Error creating the new sensor data");
            response.status(BAD_REQUEST);
            response.json({ error_code: "SENSOR_ERROR" });
            return;
        }
        response.status(OK);
        response.json({ dataID: sensorDataCreated.id });
        return;
    }


    /**
    * @typedef addSensorDataRequest
    * @property {string} sensorID - The identifier of the associated claim
    * @property {string} data - The data JSON
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
    * @route POST /api/v1/sensors/addData
    * @group Sensor
    * @param {RegisterSensorRequest.model} request.body
    * @returns {RegisterSensorBadRequest.model} 400 - Bad request
    * @returns {RegisterSensorErrorForbidden.model} 403 - Access denied to the account
    * @returns {RegisterSensorResponse.model} 200 - Success
    */
    public async addSensorDataFromWoTTDDJson(request: Express.Request, response: Express.Response) {
        const sensorID = request.body.sensorID || "";
        
        if (!sensorID) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const sensor: Sensors = await Sensors.findSensorByID(sensorID);

        if (sensor === null){
            response.status(BAD_REQUEST);
            response.json({ error_code: "SENSOR_NOT_FOUND" });
            return;
        }

        const WoTTDDJson = request.body.WoTTDDJson || "";

        if (!WoTTDDJson) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        let jsonParsed = null;

        try {
            jsonParsed = JSON.parse(WoTTDDJson);
            console.log(jsonParsed);
        } catch (ex) {
            console.log("Error in the WoTTDDJson");
            response.status(BAD_REQUEST);
            response.json({ error_code: "WoTTDDJson_ERROR" });
            return;
        }


        if ((!('dataType' in jsonParsed)) || (!('data' in jsonParsed))){
            console.log("Error in the WoTTDDJson");
            response.status(BAD_REQUEST);
            response.json({ error_code: "WoTTDDJson_ERROR" });
            return;
        }


        const data = {
            dataType: jsonParsed.dataType,
            data: jsonParsed.data
        }


        const sensorDataCreated: SensorsData = new SensorsData({
            id: createRandomUID(),
            sensorId: sensorID,
            data: data,
            timestamp: Date.now()
        });

        try {
            await sensorDataCreated.insert();
        } catch (ex) {
            console.log("Error creating the new sensor data");
            response.status(BAD_REQUEST);
            response.json({ error_code: "SENSOR_ERROR" });
            return;
        }
        response.status(OK);
        response.json({ dataID: sensorDataCreated.id });
        return;
    }
}
