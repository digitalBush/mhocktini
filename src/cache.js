const moduleMocks = (global[Symbol.for("modpod")] = new Map()); // mockId -> Cache

// This port is for requests from the other thread to check if a module should be mocked
export function setupPort(port) {
	port.on("message", ({msgId, mockId, module}) => {
		const cache = moduleMocks.get(mockId);

		if (!cache) {
			return port.postMessage({
				msgId,
				isMocked: false,
				isMissing: true
			});
		}

		const mock = cache.get(module);
		return port.postMessage({
			msgId,
			isMocked: !!mock,
			keys: mock && Object.keys(mock)
		});
	});
	port.unref();
}

let idCounter = 1;
export default class Cache {
	#id;
	#mocks = new Map(); //module

	constructor() {
		this.#id = String(idCounter++);
		moduleMocks.set(this.#id, this);
	}

	clear() {
		moduleMocks.delete(this.#id);
		const unused = [...this.#mocks.entries()].reduce((acc, [key, {used}]) => {
			if (!used) {
				acc.push(`"${key}"`);
			}
			return acc;
		}, []);

		if (unused.length > 0) {
			throw new Error(`Unused mocks: ${unused.join(",")}`);
		}
	}

	add(module, fake) {
		this.#mocks.set(module, {fake, used: false});
	}

	get(module) {
		const mock = this.#mocks.get(module);
		if (mock) {
			mock.used = true;
			return mock.fake;
		}
	}

	get id() {
		return this.#id;
	}
}
