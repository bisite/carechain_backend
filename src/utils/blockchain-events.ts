// Blockchain event parser from logs

"use strict";

import Web3 from "web3";
import { Log } from "web3-core";
import ABIDecoder from "abi-decoder";
import { AbiItem } from "web3-utils";
import { loadContract } from "../utils/ethereum-utils";

ABIDecoder.addABI(loadContract());

function forceSimple(logs: any): string[] {
    if (logs && logs[0] && logs[0] instanceof Array) {
        return logs[0];
    } else {
        return logs;
    }
}

export function interpretLog(web3: Web3, log: Log, abi: AbiItem[]): { name: string; signature: string; arguments: {[key: string]: any}; txHash: string } {    
    let event = null;
    let eventSig = "";

    for (let i = 0; i < abi.length; i++) {
        const item = abi[i];
        if (item.type !== "event") continue;
        const signature = item.name + "(" + item.inputs.map(function (input) { return input.type; }).join(",") + ")";
        const hash = web3.utils.sha3(signature);
        if (hash === log.topics[0]) {
            event = item;
            eventSig = signature;
            break;
        }
    }

    if (event !== null) {
        const inputs = event.inputs.map(function (input) { return {type: input.type, name: input.name, indexed: input.indexed}; });
        console.log("---------INPUTS--------");
        console.log(inputs);
        console.log("---------log.data--------");
        console.log(log.data);
        console.log("---------log.topics--------");
        console.log(log.topics);
        console.log("---------forceSimple--------");
        console.log(forceSimple(log.topics));
        
        const data = web3.eth.abi.decodeLog(inputs, log.data, forceSimple(log.topics));
        const transactionHash = log.transactionHash;
        // Do something with the data. Depends on the log and what you're using the data for.
        return {name: event.name, signature: eventSig, arguments: data, txHash: transactionHash};
    }

    return null;
}