import St from 'gi://St';

import * as Config from 'resource:///org/gnome/shell/misc/config.js';

export const VERSION = Number(Config.PACKAGE_VERSION.split('.')[0]);

export const ButtonMask = {
	PRIMARY: 'PRIMARY' in St.ButtonMask ? St.ButtonMask.PRIMARY : St.ButtonMask.ONE,
	MIDDLE: 'MIDDLE' in St.ButtonMask ? St.ButtonMask.MIDDLE : St.ButtonMask.TWO,
	SECONDARY: 'SECONDARY' in St.ButtonMask ? St.ButtonMask.SECONDARY : St.ButtonMask.THREE,
};
