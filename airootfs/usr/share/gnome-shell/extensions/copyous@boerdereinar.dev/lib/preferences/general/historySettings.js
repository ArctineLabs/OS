import Adw from 'gi://Adw';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { getDataPath } from '../../common/constants.js';
import { registerClass } from '../../common/gjs.js';
import { bind_enum } from '../../common/settings.js';
import { makeResettable } from '../utils.js';

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

Gio._promisify(Gtk.FileDialog.prototype, 'open', 'open_finish');
let HistorySettings = class HistorySettings extends Adw.PreferencesGroup {
	_settings;
	_defaultDatabaseLocation;
	_inMemoryDatabase;
	_databaseLocation;
	_clipboardHistory;

	constructor(prefs, window) {
		super({
			title: _('History'),
		});
		this._defaultDatabaseLocation = GLib.build_filenamev([getDataPath(prefs).get_path(), 'clipboard.db']);
		this._inMemoryDatabase = new Adw.SwitchRow({
			title: _('Use In-Memory Database'),
			subtitle: _('Store clipboard history in memory instead of on disk'),
			active: true,
			sensitive: false,
		});
		this.add(this._inMemoryDatabase);
		this._databaseLocation = new Adw.ActionRow({
			title: _('Database Location'),
			activatable: true,
			sensitive: false,
		});
		this._databaseLocation.connect('activated', () => this.openDatabaseLocation(window));
		this.add(this._databaseLocation);
		this._clipboardHistory = new Adw.ComboRow({
			title: _('Clipboard History'),
			subtitle: _(
				'Choose what to do with your clipboard history when you restart, log out, or shut down your system',
			),
			model: Gtk.StringList.new([_('Clear'), _('Keep Pinned/Tagged'), _('Keep All')]),
			sensitive: false,
		});
		this.add(this._clipboardHistory);
		const historyLength = new Adw.SpinRow({
			title: _('History Length'),
			subtitle: _('Select how many items to keep in the clipboard history'),
			adjustment: new Gtk.Adjustment({ lower: 10, upper: 500, step_increment: 1, page_increment: 5, value: 50 }),
		});
		this.add(historyLength);
		const timeLimit = new Adw.SpinRow({
			title: _('History Time Limit'),
			subtitle: _(
				'Select how many minutes to keep items in the clipboard history. Set to 0 to disable the time limit',
			),
			adjustment: new Gtk.Adjustment({ lower: 0, upper: 1440, step_increment: 5, page_increment: 15, value: 0 }),
		});
		this.add(timeLimit);

		// Bind properties
		this._settings = prefs.getSettings();
		this._settings.bind('database-location', this, 'database-location', Gio.SettingsBindFlags.DEFAULT);
		bind_enum(this._settings, 'clipboard-history', this._clipboardHistory, 'selected');
		this._settings.bind('history-length', historyLength, 'value', Gio.SettingsBindFlags.DEFAULT);
		this._settings.bind('history-time', timeLimit, 'value', Gio.SettingsBindFlags.DEFAULT);
		makeResettable(this._databaseLocation, this._settings, 'database-location');
		makeResettable(this._clipboardHistory, this._settings, 'clipboard-history');
		makeResettable(historyLength, this._settings, 'history-length');
		makeResettable(timeLimit, this._settings, 'history-time');
		this._inMemoryDatabase.bind_property(
			'active',
			this._databaseLocation,
			'sensitive',
			GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN,
		);
		this._inMemoryDatabase.bind_property(
			'active',
			this._clipboardHistory,
			'sensitive',
			GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN,
		);
	}

	get databaseLocation() {
		if (this._databaseLocation.subtitle === this._defaultDatabaseLocation) {
			return '';
		} else {
			return this._databaseLocation.subtitle;
		}
	}

	set databaseLocation(value) {
		if (value === '') {
			this._databaseLocation.subtitle = this._defaultDatabaseLocation;
		} else {
			this._databaseLocation.subtitle = value;
		}
		this.notify('database-location');
	}

	set libgda(installed) {
		if (installed) {
			this._inMemoryDatabase.sensitive = true;
			this._settings.bind('in-memory-database', this._inMemoryDatabase, 'active', Gio.SettingsBindFlags.DEFAULT);
		}
		this.notify('libgda');
	}

	async openDatabaseLocation(window) {
		const dialog = new Gtk.FileDialog({
			initial_file: Gio.File.new_for_path(this.databaseLocation),
			default_filter: new Gtk.FileFilter({
				patterns: ['*.db'],
			}),
		});
		try {
			const result = await dialog.open(window, null);
			const path = result?.get_path();
			if (path != null) {
				this.databaseLocation = path;
			}
		} catch {
			console.error('Failed to open database location');
		}
	}
};
HistorySettings = __decorate(
	[
		registerClass({
			Properties: {
				'libgda': GObject.ParamSpec.boolean('libgda', null, null, GObject.ParamFlags.WRITABLE, false),
				'database-location': GObject.ParamSpec.string(
					'database-location',
					null,
					null,
					GObject.ParamFlags.READWRITE,
					'',
				),
			},
		}),
	],
	HistorySettings,
);

export { HistorySettings };
