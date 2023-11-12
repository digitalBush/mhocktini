import {describe, it} from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {Mocker} from "../index.js"; // We're gonna test with our own mocker. 😍

describe("getModuleUrl", () => {
	it("should error if no package.json is found", async (t) => {
		const m = new Mocker();
		t.after(() => m.dispose());

		m.mock("node:fs/promises", {
			default: {
				stat: () =>
					Promise.resolve({
						isFile: () => false
					})
			}
		});

		const {default: getModuleUrl} = await m.import("./getModuleUrl.js");

		await assert.rejects(() => getModuleUrl("#/lol.js", import.meta.url), {
			message: `Can't locate package.json from ${path.dirname(import.meta.url)}`
		});
	});

	it("should error if error is not ENOENT", async (t) => {
		const m = new Mocker();
		t.after(() => m.dispose());

		m.mock("node:fs/promises", {
			default: {
				stat: () => Promise.reject(new Error("boom"))
			}
		});

		const {default: getModuleUrl} = await m.import("./getModuleUrl.js");

		await assert.rejects(() => getModuleUrl("#/lol.js", import.meta.url), {
			message: "boom"
		});
	});
});
