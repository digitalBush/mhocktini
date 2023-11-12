export default async () => {
	const b = await import("./b.js");
	return b.default();
};
