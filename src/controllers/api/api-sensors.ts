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
import fetch from 'node-fetch';


export class SensorsController extends Controller{
    public registerAPI(prefix: string, application: Express.Express): any {
        
        application.post(prefix + "/sensors/register", expressSecurityMeasures(noCache(this.registerSensor)));
        application.post(prefix + "/sensors/deploy", expressSecurityMeasures(noCache(this.deploySensor)));
        application.post(prefix + "/sensors/addData", expressSecurityMeasures(noCache(this.addSensorData)));
        
        
        application.get(prefix + "/sensors/get/:sensorID", expressSecurityMeasures(noCache(this.getSensor)));
        application.get(prefix + "/sensors/get_all", expressSecurityMeasures(noCache(this.getAllSensors)));        
    }

    
    /**
    * @typedef RegisterSensorRequest
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
            console.log("JSON parse error");
            response.status(BAD_REQUEST);
            response.json({ error_code: "WoTTDDJson_parse_ERROR" });
            return;
        }


        if ((!('url' in jsonParsed)) || (!('name' in jsonParsed)) || (!('dataType' in jsonParsed)) || (!('auth' in jsonParsed))){
            console.log("Error in the WoTTDDJson");
            response.status(BAD_REQUEST);
            response.json({ error_code: "WoTTDDJson_PARAMS_ERROR" });
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
        response.json({ sensorID: sensorCreated.id });
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
    * @typedef GetSensorsRequest
    */



    /**
    * @typedef GetSensorsBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef GetSensorsErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CREDENTIALS: Invalid credentials
    */


    /**
    * Get all sensors data
    * @route GET /api/v1/sensors/get_all
    * @group Sensor
    * @param {DeploySensorRequest.model} request.body -
    * @returns {DeploySensorBadRequest.model} 400 - Bad request
    * @returns {DeploySensorErrorForbidden.model} 403 - Access denied to the account
    * @returns 200 - Success
    */
    public async getAllSensors(request: Express.Request, response: Express.Response) {


        const sensor: Sensors[] = await Sensors.findAllSensors();

        const temp = []

        for (const sen of sensor){
            temp.push({
                id: sen.id,
                deployed: sen.deployed,
                WoTTDDJson: sen.WoTTDDJson,
                url: sen.url,
                name: sen.name,
                dataType: sen.dataType,
                auth: sen.auth,
            })
        }

        response.status(OK);
        response.json(temp);
        return;
    }



    /**
    * @typedef addSensorDataRequest
    * @property {string} sensorID - The identifier of the associated sensor
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


        if (sensor.auth.includes("ados")){
            const data_api = {username: "carlos_alvarez@usal.es", password: "bisite_02ABX"}

            const response_api = await fetch('https://api.airtrace.io/v1/users/login', {
                method: 'POST',
                body: JSON.stringify(data_api),
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const response_json = await response_api.json();
            const bearer = response_json['Token'];

            const data_string = "" + sensor.name + "," + Date.now() + "," + data;
            const url = "https://api.airtrace.io/v1" + sensor.auth.replace(/[^a-z0-9\/]/ig, "");
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({data: data_string}),
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": bearer
                },
            });
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
    * @property {string} sensorID - The identifier of the associated sensor
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
