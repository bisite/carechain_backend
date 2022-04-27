// User Model

"use strict";

import Crypto from "crypto";
import { Config } from "../config";
import { createRandomUID } from "../utils/text-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, GenericRow } from "tsbean-orm";

const USER_COLLECTION_NAME = "users";

const SALT_LENGTH_BYTES = 16;

const MIN_USER_NAME_LENGTH = 3;
const MAX_USER_NAME_LENGTH = 20;

const PASSWORD_RESET_EXPIRATION = 2 * 60 * 60 * 1000;

/**
 * Represents an user.
 */
export class User extends DataModel {

    public static finder = new DataFinder<User>(DataSource.DEFAULT, USER_COLLECTION_NAME, "id", function (data: any) {
        return new User(data);
    });

    public static async figureName(uid: string) {
        if (!uid) {
            return "(System)";
        }
        const user = await User.findUserByUID(uid);
        if (user) {
            return user.getName();
        } else {
            return "(deleted user)";
        }
    }

    /**
     * Finds an user by email or username
     * @param inputName Either the username or the email
     * @param callback The callback
     */
    public static async findUser(inputName: string): Promise<User> {
        const users = await User.finder.find(
            DataFilter.or(
                DataFilter.equals("usernameLowerCase", ("" + inputName).toLowerCase()),
                DataFilter.equals("email", "" + inputName),
            ),
            OrderBy.nothing(),
        );
        return users[0] || null;
    }


    public static async findAllUsers(inputName: string): Promise<User[]> {
        const users = await User.finder.find(
            DataFilter.or(
                DataFilter.equals("usernameLowerCase", ("" + inputName).toLowerCase()),
                DataFilter.equals("email", "" + inputName),
            ),
            OrderBy.nothing(),
        );
        return users || null;
    }


    public static async countAll(onlyemail: boolean): Promise<number> {
        if (onlyemail) {
            return User.finder.count(DataFilter.equals("type", "email"));
        } else {
            return User.finder.count(DataFilter.any());
        }
    }

    public static async findAdministrators(): Promise<User[]> {
        return User.finder.find(
            DataFilter.equals("globalAdmin", true),
            OrderBy.nothing(),
        );
    }

    public static async findAll(onlyemail: boolean, skip: number, limit: number): Promise<User[]> {
        const filter = onlyemail ? DataFilter.equals("type", "email") : DataFilter.any();
        return User.finder.find(
            filter,
            OrderBy.nothing(),
            SelectOptions.configure().setFirstRow(skip).setMaxRows(limit).fetchOnly(['id', 'username', 'name', 'surname', 'type', 'tpUsername', 'email', 'tpEmail', 'globalAdmin', 'created']),
        );
    }

    public static async search(onlyemail: boolean, inputName: string, skip: number, limit: number): Promise<User[]> {
        const filter = onlyemail ? DataFilter.equals("type", "email") : DataFilter.any();
        return User.finder.find(
            DataFilter.and(
                filter,
                DataFilter.or(
                    DataFilter.contains("username", inputName, true),
                    DataFilter.contains("fullName", inputName, true),
                    DataFilter.contains("tpUsername", inputName, true)
                ),
            ),
            OrderBy.nothing(),
            SelectOptions.configure().setFirstRow(skip).setMaxRows(limit).fetchOnly(['id', 'username', 'type', 'tpUsername', 'email', 'tpEmail', 'tfa', 'globalAdmin', 'created']),
        );
    }

    public static async searchCount(onlyemail: boolean, inputName: string): Promise<number> {
        const filter = onlyemail ? DataFilter.equals("type", "email") : DataFilter.any();
        return User.finder.count(
            DataFilter.and(
                filter,
                DataFilter.or(
                    DataFilter.contains("username", inputName, true),
                    DataFilter.contains("fullName", inputName, true),
                    DataFilter.contains("tpUsername", inputName, true)
                ),
            )
        );
    }


    public static async getAllUsers(): Promise<User[]> {
        return User.finder.find(
            DataFilter.any(),
        );
    }

    /**
     * Finds users.
     * @param inputName The username or email (first or third-party)
     * @param callback The callback
     */
    public static async searchUsers(organization: string, inputName: string, skip: number, limit: number): Promise<User[]> {
        return User.finder.find(
            DataFilter.and(
                DataFilter.equals("organization", organization),
                DataFilter.or(
                    DataFilter.contains("username", inputName, true),
                    DataFilter.contains("fullName", inputName, true),
                    DataFilter.contains("tpUsername", inputName, true)
                ),
            ),
            OrderBy.nothing(),
            SelectOptions.configure().setFirstRow(skip).setMaxRows(limit),
        );
    }

    /**
     * Finds an user by  username
     * @param username The username
     * @param callback The callback
     */
    public static async findUserByUsername(username: string): Promise<User> {
        const users = await User.finder.find(
            DataFilter.equals("usernameLowerCase", ("" + username).toLowerCase()),
            OrderBy.nothing(),
        );
        return users[0] || null;
    }

    /**
     * Finds an user by its UID.
     * @param uid The user identifier.
     */
    public static async findUserByUID(uid: string): Promise<User> {
        return User.finder.findByKey(uid);
    }

    /**
     * Validates an username.
     * @param name The username.
     * @returns True if the username is valid, false if it is invalid.
     */
    public static validateUserName(name: string) {
        if (name.length < MIN_USER_NAME_LENGTH || name.length > MAX_USER_NAME_LENGTH) {
            return false;
        }
        if (!(/^[a-z0-9\s_]+$/i).test(name)) {
            return false;
        }

        return true;
    }

    /**
     * Registers an user with basic credentials (email, username and password)
     * @param email The email.
     * @param username The username.
     * @param password The password.
     * @param country The country
     */
    public static async registerWithBasicCredentials(email: string, username: string, password: string): Promise<User> {
        const passwdSalt = randomSalt();
        const user: User = new User({
            id: createRandomUID(),
            type: "email",
            email,
            emailVerified: Config.getInstance().emailValidationDisabled,
            emailVerificationCode: createRandomUID(),
            username,
            passwordHash: computePasswordHash(password, passwdSalt),
            passwordSalt: passwdSalt,
        });

        try {
            await user.insert();
        } catch (ex) {
            return Promise.reject(ex);
        }

        return Promise.resolve(user);
    }

    /**
     * Registers an user with credentials (email, username, password, name, lastname, birth_date, gender)
     * @param email The email.
     * @param username The username.
     * @param password The password.
     * @param name The name
     * @param lastname The lastname
     * @param birth_date The birth date
     * @param gender The gender
     */
    public static async registerWithCredentials(email: string, username: string, password: string, name: string, surname: string, birth_date: string, gender: string): Promise<User> {
        const passwdSalt = randomSalt();
        const user: User = new User({
            id: createRandomUID(),
            type: "email",
            email,
            emailVerified: Config.getInstance().emailValidationDisabled,
            emailVerificationCode: createRandomUID(),
            username,
            name,
            surname,
            birth_date,
            gender,
            passwordHash: computePasswordHash(password, passwdSalt),
            passwordSalt: passwdSalt,
            role: 0
        });

        try {
            await user.insert();
        } catch (ex) {
            return Promise.reject(ex);
        }

        return Promise.resolve(user);
    }

    /**
     * Registers an user with github.
     * @param username The username (github@{id}).
     * @param name The github username.
     * @param email The email.
     */
    public static async registerWithThirdParty(type: string, username: string, name: string, email: string): Promise<User> {
        const user: User = new User({
            id: createRandomUID(),
            type,
            emailVerified: false,
            username,
            email: "#" + username + "#",
            tpEmail: email,
            tpUsername: name,
        });

        try {
            await user.insert();
        } catch (ex) {
            return Promise.reject(ex);
        }

        return Promise.resolve(user);
    }

    public id: string;
    public type: string;
    public role: number;

    // Email/Username and password account
    public email: string;
    public username: string;
    public usernameLowerCase: string;
    public emailVerified: boolean;
    public emailVerificationCode: string;
    public passwordHash: string;
    public passwordSalt: string;
    public passwordResetCode: string;
    public passwordResetExpiration: number;

    // Basic info
    public name: string;
    public surname: string;
    public birth_date: number;
    public gender: string;
    public country: number;
    public id_type: string;
    public identifier_card: string;
    public created_at: string;
    public last_edited: number;
    public terms_acepted: number;
    public member_get_member: number;
    public email_consent:  boolean;
    public language_contract: number;
   

    // Picture
    public picture: string;

    // Thrird party login
    public tpEmail: string;
    public tpUsername: string;

    // Global admin
    public userType: string; 
    public banned: boolean;

    // Two-factor authentication
    public tfa: boolean;
    public tfaSecret: string;

    // Creation timestamp
    public created: number;

    public lastAccess: number;

    // Constructor

    constructor(data: GenericRow) {
        super(DataSource.DEFAULT, USER_COLLECTION_NAME, "id");

        this.id = data.id;
        this.type = data.type;

        this.email = data.email || "";
        this.username = data.username || "";
        this.usernameLowerCase = this.username.toLowerCase();
        this.passwordHash = data.passwordHash || "";
        this.passwordSalt = data.passwordSalt || "";
        this.emailVerified = !!data.emailVerified;
        this.emailVerificationCode = data.emailVerificationCode || "";
        this.passwordResetCode = data.passwordResetCode || "";
        this.passwordResetExpiration = data.passwordResetExpiration || "";

        this.tpEmail = data.tpEmail;
        this.tpUsername = data.tpUsername;

        this.name = data.name || "";
        this.surname = data.surname || "";
        this.birth_date = data.birth_date;
        this.gender = data.gender;
        this.country = data.country;
        this.id_type = data.id_type;
        this.identifier_card = data.identifier_card;
        this.created_at = data.created_at;
        this.last_edited = data.last_edited;
        this.terms_acepted = data.terms_acepted;
        this.member_get_member = data.member_get_member;
        this.email_consent = data.email_consent;
        this.language_contract = data.language_contract;
        this.picture = data.picture || "";
        this.lastAccess = data.lastAccess || 0;
 
        this.userType = "user";
        this.banned = !!data.banned;

        this.tfa = !!data.tfa;
        this.tfaSecret = data.tfaSecret || "";

        this.created = parseInt(data.created, 10) || 0;

        this.init();
    }

    /**
     * Checks the user's password.
     * @param password The password.
     */
    public ckeckPassword(password: string): boolean {
        return checkPassword(this.passwordHash, this.passwordSalt, password);
    }

    /**
     * Returns the username to display.
     */
    public getName(): string {
        switch (this.type) {
        case "github":
            return this.tpUsername;
        case "facebook":
            return this.tpUsername;
        case "google":
            return this.tpUsername;
        case "amazon":
            return this.tpUsername;
        default:
            return this.username;
        }
    }

    /**
     * Returns the email to display.
     */
    public getEmail(): string {
        switch (this.type) {
        case "github":
            return this.tpEmail;
        case "facebook":
            return this.tpEmail;
        case "google":
            return this.tpEmail;
        case "amazon":
            return this.tpEmail;
        default:
            return this.email;
        }
    }

    /**
     * Returns the URL for changing the password.
     */
    public getPasswordChangeURI(): string {
        switch (this.type) {
        case "facebook":
            return "https://www.facebook.com/settings?tab=security";
        case "google":
            return "https://myaccount.google.com/security";
        case "amazon":
            return "https://www.amazon.es/gp/css/homepage.html";
        case "github":
            return "https://github.com/settings/admin";
        default:
            return "";
        }
    }

    /**
     * Generates a new code for changing the password
     */
    public async generateResetCode() {
        this.passwordResetCode = createRandomUID();
        this.passwordResetExpiration = Date.now() + PASSWORD_RESET_EXPIRATION;
        await this.save();
    }

    /**
     * Changes the user password.
     * @param password The new password
     */
    public async changePassword(password: string) {
        this.passwordSalt = randomSalt();
        this.passwordHash = computePasswordHash(password, this.passwordSalt);
        this.passwordResetExpiration = 0;
        await this.save();
    }
}

/**
 * Generates a random salt.
 * @returns A random salt.
 */
function randomSalt(): string {
    return Crypto.randomBytes(SALT_LENGTH_BYTES).toString("hex");
}

/**
 * Computes the hash of a password.
 * @param password The password.
 * @param salt The salt.
 * @returns The password hash
 */
function computePasswordHash(password: string, salt: string): string {
    const hash = Crypto.createHash("sha256");
    hash.update(password, "utf8");
    hash.update(salt, "utf8");
    return hash.digest().toString("hex");
}

/**
 * Checks a password.
 * @param passwordHash The password hash.
 * @param passwordSalt The salt.
 * @param password The input password.
 * @returns true if the password is valid, false if it is invalid.
 */
function checkPassword(passwordHash: string, passwordSalt: string, password: string): boolean {
    try {
        return Crypto.timingSafeEqual(Buffer.from(computePasswordHash(password, passwordSalt), 'hex'), Buffer.from(passwordHash, 'hex'));
    } catch (ex) {
        return false;
    }
}