// Data sync blockchain -> database

"use strict";

import { EthEventListener } from "./event-listener";
import { BlockchainConfiguration, Config } from "../config";
import { DynamicConfiguration } from "../models/dynconf";
import { Wallet } from "../models/wallet";
import { loadContract } from "../utils/ethereum-utils";
//import { EventTransaction } from "../models/event-transactions";
//import { AllTransaction } from "../models/all-transactions";
import { Monitor } from "../monitor";
import { toISODate, hexToBase64, hexNoPrefix, hexToUTF8, createRandomUID } from "../utils/text-utils";
import Web3 from "web3";
import { from } from "form-data";

const LAST_BLOCK_VAR = "last_processed_block";

const blockchainConfiguration : BlockchainConfiguration = new BlockchainConfiguration();
const w3 = new Web3(Web3.givenProvider || blockchainConfiguration.ws_provider);
const blocktime = 15000;

function debugEvent(event, time: string, contract: string) {
    if (!Config.getInstance().isProduction) {
        let str = "";
        str += "\n-------------------- EVENT --------------------";
        str += "\nSignature: " + event.signature;
        str += "\nTransaction hash: " + event.transactionHash;
        str += "\nArguments: " + JSON.stringify(event.returnValues);
        str += "\nContract: " + contract;
        str += "\nAt: " + time;
        str += "\n-----------------------------------------------\n"
        Monitor.debug(str);
    }
}

async function eventContractHandler(event, time: string, contract: string) {

    //const idElement = (event.arguments["0"] + "").toLowerCase();
    //const name = event.name;
    //await AllTransaction.setTransaction(event.txHash, name, idElement, time);
    //await EventTransaction.setEventTransaction(name + "-" + idElement, name, idElement, event.txHash, event.txHash);
    debugEvent(event, time, contract);
}

export async function createDataSyncProcess() {
    let startBlock = 0;
    
    try {
        startBlock = await DynamicConfiguration.getNumberConfiguration(LAST_BLOCK_VAR, startBlock);
    } catch (ex) {
        Monitor.exception(ex);
        Monitor.error("Something went wrong. Could not fetch status from the database. Check configuration or connection issues.");
        process.exit(1);
    }

    if (isNaN(startBlock) || !isFinite(startBlock)) {
        startBlock = 8932497;
    }

    startBlock = Math.floor(startBlock);

    /* LISTENERS */

    const trazabilityListener  = new EthEventListener(w3, startBlock, blocktime);
    trazabilityListener.onBlockParsed = async function (blockNum: number) {
        await DynamicConfiguration.setConfiguration(LAST_BLOCK_VAR, "" + blockNum);
    };
    trazabilityListener.setHandler(
        blockchainConfiguration.contract_address,
        loadContract(),
        eventContractHandler,
    );
    trazabilityListener.start();
}