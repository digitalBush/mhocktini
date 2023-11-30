# modpod

[![Build Status](https://github.com/digitalbush/modpod/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/digitalBush/modpod/actions/workflows/test.yml?query=branch%3Amain)
[![Coverage Status](https://coveralls.io/repos/github/digitalBush/modpod/badge.svg?branch=main)](https://coveralls.io/github/digitalBush/modpod?branch=main)

Isolate your ES Modules for testing.

```shell
 npm i -D modpod
```

## Easy Mode

```js
import {test} from "node:test";

import modpod from "modpod";

test("easy mode", async () => {
	const instance = await modpod("./target.js", {
		"./dep.js": {
			// Replaces `export default function(){...}` in ./dep.js
			default: () => "mocked default",
			// Replaces `export function otherThing(){...}` in ./dep.js
			otherThing: () => "mocked named export 'otherThing'"
		}
	});

	// Exercise instance
	// Assert what you expected would happen
});
```

The default export is a function that sets up a mock environment, imports the target, and cleans up.

- `modpod()` is a shallow mock. It'll only replace dependencies one level deep.

- `modpod.strict()` will make sure that all dependencies of `./target.js` are mocked. If an import is missing a mock, an error will be thrown.

- `modpod.deep()` will replace `./dep.js` anywhere it is imported. Even if it's a dependency of a dependency.

**Note:** If a mock is declared, but never used, then an error will be thrown.

## Hard Mode

If you need more control over the mock lifecycle (like dynamic imports), then you'll need to use the `Pod` class directly.

Let's consider a few files:

target.js

```js
export async function doSomething() {
	const dep = await import("./dep.js");
	return dep();
}
```

dep.js

```js
export default () => "dep";
```

Now we can write a test that handles the dynamic import.

```js
import assert from "node:assert";
import {test, mock} from "node:test";

import {Pod} from "modpod";

test("hard mode", async (t) => {
	const p = new Pod({strict: true});
	t.after(() => p.dispose()); // Clean up

	const dep = mock.fn(() => "mocked");
	p.mock("./dep.js", {
		default: dep
	});

	const instance = await p.import("./target.js");
	assert.strictEqual(dep.mock.calls.length, 0);

	const result = await instance.doSomething();
	assert.strictEqual(dep.mock.calls.length, 1);
});
```
