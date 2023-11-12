/*
    These hooks run on a loader thread.
*/

let port;
const msgPromises = new Map(); //msgId -> resolve()

export async function initialize({port: p}) {
	port = p.on("message", ({msgId, ...msg}) => {
		const resolve = msgPromises.get(msgId);
		msgPromises.delete(msgId);
		if (msgPromises.size === 0) {
			port.unref();
		}
		resolve(msg);
	});
	p.unref();
}

export async function resolve(module, context, nextResolve) {
	const {parentURL} = context;

	if (parentURL) {
		const {mockId, strict, deep} = getMockOpts(parentURL) || {};
		if (mockId) {
			const {isMocked, keys, isMissing} = await checkMock({
				mockId,
				module
			});

			if (isMocked) {
				return {
					format: "module",
					shortCircuit: true,
					url: `modpod:///${encodeURIComponent(module)}?mockId=${mockId}&keys=${keys.join(",")}`
				};
			} else if (strict) {
				throw new Error(`Strict mode missing mock: "${module}"`);
			} else if (isMissing) {
				throw new Error(
					`Late dynamic import: "${module}". Use the Mocker directly and call dispose after your test is done.`
				);
			}
			if (deep && canRewrite(module)) {
				const response = new URL(module, parentURL);
				response.searchParams.set("mockId", mockId);
				response.searchParams.set("deep", "1");

				return nextResolve(String(response), context);
			}
		}
	}
	return nextResolve(module, context);
}

export async function load(url, context, nextLoad) {
	if (url.startsWith("modpod://")) {
		// modpod://{module}?mockId=123&keys=default,key1,key2,...
		const u = new URL(url);
		const keys = u.searchParams.get("keys").split(",");
		const mockId = u.searchParams.get("mockId");
		const moduleId = decodeURIComponent(u.pathname.substring(1));

		const source = `
const mocks = global[Symbol.for("modpod")].get("${mockId}").get("${moduleId}");\n
${keys.map(buildExport).join("\n")}
`;

		return {
			format: "module",
			shortCircuit: true,
			source
		};
	}

	return nextLoad(url, context);
}

// Helpers

function buildExport(key) {
	const name = key === "default" ? "default" : `const ${key} =`;
	return `export ${name} mocks["${key}"];`;
}

function canRewrite(url) {
	//TODO: something better than this...
	return (
		url.startsWith(".") || // relative ./ or ../
		url.startsWith("#") // package imports...
	);
}

function getMockOpts(url) {
	if (url.startsWith("file://")) {
		const u = new URL(url);
		const mockId = u.searchParams.get("mockId");
		if (mockId) {
			return {
				mockId,
				deep: u.searchParams.get("deep") === "1",
				strict: u.searchParams.get("strict") === "1"
			};
		}
	}
}

let idCounter = 0;
async function checkMock({mockId, module}) {
	return new Promise((resolve) => {
		const msgId = idCounter++;
		msgPromises.set(msgId, resolve);
		port.ref();
		port.postMessage({
			msgId,
			mockId,
			module
		});
	});
}
