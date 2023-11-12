import {describe, it} from "node:test";
import assert from "node:assert/strict";
import mock from "../index.js";

describe("deep", () => {
	it("should mock nested dependency", async () => {
		const a = await mock.deep("./scenarios/linear/a.js", {
			"./c.js": {
				default: {mocked: "default"},
				named: {mocked: "named"}
			}
		});

		assert.deepEqual(a.default, {
			a: true,
			b: true,
			mocked: "default"
		});

		assert.deepEqual(a.named, {
			a: "a",
			b: "b",
			mocked: "named"
		});
	});

	it("should mock all reused modules", async () => {
		const a = await mock.deep("./scenarios/linear/a.js", {
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
			a: "mocked",
			b: "mocked",
			c: "mocked"
		});
	});

	it("should fail with late dynamic import", async () => {
		const a = await mock.deep("./scenarios/dynamic/a.js", {});
		await assert.rejects(() => a.default());
	});
});
