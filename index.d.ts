// Type definitions for node-amicontained
// Project: node-amicontained

// types
interface Runtimes {
	DOCKER: "docker",
	RKT: "rkt",
	SYSTEMD_NSPAWN: "systemd-nspawn",
	LXC: "lxc",
	LXC_LIBVIRT: "lxc-libvirt",
	OPENVZ: "openvz"
};

interface PromisifiedModule {
	runtimes: Runtimes,

	detectRuntime: () => Promise<string>,
	amIContained: () => Promise<boolean>,
	hasPIDNamespace: () => Promise<boolean>,
	appArmorProfile: () => Promise<string>,
}

// module methods
export function detectRuntime(cb: (err: Error, runtime: string) => void): void;
export function amIContained(cb: (err: Error, res: boolean) => void): void;
export function hasPIDNamespace(cb: (err: Error, res: boolean) => void): void;
export function appArmorProfile(cb: (err: Error, profile: string) => void): void;

// transform the module into promises
export function promisify(): PromisifiedModule;

// variables
export const runtimes: Runtimes;