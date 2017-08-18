# amicontained

This package helps detect if an application is currently running in a container.

## Installation

```
npm install amicontained
```

## Usage / API

```js
const amicontained = require('amicontained');

amicontained.amIContained((err, result) => {
	if (err) {
		return console.error(err);
	}

	if (result) {
		console.log('I am running in a container!');
	} else {
		console.log('I am not running in a container!');
	}
});

amicontained.runtime((err, runtime) => {
	if (err) {
		return console.error(err);
	}

	console.log(`Current container runtime is ${runtime}`);
});

amicontained.hasPIDNamespace((err, result) => {
	if (err) {
		return console.error(err);
	}

	if (result) {
		console.log('PID is namespaced!');
	} else {
		console.log('PID is not namespaced!');
	}
});

amicontained.appArmorProfile((err, profile) => {
	if (err) {
		return console.error(err);
	}

	console.log(`Current apparmor profile is:\n\n${profile}`);
});
```

Running this file with docker would yield:

```bash
$ docker run --rm -it my-container:latest
I am contained!
Current container runtime is docker
PID is namespaced!
```

### Promise-based

To use the API with promises, you can do:

```js
const amicontained = require('amicontained').promisify();

amicontained.runtime().then((result) => {
	console.log(`Current container runtime is ${runtime}`);
});
```

Or if your version of node supports async/await:

```js
const amicontained = require('amicontained').promisify();

async function main() {
	const runtime = await amicontained.runtime();
	console.log(runtime);
}

main();
```

## License

MIT