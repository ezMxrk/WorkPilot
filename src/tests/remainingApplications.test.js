const test = require("node:test");
const assert = require("node:assert");

const remainingApplications = require("../utils/remainingApplications");

test("should calculate remaining applications correctly", () => {
    const result = remainingApplications(20, 7);
    assert.strictEqual(result, 13);
});

test("should return 0 when sent applications exceed target", () => {
    const result = remainingApplications(20, 25);
    assert.strictEqual(result, 0);
});

test("should return 0 when sent applications are negative", () => {
    const result = remainingApplications(20, -3);
    assert.strictEqual(result, 0);
});

test("should return 0 when target is negative", () => {
    const result = remainingApplications(-10, 3);
    assert.strictEqual(result, 0);
});

test("should return 0 when target is reached", () => {
    const result = remainingApplications(20, 20);
    assert.strictEqual(result, 0);
});