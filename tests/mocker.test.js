import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {Mocker} from "../index.js";

describe("Mocker", () => {
	[
		["file://", import.meta.resolve("./scenarios/linear/a.js")],
		["absolute", fileURLToPath(import.meta.resolve("./scenarios/linear/a.js"))],
		["relative", "./scenarios/linear/a.js"],
		["package imports", "#root/tests/scenarios/linear/a.js"]
	].forEach(([desc, file]) => {
		it(`should import from ${desc} path`, async (t) => {
			const m = new Mocker();
			t.after(() => m.dispose());

			m.mock("./b.js", {
				default: {mocked: "default"},
				named: {mocked: "named"}
			});

			const a = await m.import(file);

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
		const m = new Mocker();
		t.after(() => m.dispose());
		m.mock("./b.js", {
			default: () => "mocked"
		});
		const a = await m.import("./scenarios/dynamic/a.js");
		assert.deepEqual(await a.default(), "mocked");
	});

	it("should error when trying to deep strict mocks", async () => {
		assert.throws(() => new Mocker({deep: true, strict: true}), {
			message: "Can't have a deep and strict mock"
		});
	});

	it("should error with unknown options", async () => {
		assert.throws(() => new Mocker({foo: "bar"}), {
			message: 'Unknown options: {"foo":"bar"}'
		});
	});

	it("should error with unused mocks", async () => {
		const m = new Mocker();

		m.mock("./lol.js", {
			default: {mocked: "default"},
			named: {mocked: "named"}
		});

		await m.import(import.meta.resolve("./scenarios/linear/a.js"));

		assert.throws(() => m.dispose(), {
			message: 'Unused mocks: "./lol.js"'
		});
	});
});
