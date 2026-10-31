import Adw from 'gi://Adw';

import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { __decorate } from '../../../thirdparty/tslib.js';
import { registerClass } from '../../common/gjs.js';
import { ShortcutRow } from './shortcutRow.js';

let NavigationShortcuts = class NavigationShortcuts extends Adw.PreferencesGroup {
	constructor() {
		super({
			title: _('Navigation'),
		});
		this.add(new ShortcutRow(_('Navigate'), 'Tab Up Down Left Right'));
		this.add(new ShortcutRow(_('Jump to Item'), '<Ctrl>0...9'));
		this.add(new ShortcutRow(_('Jump to Start'), 'Home'));
		this.add(new ShortcutRow(_('Jump to End'), 'End'));
		this.add(new ShortcutRow(_('Jump to Search'), '<Ctrl>F'));
	}
};
NavigationShortcuts = __decorate([registerClass()], NavigationShortcuts);

export { NavigationShortcuts };
