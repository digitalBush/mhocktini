import {describe, it} from "node:test";
import assert from "node:assert/strict";
import mock from "../index.js";

describe("shallow (default)", () => {
	it("should stop mocking after one level", async () => {
		const a = await mock("./scenarios/linear/a.js", {
			"./b.js": {
				default: {mocked: "default"},
				named: {mocked: "named"}
			}
		});

		assert.deepEqual(a.default, {
			a: true,
			mocked: "default"
		});

		assert.deepEqual(a.named, {
			a: "a",
			mocked: "named"
		});
	});

	it("should only mock reused module one level deep", async () => {
		const a = await mock("./scenarios/linear/a.js", {
			"node:path": {
				default: {
					basename: () => "mocked"
				}
			}
		});

		assert.deepEqual(a.default, {
			a: true,
			b: true,
			c: true
		});

		assert.deepEqual(a.named, {
			a: "mocked", // shallow only intercepted this one.
			b: "b",
			c: "c"
		});
	});

	it("should fail with late dynamic import", async () => {
		const a = await mock("./scenarios/dynamic/a.js", {});
		await assert.rejects(() => a.default());
	});
});
