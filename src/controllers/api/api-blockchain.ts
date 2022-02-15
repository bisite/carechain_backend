"use strict"
import Express from "express"
import { Config } from "../../config";
import { Monitor } from "../../monitor";
import { BAD_REQUEST, expressSecurityMeasures, FORBIDDEN, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, OK } from "../../utils/http-utils";
import { Controller } from "../controller";
import { trigger,registerEventLogger, deployContract, addClaimProveedor, addClaimApoderado } from "../../utils/ethereum-utils";
import { Wallet } from "../../models/wallet";


export class BlockchainController extends Controller{
    public registerAPI(prefix: string, application: Express.Express): any {
        application.post(prefix + "/blockchain/grantAdmin", expressSecurityMeasures(noCache(this.grantAdmin)))
        application.post(prefix + "/blockchain/revokeAdmin", expressSecurityMeasures(noCache(this.revokeAdmin)))
        application.post(prefix + "/blockchain/transferRoot", expressSecurityMeasures(noCache(this.transferRoot)))
        application.post(prefix + "/blockchain/grantAllowanceSigner", expressSecurityMeasures(noCache(this.grantAllowanceSigner)))
        application.post(prefix + "/blockchain/revokeAllowanceSigner", expressSecurityMeasures(noCache(this.revokeAllowanceSigner)))
        application.post(prefix + "/blockchain/addClaim", expressSecurityMeasures(noCache(this.addClaim)))
        application.post(prefix + "/blockchain/addClaimProveedor", expressSecurityMeasures(noCache(this.addClaimProveedor)))
        application.post(prefix + "/blockchain/addClaimApoderado", expressSecurityMeasures(noCache(this.addClaimApoderado)))

        
        
        application.get(prefix + "/blockchain/isAdmin", expressSecurityMeasures(noCache(this.isAdmin)))
        application.get(prefix + "/blockchain/root", expressSecurityMeasures(noCache(this.root)))
        application.get(prefix + "/blockchain/isAllowanceSinger", expressSecurityMeasures(noCache(this.isAllowanceSinger)))
        application.get(prefix + "/blockchain/getClaim", expressSecurityMeasures(noCache(this.getClaim)))

        application.get(prefix + "/blockchain/examples", expressSecurityMeasures(noCache(this.examples)))

    }
    
    /**
     * Gives administrator permissions to an address
     * @route POST /api/v1/blockchain/grantAdmin
     * @group BLOCKCHAIN
     * @param {LoginRequest.model} request.body - address and pKey (optional admin private key)
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
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
     * Remove administrator permissions to an address
     * @route POST /api/v1/blockchain/revokeAdmin
     * @group BLOCKCHAIN
     * @param {LoginRequest.model} request.body - address and pKey (optional admin private key)
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
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
     * Transfers the ownership of the contract
     * @route POST /api/v1/blockchain/transferRoot
     * @group BLOCKCHAIN
     * @param {LoginRequest.model} request.body - address and pKey (optional root private key)
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
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
     * Return if an account is admin
     * @route GET /api/v1/blockchain/isAdmin
     * @group BLOCKCHAIN
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
     * @param {LoginRequest.model} request.body - address
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
     * Return the address of the root
     * @route GET /api/v1/blockchain/root
     * @group BLOCKCHAIN
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
     */
    public async root(request: Express.Request, response: Express.Response) {
        const temp = await trigger(true, "root", [], "");
        response.status(OK);
        response.json({ root: temp });
        return;
    }


    /**
     * Gives signer permissions to an address
     * @route POST /api/v1/blockchain/grantAllowanceSigner
     * @group BLOCKCHAIN
     * @param {LoginRequest.model} request.body - address and pKey (optional admin private key)
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
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
     * Revoke signer permissions to an address
     * @route POST /api/v1/blockchain/revokeAllowanceSigner
     * @group BLOCKCHAIN
     * @param {LoginRequest.model} request.body - address and pKey (optional admin private key)
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
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
     * Return if an account is allowanceSigner
     * @route GET /api/v1/blockchain/isAllowanceSinger
     * @group BLOCKCHAIN
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
     * @param {LoginRequest.model} request.body - address
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


    public async getClaim(request: Express.Request, response: Express.Response) {
        const claimId = request.body.claimId || "";
        
        if (!claimId) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_PARAMS" });
            return;
        }

        const temp = await trigger(true, "getClaim", [claimId], "");
        response.status(OK);
        response.json({ isAdmin: temp });
        return;
    }



    /**
     * Add specific claim
     * @route POST /api/v1/blockchain/addClaim
     * @group BLOCKCHAIN
     * @param {LoginRequest.model} request.body - address and pKey (optional admin private key)
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
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
     * Add specific claim
     * @route POST /api/v1/blockchain/addClaimProveedor
     * @group BLOCKCHAIN
     * @param {LoginRequest.model} request.body - address and pKey (optional admin private key)
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
     */
    public async addClaimProveedor(request: Express.Request, response: Express.Response) {
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

        const tx_hash = await addClaimProveedor(topic, clauses, claims, dateinit, dateend, status, id, pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
        return;
    }


    /**
     * Add specific claim
     * @route POST /api/v1/blockchain/addClaimProveedor
     * @group BLOCKCHAIN
     * @param {LoginRequest.model} request.body - address and pKey (optional admin private key)
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginResponse.model} 200 - Success
     */
    public async addClaimApoderado(request: Express.Request, response: Express.Response) {
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
    
        const tx_hash = await addClaimApoderado(claimId, address, clauses, claims, dateinit, dateend, status, personal_hash, id, signers, pKey);
        response.status(OK);
        response.json({ tx_hash: tx_hash });
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
