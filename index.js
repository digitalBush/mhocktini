import "./src/register.js";
import internal from "./src/internal.js";
import Mocker from "./src/mocker.js";

async function _mock(module, mocks, opts) {
	const m = new Mocker(opts, {[internal]: 3});
	try {
		for (const [k, v] of Object.entries(mocks)) {
			m.mock(k, v);
		}
		const instance = await m.import(module);
		return instance;
	} finally {
		m.dispose();
	}
}

const mock = (module, mocks) => _mock(module, mocks, {});
mock.deep = (module, mocks) => _mock(module, mocks, {deep: true});
mock.strict = (module, mocks) => _mock(module, mocks, {strict: true});

export default mock;

export {Mocker};
