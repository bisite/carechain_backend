// User Model

"use strict";


import { Config } from "../config";
import { createRandomUID } from "../utils/text-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, GenericRow } from "tsbean-orm";

const USER_COLLECTION_NAME = "activity";


/**
 * Represents the activity.
 */
export class Activity extends DataModel {

    public static finder = new DataFinder<Activity>(DataSource.DEFAULT, USER_COLLECTION_NAME, "id", function (data: any) {
        return new Activity(data);
    });

    
    public id: number;
    public user: number;
    public last_activity: string;
    public url: string;

    // Constructor

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, USER_COLLECTION_NAME, "id");

        this.id = data.id;
        this.user = data.user;
        this.last_activity = data.last_activity || "" + Date.now();
        this.url = data.url;

        
        this.init();
    }
}
