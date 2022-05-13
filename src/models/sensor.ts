// User Model

"use strict";


import { Config } from "../config";
import { createRandomUID } from "../utils/text-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, GenericRow } from "tsbean-orm";
import { String } from "aws-sdk/clients/acm";
import { bool } from "aws-sdk/clients/signer";

const USER_COLLECTION_NAME = "sensors";


/**
 * Represents the partners.
 */
export class Sensors extends DataModel {

    public static finder = new DataFinder<Sensors>(DataSource.DEFAULT, USER_COLLECTION_NAME, "id", function (data: any) {
        return new Sensors(data);
    });

    
    public id: string;
    public WoTTDDJson: string;
    public deployed: boolean;
    public url: string;
    public name: string;
    public dataType: string;
    public auth: string;

    // Constructor

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, USER_COLLECTION_NAME, "id");

        this.id = data.id;
        this.deployed = data.deployed || false;
        this.WoTTDDJson = data.WoTTDDJson || "";
        this.url = data.url || "";
        this.name = data.name || "";
        this.dataType = data.dataType || "";
        this.auth = data.auth || "";
        this.init();
    }

    /**
     * Finds sensor by from id
     * @param id The id
     * @param callback The callback
     */
    public static async findSensorByID(id: string): Promise<Sensors> {
        const sens = await Sensors.finder.findByKey(id);
        return sens;
    }


    public static async findAllSensors(): Promise<Sensors[]> {
        return await Sensors.finder.find(DataFilter.any());
    }
}
