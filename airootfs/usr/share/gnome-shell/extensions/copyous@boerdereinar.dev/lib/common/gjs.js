import GObject from 'gi://GObject';

import { __decorate } from '../../thirdparty/tslib.js';

/**
 * GObject.registerClass wrapper for use with decorators
 */
export function registerClass(options) {
	if (options) {
		return (cls) => {
			GObject.registerClass(options, cls);
		};
	} else {
		return (cls) => {
			GObject.registerClass(cls);
		};
	}
}

let JsObjectWrapper = class JsObjectWrapper extends GObject.Object {
	jsobject;

	constructor(jsobject) {
		super();
		this.jsobject = jsobject;
	}
};
JsObjectWrapper = __decorate(
	[
		registerClass({
			Properties: {
				jsobject: GObject.ParamSpec.jsobject('jsobject', null, null, GObject.ParamFlags.READABLE),
			},
		}),
	],
	JsObjectWrapper,
);

export { JsObjectWrapper };

export function int32ParamSpec(name, flags, defaultValue) {
	return GObject.ParamSpec.int(name, null, null, flags, 0, 2147483647, defaultValue);
}

export function enumParamSpec(name, flags, e, defaultValue) {
	const values = Object.values(e)
		.map((k) => +k)
		.filter((k) => Number.isInteger(k));
	const min = Math.min(...values);
	const max = Math.max(...values);
	return GObject.ParamSpec.int(name, null, null, flags, min, max, defaultValue);
}

export function flagsParamSpec(name, flags, e, defaultValue) {
	const values = Object.values(e)
		.map((k) => +k)
		.filter((k) => Number.isInteger(k));
	const max = (2 << Math.log2(Math.floor(Math.max(...values)))) - 1;
	return GObject.ParamSpec.int(name, null, null, flags, 0, max, defaultValue);
}
