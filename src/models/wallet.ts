// User Model

"use strict";

import Crypto from "crypto";
import { Config } from "../config";
import { createRandomUID } from "../utils/text-utils";
import { createWallet } from "../utils/ethereum-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, GenericRow } from "tsbean-orm";

const USER_COLLECTION_NAME = "wallets";

/**
 * Represents an user.
 */
export class Wallet extends DataModel {

    public static finder = new DataFinder<Wallet>(DataSource.DEFAULT, USER_COLLECTION_NAME, "id", function (data: any) {
        return new Wallet(data);
    });


    public static async countAll(): Promise<number> {
        return Wallet.finder.count(DataFilter.any());
    }


    /**
     * Finds a wallet by its UID.
     * @param uid The wallet identifier.
     */
    public static async findWalletByUID(uid: string): Promise<Wallet> {
        return Wallet.finder.findByKey(uid);
    }

    public id: string;
    public userId: string;
    public privateKey: string;
    public publicKey: string;

    // Constructor

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, USER_COLLECTION_NAME, "id");

        this.id = data.id;
        this.userId = data.userId;
        this.privateKey = data.privateKey;
        this.publicKey = data.publicKey;

        this.init();
    }

    /**
     * Returns the public key.
     */
    public getPublicKey(): string {
        return this.publicKey;
    }


    /**
     * Returns the private key.
     */
    public getPrivateKey(): string {
        return this.privateKey;
    }


    /**
     * Finds wallet by address
     * @param user The user
     * @param callback The callback
     */
    public static async findWalletByAddress(address: string): Promise<Wallet> {
        const wallets = await Wallet.finder.find(
            DataFilter.equals("publicKey", address),
            OrderBy.nothing(),
        );
        return wallets[0] || null;
    }


    /**
     * Finds a wallet by user
     * @param user The user
     * @param callback The callback
     */
    public static async findWalletByUser(user: string): Promise<Wallet> {
        const users = await Wallet.finder.find(
            DataFilter.equals("userId", user),
            OrderBy.nothing(),
        );
        return users[0] || null;
    }


    /**
     * Creates a new wallet for an user.
     * @param user The user UID.
     */
    public static async createNewWalletForUser(user: string): Promise<Wallet> {
        const nWallet = await createWallet();
        const wallet: Wallet = new Wallet({
            id: createRandomUID(),
            userId: user,
            privateKey: nWallet['privateKey'],
            publicKey: nWallet['address'],
        });

        try {
            await wallet.insert();
        } catch (ex) {
            console.log("Error al guardar la wallet");
            return Promise.reject(ex);
        }

        return Promise.resolve(wallet);
    }
}