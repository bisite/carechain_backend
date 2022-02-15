// JSON sanitizer test
// Mocha | https://mochajs.org/

"use strict";

const sanitizeJSON = require("../dist/utils/json-utils").sanitizeJSON;
const Assert = require('assert');

describe("sanitizeJSON", function () {
    it("should throw Error when schema is not valid", function () {
        let error = true;

        try {
            sanitizeJSON({}, true);
            error = false;
        } catch (ex) { }

        try {
            sanitizeJSON({}, false);
            error = false;
        } catch (ex) { }

        try {
            sanitizeJSON({}, 0);
            error = false;
        } catch (ex) { }

        try {
            sanitizeJSON({}, 1);
            error = false;
        } catch (ex) { }

        Assert.strictEqual(error, true);
    });

    it("should use the schema custom function", function () {
        let usedFunction = false;
        const value = sanitizeJSON("example", function (json) {
            Assert.strictEqual(json, "example");
            usedFunction = true;
            return "example_custom";
        });

        Assert.strictEqual(usedFunction, true);
        Assert.strictEqual(value, "example_custom");
    });

    it("should always return string type if the schema dictates it", function () {
        Assert.strictEqual(typeof (sanitizeJSON("", { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON("example", { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON(0, { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON(1, { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON(true, { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON(false, { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON({}, { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON([], { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON(null, { $type: "string" })), "string");
        Assert.strictEqual(typeof (sanitizeJSON(undefined, { $type: "string" })), "string");

        Assert.strictEqual(typeof (sanitizeJSON("", "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON("example", "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON(0, "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON(1, "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON(true, "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON(false, "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON({}, "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON([], "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON(null, "string")), "string");
        Assert.strictEqual(typeof (sanitizeJSON(undefined, "string")), "string");
    });

    it("should always return number type if the schema dictates it", function () {
        Assert.strictEqual(typeof (sanitizeJSON("", { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON("example", { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON(0, { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON(1, { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON(true, { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON(false, { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON({}, { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON([], { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON(null, { $type: "number" })), "number");
        Assert.strictEqual(typeof (sanitizeJSON(undefined, { $type: "number" })), "number");

        Assert.strictEqual(typeof (sanitizeJSON("", "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON("example", "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON(0, "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON(1, "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON(true, "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON(false, "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON({}, "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON([], "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON(null, "number")), "number");
        Assert.strictEqual(typeof (sanitizeJSON(undefined, "number")), "number");
    });

    it("should always return boolean type if the schema dictates it", function () {
        Assert.strictEqual(typeof (sanitizeJSON("", { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON("example", { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(0, { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(1, { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(true, { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(false, { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON({}, { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON([], { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(null, { $type: "boolean" })), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(undefined, { $type: "boolean" })), "boolean");

        Assert.strictEqual(typeof (sanitizeJSON("", "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON("example", "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(0, "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(1, "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(true, "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(false, "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON({}, "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON([], "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(null, "boolean")), "boolean");
        Assert.strictEqual(typeof (sanitizeJSON(undefined, "boolean")), "boolean");
    });

    it("should respect string length limits", function () {
        Assert.strictEqual(
            sanitizeJSON("test short", { $type: "string", $length: 20 }),
            "test short"
        );

        Assert.strictEqual(
            sanitizeJSON("test long", { $type: "string", $length: 4 }),
            "test"
        );
    });

    it("should respect string enumeration restrictions", function () {
        Assert.strictEqual(
            sanitizeJSON("a", { $type: "string", $enum: ["a", "b", "c"] }),
            "a"
        );

        Assert.strictEqual(
            sanitizeJSON("b", { $type: "string", $enum: ["a", "b", "c"] }),
            "b"
        );

        Assert.strictEqual(
            sanitizeJSON("c", { $type: "string", $enum: ["a", "b", "c"] }),
            "c"
        );

        Assert.strictEqual(
            sanitizeJSON("a", { $type: "string", $enum: ["a", "b", "c"], $default: "b" }),
            "a"
        );

        Assert.strictEqual(
            sanitizeJSON("b", { $type: "string", $enum: ["a", "b", "c"], $default: "b" }),
            "b"
        );

        Assert.strictEqual(
            sanitizeJSON("c", { $type: "string", $enum: ["a", "b", "c"], $default: "b" }),
            "c"
        );

        Assert.strictEqual(
            sanitizeJSON("x", { $type: "string", $enum: ["a", "b", "c"] }),
            "a"
        );

        Assert.strictEqual(
            sanitizeJSON("x", { $type: "string", $enum: ["a", "b", "c"], $default: "b" }),
            "b"
        );
    });


    it("should respect number enumeration restrictions", function () {
        Assert.strictEqual(
            sanitizeJSON(1, { $type: "number", $enum: [1, 2, 5] }),
            1
        );

        Assert.strictEqual(
            sanitizeJSON(2, { $type: "number", $enum: [1, 2, 5] }),
            2
        );

        Assert.strictEqual(
            sanitizeJSON(5, { $type: "number", $enum: [1, 2, 5] }),
            5
        );

        Assert.strictEqual(
            sanitizeJSON(10, { $type: "number", $enum: [1, 2, 5] }),
            1
        );

        Assert.strictEqual(
            sanitizeJSON(10, { $type: "number", $enum: [1, 2, 5], $default: 2 }),
            2
        );
    });

    it("should respect number boundaries", function () {
        Assert.strictEqual(
            sanitizeJSON(0, { $type: "number", $min: 0, $max: 10 }),
            0
        );

        Assert.strictEqual(
            sanitizeJSON(1, { $type: "number", $min: 0, $max: 10 }),
            1
        );

        Assert.strictEqual(
            sanitizeJSON(-1, { $type: "number", $min: 0, $max: 10 }),
            0
        );

        Assert.strictEqual(
            sanitizeJSON(11, { $type: "number", $min: 0, $max: 10 }),
            10
        );

        Assert.strictEqual(
            sanitizeJSON(-Infinity, { $type: "number", $min: 0, $max: 10 }),
            0
        );

        Assert.strictEqual(
            sanitizeJSON(Infinity, { $type: "number", $min: 0, $max: 10 }),
            10
        );
    });

    it("should respect number NaN and Infinity restrictions", function () {
        Assert.ok(
            isNaN(sanitizeJSON(NaN, { $type: "number", $min: 0, $max: 10, $nan: true, $finite: false }))
        );

        Assert.ok(
            isNaN(sanitizeJSON(undefined, { $type: "number", $min: 0, $max: 10, $nan: true, $finite: false })),
        );

        Assert.strictEqual(
            sanitizeJSON(Infinity, { $type: "number", $nan: true, $finite: false }),
            Infinity
        );

        Assert.strictEqual(
            sanitizeJSON(-Infinity, { $type: "number", $nan: true, $finite: false }),
            -Infinity
        );

        Assert.strictEqual(
            sanitizeJSON(Infinity, { $type: "number", $nan: false, $finite: false }),
            Infinity
        );

        Assert.strictEqual(
            sanitizeJSON(-Infinity, { $type: "number", $nan: false, $finite: false }),
            -Infinity
        );

        Assert.strictEqual(
            sanitizeJSON(NaN, { $type: "number", $nan: false, $finite: false }),
            0
        );

        Assert.strictEqual(
            sanitizeJSON(NaN, { $type: "number", $nan: false, $finite: true }),
            0
        );

        Assert.strictEqual(
            sanitizeJSON(NaN, { $type: "number", $nan: false, $default: 5 }),
            5
        );

        Assert.strictEqual(
            sanitizeJSON(NaN, { $type: "number", $finite: true }),
            0
        );

        Assert.strictEqual(
            sanitizeJSON(NaN, { $type: "number", $finite: true, $default: 5 }),
            5
        );


        Assert.strictEqual(
            sanitizeJSON(Infinity, { $type: "number", $finite: true }),
            0
        );

        Assert.strictEqual(
            sanitizeJSON(Infinity, { $type: "number", $finite: true, $default: 5 }),
            5
        );

        Assert.strictEqual(
            sanitizeJSON(-Infinity, { $type: "number", $finite: true }),
            0
        );

        Assert.strictEqual(
            sanitizeJSON(-Infinity, { $type: "number", $finite: true, $default: 5 }),
            5
        );
    });

    it("should always return array if schema disctates it", function () {
        Assert.ok((sanitizeJSON([], { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON({}, { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON("", { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON("test", { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON(true, { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON(false, { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON(0, { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON(1, { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON(undefined, { $type: "array", $items: "string" }) instanceof Array));
        Assert.ok((sanitizeJSON(null, { $type: "array", $items: "string" }) instanceof Array));
    });

    it("should ignore extra properties not defined in schema", function () {
        const value = sanitizeJSON(
            {
                p1: "test",
                p3: 9,
            },
            {
                p1: "string",
                p2: "number",
            }
        )

        Assert.strictEqual(value.p1, "test");
        Assert.strictEqual(value.p2, 0);
        Assert.strictEqual(value.p3, undefined);
    });

    it("should apply $items schema to array items", function () {
        const testArray = ["1", "2", "3", "4", "5"];

        let value = sanitizeJSON(testArray, { $type: "array", $items: "string" });
        Assert.ok(value instanceof Array);
        Assert.strictEqual(value.length, testArray.length);
        for (let i = 0; i < value.length; i++) {
            Assert.strictEqual(value[i], testArray[i]);
        }

        value = sanitizeJSON(testArray, { $type: "array", $items: "number" });
        Assert.ok(value instanceof Array);
        Assert.strictEqual(value.length, testArray.length);
        for (let i = 0; i < value.length; i++) {
            Assert.strictEqual(typeof value[i], "number");
            Assert.strictEqual(Number(value[i]), Number(testArray[i]));
        }

        value = sanitizeJSON(testArray, { $type: "array", $items: "boolean" });
        Assert.ok(value instanceof Array);
        Assert.strictEqual(value.length, testArray.length);
        for (let i = 0; i < value.length; i++) {
            Assert.strictEqual(typeof value[i], "boolean");
        }
    });

    it("should apply nested schemas to nested objects", function () {
        let passedChildren1 = false;
        let passedChildren2 = false;
        const schema = {
            children1: function (data) {
                Assert.strictEqual(data, "children_1");
                passedChildren1 = true;
                return "children_1_custom";
            },
            children2: function (data) {
                Assert.strictEqual(data, "children_2");
                passedChildren2 = true;
                return "children_2_custom";
            },
        };

        const value = sanitizeJSON({ children1: "children_1", children2: "children_2" }, schema);

        Assert.ok(passedChildren1);
        Assert.ok(passedChildren2);

        Assert.strictEqual(typeof value, "object");
        Assert.ok(!(value instanceof Array));
        Assert.strictEqual(Object.keys(value).length, 2);
        Assert.strictEqual(value.children1, "children_1_custom");
        Assert.strictEqual(value.children2, "children_2_custom");
    });
});
