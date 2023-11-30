// This is the consumer code that coordinates with MockProvider
import callsites from "callsites";

import internal from "./internal.js";
import Cache from "./cache.js";
import getModuleUrl from "./getModuleUrl.js";

export default class Pod {
	#cache;
	#caller;
	#options;

	constructor(options = {}, {[internal]: depth = 1} = {}) {
		assertOptions(options);
		this.#options = options;
		this.#cache = new Cache();
		this.#caller = callsites()[depth].getFileName();
	}

	mock(module, fake) {
		//TODO: do we need to do any normalization of the fake? add a default if missing, etc?
		this.#cache.add(module, fake);
	}

	async import(module) {
		const url = await getModuleUrl(module, this.#caller);

		const {strict, deep} = this.#options;
		url.searchParams.set("mockId", this.#cache.id);
		if (deep) {
			url.searchParams.set("deep", "1");
		}
		if (strict) {
			url.searchParams.set("strict", "1");
		}
		return import(String(url));
	}

	dispose() {
		this.#cache.clear();
	}
}

function assertOptions({deep, strict, ...other}) {
	if (deep && strict) {
		throw new Error("Can't have a deep and strict mock");
	}

	if (Object.keys(other).length > 0) {
		throw new Error(`Unknown options: ${JSON.stringify(other)}`);
	}
}
