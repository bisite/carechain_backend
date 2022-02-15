const ws_provider = "wss://rinkeby.infura.io/ws/v3/faddb75addcb40638193ca610aed4830"
const network = "rinkeby"
const address = "0xBEd6748bFF42725e0682A34A17E59a45AB224471"
const private_key = "384d030f3e98dacf479de02c3553c0f44ac6bdd492d9b178e194ea8f15f132bc"
const password_wallet = "loyaltour_2021"
const contract_address = "0xEcb991d836E2CF503Add125c7ddB18cdA6898F15"
const contract_address_implementation = "0x5BffE809c955a7b8a46c5E84f080eD9bA3304DfC"

Web3 = require('web3');
var fs = require('fs');
const { get } = require('http')
var w3 = new Web3(Web3.givenProvider || ws_provider);


async function createWallet() {
    var acct = w3.eth.accounts.create();
    //ether_send(acct.address, 0.005);
    return acct;
}


const etherSend = async (address, etherAmount) => {
    const acct = w3.eth.accounts.privateKeyToAccount(private_key);
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
    }, private_key)

    tx_hash = await w3.eth.sendSignedTransaction(signed_txn.rawTransaction);
    return tx_hash['transactionHash'];
}

async function getInizializeData(method, params) {
    var contract = await getContractImplementation();
    var contractFunc = await contract.methods[method];
    
    var data = await contractFunc(...params).encodeABI()
    
    console.log(data);
    
    return data;
}



async function getBalance(address) {
    return await w3.utils.fromWei(await w3.eth.getBalance(address))
}


function loadContract() {
    return JSON.parse(fs.readFileSync(contract_address + '.json', 'utf8'));
}

function loadContractImplementation() {
    return JSON.parse(fs.readFileSync(contract_address_implementation + '.json', 'utf8'));
}


async function getContract() {
    return new w3.eth.Contract(loadContract(), contract_address);
}

async function getContractImplementation() {
    return new w3.eth.Contract(loadContractImplementation(), contract_address);
}


async function prepareTransaction(pKey, gas, data) {
    var acct = await w3.eth.accounts.privateKeyToAccount(pKey);
    var contract = await getContract();
    var nonce = await w3.eth.getTransactionCount(acct.address);
    var gasPrice = await w3.eth.getGasPrice();
    var data = {'gas': gas, 'to': contract_address, 'gasPrice': gasPrice, 'nonce': nonce, 'chainId': 4, 'from': acct.address, 'data': data};
    return data;
}


async function signAndSendTransaction(pKey, tx) {
    const signed_txn = await w3.eth.accounts.signTransaction(tx, pKey)

    tx_hash = await w3.eth.sendSignedTransaction(signed_txn.rawTransaction);
    return tx_hash['transactionHash'];
}


async function trigger(view, method, params, pKey) {
    var contract = await getContractImplementation();
    var contractFunc = await contract.methods[method];
    
    if (view == true) {
        var result = await contractFunc(...params).call()           //Spread syntax
        return result
    } else {
        var data = await contractFunc(...params).encodeABI()
        var tx;
        var acct;
        var contract = await getContract();
        var contractFunc = contract.methods[method];
        var gas = 0xfffff;
        var tx_hash;
        if (pKey === ""){
            tx = await prepareTransaction(private_key, gas, data);
            tx_hash = await signAndSendTransaction(private_key, tx);
        } else {
            tx = await prepareTransaction(pKey, gas, data);
            tx_hash = await signAndSendTransaction(pKey, tx);
        }
        
        return tx_hash;
    }
}

async function deployContract(topic, address, clauses, claims, dateinit, dateend, status, personal_hash, signers, id, pKey){
    var signature = Web3.utils.soliditySha3(
        { type: 'address', value: contract_address },
        { type: 'uint256', value: 1 },
        { type: 'string[]', value: [] });
    var data = [topic, address, Web3.utils.toHex(signature), personal_hash, clauses, claims, dateinit, dateend, status, id, signers];
    return await trigger(false, "addClaim", data, pKey);
}


async function addClaimProveedor(topic, clauses, claims, dateinit, dateend, status, id, pKey){
    var signature = Web3.utils.soliditySha3(
        { type: 'address', value: contract_address },
        { type: 'uint256', value: 1 },
        { type: 'string[]', value: [] });
    var data = [topic, Web3.utils.toHex(signature), clauses, claims, dateinit, dateend, status, id];
    return await trigger(false, "addClaimProveedor", data, pKey);
}


async function addClaimApoderado(claimId, address, clauses, claims, dateinit, dateend, status, personal_hash, id, signers, pKey){
    var data = [claimId, address, personal_hash, clauses, claims, dateinit, dateend, status, id, signers];
    return await trigger(false, "addClaimApoderado", data, pKey);
}


async function registerEventLogger(eventName) {
    var contract = await getContractImplementation();
    var contractFunc = await contract.events[eventName];
    contractFunc((err, events)=>{console.log(err, events)});
}

async function main() {
    var contract = await getContract();
    console.log(await contract.getPastEvents("allEvents")); // Nos permite buscar los eventos pasados
    contract.events.allEvents((err, events)=>{console.log(err, events)});  // Registra  todos los eventos del contrato que han ocurrido
    var account = await createWallet();
    console.log(account.address);
    //var hash = await etherSend(account.address, "0.001");
    //console.log(await getBalance("0x7e68fEa136a272e815f8Dd930d3C76185c53D64f"));
    //console.log(loadContract())
    //console.log(getContract());
    //console.log(await prepareTransaction('d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5', 23000));
    var param = [account.address, 10];
    console.log(await trigger(false, "mint", param, "d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5"));
}

exports.trigger = trigger;
exports.getInizializeData = getInizializeData;
exports.registerEventLogger = registerEventLogger;
exports.deployContract = deployContract;
exports.addClaimProveedor = addClaimProveedor;
exports.addClaimApoderado = addClaimApoderado;

//main();