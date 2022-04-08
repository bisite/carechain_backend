// User Model

"use strict";


import { Config } from "../config";
import { createRandomUID } from "../utils/text-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, GenericRow } from "tsbean-orm";
import { String } from "aws-sdk/clients/acm";
import { bool } from "aws-sdk/clients/signer";

const USER_COLLECTION_NAME = "sensorsData";


/**
 * Represents the partners.
 */
export class SensorsData extends DataModel {

    public static finder = new DataFinder<SensorsData>(DataSource.DEFAULT, USER_COLLECTION_NAME, "id", function (data: any) {
        return new SensorsData(data);
    });

    
    public id: string;
    public sensorId: string;
    public timestamp: string;
    public data: string;

    // Constructor

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, USER_COLLECTION_NAME, "id");

        this.id = data.id;
        this.sensorId = data.sensorId || "";
        this.timestamp = data.timestamp || "";
        this.data = data.data || "";
        
        this.init();
    }

    /**
     * Finds sensor by from id
     * @param id The id
     * @param callback The callback
     */
    public static async findSensorDataByID(id: string): Promise<SensorsData> {
        const sens = await SensorsData.finder.findByKey(id);
        return sens;
    }


    /**
     * Finds data from sensor id
     * @param sensorID The sensor id
     * @param callback The callback
     */
    public static async findSensorDataBySensorID(sensorID: string): Promise<SensorsData[]> {
        const transactions = await SensorsData.finder.find(
            DataFilter.equals("sensorId", sensorID),
            OrderBy.nothing(),
        );
        return transactions;
    }
}
