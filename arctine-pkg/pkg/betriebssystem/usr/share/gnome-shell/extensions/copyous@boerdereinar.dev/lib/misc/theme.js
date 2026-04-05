import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { DefaultColors, getDataPath } from '../common/constants.js';
import { enumParamSpec, registerClass } from '../common/gjs.js';

var __decorate =
	(this && this.__decorate) ||
	function (decorators, target, key, desc) {
		var c = arguments.length,
			r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
			d;
		if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
			r = Reflect.decorate(decorators, target, key, desc);
		else
			for (var i = decorators.length - 1; i >= 0; i--)
				if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
		return (c > 3 && r && Object.defineProperty(target, key, r), r);
	};

Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_async');

export const Theme = {
	System: 0,
	Dark: 1,
	Light: 2,
	Custom: 3,
};

export const ColorScheme = {
	Dark: 0,
	Light: 1,
};

let ThemeManager = class ThemeManager extends GObject.Object {
	ext;
	_resource;
	_themeSettings;
	_theme;
	_settings;
	_colorSchemeChangedId;
	_stylesheet = null;
	_colorScheme = ColorScheme.Dark;

	constructor(ext) {
		super();
		this.ext = ext;
		this._resource = Gio.resource_load(`${this.ext.path}/theme.gresource`);
		Gio.resources_register(this._resource);
		this._themeSettings = this.ext.settings.get_child('theme');
		this._themeSettings.connectObject('changed', this.updateTheme.bind(this), this);
		this._theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
		this._settings = St.Settings.get();
		this._colorSchemeChangedId = this._settings.connect('notify::color-scheme', this.updateTheme.bind(this));
		this.updateTheme().catch(() => {});
	}

	get colorScheme() {
		return this._colorScheme;
	}

	set colorScheme(scheme) {
		if (scheme === this._colorScheme) return;
		this._colorScheme = scheme;
		this.notify('color-scheme');
	}

	destroy() {
		if (this._stylesheet) this._theme.unload_stylesheet(this._stylesheet);
		this._stylesheet = null;
		Gio.resources_unregister(this._resource);
		this._themeSettings.disconnectObject(this);
		this._settings.disconnect(this._colorSchemeChangedId);
	}

	async updateTheme() {
		const theme = this._themeSettings.get_enum('theme');
		const systemColorScheme =
			this._settings.get_color_scheme() === St.SystemColorScheme.PREFER_LIGHT
				? ColorScheme.Light
				: ColorScheme.Dark;
		const customColorScheme = this._themeSettings.get_enum('custom-color-scheme');
		this.colorScheme = (() => {
			switch (theme) {
				case Theme.System:
					return systemColorScheme;
				case Theme.Dark:
					return ColorScheme.Dark;
				case Theme.Light:
					return ColorScheme.Light;
				case Theme.Custom:
					return customColorScheme;
			}
		})();
		let colorScheme = this.colorScheme === ColorScheme.Dark ? 'dark' : 'light';

		// Custom Theme
		if (theme === Theme.Custom) {
			try {
				// Load template
				const uri = `resource:///org/gnome/shell/extensions/copyous/template-${colorScheme}.css`;
				const template = Gio.File.new_for_uri(uri);
				const [contents] = await template.load_contents_async(null);
				const text = new TextDecoder().decode(contents);

				// Fill template
				const css = Object.entries(DefaultColors).reduce((s, [key, colors]) => {
					const i = Math.min(this.colorScheme, colors.length - 1);
					let color = this._themeSettings.get_string(key);
					color = color ? color : colors[i];

					// custom-var-foo-bar -> var_foo_bar
					const variable = key.substring('custom-'.length).replace(/-/g, '_');
					return s.replaceAll(`$${variable}`, color);
				}, text);

				// Save theme
				const path = getDataPath(this.ext);
				const stylesheet = path.get_child('custom-theme.css');
				const bytes = new TextEncoder().encode(css);
				await stylesheet.replace_contents_async(
					bytes,
					null,
					false,
					Gio.FileCreateFlags.REPLACE_DESTINATION,
					null,
				);

				// Load theme
				if (this._stylesheet) this._theme.unload_stylesheet(this._stylesheet);
				this._theme.load_stylesheet(stylesheet);
				this._stylesheet = stylesheet;
				return;
			} catch (err) {
				this.ext.logger.error(err);

				// Fallback to default dark theme
				colorScheme = 'dark';
			}
		}

		// GNOME Theme
		const uri = `resource:///org/gnome/shell/extensions/copyous/stylesheet-${colorScheme}.css`;
		const stylesheet = Gio.File.new_for_uri(uri);
		if (this._stylesheet?.equal(stylesheet)) return;
		try {
			if (this._stylesheet) this._theme.unload_stylesheet(this._stylesheet);
			this._theme.load_stylesheet(stylesheet);
			this._stylesheet = stylesheet;
		} catch (err) {
			this.ext.logger.error(err);
		}
	}
};
ThemeManager = __decorate(
	[
		registerClass({
			Properties: {
				'color-scheme': enumParamSpec(
					'color-scheme',
					GObject.ParamFlags.READABLE,
					ColorScheme,
					ColorScheme.Dark,
				),
			},
		}),
	],
	ThemeManager,
);

export { ThemeManager };
