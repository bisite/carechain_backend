// User Model

"use strict";


import { Config } from "../config";
import { createRandomUID } from "../utils/text-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, GenericRow } from "tsbean-orm";
import { String } from "aws-sdk/clients/acm";
import { bool } from "aws-sdk/clients/signer";
import { integer } from "aws-sdk/clients/cloudfront";

const USER_COLLECTION_NAME = "microServices";


/**
 * Represents the partners.
 */
export class Microservice extends DataModel {

    public static finder = new DataFinder<Microservice>(DataSource.DEFAULT, USER_COLLECTION_NAME, "uniqueID", function (data: any) {
        return new Microservice(data);
    });

    
    public claimId: string;
    public uniqueID: string;
    public txHash: string;
    public topic: integer;
    public address: string;
    public clauses: string;
    public claims: string;
    public dateInit: string;
    public dateEnd: string;
    public status: string;
    public personalHash: string;
    public signers: string;
    public id: string;

    // Constructor

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, USER_COLLECTION_NAME, "uniqueID");

        this.id = data.id;
        this.uniqueID = data.uniqueID;
        this.txHash = data.txHash;
        this.claimId =  data.claimId || "";
        this.topic =  data.topic || 1;
        this.address =  data.address || "";
        this.clauses =  data.clauses || "";
        this.claims =  data.claims || "";
        this.dateInit =  data.dateInit || "";
        this.dateEnd =  data.dateEnd || "";
        this.status =  data.status || "";
        this.personalHash =  data.personalHash || "";
        this.signers =  data.signers || "";
        
        this.init();
    }

    /**
     * Finds micro service by from claim id
     * @param id The claim id
     * @param callback The callback
     */
    public static async findMicroserviceDataByClaimID(id: string): Promise<Microservice> {

        const micro = await Microservice.finder.find(
            DataFilter.equals("claimId", id),
            OrderBy.nothing(),
        );
        return micro[0] || null;
    }


    /**
     * Finds micro service from tx hash
     * @param txHash The tx hash
     * @param callback The callback
     */
    public static async findMicroserviceDataByTXHash(txHash: string): Promise<Microservice> {
        const micro = await Microservice.finder.find(
            DataFilter.equals("txHash", txHash),
            OrderBy.nothing(),
        );
        return micro[0] || null;
    }


    public static async findAllMicroservices(): Promise<Microservice[]> {
        return await Microservice.finder.find(DataFilter.any());
    }

}
