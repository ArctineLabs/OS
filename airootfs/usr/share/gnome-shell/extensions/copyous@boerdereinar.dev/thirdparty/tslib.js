export function __decorate(decorators, target, _key, _desc) {
	let r = target;
	for (let i = decorators.length - 1; i >= 0; i--) {
		let d = decorators[i];
		if (d) {
			r = d(r) || r;
		}
	}
	return r;
}
