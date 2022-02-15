// User Model

"use strict";


import { Config } from "../config";
import { createRandomUID } from "../utils/text-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, GenericRow } from "tsbean-orm";
import { String } from "aws-sdk/clients/acm";

const USER_COLLECTION_NAME = "transactions";


/**
 * Represents the partners.
 */
export class Transactions extends DataModel {

    public static finder = new DataFinder<Transactions>(DataSource.DEFAULT, USER_COLLECTION_NAME, "id", function (data: any) {
        return new Transactions(data);
    });

    
    public id: number;
    public name: string;
    public signature: string;
    public blocknumber: number;
    public timestamp: string;
    public fromAddress: string;
    public toAddress: string;
    public fromPartnerName: string;
    public fromPartnerCategory: string;
    public fromPartnerCategorySpanish: string;
    public toPartnerName: string;
    public toPartnerCategory: string;
    public toPartnerCategorySpanish: string;
    public amount: string;

    // Constructor

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, USER_COLLECTION_NAME, "id");

        this.id = data.id;
        this.name = data.name || "";
        this.signature = data.signature || "";
        this.blocknumber = data.blocknumber || "";
        this.timestamp = data.timestamp || "";
        this.fromAddress = data.fromAddress || "";
        this.toAddress = data.toAddress || "";
        this.fromPartnerName = data.fromPartnerName || "";
        this.fromPartnerCategory = data.fromPartnerCategory || "";
        this.fromPartnerCategorySpanish = data.fromPartnerCategorySpanish || "";
        this.toPartnerName = data.toPartnerName || "";
        this.toPartnerCategory = data.toPartnerCategory || "";
        this.toPartnerCategorySpanish = data.toPartnerCategorySpanish || "";
        this.amount = data.amount || "";
        this.init();
    }

    /**
     * Finds transaction by from address
     * @param user The user
     * @param callback The callback
     */
    public static async findTransactionsFrom(from: string): Promise<Transactions[]> {
        const transactions = await Transactions.finder.find(
            DataFilter.equals("fromAddress", from),
            OrderBy.nothing(),
        );
        return transactions;
    }

    /**
     * Finds transaction by to address
     * @param user The user
     * @param callback The callback
     */
    public static async findTransactionsTo(to: string): Promise<Transactions[]> {
        const transactions = await Transactions.finder.find(
            DataFilter.equals("toAddress", to),
            OrderBy.nothing(),
        );
        return transactions;
    }
}
