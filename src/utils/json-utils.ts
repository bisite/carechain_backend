/* JSON utils */

"use strict";

export function makeUnique(arr: string[]) {
    const temp: any = {};
    for (const v of arr) {
        temp[v] = true;
    }
    return Object.keys(temp).sort();
}

export function isArray(obj: any): boolean {
    return (obj instanceof Array);
}

export function objectKeysNumeric(obj: any): number[] {
    if (obj === null) {
        return null;
    }
    const res = [];
    for (const k of Object.keys(obj)) {
        res.push(Number(k));
    }
    return res;
}

export function arrayToObject(arr: any[], val: any): any {
    if (arr === null) {
        return null;
    }
    const obj: any = {};
    for (const k of arr) {
        obj[k] = val;
    }
    return obj;
}

const QUERY_TREE_MAX_DEPH = 4;
const QUERY_TREE_MAX_CHILDREN = 16;

export interface QueryTree {
    type: string;
    operation: string;
    left: number;
    right: string;
    children: QueryTree[];
}

export function forceArrayString(arr: any, maxLength: number, maxStringLength: number) {
    const sanitized = [];

    if (typeof arr === "object" && arr instanceof Array) {
        for (let i = 0; i < arr.length && i < maxLength; i++) {
            let str = "" + arr[i];
            if (str.length > maxStringLength) {
                str = str.substr(0, maxStringLength);
            }
            sanitized.push(str);
        }
    }

    return sanitized;
}

export function limitStringSize(str: string, limit: number): string {
    str = str + "";
    if (str.length > limit) {
        return str.substr(0, limit);
    } else {
        return str;
    }
}

export function sanitizeQueryTree(tree: any, depth?: number): QueryTree {
    depth = depth || 0;
    const sanitized: QueryTree = {
        type: "anyof",
        operation: "",
        left: -1,
        right: "",
        children: [],
    };

    if (typeof tree === "object") {
        let type = ("" + tree.type).toLowerCase();

        if (!["single", "one", "anyof", "allof", "not"].includes(type)) {
            type = "anyof";
        }

        sanitized.type = type;

        let operation = ("" + tree.operation).toLowerCase();

        if (!["null", "eq", "lt", "le", "lte", "gt", "ge", "gte", "cn", "cni", "sw", "swi", "ew", "ewi"].includes(operation)) {
            operation = "";
        }

        sanitized.operation = operation;

        let left = -1;
        if (typeof tree.left === "number") {
            left = Math.floor(tree.left);
        }

        sanitized.left = left;

        if (tree.right === null) {
            sanitized.right = null;
        } else {
            let right = "" + tree.right;

            if (right.length > 1024) {
                right = right.substr(0, 1024);
            }

            sanitized.right = right;
        }

        if (depth < QUERY_TREE_MAX_DEPH && (type in { anyof: 1, allof: 1, not: 1 }) && typeof tree.children === "object" && tree.children instanceof Array) {
            for (let i = 0; i < tree.children.length && i < QUERY_TREE_MAX_CHILDREN; i++) {
                sanitized.children.push(sanitizeQueryTree(tree.children[i], depth + 1));
            }
        }
    }

    return sanitized;
}

export function sanitizeDashboardFilter(tree: any, depth?: number): any {
    depth = depth || 0;
    const sanitized = {
        type: "anyof",
        operation: "",
        left: -1,
        rightType: "value",
        rightName: "",
        right: "",
        rightDefaultValue: "",
        children: [],
    };

    if (typeof tree === "object") {
        let type = ("" + tree.type).toLowerCase();

        if (!["single", "one", "anyof", "allof", "not"].includes(type)) {
            type = "anyof";
        }

        sanitized.type = type;

        let operation = ("" + tree.operation).toLowerCase();

        if (!["null", "eq", "lt", "le", "lte", "gt", "ge", "gte", "cn", "cni", "sw", "swi", "ew", "ewi"].includes(operation)) {
            operation = "";
        }

        sanitized.operation = operation;

        let left = -1;
        if (typeof tree.left === "number") {
            left = Math.floor(tree.left);
        }

        sanitized.left = left;

        let rightType = ("" + tree.rightType).toLowerCase();
        if (rightType !== "var") {
            rightType = "value";
        }
        sanitized.rightType = rightType;

        sanitized.rightName = limitStringSize("" + tree.rightName, 255);
        sanitized.rightDefaultValue = limitStringSize("" + tree.rightDefaultValue, 255);

        if (tree.right === null) {
            sanitized.right = null;
        } else {
            let right = "" + tree.right;

            if (right.length > 1024) {
                right = right.substr(0, 1024);
            }

            sanitized.right = right;
        }

        if (depth < QUERY_TREE_MAX_DEPH && (type in { anyof: 1, allof: 1, not: 1 }) && typeof tree.children === "object" && tree.children instanceof Array) {
            for (let i = 0; i < tree.children.length && i < QUERY_TREE_MAX_CHILDREN; i++) {
                sanitized.children.push(sanitizeDashboardFilter(tree.children[i], depth + 1));
            }
        }
    }

    return sanitized;
}

export function sanitizeDashboardFilterComponent(tree: any, depth?: number): any {
    depth = depth || 0;
    const sanitized = {
        type: "anyof",
        operation: "",
        left: -1,
        rightType: "value",
        rightName: "",
        right: "",
        rightDefaultValue: "",
        children: [],
    };

    if (typeof tree === "object") {
        let type = ("" + tree.type).toLowerCase();

        if (!["single", "one", "anyof", "allof", "not"].includes(type)) {
            type = "anyof";
        }

        sanitized.type = type;

        let operation = ("" + tree.operation).toLowerCase();

        if (!["null", "eq", "lt", "le", "lte", "gt", "ge", "gte", "cn", "cni", "sw", "swi", "ew", "ewi"].includes(operation)) {
            operation = "";
        }

        sanitized.operation = operation;

        let left = -1;
        if (typeof tree.left === "number") {
            left = Math.floor(tree.left);
        }

        sanitized.left = left;

        let rightType = ("" + tree.rightType).toLowerCase();
        if (rightType !== "user") {
            rightType = "value";
        }
        sanitized.rightType = rightType;

        sanitized.rightName = limitStringSize("" + tree.rightName, 255);
        sanitized.rightDefaultValue = limitStringSize("" + tree.rightDefaultValue, 255);

        if (tree.right === null) {
            sanitized.right = null;
        } else {
            let right = "" + tree.right;

            if (right.length > 1024) {
                right = right.substr(0, 1024);
            }

            sanitized.right = right;
        }

        if (depth < QUERY_TREE_MAX_DEPH && (type in { anyof: 1, allof: 1, not: 1 }) && typeof tree.children === "object" && tree.children instanceof Array) {
            for (let i = 0; i < tree.children.length && i < QUERY_TREE_MAX_CHILDREN; i++) {
                sanitized.children.push(sanitizeDashboardFilter(tree.children[i], depth + 1));
            }
        }
    }

    return sanitized;
}

export const VARCHAR = { $type: "string", $length: 255 };
export const TEXTCHAR = { $type: "string" };
export const NUMBER = "number";
export const BOOLEAN = "boolean";

/**
 * Sanitized JSON, removing arbitrary properties.
 * @param json Input JSON
 * @param schema Schema to follow
 */
export function sanitizeJSON(json: any, schema: any) {
    let type = "";
    let format = "";
    let min;
    let max;
    let enumOpts;
    let finite = false;
    let nan = false;
    let defaultVal;
    let maxLength;

    if (typeof schema === "string") {
        // Default options of type
        type = schema;
    } else if (typeof schema === "object") {
        if (typeof schema.$type === "string") {
            type = schema.$type;
            format = schema.$format;
            min = schema.$min;
            max = schema.$max;
            enumOpts = schema.$enum;
            finite = schema.$finite;
            nan = schema.$nan;
            defaultVal = schema.$default;
            maxLength = schema.$length;
        } else {
            type = "object";
        }
    } else if (typeof schema === "function") {
        return schema(json);
    } else {
        throw new Error("Invalid schema. Schema must be string or object.");
    }

    switch (type) {
    case "string": {
        let value = "" + json;

        if (maxLength !== undefined) {
            if (value.length > maxLength) {
                value = value.substr(0, maxLength);
            }
        }

        if (enumOpts !== undefined) {
            if (enumOpts.indexOf(value) === -1) {
                if (defaultVal !== undefined) {
                    value = defaultVal;
                } else if (enumOpts.length > 0) {
                    value = enumOpts[0];
                } else {
                    value = "";
                }
            }
        }

        return value;
    }
    case "boolean": {
        if (typeof json === "boolean") {
            return json;
        } else {
            if (defaultVal !== undefined) {
                return defaultVal;
            } else {
                return false;
            }
        }
    }
    case "number": {
        let value = Number(json);

        if (format === "integer") {
            value = Math.floor(value);
        }

        if (isNaN(value)) {
            if (nan === false) {
                if (defaultVal !== undefined) {
                    value = defaultVal;
                } else {
                    value = 0;
                }
            }
        }

        if (!isFinite(value)) {
            if (finite === true) {
                if (defaultVal !== undefined) {
                    value = defaultVal;
                } else {
                    value = 0;
                }
            }
        }

        if (min !== undefined) {
            value = Math.max(min, value);
        }

        if (max !== undefined) {
            value = Math.min(max, value);
        }

        if (enumOpts !== undefined) {
            if (enumOpts.indexOf(value) === -1) {
                if (defaultVal !== undefined) {
                    value = defaultVal;
                } else if (enumOpts.length > 0) {
                    value = enumOpts[0];
                } else {
                    value = 0;
                }
            }
        }

        return value;
    }
    case "array": {
        let workingArray = [];
        const resultArray = [];
        if (typeof json === "object" && json !== null && (json instanceof Array)) {
            workingArray = json;
        }
        for (const item of workingArray) {
            resultArray.push(sanitizeJSON(item, schema.$items));
        }
        return resultArray;
    }
    default:
    // Object
    {
        let workingObject: any = {};
        const resultObject: any = {};
        if (typeof json === "object" && json !== null && !(json instanceof Array)) {
            workingObject = json;
        }
        const schemaProps = schema.$properties || schema;
        for (const key of Object.keys(schemaProps)) {
            resultObject[key] = sanitizeJSON(workingObject[key], schemaProps[key]);
        }
        return resultObject;
    }
    }
}

export function replaceID(data: any, id: string, replace: string) {
    if (data === null) {
        return null;
    } else if (data === undefined) {
        return undefined;
    } else if (typeof data === "string") {
        if (data === id) {
            return replace;
        } else {
            return data;
        }
    } else if (typeof data === "object") {
        if (data instanceof Array) {
            const res = [];
            for (const item of data) {
                res.push(replaceID(item, id, replace));
            }
            return res;
        } else {
            const res: any = {};
            for (const key of Object.keys(data)) {
                res[key] = replaceID(data[key], id, replace);
            }
            return res;
        }
    } else {
        return data;
    }
}

export function replaceIdentifiers(data: any, mapping: { [key: string]: string }) {
    for (const key of Object.keys(mapping)) {
        data = replaceID(data, key, mapping[key]);
    }
    return data;
}

export function toFlatJSON(json: any): {[key: string]: string | boolean | number | null} {
    const result: {[key: string]: string | boolean | number | null} = {};

    if (typeof json === "object" && json !== null) {
        if (json instanceof Array) {
            let i = 0;
            for (const elem of json) {
                if (typeof elem === "object" && elem !== null) {
                    const flat = toFlatJSON(elem);
                    const wasArray = elem instanceof Array;

                    for (const f of Object.keys(flat)) {
                        result["[" + i + "]" + (wasArray ? "" : ".") + f] = flat[f];
                    }
                } else {
                    result["[" + i + "]"] = elem;
                }
                i++;
            }
        } else {
            for (const k of Object.keys(json)) {
                const elem = json[k];

                if (typeof elem === "object" && elem !== null) {
                    const flat = toFlatJSON(elem);
                    const wasArray = elem instanceof Array;

                    for (const f of Object.keys(flat)) {
                        result[k + (wasArray ? "" : ".") + f] = flat[f];
                    }
                } else {
                    result[k] = json[k];
                }
            }
        }
    } else {
        return {"[0]": json};
    }

    return result;
}
