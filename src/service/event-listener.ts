// Blockchain event listener

"use strict";

import Web3 from "web3";
import { Monitor } from "../monitor";
import { Log } from "web3-core";
import { interpretLog } from "../utils/blockchain-events";
import { AbiItem } from "web3-utils";
import { getAllEvents, getDateFromBlock } from "../utils/ethereum-utils";
import { DynamicConfiguration } from "../models/dynconf";

//address

const LAST_BLOCK_VAR = "last_processed_block";

export interface EthEventhandler {
    address: string;
    abi: AbiItem[];
    handler: (event, time: string, contract: string) => Promise<void>;
}

/**
 * Event listener service
 */
export class EthEventListener {
    public web3: Web3;
    public handlers: {[key: string]: EthEventhandler};
    public onBlockParsed: (blockNum: number) => Promise<void>;
    public nextBlock: number;
    public timeout;
    public blockTime: number;

    public setHandler(contract: string, abi: AbiItem[], handler: (event, time: string, contract: string) => Promise<void>) {
        this.handlers[contract] = {
            address: contract,
            abi: abi,
            handler: handler,
        }
    }

    public removeHandler(contract: string) {
        delete this.handlers[contract];
    }

    constructor(web3: Web3, startBlock: number, blockTime: number) {
        this.web3 = web3;
        this.handlers = {};
        this.nextBlock = startBlock;
        this.onBlockParsed = null;
        this.timeout = null;
        this.blockTime = blockTime;
    }

    public start() {
        this.prepareNextHandle();
    }

    // De momento se filtran los eventos mediante una conexión por websocket. En caso de que sea necesario utilizar el contenido de eventlister.txt

    public async handleNextBlock() {
        this.timeout = null;
        try {
            const events = await getAllEvents(this.nextBlock + 1);

            if (events.length > 0) {
                
                for (const event of events){
                    const time = await getDateFromBlock(event.blockNumber);
                    await this.handlers[event.address].handler(event, "" + time, event.address);
                    this.nextBlock = event.blockNumber;
                }

                await DynamicConfiguration.setConfiguration(LAST_BLOCK_VAR, "" + this.nextBlock);
                Monitor.info("[Event listener] New events, last event in block " + this.nextBlock);

                this.timeout = setTimeout(this.handleNextBlock.bind(this), 1);
            } else {
                Monitor.info("[Event listener] Not new events, last event in block " + this.nextBlock);
                // No block
                this.prepareNextHandle();
            }
        } catch (ex) {
            Monitor.debugException(ex);
            this.prepareNextHandle();
        }
    }

    public prepareNextHandle() {
        this.timeout = setTimeout(this.handleNextBlock.bind(this), this.blockTime);
    }

}