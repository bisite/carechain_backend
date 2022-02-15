"use strict"

import { BlockchainConfiguration } from "../config";
import { readFileSync } from "fs";
import * as path from 'path';
import Web3 from 'web3';
import { time } from "console";

const blockchainConfiguration : BlockchainConfiguration = new BlockchainConfiguration()

const newProvider = () => new Web3.providers.WebsocketProvider(Web3.givenProvider || blockchainConfiguration.ws_provider, {
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
    },
})
const w3 = new Web3(newProvider());


export async function createWallet() {
    const acct = w3.eth.accounts.create();
    await etherSend(acct.address, '0.005');
    return acct;
}


async function etherSend (address, etherAmount) {
    const acct = w3.eth.accounts.privateKeyToAccount(blockchainConfiguration.private_key);
    const gas = await w3.eth.estimateGas({'to': address, 'from': acct.address, 'value':  w3.utils.toWei(etherAmount, 'ether')});
    const nonce = await w3.eth.getTransactionCount(acct.address);
    const gasPrice = await w3.eth.getGasPrice();
    const value = await w3.utils.toWei(etherAmount, 'ether')
    const signed_txn = await w3.eth.accounts.signTransaction({
        'nonce': nonce,
        'gasPrice': gasPrice,
        'to': address,
        'value': value,
        'gas': gas
    }, blockchainConfiguration.private_key)
    const tx_hash = await w3.eth.sendSignedTransaction(signed_txn.rawTransaction);
    return tx_hash['transactionHash'];
}


async function getBalance(address) {
    return await w3.utils.fromWei(await w3.eth.getBalance(address))
}


export function loadContract() {
    const dest = path.join(process.env.HOME, blockchainConfiguration.contract_address)
    return JSON.parse(readFileSync(dest + '.json', 'utf8'));
}

function loadContractImplementation() {
    const dest = path.join(process.env.HOME, blockchainConfiguration.contract_address_implementation)
    return JSON.parse(readFileSync(dest + '.json', 'utf8'));
}


async function getContract() {
    return new w3.eth.Contract(loadContract(), blockchainConfiguration.contract_address);
}

async function getContractImplementation() {
    return new w3.eth.Contract(loadContractImplementation(), blockchainConfiguration.contract_address);
}


async function prepareTransaction(pKey, gas, data) {
    const acct = await w3.eth.accounts.privateKeyToAccount(pKey);
    const contract = await getContract();
    const nonce = await w3.eth.getTransactionCount(acct.address);
    const gasPrice = await w3.eth.getGasPrice();
    data = {'gas': gas, 'to': blockchainConfiguration.contract_address, 'gasPrice': gasPrice, 'nonce': nonce, 'chainId': 4, 'from': acct.address, 'data': data};
    return data;
}


async function signAndSendTransaction(pKey, tx) {
    const signed_txn = await w3.eth.accounts.signTransaction(tx, pKey)

    const tx_hash = await w3.eth.sendSignedTransaction(signed_txn.rawTransaction);
    return tx_hash['transactionHash'];
}


export async function trigger(view, method, params, pKey) {
    const contract = await getContractImplementation();
    const contractFunc = await contract.methods[method];
    
    if (view === true) {
        const result = await contractFunc(...params).call()           //Spread syntax
        return result
    } else {
        const data = await contractFunc(...params).encodeABI()
        let tx;
        let acct;
        const gas = 0xffffff;
        let tx_hash;
        if (pKey === ""){
            tx = await prepareTransaction(blockchainConfiguration.private_key, gas, data);
            tx_hash = await signAndSendTransaction(blockchainConfiguration.private_key, tx);
        } else {
            tx = await prepareTransaction(pKey, gas, data);
            tx_hash = await signAndSendTransaction(pKey, tx);
        }
        
        return tx_hash;
    }
}

export async function deployContract(topic, address, clauses, claims, dateinit, dateend, status, personal_hash, signers, id, pKey){
    const signature = Web3.utils.soliditySha3(blockchainConfiguration.contract_address, 1, JSON.stringify([]));
    const data = [topic, address, Web3.utils.toHex(signature), personal_hash, clauses, claims, dateinit, dateend, status, id, signers];
    return await trigger(false, "addClaim", data, pKey);
}


export async function addClaimProveedor(topic, clauses, claims, dateinit, dateend, status, id, pKey){
    const signature = Web3.utils.soliditySha3(blockchainConfiguration.contract_address, 1, JSON.stringify([]));
    const data = [topic, Web3.utils.toHex(signature), clauses, claims, dateinit, dateend, status, id];
    return await trigger(false, "addClaimProveedor", data, pKey);
}


export async function addClaimApoderado(claimId, address, clauses, claims, dateinit, dateend, status, personal_hash, id, signers, pKey){
    const data = [claimId, address, personal_hash, clauses, claims, dateinit, dateend, status, id, signers];
    return await trigger(false, "addClaimApoderado", data, pKey);
}

export async function registerEventLogger(eventName) {
    const contract = await getContractImplementation();
    const contractFunc = await contract.events[eventName];
    contractFunc((err, events)=>{console.log(err, events)});
}



export async function getAllEvents(block) {
    const contract = await getContractImplementation();
    const events = contract.getPastEvents("allEvents", { fromBlock: block});
    return events;
}

export const web3_getTimeStampFromBlock = (i, opt = true) =>{
    return new Promise((resolve, reject) =>{
        w3.eth.getBlock(i, opt, (err, data) => {
            if (err) {
                reject(err);
            }
            const date = new Date(0);
            date.setUTCSeconds(Number(data.timestamp));
            /*console.log(date.toTimeString(), date.toLocaleString());
            console.log(data.timestamp);*/
            resolve(date.toLocaleString("es-ES", {timeZone: 'Europe/Madrid'}));
        });
    });
};

export async function getDateFromBlock(blockNumber){
    const ts = await web3_getTimeStampFromBlock(blockNumber);
    return ts;
    //let date = new Date(ts).toLocaleDateString("en-US")
}

async function main() {
    const contract = await getContract();
    console.log(await contract.getPastEvents("allEvents")); // Nos permite buscar los eventos pasados
    contract.events.allEvents((err, events)=>{console.log(err, events)});  // Registra  todos los eventos del contrato que han ocurrido
    const account = await createWallet();
    console.log(account.address);
    //let hash = await etherSend(account.address, "0.001");
    //console.log(await getBalance("0x7e68fEa136a272e815f8Dd930d3C76185c53D64f"));
    //console.log(loadContract())
    //console.log(getContract());
    //console.log(await prepareTransaction('d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5', 23000));
    const param = [account.address, 10];
    console.log(await trigger(false, "mint", param, "d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5"));
}

exports.trigger = trigger;
exports.registerEventLogger = registerEventLogger;