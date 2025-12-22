export function bind_enum(settings, key, object, property) {
	object.set_property(property, settings.get_enum(key));
	settings.connect(`changed::${key}`, () => object.set_property(property, settings.get_enum(key)));
	object.connect(`notify::${property}`, () => {
		const value = object[property];
		if (value != null) settings.set_enum(key, value);
	});
}

export function bind_flags(settings, key, object, property) {
	object.set_property(property, settings.get_flags(key));
	settings.connect(`changed::${key}`, () => object.set_property(property, settings.get_flags(key)));
	object.connect(`notify::${property}`, () => {
		const value = object[property];
		if (value != null) settings.set_flags(key, value);
	});
}
