// User Model

"use strict";


import { Config } from "../config";
import { createRandomUID } from "../utils/text-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, GenericRow } from "tsbean-orm";

const USER_COLLECTION_NAME = "preferences";


/**
 * Represents the preferences.
 */
export class Preferences extends DataModel {

    public static finder = new DataFinder<Preferences>(DataSource.DEFAULT, USER_COLLECTION_NAME, "id", function (data: any) {
        return new Preferences(data);
    });

    
    public id: number;
    public payment_method: number;
    public user_id: number;
    public created_at: string;
    public last_edited: string;

    // Constructor

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, USER_COLLECTION_NAME, "id");

        this.id = data.id;
        this.user_id = data.user;
        this.created_at = data.created_at || "" + Date.now();
        this.last_edited = data.last_edited || "" + Date.now();
        
        this.init();
    }
}
