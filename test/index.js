const amicontained = require('../');
const amicontainedPromisified = amicontained.promisify();
const assert = require('assert');
const mock = require('mock-fs');


/**
 * For now I have only tests for container environments I could test on my machine
 */
describe('amicontained (callback version)', () => {
	describe('runtime detection', () => {
		it('can detect docker', (done) => {
			mock({
				'/proc/self/cgroup': `10:freezer:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
9:cpuset:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
8:memory:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
7:blkio:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
6:pids:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
5:net_cls,net_prio:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
4:cpu,cpuacct:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
3:perf_event:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
2:devices:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
1:name=systemd:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
0::/system.slice/docker.service
`
			});

			amicontained.detectRuntime((err, runtime) => {
				assert(runtime === amicontained.runtimes.DOCKER, 'Runtime should be Docker');

				mock.restore();

				done();
			});
		});

		it('can detect rkt', (done) => {
			mock({
				'/proc/self/cgroup': `10:freezer:/
9:cpuset:/
8:memory:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice
7:blkio:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice
6:pids:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice/node.service
5:net_cls,net_prio:/
4:cpu,cpuacct:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice
3:perf_event:/
2:devices:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice/node.service
1:name=systemd:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice/node.service
0::/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope

`
			});

			amicontained.detectRuntime((err, runtime) => {
				assert(runtime === amicontained.runtimes.RKT, 'Runtime should be rkt');

				mock.restore();

				done();
			});
		});

		it('can detect lxc', (done) => {
			mock({
				'/run/systemd/container': 'lxc'
			});

			amicontained.detectRuntime((err, runtime) => {
				assert(runtime === amicontained.runtimes.LXC, 'Runtime should be lxc');

				mock.restore();

				done();
			});
		});
	});

	it('amicontained', (done) => {
		mock({
			'/proc/self/cgroup': `10:freezer:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
9:cpuset:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
8:memory:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
7:blkio:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
6:pids:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
5:net_cls,net_prio:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
4:cpu,cpuacct:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
3:perf_event:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
2:devices:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
1:name=systemd:/docker/90039ca2d1668a587bf2b485eaa85e363aa85ef1d816e66582c401b784aef04d
0::/system.slice/docker.service
`
		});

		amicontained.amIContained((err, result) => {
			assert(result, 'I should be contained');

			mock.restore();

			done();
		});
	});

	describe('promisified', () => {
		it('can detect rkt', () => {
			mock({
				'/proc/self/cgroup': `10:freezer:/
9:cpuset:/
8:memory:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice
7:blkio:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice
6:pids:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice/node.service
5:net_cls,net_prio:/
4:cpu,cpuacct:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice
3:perf_event:/
2:devices:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice/node.service
1:name=systemd:/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope/system.slice/node.service
0::/machine.slice/machine-rkt\x2d7767082e\x2d5239\x2d46f3\x2d9e30\x2d955fb0fad360.scope

`
			});

			return amicontainedPromisified.detectRuntime().then((runtime) => {
				assert(runtime === amicontained.runtimes.RKT, 'Runtime should be rkt');

				mock.restore();
			});
		});
	});
});