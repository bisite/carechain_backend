// // Reserved for license
// /*
"use strict";

import Express from "express";
import speakeasy from "speakeasy";
import Mailer from "nodemailer";
import { Config } from "../../config";
import { User } from "../../models/user";
import { Wallet } from "../../models/wallet";
import { Monitor } from "../../monitor";
import { BAD_REQUEST, expressSecurityMeasures, FORBIDDEN, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, OK, UNAUTHORIZED } from "../../utils/http-utils";
import { verifyCaptcha } from "../../utils/recaptcha";
import { secureStringCompare, validateEmail } from "../../utils/text-utils";
import { Controller } from "../controller";
import { Session } from "../../models/session";
import { MailService } from "../../service/mail-service";
import { trigger } from "../../utils/ethereum-utils";

/**
* Authentication API
* @group auth - Authentication API
*/
export class AuthController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        // Context
        application.get(prefix + "/auth/context", expressSecurityMeasures(this.context.bind(this)));

        // Login
        application.post(prefix + "/auth/login", expressSecurityMeasures(this.login.bind(this)));

        // Logout
        application.post(prefix + "/auth/logout", expressSecurityMeasures(this.logout.bind(this)));
        application.post(prefix + "/auth/custom_logout", expressSecurityMeasures(this.logoutCustom.bind(this)));

        // Two factor authentication
        application.post(prefix + "/auth/tfa", expressSecurityMeasures(this.tfaLogin.bind(this)));

        // Signup
        application.post(prefix + "/auth/signup", expressSecurityMeasures(this.signup.bind(this)));

        // Email verification
        application.post(prefix + "/auth/email/verify", expressSecurityMeasures(this.verifyEmail.bind(this)));


        /* application.use((req: any, res, next) => {
            // Get auth token from the cookies
            const authToken = req.cookies['session_id'];

            // Inject the user to the request
            req.user = authTokens[authToken];

            next();
        });*/
    }

    /**
    * @typedef ContextUserInfo
    * @property {string} name - Profile name
    * @property {string} description - Profile description
    * @property {string} url - Profile external link
    * @property {string} picture - Avatar (image URL)
    */

    /**
    * @typedef AuthenticationContext
    * @property {string} status - Authentication status: LOGGED_IN
    * @property {string} uid - User ID
    * @property {string} account_type - Account type (email, github, google, etc)
    * @property {string} username - Username
    * @property {ContextUserInfo.model} profile - User profile info
    */

    /**
    * @typedef AuthenticationContextError
    * @property {string} status - Authentication status: UNAUTHORIZED, TFA_REQUIRED (requires two, factor authentication), USER_NOT_FOUND
    */

    /**
    * Authentication context
    * @route GET /auth/context
    * @group auth
    * @returns {AuthenticationContext.model} 200 - Authentication context
    * @returns {AuthenticationContextError.model} 400 - Unauthorized
    * @security SessionIdAuth
    */
    public async context(request: Express.Request, response: Express.Response) {
        const session = await this.session(request, true);
        
        if (!session) {
            response.status(UNAUTHORIZED);
            return response.json({ status: "UNAUTHORIZED" });
        }

        if (session.tfaPending) {
            response.status(UNAUTHORIZED);
            return response.json({ status: "TFA_REQUIRED" });
        }

        const user = await session.findUser();

        if (!user) {
            response.status(UNAUTHORIZED);
            return response.json({ status: "USER_NOT_FOUND" });
        }

        response.json({
            status: "LOGGED_IN",
            uid: user.id,
            account_type: user.type,
            global_admin: user.globalAdmin,
            username: user.username,
            tfa: user.tfa,

            profile: {
                name: user.name || user.getName(),
                surname: user.surname,
                picture: "",
            },
        });
    }

    /**
    * @typedef LoginRequest
    * @property {string} username - Username or email
    * @property {string} password - Password
    * @property {string} captcha - Captcha (Action = "login")
    * @property {string} remember - Send "Yes" to keep the session active until closed
    */

    /**
    * @typedef LoginErrorBadRequest
    * @property {string} error_code - Error Code:
    *  - CAPTCHA: Invalid captcha
    *  - INVALID_CREDENTIALS: Invalid username or empty password
    */

    /**
    * @typedef LoginErrorForbidden
    * @property {string} error_code - Error Code:
    *  - CAPTCHA: Invalid captcha
    *  - INVALID_CREDENTIALS: Invalid credentials
    */

    /**
    * @typedef LoginResponse
    * @property {string} uid - User Id
    * @property {string} session_id - Session ID
    */

    /**
    * Login with username and password
    * @route POST /auth/login
    * @group auth
    * @param {LoginRequest.model} request.body - Username or email
    * @returns {LoginErrorBadRequest.model} 400 - Bad request
    * @returns {LoginErrorForbidden.model} 403 - Access denied to the account
    * @returns {LoginResponse.model} 200 - Success
    */
    public async login(request: Express.Request, response: Express.Response) {
        // Check captcha
        if (Config.getInstance().reCaptcha.siteId) {
            const valid = await verifyCaptcha(request.body.captcha, "login");
            if (!valid) {
                response.status(BAD_REQUEST);
                response.json({ error_code: "CAPTCHA" });
                return;
            }
        }

        const username = request.body.username || "";
        const password = request.body.password || "";
        const remember = (request.body.remember + "").toLowerCase() === "yes";

        if (!username || !password) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "INVALID_CREDENTIALS" });
            return;
        }

        const user = await User.findUser(username);

        if (!user) {
            Monitor.debug("User was not found.");
        }

        if (user && user.emailVerified && user.ckeckPassword(password)) {
            // Check user banned
            if (user.banned) {
                response.status(FORBIDDEN);
                response.json({ error_code: "USER_BANNED" });
                return;
            }
            // Login sucessful, create new session
            try {
                const session = await Session.createSession(user, !remember, this.remoteAddress(request), this.userAgent(request, "os"), this.userAgent(request, "browser"));

                let dev = [];
                if(user.email === username) { // Do login by email
                    const users = await User.findAllUsers(user.email);
                    dev = users.map(u => {
                        return {
                            id: u.id,
                            username: u.username,
                            lastAccess: u.lastAccess
                        };
                    });
                }

                response.cookie("x-session-id", session.getSession());
                response.status(OK);
                response.json({ uid: user.id, globalAdmin: user.globalAdmin, session_id: session.getSession(), users: dev });
            } catch (ex) {
                Monitor.exception(ex);
                response.status(INTERNAL_SERVER_ERROR);
                response.json({ error_message: ex.message });
                return;
            }
        } else {
            response.status(FORBIDDEN);
            response.json({ error_code: "INVALID_CREDENTIALS" });
            return;
        }
    }

    
   


    /**
    * @typedef TFAErrorBadRequest
    * @property {string} error_code - Error Code:
    *  - CAPTCHA: Invalid captcha
    */

    /**
    * @typedef TFAErrorForbidden
    * @property {string} error_code - Error Code:
    *  - INVALID_CODE: Invalid code provided
    */

    /**
    * @typedef TFALoginRequest
    * @property {string} captcha - Captcha (action = "tfa")
    * @property {string} token - Two-factor authentication single-use code
    */

    /**
    * Two factor authentication login. Input the one-use code
    * @route POST /auth/tfa
    * @group auth
    * @param {TFALoginRequest.model} request.body - Request body
    * @returns {TFAErrorBadRequest.model} 400 - Bad request
    * @returns {TFAErrorForbidden.model} 403 - Invalid code
    * @returns {void} 404 - If session is not found or the user does not have two factor authentication
    * @returns {void} 200 - Success, now the user is full logged in, use the same session ID
    * @security SessionIdAuth
    */
    public async tfaLogin(request: Express.Request, response: Express.Response) {
        const session = await this.session(request, true);

        if (!session) {
            response.status(NOT_FOUND);
            response.end();
            return;
        }

        const user = await session.findUser();

        if (!user || !user.tfa) {
            response.status(NOT_FOUND);
            response.end();
            return;
        }

        // Check captcha

        if (Config.getInstance().reCaptcha.siteId) {
            const valid = await verifyCaptcha(request.body.captcha, "tfa");
            if (!valid) {
                response.status(BAD_REQUEST);
                response.json({ error_code: "CAPTCHA" });
                return;
            }
        }

        // Validate token

        try {
            if (!speakeasy.totp.verify({ secret: user.tfaSecret, encoding: 'base32', token: request.body.token || request.body.code || "", step: 60 })) {
                response.status(FORBIDDEN);
                response.json({ error_code: "INVALID_CODE" });
                return;
            }
        } catch (ex) {
            Monitor.debugException(ex);
            response.status(FORBIDDEN);
            response.json({ error_code: "INVALID_CODE" });
            return;
        }

        session.tfaPending = false;
        await session.save();

        response.status(OK);
        response.json({ status: "SUCCESS" });
    }

    /**
    * Logout
    * @route POST /auth/logout
    * @group auth
    * @returns {void} 200 - Success, the session was deleted
    * @security SessionIdAuth
    */
    public async logout(request: Express.Request | any, response: Express.Response) {
        const session = await this.session(request, true);
        if (session) {
            try {
                await session.delete();
            } catch (ex) {
                Monitor.exception(ex);
                response.status(INTERNAL_SERVER_ERROR);
                response.json({ error_message: ex.message });
                return;
            }
        }

        response.status(OK);
        response.json({ status: "SUCCESS" });
    }

    /**
    * @typedef CustomLogoutRequest
    * @property {string} id - Session ID
    */

    /**
    * Custom Logout (close any session knowing the ID)
    * @route POST /auth/custom_logout
    * @group auth
    * @param {CustomLogoutRequest.model} request.body - Request body
    * @returns {void} 200 - Success, the session was deleted
    */
    public async logoutCustom(request: Express.Request, response: Express.Response) {
        const session = await Session.findSecure(request.body.id || "");
        if (session) {
            try {
                await session.delete();
            } catch (ex) {
                Monitor.exception(ex);
                response.status(INTERNAL_SERVER_ERROR);
                response.json({ error_message: ex.message });
                return;
            }
        }

        response.status(OK);
        response.json({ status: "SUCCESS" });
    }

    /**
    * @typedef SignupRequest
    * @property {string} email - Email
    * @property {string} username - Username
    * @property {string} password - Password
    * @property {string} captcha - Captcha (action = "signup")
    */

    /**
    * @typedef SignupErrorBadRequest
    * @property {string} error_code - Error Code:
    *  - CAPTCHA: Invalid captcha
    *  - EMAIL_INVALID: Invalid email
    *  - EMAIL_IN_USE: Email is in use
    *  - UERNAME_INVALID: Invalid username
    *  - USERNAME_IN_USE: Username in use
    *  - WEAK_PASSWORD: Password too short
    */

    /**
    * @typedef SignupRespose
    * @property {string} uid - User ID of the new user
    */

    /**
    * Creates an account using email + password
    * @route POST /auth/signup
    * @group auth
    * @param {SignupRequest.model} request.body - Request body
    * @returns {SignupErrorBadRequest.model} 400 - Bad request
    * @returns {SignupRespose.model} 200 - Success
    */
    public async signup(request: Express.Request, response: Express.Response) {
        // Check captcha
        if (Config.getInstance().reCaptcha.siteId) {
            const valid = await verifyCaptcha(request.body.captcha, "signup");
            if (!valid) {
                response.status(BAD_REQUEST);
                response.json({ error_code: "CAPTCHA" });
                return;
            }
        }
        
        const email = request.body.email || "";

        if (!email || !validateEmail(email)) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "EMAIL_INVALID" });
            return;
        }

        const username = request.body.username || "";

        if (!username || !User.validateUserName(username)) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "UERNAME_INVALID" });
            return;
        }

        if (await User.findUser(username) !== null) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "USERNAME_IN_USE" });
            return;
        }
       
        const password = request.body.password || "";

        if (!password || password.length < 6) {
            response.status(BAD_REQUEST);
            response.json({ error_code: "WEAK_PASSWORD" });
            return;
        }

        const name = request.body.name || "";
        const surname = request.body.surname || "";
        const birth_date = request.body.birth_date || "";
        const gender = request.body.gender || "";

        // Create the new user.

        let createdUser: User;
       
        try {
            createdUser = await User.registerWithCredentials(email, username, password, name, surname, birth_date, gender);
        } catch (ex) {
            Monitor.exception(ex);
            response.status(INTERNAL_SERVER_ERROR);
            response.json({ error_message: ex.message });
            return;
        }
       
        // Create a wallet for the user
        let wallet: Wallet;
        try {
            wallet = await Wallet.createNewWalletForUser(createdUser.id);
        } catch (ex) {
            console.log("Error al crear la wallet del usuario")
            Monitor.exception(ex);
            response.status(INTERNAL_SERVER_ERROR);
            response.json({ error_message: ex.message });
            return;
        }


        const tx_hash = await trigger(false, "grantAdmin", [wallet.getPublicKey()], "");
       
        response.status(OK);
        response.json({ uid: createdUser.id, success:true, tx_hash: tx_hash});
    }

    /**
    * @typedef EmailVerifyRequest
    * @property {string} uid - User ID
    * @property {string} verification - Verification code
    */

    /**
    * @typedef EmailVerifyResponse
    * @property {string} status - Status:
    *  - VERIFIED: Account was verified
    *  - ALREADY_VERIFIED: Account was already verified
    */

    /**
    * Sends request to verify an account
    * @route POST /auth/email/verify
    * @group auth
    * @param {EmailVerifyRequest.model} request.body - Request body
    * @returns {void} 400 - Invalid verification code
    * @returns  {EmailVerifyResponse.model} 200 - Success
    */
    public async verifyEmail(request: Express.Request, response: Express.Response) {
        const uid = request.body.uid || "";
        const verification = request.body.verification || "";

        const usertoVerify = await User.findUserByUID(uid);

        if (usertoVerify && usertoVerify.email && !usertoVerify.emailVerified && secureStringCompare(usertoVerify.emailVerificationCode, verification)) {
            usertoVerify.emailVerified = true;
            usertoVerify.emailVerificationCode = "";

            await usertoVerify.save();

            response.status(OK);
            response.json({ status: "VERIFIED" });
        } else if (usertoVerify && usertoVerify.emailVerified) {
            response.status(OK);
            response.json({ status: "ALREADY_VERIFIED" });
        } else {
            response.status(NOT_FOUND);
            response.json({ error_code: "INVALID_VERIFICATION_CODE" });
        }
    }

}
