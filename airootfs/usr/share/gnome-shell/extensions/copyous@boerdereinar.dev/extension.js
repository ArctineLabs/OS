import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { getDataPath, getHljsLanguages, getHljsPath } from './lib/common/constants.js';
import { DbusService } from './lib/common/dbus.js';
import { tryCreateSoundManager } from './lib/common/sound.js';
import { ClipboardManager } from './lib/misc/clipboard.js';
import { ClipboardEntryTracker } from './lib/misc/db.js';
import { NotificationManager } from './lib/misc/notifications.js';
import { ShortcutManager } from './lib/misc/shortcuts.js';
import { ThemeManager } from './lib/misc/theme.js';
import { ClipboardDialog } from './lib/ui/clipboardDialog.js';
import { ClipboardIndicator } from './lib/ui/indicator.js';

export default class CopyousExtension extends Extension {
	settings;
	logger;
	hljs;
	hljsMonitor;
	hljsLanguages;
	hljsCallbacks;
	themeManager;
	clipboardDialog;
	indicator;
	dbus;
	notificationManager;
	soundManager;
	shortcutsManager;
	entryTracker;
	historyTimeoutId = -1;
	updateHistory = false;
	clipboardManager;

	enable() {
		this.settings = this.getSettings();
		this.logger = this.getLogger();
		const error = this.logger.error.bind(this.logger);

		// Highlight.js
		this.initHljs().catch(error);

		// Theme
		this.themeManager = new ThemeManager(this);

		// UI
		this.clipboardDialog = new ClipboardDialog(this);
		this.clipboardDialog.connect('notify::opened', async () => {
			// Update the history when the dialog is closed and an update was scheduled while the dialog was open
			if (!this.clipboardDialog?.opened && this.updateHistory) {
				await this.entryTracker?.deleteOldest();
			}
		});
		this.clipboardDialog.connect('paste', async (_, entry) => {
			await this.clipboardManager?.pasteEntry(entry);
			this.indicator?.showEntry(entry);
		});
		this.indicator = new ClipboardIndicator(this);
		this.indicator.connect('open-dialog', () => this.clipboardDialog?.open());
		this.indicator.connect('clear-history', (_, history) => this.entryTracker?.clear(history));

		// DBus
		this.dbus = new DbusService();
		this.dbus.connect('toggle', () => this.clipboardDialog?.toggle());
		this.dbus.connect('show', () => this.clipboardDialog?.open());
		this.dbus.connect('hide', () => this.clipboardDialog?.close());
		this.dbus.connect('clear-history', (_, history) => this.entryTracker?.clear(history === -1 ? null : history));

		// Feedback
		this.notificationManager = new NotificationManager(this);
		tryCreateSoundManager(this)
			.then((soundManager) => {
				if (soundManager) this.soundManager = soundManager;
			})
			.catch(error);

		// Shortcuts
		this.shortcutsManager = new ShortcutManager(this, this.clipboardDialog);
		this.shortcutsManager.connect('open-clipboard-dialog', () => this.clipboardDialog?.toggle());
		this.shortcutsManager.connect('toggle-incognito-mode', () => this.indicator?.toggleIncognito());

		// Database
		this.entryTracker = new ClipboardEntryTracker(this);
		this.initEntryTracker().catch(error);
		this.initHistoryTimeout().catch(error);
		this.settings.connectObject(
			'changed::database-location',
			this.initEntryTracker.bind(this),
			'changed::in-memory-database',
			this.initEntryTracker.bind(this),
			'changed::history-time',
			this.initHistoryTimeout.bind(this),
			this,
		);

		// Clipboard Manager
		this.clipboardManager = new ClipboardManager(this, this.entryTracker);
		this.clipboardManager.connect('clipboard', (_, entry) => {
			this.clipboardDialog?.addEntry(entry);
			this.indicator?.showEntry(entry);
			this.indicator?.animate();
			this.notificationManager?.notification(entry);
			this.soundManager?.playSound();
		});
		this.clipboardManager.connect('text', (_, text) => {
			this.indicator?.showText(text);
			this.indicator?.animate();
			this.notificationManager?.textNotification(text);
			this.soundManager?.playSound();
		});
		this.clipboardManager.connect('image', (_, image, width, height) => {
			this.indicator?.showImageBytes(image);
			this.indicator?.animate();
			this.notificationManager?.imageNotification(image, width, height);
			this.soundManager?.playSound();
		});
	}

	async initHljs() {
		if (this.hljs) return;
		const hljsPath = getHljsPath(this);
		try {
			const hljs = await import(hljsPath.get_uri());
			this.hljs = hljs.default;

			// Disable file monitor
			this.hljsMonitor?.cancel();
			this.hljsMonitor = undefined;

			// Initialize extra languages
			await this.loadHljsLanguages();

			// Notify dependents
			this.hljsCallbacks?.forEach((fn) => fn());
			this.hljsCallbacks = undefined;
		} catch {
			this.hljs = null;

			// Automatically load highlight.js
			if (!this.hljsMonitor) {
				this.hljsMonitor = hljsPath.monitor(Gio.FileMonitorFlags.NONE, null);
				this.hljsMonitor.connect('changed', async (_monitor, _file, _otherFile, eventType) => {
					if (eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
						await this.initHljs();
					}
				});
			}
		}
	}

	async loadHljsLanguages() {
		this.hljsLanguages ??= new Map();
		if (!this.hljsMonitor) {
			const path = getDataPath(this).get_child('languages');
			this.hljsMonitor = path.monitor_directory(Gio.FileMonitorFlags.NONE, null);
			this.hljsMonitor.connect('changed', async (_monitor, _file, _otherFile, eventType) => {
				if (
					eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT ||
					eventType === Gio.FileMonitorEvent.DELETED
				) {
					await this.loadHljsLanguages();
				}
			});
		}
		const languages = getHljsLanguages(this);
		await Promise.all(
			languages.map(async ([name, _language, _hash, path]) => {
				const enabled = this.hljsLanguages?.get(name) ?? false;
				if (!path.query_exists(null)) {
					if (enabled) {
						this.hljs?.unregisterLanguage(name);
						this.hljsLanguages?.set(name, false);
					}
					return;
				}
				if (enabled) return;
				try {
					const language = await import(path.get_uri());
					this.hljs?.registerLanguage(name, language.default);
					this.hljsLanguages?.set(name, true);
				} catch {
					this.logger.error(`Failed to register language "${name}"`);
				}
			}),
		);
	}

	connectHljsInit(fn) {
		if (this.hljs != null) return;
		this.hljsCallbacks ??= [];
		this.hljsCallbacks.push(fn);
	}

	async initEntryTracker() {
		if (!this.entryTracker) return;
		this.clipboardDialog?.clearEntries();
		const entries = await this.entryTracker.init();
		for (const entry of entries) {
			this.clipboardDialog?.addEntry(entry);
		}
	}

	async initHistoryTimeout() {
		if (this.historyTimeoutId >= 0) GLib.source_remove(this.historyTimeoutId);
		const historyTime = this.settings?.get_int('history-time');
		if (historyTime === undefined || historyTime === 0) return;
		await this.entryTracker?.deleteOldest();
		this.historyTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
			// Do not update the history if the dialog is open
			this.updateHistory = this.clipboardDialog?.opened ?? false;
			if (this.updateHistory) return GLib.SOURCE_CONTINUE;
			if (this.entryTracker?.checkOldest()) {
				this.entryTracker?.deleteOldest().catch(this.logger.error.bind(this.logger));
			}
			return GLib.SOURCE_CONTINUE;
		});
	}

	disable() {
		// UI
		this.clipboardDialog?.destroy();
		this.indicator?.destroy();
		this.clipboardDialog = undefined;
		this.indicator = undefined;

		// Highlight.js
		this.hljs = undefined;
		this.hljsMonitor?.cancel();
		this.hljsMonitor = undefined;
		this.hljsLanguages = undefined;
		this.hljsCallbacks = undefined;

		// Theme
		this.themeManager?.destroy();
		this.themeManager = undefined;

		// DBus
		this.dbus?.destroy();
		this.dbus = undefined;

		// Feedback
		this.notificationManager = undefined;
		this.soundManager?.destroy();
		this.soundManager = undefined;

		// Shortcuts
		this.shortcutsManager?.destroy();
		this.shortcutsManager = undefined;

		// Database
		const error = this.logger.error.bind(this.logger);
		this.entryTracker?.destroy().catch(error);
		this.entryTracker = undefined;
		if (this.historyTimeoutId >= 0) GLib.source_remove(this.historyTimeoutId);
		this.historyTimeoutId = -1;

		// Clipboard Manager
		this.clipboardManager?.destroy();
		this.clipboardManager = undefined;

		// Globals
		this.settings?.disconnectObject(this);
		this.settings = undefined;
		this.logger = undefined;
	}
}
