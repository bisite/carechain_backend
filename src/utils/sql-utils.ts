/// SQL utils

"use strict";

import { Monitor } from "../monitor";

export function toMySQLName(camel: string) {
    let result = "";
    for (let i = 0; i < camel.length; i++) {
        const c = camel.charAt(i);

        if (c.toLowerCase() !== c) {
            result += "_" + c.toLowerCase();
        } else {
            result += c;
        }
    }
    return result;
}

export function toCamelCase(sqlName: string) {
    let result = "";
    let nextUpper = false;
    for (let i = 0; i < sqlName.length; i++) {
        const c = sqlName.charAt(i);
        if (c === "_") {
            nextUpper = true;
        } else {
            if (nextUpper) {
                result += c.toUpperCase();
            } else {
                result += c.toLowerCase();
            }
            nextUpper = false;
        }
    }
    return result;
}

export function reverseRegexp(exp: RegExp): string {
    const source = exp.source;
    let result = "";
    let nextEscape = false;
    for (let i = 0; i < source.length; i++) {
        const c = source.charAt(i);

        if (c === "\\") {
            if (nextEscape) {
                nextEscape = false;
                result += c;
            } else {
                nextEscape = true;
            }
        } else {
            nextEscape = false;
            result += c;
        }
    }
    return result;
}

export function replaceLikeWildcards(str): string {
    return str.replace(/[\%]/g, "\\%").replace(/[\_]/g, "\\_");
}

export function mongoToSQL(mongoFilter): { query: string; values: any[] } {
    let query = "";
    const values = [];

    if (!mongoFilter || Object.keys(mongoFilter).length === 0) {
        return { query: "", values: [] };
    }

    if (mongoFilter.$and) {
        let first = true;
        for (const subCondition of mongoFilter.$and) {
            const child = mongoToSQL(subCondition);

            if (child.query.length > 0) {

                if (first) {
                    first = false;
                } else {
                    query += " AND ";
                }

                query += "( " + child.query + " )";
                for (const sv of child.values) {
                    values.push(sv);
                }
            }
        }
    } else if (mongoFilter.$or) {
        let first = true;
        for (const subCondition of mongoFilter.$or) {
            const child = mongoToSQL(subCondition);

            if (child.query.length > 0) {

                if (first) {
                    first = false;
                } else {
                    query += " OR ";
                }

                query += "( " + child.query + " )";
                for (const sv of child.values) {
                    values.push(sv);
                }
            }
        }
    } else if (mongoFilter.$not) {
        const child = mongoToSQL(mongoFilter.$not);

        if (child.query.length > 0) {
            query = "NOT( " + child.query + " )";
            for (const sv of child.values) {
                values.push(sv);
            }
        }
    } else {
        // Single (AND)

        let fsrt = true;

        for (const field of Object.keys(mongoFilter)) {
            const val = mongoFilter[field];

            if (fsrt) {
                fsrt = false;
            } else {
                query += " AND ";
            }

            if (val !== null && val instanceof RegExp) {
                // Regular expression
                const rStr = reverseRegexp(val);

                if (val.flags.indexOf("i") >= 0) {
                    query += "UPPER(`" + toMySQLName(field) + "`) LIKE UPPER(?)";
                } else {
                    query += "`" + toMySQLName(field) + "` LIKE ?";
                }

                if (rStr.startsWith("^")) {
                    // Ends with
                    values.push("%" + replaceLikeWildcards(rStr.substr(1)));
                } else if (rStr.endsWith("$")) {
                    // Starts with
                    values.push(replaceLikeWildcards(rStr.substr(0, rStr.length - 1)) + "%");
                } else {
                    // Contains
                    values.push("%" + replaceLikeWildcards(rStr) + "%");
                }
            } else if (val !== null && typeof val === "object") {
                // Complex
                if (val.$eq !== undefined) {
                    if (val.$eq === null) {
                        query += "`" + toMySQLName(field) + "` IS NULL";
                    } else {
                        query += "`" + toMySQLName(field) + "` = ?";
                        values.push(val.$eq);
                    }
                } else if (val.$ne !== undefined) {
                    query += "`" + toMySQLName(field) + "` != ?";
                    values.push(val.$ne);
                } else if (val.$gt !== undefined) {
                    query += "`" + toMySQLName(field) + "` > ?";
                    values.push(val.$gt);
                } else if (val.$gte !== undefined) {
                    query += "`" + toMySQLName(field) + "` >= ?";
                    values.push(val.$gte);
                } else if (val.$lt !== undefined) {
                    query += "`" + toMySQLName(field) + "` < ?";
                    values.push(val.$lt);
                } else if (val.$lte !== undefined) {
                    query += "`" + toMySQLName(field) + "` <= ?";
                    values.push(val.$lte);
                } else if (val.$exists !== undefined) {
                    if (val.$exists) {
                        query += "`" + toMySQLName(field) + "` IS NOT NULL";
                    } else {
                        query += "`" + toMySQLName(field) + "` IS NULL";
                    }
                } else if (val.$in !== undefined) {
                    let subquery = "";
                    let first = true;
                    for (const v of val.$in) {
                        if (first) {
                            first = false;
                        } else {
                            subquery += " OR ";
                        }
                        subquery += "(`" + toMySQLName(field) + "` = ?)";
                        values.push(v);
                    }
                    if (subquery.length > 0) {
                        query += "(" + subquery + ")";
                    }
                } else {
                    query += "1";
                }
            } else {
                // EQ
                if (val !== null) {
                    query += "`" + toMySQLName(field) + "` = ?";
                    values.push(val);
                } else {
                    query += "`" + toMySQLName(field) + "` IS NULL";
                }
            }
        }
    }

    return { query, values };
}

export function toSQLCompatibleValue(val: any) {
    if (val === null || val === undefined) {
        return null;
    } else if (typeof val === "object") {
        return "~" + JSON.stringify(val);
    } else if (typeof val === "string") {
        if (val.length > 0 && val.charAt(0) === "~") {
            return "~" + val;
        } else {
            return val;
        }
    } else if (typeof val === "number") {
        return val;
    } else if (typeof val === "boolean") {
        return val ? 1 : 0;
    } else {
        Monitor.warning("Unrecognized type: " + (typeof val));
        return null;
    }
}

export function toTypescriptFromSQL(val: any) {
    if (val === null || val === undefined) {
        return null;
    } else if (typeof val === "number") {
        return val;
    } else if (typeof val === "string") {
        if (val.length > 0 && val.charAt(0) === "~") {
            if (val.charAt(1) !== "~") {
                try {
                    return JSON.parse(val.substr(1));
                } catch (ex) {
                    return null;
                }
            } else {
                return val.substr(1);
            }
        } else {
            return val;
        }
    } else {
        return val;
    }
}

export function normalizeSQLResults(results: any[]) {
    const trueResults = [];

    for (const result of results) {
        const r: any = {};

        for (const key of Object.keys(result)) {
            r[toCamelCase(key)] = toTypescriptFromSQL(result[key]);
        }

        trueResults.push(r);
    }

    return trueResults;
}
