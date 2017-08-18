'use strict';

const async = require('async');
const fs = require('fs');

const runtimes = {
	DOCKER: "docker",
	RKT: "rkt",
	SYSTEMD_NSPAWN: "systemd-nspawn",
	LXC: "lxc",
	LXC_LIBVIRT: "lxc-libvirt",
	OPENVZ: "openvz"
};
const runtime_list = Object.keys(runtimes).map(v => runtimes[v]);

// check for the cgroup file
function checkCgroup(cb) {
	fs.exists('/proc/self/cgroup', (exists) => {
		if (!exists) {
			return cb("unknown");
		}

		fs.readFile('/proc/self/cgroup', (err, buf) => {
			if (err) {
				return cb(err);
			}

			const content = buf.toString('ascii');

			for (let runtime of runtime_list) {
				if (content.indexOf(runtime) !== -1) {
					return cb(null, runtime);
				}
			}

			return cb("unknown");
		});
	});
}

// check for openvz
function checkVZ(cb) {
	fs.exists("/proc/vz", (exists) => {
		if (exists) {
			return cb(null, "openvz");
		}

		fs.exists("/proc/bc", (exists) => {
			if (exists) {
				return cb(null, "openvz");
			}

			return cb("unknown");
		});
	});
}

// some environments provide an environment variable
function checkEnv(cb) {
	if (process.env.CONTAINER && runtime_list.indexOf(process.env.CONTAINER) !== -1) {
		return cb(null, process.env.CONTAINER);
	}

	if (process.env.container && runtime_list.indexOf(process.env.container) !== -1) {
		return cb(null, process.env.container);
	}

	return cb("unknown");
}

// for systemd we can check the run folder
function checkSystemd(cb) {
	fs.exists('/run/systemd/container', (exists) => {
		if (!exists) {
			return cb("unknown");
		}

		fs.readFile('/run/systemd/container', (err, buf) => {
			if (err) {
				return cb(err);
			}

			const content = buf.toString('ascii');
			if (runtime_list.indexOf(content) !== -1) {
				return cb(null, content);
			}

			return cb("unknown");
		});
	});
}

/**
 *
 *
 * @param {any} cb
 */
function detectRuntime(cb) {
	async.tryEach([
		checkCgroup,
		checkVZ,
		checkEnv,
		checkSystemd
	], (err, runtime) => {
		if (err === "unknown") {
			return cb(null, null);
		}

		return cb(err, runtime);
	});
};

function amIContained(cb) {
	detectRuntime((err, runtime) => {
		if (err) {
			return cb(err);
		}

		return cb(null, runtime !== null);
	})
}

function hasPIDNamespace(cb) {
	fs.exists('/proc/self/sched', (exists) => {
		if (!exists) {
			return cb(null, false);
		}

		fs.readFile('/proc/self/sched', (err, buf) => {
			if (err) {
				return cb(err, null);
			}

			const top = buf.slice(0, buf.indexOf('\n')).toString('ascii');
			const matches = top.match(/^\w+ \((\d+)/);

			if (!matches) {
				return cb(null, false);
			}

			const pid = parseInt(matches[1], 10);

			cb(null, pid !== process.pid);
		});
	});
};

function appArmorProfile(cb) {
	fs.exists('/proc/self/attr/current', (exists) => {
		if (!exists) {
			return cb(null, "none");
		}

		fs.readFile('/proc/self/attr/current', (err, buf) => {
			if (err) {
				if (err.code === 'EINVAL') {
					return cb(null, null);
				}

				return cb(err, null);
			}

			cb(null, buf.toString('ascii'));
		});
	});
}

function wrap(fn) {
	return function () {
		return new Promise((resolve, reject) => {
			fn((err, res) => {
				if (err) {
					return reject(err);
				}

				resolve(res);
			})
		})
	};
}

// exports list
exports.runtimes = runtimes;

exports.detectRuntime = detectRuntime;
exports.amIContained = amIContained;
exports.hasPIDNamespace = hasPIDNamespace;
exports.appArmorProfile = appArmorProfile;

/**
 * Converts the module to a promise based version (for use with async/await)
 */
exports.promisify = function () {
	return {
		runtimes: runtimes,

		// wrap all functions into promises
		detectRuntime: wrap(detectRuntime),
		amIContained: wrap(amIContained),
		hasPIDNamespace: wrap(hasPIDNamespace),
		appArmorProfile: wrap(appArmorProfile),
	}
};