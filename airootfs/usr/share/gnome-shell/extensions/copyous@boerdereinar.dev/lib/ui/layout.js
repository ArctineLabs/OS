import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import { int32ParamSpec, registerClass } from '../common/gjs.js';

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

let FitConstraint = class FitConstraint extends Clutter.Constraint {
	_source;
	_x = 0;
	_y = 0;

	constructor(source, enabled) {
		super({
			enabled: enabled,
		});
		this._source = source;
	}

	get source() {
		return this._source;
	}

	set source(source) {
		this._source = source;
		if (this.actor) this.actor.queue_relayout();
		this.notify('source');
	}

	get x() {
		return this._x;
	}

	set x(x) {
		this._x = x;
		if (this.actor) this.actor.queue_relayout();
		this.notify('x');
	}

	get y() {
		return this._y;
	}

	set y(y) {
		this._y = y;
		if (this.actor) this.actor.queue_relayout();
		this.notify('y');
	}

	vfunc_update_allocation(_actor, allocation) {
		const [width, height] = allocation.get_size();
		const [sw, sh] = this.source.allocation.get_size();
		const x = Math.max(0, Math.min(this.x, sw - width));
		const y = Math.max(0, Math.min(this.y, sh - height));
		allocation.set_origin(x, y);
	}
};
FitConstraint = __decorate(
	[
		registerClass({
			Properties: {
				source: GObject.ParamSpec.object('source', null, null, GObject.ParamFlags.READWRITE, Clutter.Actor),
				x: int32ParamSpec('x', GObject.ParamFlags.READWRITE, 0),
				y: int32ParamSpec('y', GObject.ParamFlags.READWRITE, 0),
			},
		}),
	],
	FitConstraint,
);

export { FitConstraint };

let CollapsibleHeaderLayout = class CollapsibleHeaderLayout extends Clutter.BinLayout {
	_expansion = 1;
	_enableCollapse = true;

	get expansion() {
		return this._expansion;
	}

	set expansion(value) {
		if (this._expansion === value) return;
		this._expansion = value;
		this.notify('expansion');
		this.layout_changed();
	}

	get enableCollapse() {
		return this._enableCollapse;
	}

	set enableCollapse(value) {
		if (this._enableCollapse === value) return;
		this._enableCollapse = value;
		this.notify('enable-collapse');
		this.layout_changed();
	}

	vfunc_get_preferred_height(container, for_width) {
		let [min, nat] = [0, 0];
		const child = container.first_child;
		if (child) {
			[min, nat] = child.get_preferred_height(for_width);
			if (this._enableCollapse) {
				min *= this._expansion;
				nat *= this._expansion;
			}
		}
		return [Math.floor(min), Math.floor(nat)];
	}

	vfunc_allocate(container, allocation) {
		const child = container.first_child;
		if (child) {
			const [_cmin, cnat] = child.get_preferred_height(allocation.get_width());
			const delta = Math.min(allocation.get_height() - cnat, 0);
			const y = allocation.y1 + delta;
			const box = Clutter.ActorBox.new(allocation.x1, y, allocation.x2, y + cnat);
			child.allocate(box);
		}
	}
};
CollapsibleHeaderLayout = __decorate(
	[
		registerClass({
			Properties: {
				'expansion': GObject.ParamSpec.double('expansion', null, null, GObject.ParamFlags.READWRITE, 0, 1, 1),
				'enable-collapse': GObject.ParamSpec.boolean(
					'enable-collapse',
					null,
					null,
					GObject.ParamFlags.READWRITE,
					true,
				),
			},
		}),
	],
	CollapsibleHeaderLayout,
);

export { CollapsibleHeaderLayout };
