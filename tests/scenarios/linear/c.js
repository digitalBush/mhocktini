import path from "node:path";

export default {
	c: true
};

export const named = {
	c: path.basename("c.js", ".js")
};
