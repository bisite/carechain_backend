"use strict"
import Express from "express"
import { Config } from "../../config";
import { Monitor } from "../../monitor";
import { BAD_REQUEST, expressSecurityMeasures, FORBIDDEN, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, OK } from "../../utils/http-utils";
import { Controller } from "../controller";
import { trigger,registerEventLogger, deployContract, addClaimSupplier, addClaimRepresentative } from "../../utils/ethereum-utils";
import { Wallet } from "../../models/wallet";


export class BlockchainController extends Controller{
    public registerAPI(prefix: string, application: Express.Express): any {
        application.post(prefix + "/blockchain/grantAdmin", expressSecurityMeasures(noCache(this.grantAdmin)))
        application.post(prefix + "/blockchain/revokeAdmin", expressSecurityMeasures(noCache(this.revokeAdmin)))
        application.post(prefix + "/blockchain/transferRoot", expressSecurityMeasures(noCache(this.transferRoot)))
        application.post(prefix + "/blockchain/grantAllowanceSigner", expressSecurityMeasures(noCache(this.grantAllowanceSigner)))
        application.post(prefix + "/blockchain/revokeAllowanceSigner", expressSecurityMeasures(noCache(this.revokeAllowanceSigner)))
        application.post(prefix + "/blockchain/addClaim", expressSecurityMeasures(noCache(this.addClaim)))
        application.post(prefix + "/blockchain/addClaimSupplier", expressSecurityMeasures(noCache(this.addClaimSupplier)))
        application.post(prefix + "/blockchain/addClaimRepresentative", expressSecurityMeasures(noCache(this.addClaimRepresentative)))

        
        
        application.get(prefix + "/blockchain/isAdmin", expressSecurityMeasures(noCache(this.isAdmin)))
        application.get(prefix + "/blockchain/root", expressSecurityMeasures(noCache(this.root)))
        application.get(prefix + "/blockchain/isAllowanceSinger", expressSecurityMeasures(noCache(this.isAllowanceSinger)))
        application.get(prefix + "/blockchain/getClaim", expressSecurityMeasures(noCache(this.getClaim)))

        application.get(prefix + "/blockchain/examples", expressSecurityMeasures(noCache(this.examples)))

    }


    /**
    * @typedef GrantAdminRequest
    * @property {string} address - Public addres of the new admin
    * @property {string} pKey - (Optional) the private key of the transaction signer
    */

    /**
    * @typedef GrantAdminBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */
    
    /**
    * @typedef GrantAdminResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Gives administrator permissions to an user (wallet address)
     * @route POST /api/v1/blockchain/grantAdmin
     * @group Blockchain
     * @param {GrantAdminRequest.model} request.body - Request body
     * @returns {GrantAdminBadRequest.model} 400 - Bad request
     * @returns {GrantAdminResponse.model} 200 - Success
     */
    public async grantAdmin(request: Express.Request, response: Express.Response) {
        const address = request.body.address || "";
        const pKey = request.body.pKey || "";

        if (!address) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }
        const tx_hash = await trigger(false, "grantAdmin", [address], pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }
    

    /**
    * @typedef RevokeAdminRequest
    * @property {string} address - Public addres of the new admin
    * @property {string} pKey - (Optional) the private key of the transaction signer
    */

    /**
    * @typedef RevokeAdminBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef RevokeAdminResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Remove administrator permissions to an user (wallet address)
     * @route POST /api/v1/blockchain/revokeAdmin
     * @group Blockchain
     * @param {RevokeAdminRequest.model} request.body - Request body
     * @returns {RevokeAdminBadRequest.model} 400 - Bad request
     * @returns {RevokeAdminResponse.model} 200 - Success
     */
    public async revokeAdmin(request: Express.Request, response: Express.Response) {
        const address = request.body.address || "";
        const pKey = request.body.pKey || "";

        if (!address) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }
        const tx_hash = await trigger(false, "revokeAdmin", [address], pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }
    


    /**
    * @typedef TransferRootRequest
    * @property {string} address - Public addres of the new admin
    * @property {string} pKey - (Optional) the private key of the transaction signer
    */

    /**
    * @typedef TransferRootBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef TransferRootResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Transfers the ownership of the contract
     * @route POST /api/v1/blockchain/transferRoot
     * @group Blockchain
     * @param {TransferRootRequest.model} request.body - Request body
     * @returns {TransferRootBadRequest.model} 400 - Bad request
     * @returns {TransferRootResponse.model} 200 - Success
     */
    public async transferRoot(request: Express.Request, response: Express.Response) {
        const address = request.body.address || "";
        const pKey = request.body.pKey || "";

        if (!address) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }
        const tx_hash = await trigger(false, "transferRoot", [address ], pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }
    

    /**
    * @typedef IsAdminRequest
    * @property {string} address - The address to consult if is an administrator
    */

    /**
    * @typedef IsAdminBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef IsAdminResponse
    * @property {boolean} isAdmin - If an address is admin
    */

    /**
     * Return if an account is admin
     * @route GET /api/v1/blockchain/isAdmin
     * @group Blockchain
     * @returns {IsAdminBadRequest.model} 400 - Bad request
     * @returns {IsAdminResponse.model} 200 - Success - isAdmin: Boolean
     * @param {IsAdminRequest.model} request.body - Request body
     */
    public async isAdmin(request: Express.Request, response: Express.Response) {
        const address = request.query.address || "";
        
        if (!address) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const temp = await trigger(true, "administrators", [address], "");
        response.status(OK);
        response.json({ isAdmin: temp });
        return;
    }


    /**
    * @typedef BlockchainBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */
   
    /**
    * @typedef BlockchainResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Return the address of the root
     * @route GET /api/v1/blockchain/root
     * @group Blockchain
     * @returns {BlockchainBadRequest.model} 400 - Bad request
     * @returns {BlockchainResponse.model} 200 - Success - root: Address
     */
    public async root(request: Express.Request, response: Express.Response) {
        const temp = await trigger(true, "root", [], "");
        response.status(OK);
        response.json({ root: temp });
        return;
    }


    /**
    * @typedef GrantAllowanceSignerRequest
    * @property {string} claimId - The claim identifier
    * @property {string} address - The address to give permissions
    * @property {string} pKey - (Optional) The private key address of the transactions signer
    */

    /**
    * @typedef GrantAllowanceSignerBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef GrantAllowanceSignerResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Gives permissions to a user to sign a contract
     * @route POST /api/v1/blockchain/grantAllowanceSigner
     * @group Blockchain
     * @param {GrantAllowanceSignerRequest.model} request.body - Request body
     * @returns {GrantAllowanceSignerBadRequest.model} 400 - Bad request
     * @returns {GrantAllowanceSignerResponse.model} 200 - Success
     */
    public async grantAllowanceSigner(request: Express.Request, response: Express.Response) {
        const claimId = request.body.claimId || "";
        const address = request.body.address || "";
        const pKey = request.body.pKey || "";

        if (!address || !claimId) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const tx_hash = await trigger(false, "grantAllowanceSigner", [claimId, address], pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }


    /**
    * @typedef RevokeAllowanceSignerRequest
    * @property {string} claimId - The claim identifier
    * @property {string} address - The address to revoke permissions
    * @property {string} pKey - (Optional) The private key address of the transactions signer
    */

    /**
    * @typedef RevokeAllowanceBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef RevokeAllowanceResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Removes a user's signing permissions
     * @route POST /api/v1/blockchain/revokeAllowanceSigner
     * @group Blockchain
     * @param {RevokeAllowanceRequest.model} request.body - Request body
     * @returns {RevokeAllowanceBadRequest.model} 400 - Bad request
     * @returns {RevokeAllowanceResponse.model} 200 - Success
     */
    public async revokeAllowanceSigner(request: Express.Request, response: Express.Response) {
        const claimId = request.body.claimId || "";
        const address = request.body.address || "";
        const pKey = request.body.pKey || "";

        if (!address || !claimId) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const tx_hash = await trigger(false, "revokeAllowanceSigner", [claimId, address], pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }

    
    /**
    * @typedef IsAllowanceSignerRequest
    * @property {string} claimId - The claim identifier
    * @property {string} address - The address to know if is a signer
    */

    /**
    * @typedef IsAllowanceSignerBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef IsAllowanceSignerResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Return if an account is allowanceSigner
     * @route GET /api/v1/blockchain/isAllowanceSinger
     * @group Blockchain
     * @returns {IsAllowanceSignerBadRequest.model} 400 - Bad request
     * @returns IsAllowanceSignerResponse.model} 200 - Success
     * @param {IsAllowanceSignerRequest.model} request.body - Request body
     */
    public async isAllowanceSinger(request: Express.Request, response: Express.Response) {
        const address = request.query.address || "";
        const claimId = request.body.claimId || "";
        
        if (!address || !claimId) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const temp = await trigger(true, "allowanceSigners", [claimId, address], "");
        response.status(OK);
        response.json({ isAdmin: temp });
        return;
    }


    /**
    * @typedef GetClaimSignerRequest
    * @property {string} claimId - The claim identifier
    */

    /**
    * @typedef GetClaimSignerBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef GetClaimSignerResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Returns the data of a claim, either generic or specific
     * @route GET /api/v1/blockchain/getClaim
     * @group Blockchain
     * @param {GetClaimSignerRequest.model} request.body - Request body
     * @returns {GetClaimSignerBadRequest.model} 400 - Bad request
     * @returns {GetClaimSignerResponse.model} 200 - Success
     */
    public async getClaim(request: Express.Request, response: Express.Response) {
        const claimId = request.body.claimId || "";
        
        if (!claimId) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const temp = await trigger(true, "getClaim", [claimId], "");
        response.status(OK);
        response.json({ claim: temp });
        return;
    }

    /**
    * @typedef AddClaimRequest
    * @property {string} address - The public key of the transaction sender
    * @property {integer} topic - The topic of the clauses
    * @property {array} claims - Array with the claims
    * @property {array} clauses - Array with the clauses
    * @property {array} dateinit - Array wit the date init
    * @property {array} dateend - Array with the date end
    * @property {array} status - Array with the status
    * @property {string} personal_hash - The personal hash of the client
    * @property {array} signers - Array with the address of the contract signers
    * @property {string} id - The unique claim identifier
    * @property {string} pKey - (Optional) The private key address of the transactions signer
    */

    /**
    * @typedef AddClaimBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef AddClaimResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Add specific claim
     * @route POST /api/v1/blockchain/addClaim
     * @group Blockchain
     * @param {AddClaimRequest.model} request.body - Request body
     * @returns {AddClaimBadRequest.model} 400 - Bad request
     * @returns {AddClaimResponse.model} 200 - Success
     */
    public async addClaim(request: Express.Request, response: Express.Response) {
        const address = request.body.address || "";
        const topic = parseInt(request.body.topic || "0");
        const claims = JSON.parse(request.body.claims || "{}");
        const clauses = JSON.parse(request.body.clauses || "{}");
        const dateinit = JSON.parse(request.body.dateinit || "{}");
        const dateend = JSON.parse(request.body.dateend || "{}");
        const status = JSON.parse(request.body.status || "{}");
        const personal_hash = request.body.personal_hash || "";
        const signers = JSON.parse(request.body.signers || "{}");
        const id = parseInt(request.body.id || "0");
        
        const pKey = request.body.pKey || "";

        if (!address || !topic || !claims || !clauses || !dateinit || !dateend || !status || !personal_hash || !signers || !id) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const tx_hash = await deployContract(topic, address, clauses, claims, dateinit, dateend, status, personal_hash, signers, id, pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }

        
    /**
    * @typedef AddClaimSupplierRequest
    * @property {string} address - The public key of the transaction sender
    * @property {integer} topic - The topic of the clauses
    * @property {array} claims - Array with the claims
    * @property {array} clauses - Array with the clauses
    * @property {array} dateinit - Array wit the date init
    * @property {array} dateend - Array with the date end
    * @property {array} status - Array with the status
    * @property {string} id - The unique claim identifier
    * @property {string} pKey - (Optional) The private key address of the transactions signer
    */

    /**
    * @typedef AddClaimSupplierBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef AddClaimSupplierResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Add specific claim (supplier)
     * @route POST /api/v1/blockchain/addClaimSupplier
     * @group Blockchain
     * @param {AddClaimSupplierRequest.model} request.body - Request body
     * @returns {AddClaimSupplierBadRequest.model} 400 - Bad request
     * @returns {AddClaimSupplierResponse.model} 200 - Success
     */
    public async addClaimSupplier(request: Express.Request, response: Express.Response) {
        const address = request.body.address || "";
        const topic = parseInt(request.body.topic || "0");
        const claims = JSON.parse(request.body.claims || "{}")
        const clauses = JSON.parse(request.body.clauses || "{}")
        const dateinit = JSON.parse(request.body.dateinit || "{}")
        const dateend = JSON.parse(request.body.dateend || "{}")
        const status = JSON.parse(request.body.status || "{}")
        const id = parseInt(request.body.id || "0");
        
        const pKey = request.body.pKey || "";

        if (!address || !topic || !claims || !clauses || !dateinit || !dateend || !status || !id) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const tx_hash = await addClaimSupplier(topic, clauses, claims, dateinit, dateend, status, id, pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }


    /**
    * @typedef AddClaimRepresentativeRequest
    * @property {string} claimId - The claim identifier
    * @property {string} address - The public key of the transaction sender
    * @property {array} claims - Array with the claims
    * @property {array} clauses - Array with the clauses
    * @property {array} dateinit - Array wit the date init
    * @property {array} dateend - Array with the date end
    * @property {array} status - Array with the status
    * @property {string} personal_hash - The personal hash of the client
    * @property {array} signers - Array with the address of the contract signers
    * @property {string} id - The unique claim identifier (off chain)
    * @property {string} pKey - (Optional) The private key address of the transactions signer
    */

    /**
    * @typedef AddClaimRepresentativeBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef AddClaimRepresentativeResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Add generic claim (representative)
     * @route POST /api/v1/blockchain/addClaimRepresentative
     * @group Blockchain
     * @param {AddClaimRepresentativeRequest.model} request.body - Request body
     * @returns {AddClaimRepresentativeResponse.model} 400 - Bad request
     * @returns {AddClaimRepresentativeResponse.model} 200 - Success
     */
    public async addClaimRepresentative(request: Express.Request, response: Express.Response) {
        const claimId = request.body.claimId || "";
        const address = request.body.address || "";
        const claims = JSON.parse(request.body.claims || "{}")
        const clauses = JSON.parse(request.body.clauses || "{}")
        const dateinit = JSON.parse(request.body.dateinit || "{}")
        const dateend = JSON.parse(request.body.dateend || "{}")
        const personal_hash = request.body.personal_hash || "";
        const signers = JSON.parse(request.body.signers || "{}");
        const status = JSON.parse(request.body.status || "{}")
        const id = parseInt(request.body.id || "0");
            
        const pKey = request.body.pKey || "";
    
        if (!address || !claimId || !claims || !clauses || !dateinit || !dateend || !status || !personal_hash || !signers || !id) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }
    
        const tx_hash = await addClaimRepresentative(claimId, address, clauses, claims, dateinit, dateend, status, personal_hash, id, signers, pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }


    /**
    * @typedef ModifyClaimRequest
    * @property {string} claimId - The claim identifier
    * @property {array} claims - Array with the claims
    * @property {array} clauses - Array with the clauses
    * @property {array} dateinit - Array wit the date init
    * @property {array} dateend - Array with the date end
    * @property {array} status - Array with the status
    * @property {string} personal_hash - The personal hash of the client
    * @property {string} id - The unique claim identifier (off chain)
    * @property {string} pKey - (Optional) The private key address of the transactions signer
    */

    /**
    * @typedef ModifyClaimBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef ModifyClaimResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Modify an existing claim
     * @route POST /api/v1/blockchain/modifyClaim
     * @group Blockchain
     * @param {ModifyClaimRequest.model} request.body - Request body
     * @returns {ModifyClaimResponse.model} 400 - Bad request
     * @returns {ModifyClaimResponse.model} 200 - Success
     */
    public async modifyClaim(request: Express.Request, response: Express.Response) {
        
        return;
    }


    /**
    * @typedef SignClaimRequest
    * @property {string} claimId - The claim identifier
    * @property {string} pKey - (Optional) The private key address of the transactions signer
    */

    /**
    * @typedef SignClaimBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef SignClaimResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * A user signs a claim to which he has permissions
     * @route POST /api/v1/blockchain/signClaim
     * @group Blockchain
     * @param {SignClaimRequest.model} request.body - claimId and pKey
     * @returns {SignClaimResponse.model} 400 - Bad request
     * @returns {SignClaimResponse.model} 200 - Success
     */
    public async signClaim(request: Express.Request, response: Express.Response) {
        
        return;
    }


    /**
    * @typedef ModifyConditionOfAClaimRequest
    * @property {string} claimId - The claim identifier
    * @property {integer} conditionId - The id of the condition
    * @property {array} condition - The new condition
    * @property {string} dateinit - The init time stamp
    * @property {string} dateend - The end time stamp
    * @property {string} status - The condition status
    * @property {string} pKey - (Optional) The private key address of the transactions signer
    */

    /**
    * @typedef ModifyConditionOfAClaimBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef ModifyConditionOfAClaimResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Changes a condition of an existing claim
     * @route POST /api/v1/blockchain/modifyConditionOfAClaim
     * @group Blockchain
     * @param {ModifyConditionOfAClaimRequest.model} request.body - Request body
     * @returns {ModifyConditionOfAClaimResponse.model} 400 - Bad request
     * @returns {ModifyConditionOfAClaimResponse.model} 200 - Success
     */
    public async modifyConditionOfAClaim(request: Express.Request, response: Express.Response) {
        
        return;
    }


    /**
    * @typedef ChangeStatusRequest
    * @property {string} claimId - The claim identifier
    * @property {integer} conditionId - The id of the condition
    * @property {string} newStatus - The new condition status
    * @property {string} pKey - (Optional) The private key address of the transactions signer

    */

    /**
    * @typedef ChangeStatusBadRequest
    * @property {string} error_code - Error Code:
    *  - INVALID_PARAMS: Invalid parameters
    */

    /**
    * @typedef ChangeStatusResponse
    * @property {string} tx_hash - The transaction hash
    */

    /**
     * Changes the status of an existing claim
     * @route POST /api/v1/blockchain/changeStatus
     * @group Blockchain
     * @param {ChangeStatusRequest.model} request.body - Request body
     * @returns {ChangeStatusResponse.model} 400 - Bad request
     * @returns {ChangeStatusResponse.model} 200 - Success
     */
    public async changeStatus(request: Express.Request, response: Express.Response) {
        
        return;
    }


    public async examples(request: Express.Request, response: Express.Response) {
        //Iniciamos el logger para todos los eventos
        //await ethereumUtils.registerEventLogger("allEvents");
    
        // Iniciamos un logger para un tipo de eventos
        await registerEventLogger("Approval");
        await registerEventLogger("Paused");
        await registerEventLogger("Transfer");
        await registerEventLogger("Unpaused");
    
    
        // Métodos que alteran el estado del contrato
        //const temp = await this.mint("0xBEd6748bFF42725e0682A34A17E59a45AB224471", 10);
        //var temp = await approve("d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5", "0xBEd6748bFF42725e0682A34A17E59a45AB224471", 10);
        //var temp = await burn("d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5", 10);
        //var temp = await burnFrom("put_your_pkey", "0xC446C0D669b2dD8d60118F8E7A5d66A301402cfA", 10);
        //var temp = await decreaseAllowance("d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5", "0xBEd6748bFF42725e0682A34A17E59a45AB224471", 10);
        //var temp = await increaseAllowance("d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5", "0xBEd6748bFF42725e0682A34A17E59a45AB224471", 10);
        //var temp = await grantAdmin("0xBEd6748bFF42725e0682A34A17E59a45AB224471");
        //var temp = await revokeAdmin("0xBEd6748bFF42725e0682A34A17E59a45AB224471");
        //var temp = await transfer("d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5", "0xBEd6748bFF42725e0682A34A17E59a45AB224471", 10);
        //var temp = await transferFrom("pkey_from", "0xC446C0D669b2dD8d60118F8E7A5d66A301402cfA", "0xBEd6748bFF42725e0682A34A17E59a45AB224471", 10);
        //var temp = await pause();
        //var temp = await unPause();
        //var temp = await transferRoot("d6b748a9faefe39bdb48d9dc238f0e6b106b6c39226abbe978f19813f99a38c5", "0xC446C0D669b2dD8d60118F8E7A5d66A301402cfA");
    
        // Métodos view
        //var temp = await isAdmin("0xC446C0D669b2dD8d60118F8E7A5d66A301402cfA");
        //var temp = await balanceOf("0xC446C0D669b2dD8d60118F8E7A5d66A301402cfA");
        //var temp = await isPaused();
        //var temp = await root();
        //var temp = await totalSupply();
        //var temp = await allowance("0xC446C0D669b2dD8d60118F8E7A5d66A301402cfA", "0xBEd6748bFF42725e0682A34A17E59a45AB224471");
    
    }
}
