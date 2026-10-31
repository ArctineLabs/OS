import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import { __decorate } from '../../thirdparty/tslib.js';
import { ItemType } from '../common/constants.js';
import { int32ParamSpec, registerClass } from '../common/gjs.js';

/**
 * File operation.
 */
export const FileOperation = {
	Copy: 'copy',
	Cut: 'cut',
};

/**
 * Clipboard entry.
 */
const ClipboardEntrySignals = {
	delete: {},
};
let ClipboardEntry = class ClipboardEntry extends GObject.Object {
	_id;

	constructor(id, type, content, pinned, tag, datetime, metadata = null, title = '') {
		super();
		this._id = id;
		this.type = type;
		this.content = content;
		this.pinned = pinned;
		this.tag = tag;
		this.datetime = datetime;
		this.metadata = metadata;
		this.title = title;
	}

	get id() {
		return this._id;
	}
};
ClipboardEntry = __decorate(
	[
		registerClass({
			Properties: {
				id: int32ParamSpec('id', GObject.ParamFlags.READABLE, 0),
				type: GObject.ParamSpec.string('type', null, null, GObject.ParamFlags.READWRITE, ItemType.Text),
				content: GObject.ParamSpec.string('content', null, null, GObject.ParamFlags.READWRITE, ''),
				pinned: GObject.ParamSpec.boolean('pinned', null, null, GObject.ParamFlags.READWRITE, false),
				tag: GObject.ParamSpec.string('tag', null, null, GObject.ParamFlags.READWRITE, ''),
				datetime: GObject.ParamSpec.boxed('datetime', null, null, GObject.ParamFlags.READWRITE, GLib.DateTime),
				metadata: GObject.ParamSpec.jsobject('metadata', null, null, GObject.ParamFlags.READWRITE),
				title: GObject.ParamSpec.string('title', null, null, GObject.ParamFlags.READWRITE, ''),
			},
			Signals: ClipboardEntrySignals,
		}),
	],
	ClipboardEntry,
);

export { ClipboardEntry };
