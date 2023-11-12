import def, {named as n} from "./c.js";
import path from "node:path";

export default {
	...def,
	b: true
};

export const named = {
	...n,
	b: path.basename("b.js", ".js")
};
