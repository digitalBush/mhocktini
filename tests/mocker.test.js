import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {Pod} from "../index.js";

describe("Pod", () => {
	[
		["file://", import.meta.resolve("./scenarios/linear/a.js")],
		["absolute", fileURLToPath(import.meta.resolve("./scenarios/linear/a.js"))],
		["relative", "./scenarios/linear/a.js"],
		["package imports", "#root/tests/scenarios/linear/a.js"]
	].forEach(([desc, file]) => {
		it(`should import from ${desc} path`, async (t) => {
			const p = new Pod();
			t.after(() => p.dispose());

			p.mock("./b.js", {
				default: {mocked: "default"},
				named: {mocked: "named"}
			});

			const a = await p.import(file);

			assert.deepEqual(a.default, {
				a: true,
				mocked: "default"
			});

			assert.deepEqual(a.named, {
				a: "a",
				mocked: "named"
			});
		});
	});

	it("should mock late dynamic imports", async (t) => {
		const p = new Pod();
		t.after(() => p.dispose());
		p.mock("./b.js", {
			default: () => "mocked"
		});
		const a = await p.import("./scenarios/dynamic/a.js");
		assert.deepEqual(await a.default(), "mocked");
	});

	it("should treat function mocks as a default export", async (t) => {
		const p = new Pod();
		t.after(() => p.dispose());
		p.mock("./b.js", () => "mocked");
		const a = await p.import("./scenarios/dynamic/a.js");
		assert.deepEqual(await a.default(), "mocked");
	});

	it("should error when trying to deep strict mocks", async () => {
		assert.throws(() => new Pod({deep: true, strict: true}), {
			message: "Can't have a deep and strict mock"
		});
	});

	it("should error with unknown options", async () => {
		assert.throws(() => new Pod({foo: "bar"}), {
			message: 'Unknown options: {"foo":"bar"}'
		});
	});

	it("should error with unused mocks", async () => {
		const p = new Pod();

		p.mock("./lol.js", {
			default: {mocked: "default"},
			named: {mocked: "named"}
		});

		await p.import(import.meta.resolve("./scenarios/linear/a.js"));

		assert.throws(() => p.dispose(), {
			message: 'Unused mocks: "./lol.js"'
		});
	});
});
