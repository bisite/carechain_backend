// Reserved for license

import Express from "express";
import { Config } from "../config";
import { Session } from "../models/session";
import { User } from "../models/user";

/**
 * Represents a controller. Handles http requests.
 */
export class Controller {
    /**
     * Registers the handlers for the current Express application.
     * @param app The application
     */
    public register(app: Express.Express): any {
        throw new Error("Unimplemented: The register method is not implemented for this controller.");
    }

    /**
     * Gets authentication context
     * @param request Request
     * @returns The auth context
     */
    public async auth(request: Express.Request): Promise<AuthContext> {
        const result = new AuthContext();
        const session = await Session.fromRequest(request);
        if (session) {
            // Registered user
            result.session = session;
            result.user = await session.findUser();
            if (result.user) {
                result.uid = result.user.id;
            }
        } 
        return result;
    }

    /**
     * Parses the request to find the session.
     * @param request The request.
     */
    public async session(request: Express.Request, ignoreTFA?: boolean): Promise<Session> {
        return Session.fromRequest(request, ignoreTFA);
    }

    /**
     * Gets user remote address
     * @param request Request
     * @returns Remote address
     */
    public remoteAddress(request: Express.Request): string {
        if (Config.getInstance().usingProxy) {
            return (request.headers["x-forwarded-for"] || request.socket.remoteAddress) + "";
        } else {
            return request.socket.remoteAddress + "";
        }
    }

    /**
     * Gets User agent information
     * @param request Request
     * @param key 'os' or 'browser'
     * @returns User agent information
     */
    public userAgent(request: Express.Request, key: string) {
        if (!request.useragent) {
            return "";
        }
        switch (key) {
        case "os":
            return "" + request.useragent.platform + " / " + request.useragent.os;
        case "browser":
            return "" + request.useragent.browser + " / " + request.useragent.version;
        default:
            return "";
        }
    }
}

/**
 * Authentication context
 */
export class AuthContext {
    public session: Session;
    public user: User;

    /**
     * User ID (Registered or anon)
     */
    public uid: string;

    constructor() {
        this.session = null;
        this.user = null;
        this.uid = null;
    }

    /**
     * Checks if it's authenticated
     */
    public isAuthenticated() {
        return !!this.uid;
    }

    /**
     * Checks if it's a registered user
     */
    public isRegisteredUser() {
        return !!this.user;
    }

    /**
     * Gets user name
     * @returns The user name
     */
    public getUserName() {
        if (this.isRegisteredUser()) {
            return this.user.getName();
        } else {
            return "";
        }
    }

}