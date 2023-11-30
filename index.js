import "./src/register.js";
import internal from "./src/internal.js";
import Pod from "./src/pod.js";

async function _mock(module, mocks, opts) {
	const p = new Pod(opts, {[internal]: 3});
	try {
		for (const [k, v] of Object.entries(mocks)) {
			p.mock(k, v);
		}
		const instance = await p.import(module);
		return instance;
	} finally {
		p.dispose();
	}
}

const mock = (module, mocks) => _mock(module, mocks, {});
mock.deep = (module, mocks) => _mock(module, mocks, {deep: true});
mock.strict = (module, mocks) => _mock(module, mocks, {strict: true});

export default mock;

export {Pod};
