import def, {named as n} from "./b.js";
import path from "node:path";

export default {
	...def,
	a: true
};

export const named = {
	...n,
	a: path.basename("a.js", ".js")
};
