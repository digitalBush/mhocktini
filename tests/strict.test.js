import {describe, it} from "node:test";
import assert from "node:assert/strict";
import mock from "../index.js";

describe("strict", () => {
	it("should mock all imports", async () => {
		const a = await mock.strict("./scenarios/linear/a.js", {
			"./b.js": {
				default: {mocked: "default"},
				named: {mocked: "named"}
			},
			"node:path": {
				default: {
					basename: () => "mocked"
				}
			}
		});

		assert.deepEqual(a.default, {
			a: true,
			mocked: "default"
		});

		assert.deepEqual(a.named, {
			a: "mocked",
			mocked: "named"
		});
	});

	it("should error if missing mock", async () => {
		await assert.rejects(() => mock.strict("./scenarios/linear/a.js", {}), {
			message: 'Strict mode missing mock: "./b.js"'
		});
	});

	it("should error if missing mock", async () => {
		await assert.rejects(
			() =>
				mock.strict("./scenarios/linear/a.js", {
					"node:path": {
						default: {
							basename: () => "mocked"
						}
					}
				}),
			{
				message: 'Strict mode missing mock: "./b.js"'
			}
		);
	});
});
