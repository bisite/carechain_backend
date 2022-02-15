// Reserved for license

"use strict";

import Crypto from "crypto";

/**
 * Removes acents and diacritics.
 * @param str   The input string
 * @returns     The normalized string
 */
export function normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Escapes html reserved characters.
 * @param html      Input HTML text.
 * @returns         The escaped text.
 */
export function escapeHTML(html: string): string {
    return ("" + html).replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;").replace(/\//g, "&#x2f;");
}

/**
 * Escapes single quotes and reverse bars
 * @param raw The raw input text
 * @returns The escaped text.
 */
export function escapeSingleQuotes(raw: string): string {
    return ("" + raw).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Escapes double quotes and reverse bars.
 * @param raw The raw input text
 * @returns The escaped text.
 */
export function escapeDoubleQuotes(raw: string): string {
    return ("" + raw).replace(/"/g, "\\\"").replace(/\\/g, "\\\\");
}

/**
 * Turns a timestamp into a formatted date.
 * @param timestamp The input timestamp.
 * @returns         The formatted date.
 */
export function formatDate(timestamp: number): string {
    const d: Date = new Date(timestamp);
    let day: string = "" + d.getDate();
    let month: string = "" + (d.getMonth() + 1);
    const year: string = "" + d.getFullYear();
    let hour: string = "" + d.getHours();
    let minutes: string = "" + d.getMinutes();
    let seconds: string = "" + d.getSeconds();

    if (day.length < 2) {
        day = "0" + day;
    }

    if (month.length < 2) {
        month = "0" + month;
    }

    if (hour.length < 2) {
        hour = "0" + hour;
    }

    if (minutes.length < 2) {
        minutes = "0" + minutes;
    }

    if (seconds.length < 2) {
        seconds = "0" + seconds;
    }

    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}

/**
 * Validates an email.
 * @param email The email
 */
export function validateEmail(email: string): boolean {
    return (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email);
}

/**
 * Escapes regular expressions espacial characters.
 * @param text The input text.
 */
export function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Creates a new random UID.
 * @returns The new UID
 */
export function createRandomUID(): string {
    return `${Crypto.randomBytes(4).toString("hex")}-${Crypto.randomBytes(4).toString("hex")}-${Crypto.randomBytes(4).toString("hex")}-${Date.now().toString(16)}`;
}

export function createRandomVerificationCode(): string {
    return `${Crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function createRandomToken(): string {
    return `${Crypto.randomBytes(32).toString("hex")}`;
}

export function createRandomAuthToken(): string {
    return `${Crypto.randomBytes(64).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

export function createRandomSequentialToken(): string {
    return `${padHex(Date.now().toString(16), 16)}${Crypto.randomBytes(12).toString("hex")}`;
}

export function createRandomSemiAuthToken(): string {
    return Crypto.randomBytes(32).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function splitSemiAuthTokens(fullToken: string): {id: string, secret: string} {
    if (fullToken.length % 2 !== 0) {
        fullToken = fullToken.substr(0, fullToken.length - 1);
    }
    return {
        id: fullToken.substr(0, fullToken.length / 2),
        secret: fullToken.substr(fullToken.length / 2),
    };
}

export function padHex(hex: string, numberDigits: number): string {
    while (hex.length < numberDigits) {
        hex = "0" + hex;
    }
    return hex;
}

export function validateName(name: string): boolean {
    if (!name) { return false; }
    if (name.length < 1 || name.length > 80) {
        return false;
    }
    return true;
}

export function sha256(input: string) {
    return Crypto.createHash("sha256").update(input).digest("hex");
}

export function forcePositive(i: number): number {
    if (i < 0) {
        return 0;
    } else {
        return i;
    }
}

export function fixNumber(str: string): number {
    str = (str + "").replace(/[\,]/g, ".");
    let f;
    let l;
    do {
        f = str.indexOf(".");
        l = str.lastIndexOf(".");
        if (f !== l) {
            str = str.replace(".", "");
        }
    } while (f !== l);

    if (str === "") {
        return null;
    }

    const n = Number(str);

    if (isNaN(n)) {
        return null;
    } else {
        return n;
    }
}

export function twoDecimals(n: number): number {
    return Math.floor(n * 100) / 100;
}

export function renderSize(bytes: number): string {
    if (bytes < 0) {
        return "-";
    }
    if (bytes >= (1024 * 1024 * 1024)) {
        return twoDecimals(bytes / (1024 * 1024 * 1024)) + " " + "GB";
    } else if (bytes >= (1024 * 1024)) {
        return twoDecimals(bytes / (1024 * 1024)) + " " + "MB";
    } else if (bytes >= (1024)) {
        return twoDecimals(bytes / (1024)) + " " + "KB";
    } else {
        return bytes + " " + "Bytes";
    }
}

export function fixURL(url: string) {
    if (url.indexOf("http:") === -1 && url.indexOf("https:")) {
        return "https:" + "//" + url;
    } else {
        return url;
    }
}

export function toISODate(timestamp: number): string {
    if (timestamp < 0) {
        return "never";
    }
    return (new Date(timestamp)).toISOString();
}

export function checkParamType(param: any, type: string) {
    if (param === undefined) {
        return true; // Not defined
    } else {
        return typeof param === type;
    }
}

export function hexWithPrefix(hex: string, pad?: number) {
    hex = (hex + "").toLowerCase();

    if (hex.substr(0, 2) !== "0x") {
        hex = "0x" + hex;
    }

    if (pad) {
        while (hex.length - 2 < pad) {
            hex = hex + "0";
        }
    }

    return hex;
}

export function hexNoPrefix(hex: string) {
    hex = (hex + "").toLowerCase();

    if (hex.substr(0, 2) !== "0x") {
        return hex;
    } else {
        return hex.substr(2);
    }
}

export function certToBase64(cert: string) {
    return cert.replace("-----BEGIN CERTIFICATE-----", "").replace("-----END CERTIFICATE-----", "").replace(/[^A-Za-z0-9+/=]/g, '').trim()
}

export function base64ToHex(base64: string) {
    return Buffer.from(base64, 'base64').toString('hex');
}

export function hexToBase64(hex: string) {
    return Buffer.from(hex, 'hex').toString('base64');
}

export function utf8ToHex(utf: string) {
    return Buffer.from(utf, 'utf8').toString('hex');
}

export function hexToUTF8(hex: string) {
    return Buffer.from(hex, 'hex').toString("utf8").replace(/\0/g, "");
}

export function base64ToPEM(b64: string): string {
    const str = [];
    
    str.push("-----BEGIN CERTIFICATE-----");

    while (b64.length > 64) {
        str.push(b64.substr(0, 64));
        b64 = b64.substr(64);
    }

    if (b64.length > 0) {
        str.push(b64);
    }

    str.push("-----END CERTIFICATE-----");

    return str.join("\n");
}

export function extractSubjectFromCert (cert) {
    const s = cert.subject.attributes;
    for (let i = 0; i < s.length; i++) {
        if (s[i].shortName === "CN") {
            return s[i].value;
        }
    }
    return "Unknown";
}

export function normalize(str): string {
    return (str + "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


export function secureStringCompare(a: string, b: string): boolean {
    try {
        return Crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
    } catch (ex) {
        return false;
    }
}
