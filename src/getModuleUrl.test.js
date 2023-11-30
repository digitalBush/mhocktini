import {describe, it} from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {Pod} from "../index.js"; // We're gonna test using our own mocker. 😍

describe("getModuleUrl", () => {
	it("should error if no package.json is found", async (t) => {
		const p = new Pod();
		t.after(() => p.dispose());

		p.mock("node:fs/promises", {
			default: {
				stat: () =>
					Promise.resolve({
						isFile: () => false
					})
			}
		});

		const {default: getModuleUrl} = await p.import("./getModuleUrl.js");

		await assert.rejects(() => getModuleUrl("#/lol.js", import.meta.url), {
			message: `Can't locate package.json from ${path.dirname(import.meta.url)}`
		});
	});

	it("should error if error is not ENOENT", async (t) => {
		const p = new Pod();
		t.after(() => p.dispose());

		p.mock("node:fs/promises", {
			default: {
				stat: () => Promise.reject(new Error("boom"))
			}
		});

		const {default: getModuleUrl} = await p.import("./getModuleUrl.js");

		await assert.rejects(() => getModuleUrl("#/lol.js", import.meta.url), {
			message: "boom"
		});
	});
});
