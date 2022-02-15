const ethereumUtils = require('./ethereumUtils');



async function grantAdmin(address) {
    return await ethereumUtils.trigger(false, "grantAdmin", [address], "");
}


async function revokeAdmin(address) {
    return await ethereumUtils.trigger(false, "revokeAdmin", [address], "");
}


async function isAdmin(address) {
    return await ethereumUtils.trigger(true, "administrators", [address], "");
}


async function grantAllowanceSigner(claimId, address, pKey) {
    return await ethereumUtils.trigger(false, "grantAllowanceSigner", [claimId, address], pKey);
}


async function revokeAllowanceSigner(claimId, address, pKey) {
    return await ethereumUtils.trigger(false, "revokeAllowanceSigner", [claimId, address], pKey);
}

async function isAllowanceSigner(claimId, address) {
    return await ethereumUtils.trigger(true, "allowanceSigners", [claimId, address], "");
}


async function addClaim(topic, address, clauses, claims, dateinit, dateend, status, personal_hash, signers, id, pKey){
    return await ethereumUtils.deployContract(topic, address, clauses, claims, dateinit, dateend, status, personal_hash, signers, id, pKey);
}


async function getClaim(claimId){
    return await ethereumUtils.trigger(true, "getClaim", [claimId], "");
}

async function addClaimProveedor(topic, clauses, claims, dateinit, dateend, status, id, pKey){
    return await ethereumUtils.addClaimProveedor(topic, clauses, claims, dateinit, dateend, status, id, pKey);
}

async function addClaimApoderado(claimId, address, clauses, claims, dateinit, dateend, status, personal_hash, id, signers, pKey){
    return await ethereumUtils.addClaimApoderado(claimId, address, clauses, claims, dateinit, dateend, status, personal_hash, id, signers, pKey);
}



async function root() {
    return await ethereumUtils.trigger(true, "root", [], "");
}


async function getData(){
    return await ethereumUtils.getInizializeData("initialize", ["0xBEd6748bFF42725e0682A34A17E59a45AB224471"]);
}

async function examples() {
    //Iniciamos el logger para todos los eventos
    //await ethereumUtils.registerEventLogger("allEvents");

    // Iniciamos un logger para un tipo de eventos
    await ethereumUtils.registerEventLogger("ClaimAdded");
    await ethereumUtils.registerEventLogger("GenericClaimAdded");
    
    //await ethereumUtils.registerEventLogger("Paused");
    //await ethereumUtils.registerEventLogger("Transfer");
    //await ethereumUtils.registerEventLogger("Unpaused");


    // MÉTODOS PARA INICILIZALIZAR EL CONTRATO
    //var data = await getData();
    //var temp = await root();
    //console.log(temp);
    //temp = await upgradeToAndCall("", "v0", "0x5BffE809c955a7b8a46c5E84f080eD9bA3304DfC", data.toString());
    //console.log(temp);
    //var temp = await root();
    
    
    // PRUEBAS DE GRANTADMIN, REVOKEADMIN Y ISADMIN
    var temp = await isAdmin("0x7e68fEa136a272e815f8Dd930d3C76185c53D64f");
    console.log(temp);
    //temp = await grantAdmin("0x7e68fEa136a272e815f8Dd930d3C76185c53D64f");
    //console.log(temp);
    //temp = await isAdmin("0x7e68fEa136a272e815f8Dd930d3C76185c53D64f");
    //console.log(temp);
    //temp = await revokeAdmin("0x7e68fEa136a272e815f8Dd930d3C76185c53D64f");
    //console.log(temp);
    //temp = await isAdmin("0x7e68fEa136a272e815f8Dd930d3C76185c53D64f");
    //console.log(temp);
    
    
    
    // FUNCIONALIDAD AÑADIR CLAIM ESPECÍFICA
    //var temp = await addClaim(1, "0xBEd6748bFF42725e0682A34A17E59a45AB224471", ["clause1", "clause2"], ["claim1", "claim2"], [1, 2], [10, 20], [100, 200], "hash personal", ["0x7e68fEa136a272e815f8Dd930d3C76185c53D64f"], 2, "");
    
    
    //FUNCIONALIDAD RECUPERAR CLAIM
    //var temp = await getClaim("0x0823a2201b943b275a272afc1210cd8871a9a6494dc3451dfa364b835f142472");
    
    
    
    // FUNCIONALIDAD AÑADIR CLAIM ESPECÍFICA
    //var temp = await addClaimProveedor(1, ["clause_gen_1", "clause_gen_2"], ["claim_gen_1", "claim_gen_2"], [1, 2], [10, 20], [100, 200], 3, "");
    temp = await getClaim("0x8a5e68269ec97e3ee7b4b4e7cc831168def8cac7c910a87df0a5b112857ccc7a");
    
    
    // FUNCIONALIDAD AÑADIR CLAIM DESDE GENÉRICA
    //var temp = await addClaimApoderado("0x8a5e68269ec97e3ee7b4b4e7cc831168def8cac7c910a87df0a5b112857ccc7a", "0xBEd6748bFF42725e0682A34A17E59a45AB224471", ["clause_esp_1", "clause_esp_2"], ["claim1_esp", "claim2_esp"], [11, 22], [110, 220], [1100, 2200], "hash personal", 4, ["0x7e68fEa136a272e815f8Dd930d3C76185c53D64f"], "");
    //var temp = await getClaim("0xcc91a193640d8c34f9d47601e2ca3dd1c27e8e4864c673b3f306a4723ef5ec47");
    
    
    // PRUEBAS grantAllowanceSigner, revokeAllowanceSigner AND isAllowanceSigner (es necesario haber creado la claim previamente)
    //var temp = await isAllowanceSigner("0xf465cb1814acf368f6db6a9581948fd6461513184ff6ebc301b53aaebbd5595b", "0x7e68fEa136a272e815f8Dd930d3C76185c53D64f");
    //console.log(temp);
    //temp = await grantAllowanceSigner("0xf465cb1814acf368f6db6a9581948fd6461513184ff6ebc301b53aaebbd5595b", "0x7e68fEa136a272e815f8Dd930d3C76185c53D64f", "");
    //console.log(temp);
    //temp = await isAllowanceSigner("0xf465cb1814acf368f6db6a9581948fd6461513184ff6ebc301b53aaebbd5595b", "0x7e68fEa136a272e815f8Dd930d3C76185c53D64f");
    //console.log(temp);
    //temp = await revokeAllowanceSigner("0xf465cb1814acf368f6db6a9581948fd6461513184ff6ebc301b53aaebbd5595b", "0x7e68fEa136a272e815f8Dd930d3C76185c53D64f", "");
    //console.log(temp);
    //temp = await isAllowanceSigner("0xf465cb1814acf368f6db6a9581948fd6461513184ff6ebc301b53aaebbd5595b", "0x7e68fEa136a272e815f8Dd930d3C76185c53D64f");
    //console.log(temp);
    
    
    
    
  
    // Métodos view
    //
    //var temp = await root();

    
    console.log(temp);

}

examples();