import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

import {resolveImports} from "resolve-pkg-maps";

export default async function getURL(module, caller) {
	if (module.startsWith("file://")) {
		return new URL(module);
	}

	if (module.startsWith(".")) {
		return new URL(module, caller);
	}

	if (module.startsWith("#")) {
		const {pkg, dir} = await getNearestPackage(path.dirname(caller));
		const [file] = resolveImports(pkg.imports, module);
		return new URL(file, `file://${dir}/`);
	}

	return new URL(pathToFileURL(module));
}

async function getNearestPackage(start) {
	let dir = fileURLToPath(start);
	const {root} = path.parse(dir);

	while (dir && dir !== root) {
		const pkgFile = path.join(dir, "package.json");
		try {
			const stats = await fs.stat(pkgFile);

			if (stats.isFile()) {
				const contents = await fs.readFile(pkgFile, "utf-8");
				const pkg = JSON.parse(contents);
				return {
					dir,
					pkg
				};
			}
		} catch (e) {
			if (e.code !== "ENOENT") {
				throw e;
			}
		}
		dir = path.dirname(dir);
	}
	throw new Error(`Can't locate package.json from ${start}`);
}
