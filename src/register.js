import {register} from "node:module";
import {MessageChannel} from "node:worker_threads";
import {setupPort} from "./cache.js";
const {port1, port2} = new MessageChannel();

setupPort(port1);

register("./hooks.js", import.meta.url, {
	parentURL: import.meta.url,
	data: {port: port2},
	transferList: [port2]
});
