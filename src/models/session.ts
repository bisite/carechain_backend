// Session

"use strict";

import { Config } from "../config";
import { User } from "./user";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, GenericRow } from "tsbean-orm";
import { createRandomSemiAuthToken, secureStringCompare, splitSemiAuthTokens } from "../utils/text-utils";

const SESSIONS_COLLECTION_NAME = "sessions";

const SESSION_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 1 day
const SESSION_TFA_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Represents a session.
 */
export class Session extends DataModel {

    public static finder = new DataFinder<Session>(DataSource.DEFAULT, SESSIONS_COLLECTION_NAME, "id", function (data: any) {
        return new Session(data);
    });

    public static async findSecure(token: string): Promise<Session> {
        const data = splitSemiAuthTokens(token);
        const res = await Session.finder.findByKey(data.id);
        if (!res) {
            return null;
        }
        if (!secureStringCompare(res.secret, data.secret)) {
            return null;
        }
        return res;
    }

    /**
     * Finds all the session of an user.
     * @param uid User ID
     */
    public static async findSessionsByUser(uid: string): Promise<Session[]> {
        const data = await Session.finder.find(DataFilter.equals("uid", uid), OrderBy.nothing());
        if (data) {
            const sessions = [];

            for (const s of data) {
                if (s.hasExpired() || !s.remote) {
                    await s.delete();
                } else {
                    sessions.push(s);
                }
            }

            return sessions;
        } else {
            return [];
        }
    }

    /**
     * Finds a session from a request.
     * @param request The request.
     */
    public static async fromRequest(request: any, ignoreTfa?: boolean): Promise<Session> {
        
        const remoteAddress = (request.headers["x-forwarded-for"] || request.connection.remoteAddress) + "";
        try {
            const sid = request.method !== "GET" ? request.headers["x-session-id"] : request.headers["x-session-id"] || request.cookies.session_id;
            if (sid) {
                const session = await Session.findSecure(sid);
                if (session !== null) {
                    if (session.hasExpired() || !session.remote) {
                        // Expired. Delete it.
                        session.delete();
                        return Promise.resolve(null);
                    } else if (!Config.getInstance().sessionBindingDisabled && session.remote !== remoteAddress) {
                        // Not the same IP address
                        return Promise.resolve(null);
                    } else {
                        if (!ignoreTfa && session.tfaPending) {
                            // You must provide two factor authentication
                            return Promise.resolve(null);
                        } else {
                            // Valid session
                            return session;
                        }
                    }
                } else {
                    // Session not found
                    return Promise.resolve(null);
                }
            } else {
                // Session token not provided
                return Promise.resolve(null);
            }
        } catch (ex) {
            // Database error
            return Promise.resolve(null);
        }
    }

    /**
     * Closes all sessions of an user
     * @param user The user
     */
    public static async closeSessions(user: User) {
        return Session.finder.delete(DataFilter.equals("uid", user.id));
    }

    /**
     * Creates a new session.
     * @param user The user.
     * @param expires True if the session expires, false if it should persist.
     */
    public static async createSession(user: User, expires: boolean, remoteAddress: string, os: string, browser: string): Promise<Session> {
        const session: Session = new Session({
            id: createRandomSemiAuthToken(),
            secret: createRandomSemiAuthToken(),
            uid: user.id,
            created: Date.now(),
            expiration: (expires ? (Date.now() + SESSION_EXPIRATION_TIME) : -1),
            //            tfaPending: user.tfa,
            remote: remoteAddress,
            os,
            browser,
        });
        try {
            await session.insert();
        } catch (ex) {
            return Promise.reject(ex);
        }

        return Promise.resolve(session);
    }

    public id: string;
    public secret: string;
    public uid: string;
    public created: number;
    public expiration: number;

    public tfaPending: boolean;

    public remote: string;
    public browser: string;
    public os: string;

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, SESSIONS_COLLECTION_NAME, "id");

        this.id = data.id || "";
        this.secret = data.secret || "";
        this.uid = data.uid || "";
        this.created = data.created || 0;
        this.expiration = data.expiration || 0;

        this.tfaPending = !!data.tfaPending;

        this.remote = data.remote || "";
        this.browser = data.browser || "";
        this.os = data.os || "";

        this.init();
    }

    /**
     * @returns true if the session is expired, false if it is still valid.
     */
    public hasExpired(): boolean {
        return (this.expiration > 0 && Date.now() > this.expiration) || (this.tfaPending && Date.now() - this.created > SESSION_TFA_EXPIRATION_TIME);
    }

    /**
     * @returns The session token
     */
    public getSession(): string {
        return this.id + this.secret;
    }

    /**
     * Finds the user associated with this session.
     */
    public async findUser(): Promise<User> {
        try {
            return await User.findUserByUID(this.uid);
        } catch (ex) {
            return Promise.resolve(null);
        }
    }
}