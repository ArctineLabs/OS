var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/gi.shared.ts
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";

// src/gi.ext.ts
import Clutter from "gi://Clutter";
import Meta from "gi://Meta";
import Mtk from "gi://Mtk";
import Shell from "gi://Shell";
import St from "gi://St";
import Graphene from "gi://Graphene";
import Atk from "gi://Atk";
import Pango from "gi://Pango";

// src/utils/logger.ts
function rect_to_string(rect) {
  return `{x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}}`;
}
var logger = (prefix) => (...content) => console.log("[tilingshell]", `[${prefix}]`, ...content);

// src/utils/ui.ts
import * as Main from "resource:///org/gnome/shell/ui/main.js";
var getMonitors = () => Main.layoutManager.monitors;
var isPointInsideRect = (point, rect) => {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
};
var clampPointInsideRect = (point, rect) => {
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  return {
    x: clamp(point.x, rect.x, rect.x + rect.width),
    y: clamp(point.y, rect.y, rect.y + rect.height)
  };
};
var isTileOnContainerBorder = (tilePos, container) => {
  const almostEqual = (first, second) => Math.abs(first - second) <= 1;
  const isLeft = almostEqual(tilePos.x, container.x);
  const isTop = almostEqual(tilePos.y, container.y);
  const isRight = almostEqual(
    tilePos.x + tilePos.width,
    container.x + container.width
  );
  const isBottom = almostEqual(
    tilePos.y + tilePos.height,
    container.y + container.height
  );
  return {
    isTop,
    isRight,
    isBottom,
    isLeft
  };
};
var buildTileGaps = (tilePos, innerGaps, outerGaps, container, scalingFactor = 1) => {
  const { isTop, isRight, isBottom, isLeft } = isTileOnContainerBorder(
    tilePos,
    container
  );
  const margin = new Clutter.Margin();
  margin.top = (isTop ? outerGaps.top : innerGaps.top / 2) * scalingFactor;
  margin.bottom = (isBottom ? outerGaps.bottom : innerGaps.bottom / 2) * scalingFactor;
  margin.left = (isLeft ? outerGaps.left : innerGaps.left / 2) * scalingFactor;
  margin.right = (isRight ? outerGaps.right : innerGaps.right / 2) * scalingFactor;
  return {
    gaps: margin,
    isTop,
    isRight,
    isBottom,
    isLeft
  };
};
var getMonitorScalingFactor = (monitorIndex) => {
  const scalingFactor = St.ThemeContext.get_for_stage(
    global.get_stage()
  ).get_scale_factor();
  if (scalingFactor === 1)
    return global.display.get_monitor_scale(monitorIndex);
  return scalingFactor;
};
var getScalingFactorOf = (widget) => {
  const [hasReference, scalingReference] = widget.get_theme_node().lookup_length("scaling-reference", true);
  if (!hasReference) return [true, 1];
  const [hasValue, monitorScalingFactor] = widget.get_theme_node().lookup_length("monitor-scaling-factor", true);
  if (!hasValue) return [true, 1];
  return [scalingReference !== 1, monitorScalingFactor / scalingReference];
};
var enableScalingFactorSupport = (widget, monitorScalingFactor) => {
  if (!monitorScalingFactor) return;
  widget.set_style(`${getScalingFactorSupportString(monitorScalingFactor)};`);
};
var getScalingFactorSupportString = (monitorScalingFactor) => {
  return `scaling-reference: 1px; monitor-scaling-factor: ${monitorScalingFactor}px`;
};
function buildMarginOf(value) {
  const margin = new Clutter.Margin();
  margin.top = value;
  margin.bottom = value;
  margin.left = value;
  margin.right = value;
  return margin;
}
function buildMargin(params) {
  const margin = new Clutter.Margin();
  if (params.top) margin.top = params.top;
  if (params.bottom) margin.bottom = params.bottom;
  if (params.left) margin.left = params.left;
  if (params.right) margin.right = params.right;
  return margin;
}
function buildRectangle(params = {}) {
  return new Mtk.Rectangle({
    x: params.x || 0,
    y: params.y || 0,
    width: params.width || 0,
    height: params.height || 0
  });
}
function getTransientOrParent(window) {
  const transient = window.get_transient_for();
  return window.is_attached_dialog() && transient !== null ? transient : window;
}
function filterUnfocusableWindows(windows) {
  return windows.map(getTransientOrParent).filter((win, idx, arr) => {
    return win !== null && !win.skipTaskbar && arr.indexOf(win) === idx;
  });
}
function getWindows(workspace) {
  if (!workspace) workspace = global.workspaceManager.get_active_workspace();
  return filterUnfocusableWindows(
    global.display.get_tab_list(Meta.TabList.NORMAL_ALL, workspace)
  );
}
function getWindowsOfMonitor(monitor) {
  return global.workspaceManager.get_active_workspace().list_windows().filter(
    (win) => win.get_window_type() === Meta.WindowType.NORMAL && Main.layoutManager.monitors[win.get_monitor()] === monitor
  );
}
function squaredEuclideanDistance(pointA, pointB) {
  return (pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y);
}

// src/utils/gjs.ts
function registerGObjectClass(target) {
  if (Object.prototype.hasOwnProperty.call(target, "metaInfo")) {
    return GObject.registerClass(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      target.metaInfo,
      target
    );
  } else {
    return GObject.registerClass(target);
  }
}

// src/components/layout/Layout.ts
var Layout = class {
  id;
  tiles;
  constructor(tiles, id) {
    this.tiles = tiles;
    this.id = id;
  }
};

// src/components/layout/Tile.ts
var Tile2 = class {
  static $gtype = GObject.TYPE_JSOBJECT;
  x;
  y;
  width;
  height;
  groups;
  constructor({
    x,
    y,
    width,
    height,
    groups
  }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.groups = groups;
  }
};

// src/settings/settings.ts
var ActivationKey = /* @__PURE__ */ ((ActivationKey2) => {
  ActivationKey2[ActivationKey2["NONE"] = -1] = "NONE";
  ActivationKey2[ActivationKey2["CTRL"] = 0] = "CTRL";
  ActivationKey2[ActivationKey2["ALT"] = 1] = "ALT";
  ActivationKey2[ActivationKey2["SUPER"] = 2] = "SUPER";
  return ActivationKey2;
})(ActivationKey || {});
function get_string(key) {
  return Settings.gioSetting.get_string(key) ?? Settings.gioSetting.get_default_value(key)?.get_string()[0];
}
function set_string(key, val) {
  return Settings.gioSetting.set_string(key, val);
}
function get_boolean(key) {
  return Settings.gioSetting.get_boolean(key) ?? Settings.gioSetting.get_default_value(key)?.get_boolean();
}
function set_boolean(key, val) {
  return Settings.gioSetting.set_boolean(key, val);
}
function get_number(key) {
  return Settings.gioSetting.get_int(key) ?? Settings.gioSetting.get_default_value(key)?.get_int64();
}
function set_number(key, val) {
  return Settings.gioSetting.set_int(key, val);
}
function get_unsigned_number(key) {
  return Settings.gioSetting.get_uint(key) ?? Settings.gioSetting.get_default_value(key)?.get_uint64();
}
function set_unsigned_number(key, val) {
  return Settings.gioSetting.set_uint(key, val);
}
function get_activationkey(key, defaultValue) {
  let val = Settings.gioSetting.get_strv(key);
  if (!val || val.length === 0) {
    val = Settings.gioSetting.get_default_value(key)?.get_strv() ?? [
      String(defaultValue)
    ];
    if (val.length === 0) val = [String(defaultValue)];
  }
  return Number(val[0]);
}
function set_activationkey(key, val) {
  return Settings.gioSetting.set_strv(key, [String(val)]);
}
var Settings = class _Settings {
  static _settings;
  static _is_initialized = false;
  static KEY_LAST_VERSION_NAME_INSTALLED = "last-version-name-installed";
  static KEY_OVERRIDDEN_SETTINGS = "overridden-settings";
  static KEY_WINDOW_BORDER_COLOR = "window-border-color";
  static KEY_WINDOW_USE_CUSTOM_BORDER_COLOR = "window-use-custom-border-color";
  static KEY_TILING_SYSTEM = "enable-tiling-system";
  static KEY_SNAP_ASSIST = "enable-snap-assist";
  static KEY_SHOW_INDICATOR = "show-indicator";
  static KEY_TILING_SYSTEM_ACTIVATION_KEY = "tiling-system-activation-key";
  static KEY_TILING_SYSTEM_DEACTIVATION_KEY = "tiling-system-deactivation-key";
  static KEY_SPAN_MULTIPLE_TILES_ACTIVATION_KEY = "span-multiple-tiles-activation-key";
  static KEY_SPAN_MULTIPLE_TILES = "enable-span-multiple-tiles";
  static KEY_RESTORE_WINDOW_ORIGINAL_SIZE = "restore-window-original-size";
  static KEY_WRAPAROUND_FOCUS = "enable-wraparound-focus";
  static KEY_ENABLE_DIRECTIONAL_FOCUS_TILED_ONLY = "enable-directional-focus-tiled-only";
  static KEY_RESIZE_COMPLEMENTING_WINDOWS = "resize-complementing-windows";
  static KEY_ENABLE_BLUR_SNAP_ASSISTANT = "enable-blur-snap-assistant";
  static KEY_ENABLE_BLUR_SELECTED_TILEPREVIEW = "enable-blur-selected-tilepreview";
  static KEY_ENABLE_MOVE_KEYBINDINGS = "enable-move-keybindings";
  static KEY_ENABLE_AUTO_TILING = "enable-autotiling";
  static KEY_ACTIVE_SCREEN_EDGES = "active-screen-edges";
  static KEY_TOP_EDGE_MAXIMIZE = "top-edge-maximize";
  static KEY_OVERRIDE_WINDOW_MENU = "override-window-menu";
  static KEY_OVERRIDE_ALT_TAB = "override-alt-tab";
  static KEY_SNAP_ASSISTANT_THRESHOLD = "snap-assistant-threshold";
  static KEY_ENABLE_WINDOW_BORDER = "enable-window-border";
  static KEY_INNER_GAPS = "inner-gaps";
  static KEY_OUTER_GAPS = "outer-gaps";
  static KEY_SNAP_ASSISTANT_ANIMATION_TIME = "snap-assistant-animation-time";
  static KEY_TILE_PREVIEW_ANIMATION_TIME = "tile-preview-animation-time";
  static KEY_SETTING_LAYOUTS_JSON = "layouts-json";
  static KEY_SETTING_SELECTED_LAYOUTS = "selected-layouts";
  static KEY_WINDOW_BORDER_WIDTH = "window-border-width";
  static KEY_ENABLE_SMART_WINDOW_BORDER_RADIUS = "enable-smart-window-border-radius";
  static KEY_QUARTER_TILING_THRESHOLD = "quarter-tiling-threshold";
  static KEY_EDGE_TILING_OFFSET = "edge-tiling-offset";
  static KEY_ENABLE_TILING_SYSTEM_WINDOWS_SUGGESTIONS = "enable-tiling-system-windows-suggestions";
  static KEY_ENABLE_SNAP_ASSISTANT_WINDOWS_SUGGESTIONS = "enable-snap-assistant-windows-suggestions";
  static KEY_ENABLE_SCREEN_EDGES_WINDOWS_SUGGESTIONS = "enable-screen-edges-windows-suggestions";
  static SETTING_MOVE_WINDOW_RIGHT = "move-window-right";
  static SETTING_MOVE_WINDOW_LEFT = "move-window-left";
  static SETTING_MOVE_WINDOW_UP = "move-window-up";
  static SETTING_MOVE_WINDOW_DOWN = "move-window-down";
  static SETTING_SPAN_WINDOW_RIGHT = "span-window-right";
  static SETTING_SPAN_WINDOW_LEFT = "span-window-left";
  static SETTING_SPAN_WINDOW_UP = "span-window-up";
  static SETTING_SPAN_WINDOW_DOWN = "span-window-down";
  static SETTING_SPAN_WINDOW_ALL_TILES = "span-window-all-tiles";
  static SETTING_UNTILE_WINDOW = "untile-window";
  static SETTING_MOVE_WINDOW_CENTER = "move-window-center";
  static SETTING_FOCUS_WINDOW_RIGHT = "focus-window-right";
  static SETTING_FOCUS_WINDOW_LEFT = "focus-window-left";
  static SETTING_FOCUS_WINDOW_UP = "focus-window-up";
  static SETTING_FOCUS_WINDOW_DOWN = "focus-window-down";
  static SETTING_FOCUS_WINDOW_NEXT = "focus-window-next";
  static SETTING_FOCUS_WINDOW_PREV = "focus-window-prev";
  static SETTING_HIGHLIGHT_CURRENT_WINDOW = "highlight-current-window";
  static SETTING_CYCLE_LAYOUTS = "cycle-layouts";
  static initialize(settings) {
    if (this._is_initialized) return;
    this._is_initialized = true;
    this._settings = settings;
  }
  static destroy() {
    if (this._is_initialized) {
      this._is_initialized = false;
      this._settings = null;
    }
  }
  static get gioSetting() {
    return this._settings ?? new Gio.Settings();
  }
  static bind(key, object, property, flags = Gio.SettingsBindFlags.DEFAULT) {
    this._settings?.bind(key, object, property, flags);
  }
  static get LAST_VERSION_NAME_INSTALLED() {
    return get_string(_Settings.KEY_LAST_VERSION_NAME_INSTALLED);
  }
  static set LAST_VERSION_NAME_INSTALLED(val) {
    set_string(_Settings.KEY_LAST_VERSION_NAME_INSTALLED, val);
  }
  static get OVERRIDDEN_SETTINGS() {
    return get_string(_Settings.KEY_OVERRIDDEN_SETTINGS);
  }
  static set OVERRIDDEN_SETTINGS(val) {
    set_string(_Settings.KEY_OVERRIDDEN_SETTINGS, val);
  }
  static get TILING_SYSTEM() {
    return get_boolean(_Settings.KEY_TILING_SYSTEM);
  }
  static set TILING_SYSTEM(val) {
    set_boolean(_Settings.KEY_TILING_SYSTEM, val);
  }
  static get SNAP_ASSIST() {
    return get_boolean(_Settings.KEY_SNAP_ASSIST);
  }
  static set SNAP_ASSIST(val) {
    set_boolean(_Settings.KEY_SNAP_ASSIST, val);
  }
  static get SHOW_INDICATOR() {
    return get_boolean(_Settings.KEY_SHOW_INDICATOR);
  }
  static set SHOW_INDICATOR(val) {
    set_boolean(_Settings.KEY_SHOW_INDICATOR, val);
  }
  static get TILING_SYSTEM_ACTIVATION_KEY() {
    return get_activationkey(
      _Settings.KEY_TILING_SYSTEM_ACTIVATION_KEY,
      0 /* CTRL */
    );
  }
  static set TILING_SYSTEM_ACTIVATION_KEY(val) {
    set_activationkey(_Settings.KEY_TILING_SYSTEM_ACTIVATION_KEY, val);
  }
  static get TILING_SYSTEM_DEACTIVATION_KEY() {
    return get_activationkey(
      _Settings.KEY_TILING_SYSTEM_DEACTIVATION_KEY,
      -1 /* NONE */
    );
  }
  static set TILING_SYSTEM_DEACTIVATION_KEY(val) {
    set_activationkey(_Settings.KEY_TILING_SYSTEM_DEACTIVATION_KEY, val);
  }
  static get INNER_GAPS() {
    return get_unsigned_number(_Settings.KEY_INNER_GAPS);
  }
  static set INNER_GAPS(val) {
    set_unsigned_number(_Settings.KEY_INNER_GAPS, val);
  }
  static get OUTER_GAPS() {
    return get_unsigned_number(_Settings.KEY_OUTER_GAPS);
  }
  static set OUTER_GAPS(val) {
    set_unsigned_number(_Settings.KEY_OUTER_GAPS, val);
  }
  static get SPAN_MULTIPLE_TILES() {
    return get_boolean(_Settings.KEY_SPAN_MULTIPLE_TILES);
  }
  static set SPAN_MULTIPLE_TILES(val) {
    set_boolean(_Settings.KEY_SPAN_MULTIPLE_TILES, val);
  }
  static get SPAN_MULTIPLE_TILES_ACTIVATION_KEY() {
    return get_activationkey(
      _Settings.KEY_SPAN_MULTIPLE_TILES_ACTIVATION_KEY,
      1 /* ALT */
    );
  }
  static set SPAN_MULTIPLE_TILES_ACTIVATION_KEY(val) {
    set_activationkey(_Settings.KEY_SPAN_MULTIPLE_TILES_ACTIVATION_KEY, val);
  }
  static get RESTORE_WINDOW_ORIGINAL_SIZE() {
    return get_boolean(_Settings.KEY_RESTORE_WINDOW_ORIGINAL_SIZE);
  }
  static set RESTORE_WINDOW_ORIGINAL_SIZE(val) {
    set_boolean(_Settings.KEY_RESTORE_WINDOW_ORIGINAL_SIZE, val);
  }
  static get WRAPAROUND_FOCUS() {
    return get_boolean(_Settings.KEY_WRAPAROUND_FOCUS);
  }
  static set WRAPAROUND_FOCUS(val) {
    set_boolean(_Settings.KEY_WRAPAROUND_FOCUS, val);
  }
  static get ENABLE_DIRECTIONAL_FOCUS_TILED_ONLY() {
    return get_boolean(_Settings.KEY_ENABLE_DIRECTIONAL_FOCUS_TILED_ONLY);
  }
  static set ENABLE_DIRECTIONAL_FOCUS_TILED_ONLY(val) {
    set_boolean(_Settings.KEY_ENABLE_DIRECTIONAL_FOCUS_TILED_ONLY, val);
  }
  static get RESIZE_COMPLEMENTING_WINDOWS() {
    return get_boolean(_Settings.KEY_RESIZE_COMPLEMENTING_WINDOWS);
  }
  static set RESIZE_COMPLEMENTING_WINDOWS(val) {
    set_boolean(_Settings.KEY_RESIZE_COMPLEMENTING_WINDOWS, val);
  }
  static get ENABLE_BLUR_SNAP_ASSISTANT() {
    return get_boolean(_Settings.KEY_ENABLE_BLUR_SNAP_ASSISTANT);
  }
  static set ENABLE_BLUR_SNAP_ASSISTANT(val) {
    set_boolean(_Settings.KEY_ENABLE_BLUR_SNAP_ASSISTANT, val);
  }
  static get ENABLE_BLUR_SELECTED_TILEPREVIEW() {
    return get_boolean(_Settings.KEY_ENABLE_BLUR_SELECTED_TILEPREVIEW);
  }
  static set ENABLE_BLUR_SELECTED_TILEPREVIEW(val) {
    set_boolean(_Settings.KEY_ENABLE_BLUR_SELECTED_TILEPREVIEW, val);
  }
  static get ENABLE_MOVE_KEYBINDINGS() {
    return get_boolean(_Settings.KEY_ENABLE_MOVE_KEYBINDINGS);
  }
  static set ENABLE_MOVE_KEYBINDINGS(val) {
    set_boolean(_Settings.KEY_ENABLE_MOVE_KEYBINDINGS, val);
  }
  static get ENABLE_AUTO_TILING() {
    return get_boolean(_Settings.KEY_ENABLE_AUTO_TILING);
  }
  static set ENABLE_AUTO_TILING(val) {
    set_boolean(_Settings.KEY_ENABLE_AUTO_TILING, val);
  }
  static get ACTIVE_SCREEN_EDGES() {
    return get_boolean(_Settings.KEY_ACTIVE_SCREEN_EDGES);
  }
  static set ACTIVE_SCREEN_EDGES(val) {
    set_boolean(_Settings.KEY_ACTIVE_SCREEN_EDGES, val);
  }
  static get TOP_EDGE_MAXIMIZE() {
    return get_boolean(_Settings.KEY_TOP_EDGE_MAXIMIZE);
  }
  static set TOP_EDGE_MAXIMIZE(val) {
    set_boolean(_Settings.KEY_TOP_EDGE_MAXIMIZE, val);
  }
  static get OVERRIDE_WINDOW_MENU() {
    return get_boolean(_Settings.KEY_OVERRIDE_WINDOW_MENU);
  }
  static set OVERRIDE_WINDOW_MENU(val) {
    set_boolean(_Settings.KEY_OVERRIDE_WINDOW_MENU, val);
  }
  static get OVERRIDE_ALT_TAB() {
    return get_boolean(_Settings.KEY_OVERRIDE_ALT_TAB);
  }
  static set OVERRIDE_ALT_TAB(val) {
    set_boolean(_Settings.KEY_OVERRIDE_ALT_TAB, val);
  }
  static get SNAP_ASSISTANT_THRESHOLD() {
    return get_number(_Settings.KEY_SNAP_ASSISTANT_THRESHOLD);
  }
  static set SNAP_ASSISTANT_THRESHOLD(val) {
    set_number(_Settings.KEY_SNAP_ASSISTANT_THRESHOLD, val);
  }
  static get QUARTER_TILING_THRESHOLD() {
    return get_unsigned_number(_Settings.KEY_QUARTER_TILING_THRESHOLD);
  }
  static set QUARTER_TILING_THRESHOLD(val) {
    set_unsigned_number(_Settings.KEY_QUARTER_TILING_THRESHOLD, val);
  }
  static get EDGE_TILING_OFFSET() {
    return get_unsigned_number(_Settings.KEY_EDGE_TILING_OFFSET);
  }
  static set EDGE_TILING_OFFSET(val) {
    set_unsigned_number(_Settings.KEY_EDGE_TILING_OFFSET, val);
  }
  static get WINDOW_BORDER_COLOR() {
    return get_string(_Settings.KEY_WINDOW_BORDER_COLOR);
  }
  static set WINDOW_BORDER_COLOR(val) {
    set_string(_Settings.KEY_WINDOW_BORDER_COLOR, val);
  }
  static get WINDOW_USE_CUSTOM_BORDER_COLOR() {
    return get_boolean(_Settings.KEY_WINDOW_USE_CUSTOM_BORDER_COLOR);
  }
  static set WINDOW_USE_CUSTOM_BORDER_COLOR(val) {
    set_boolean(_Settings.KEY_WINDOW_USE_CUSTOM_BORDER_COLOR, val);
  }
  static get WINDOW_BORDER_WIDTH() {
    return get_unsigned_number(_Settings.KEY_WINDOW_BORDER_WIDTH);
  }
  static set WINDOW_BORDER_WIDTH(val) {
    set_unsigned_number(_Settings.KEY_WINDOW_BORDER_WIDTH, val);
  }
  static get ENABLE_SMART_WINDOW_BORDER_RADIUS() {
    return get_boolean(_Settings.KEY_ENABLE_SMART_WINDOW_BORDER_RADIUS);
  }
  static set ENABLE_SMART_WINDOW_BORDER_RADIUS(val) {
    set_boolean(_Settings.KEY_ENABLE_SMART_WINDOW_BORDER_RADIUS, val);
  }
  static get ENABLE_WINDOW_BORDER() {
    return get_boolean(_Settings.KEY_ENABLE_WINDOW_BORDER);
  }
  static set ENABLE_WINDOW_BORDER(val) {
    set_boolean(_Settings.KEY_ENABLE_WINDOW_BORDER, val);
  }
  static get SNAP_ASSISTANT_ANIMATION_TIME() {
    return get_unsigned_number(_Settings.KEY_SNAP_ASSISTANT_ANIMATION_TIME);
  }
  static set SNAP_ASSISTANT_ANIMATION_TIME(val) {
    set_unsigned_number(_Settings.KEY_SNAP_ASSISTANT_ANIMATION_TIME, val);
  }
  static get TILE_PREVIEW_ANIMATION_TIME() {
    return get_unsigned_number(_Settings.KEY_TILE_PREVIEW_ANIMATION_TIME);
  }
  static set TILE_PREVIEW_ANIMATION_TIME(val) {
    set_unsigned_number(_Settings.KEY_TILE_PREVIEW_ANIMATION_TIME, val);
  }
  static get ENABLE_TILING_SYSTEM_WINDOWS_SUGGESTIONS() {
    return get_boolean(
      _Settings.KEY_ENABLE_TILING_SYSTEM_WINDOWS_SUGGESTIONS
    );
  }
  static set ENABLE_TILING_SYSTEM_WINDOWS_SUGGESTIONS(val) {
    set_boolean(_Settings.KEY_ENABLE_TILING_SYSTEM_WINDOWS_SUGGESTIONS, val);
  }
  static get ENABLE_SNAP_ASSISTANT_WINDOWS_SUGGESTIONS() {
    return get_boolean(
      _Settings.KEY_ENABLE_SNAP_ASSISTANT_WINDOWS_SUGGESTIONS
    );
  }
  static set ENABLE_SNAP_ASSISTANT_WINDOWS_SUGGESTIONS(val) {
    set_boolean(
      _Settings.KEY_ENABLE_SNAP_ASSISTANT_WINDOWS_SUGGESTIONS,
      val
    );
  }
  static get ENABLE_SCREEN_EDGES_WINDOWS_SUGGESTIONS() {
    return get_boolean(
      _Settings.KEY_ENABLE_SCREEN_EDGES_WINDOWS_SUGGESTIONS
    );
  }
  static set ENABLE_SCREEN_EDGES_WINDOWS_SUGGESTIONS(val) {
    set_boolean(_Settings.KEY_ENABLE_SCREEN_EDGES_WINDOWS_SUGGESTIONS, val);
  }
  static get_inner_gaps(scaleFactor = 1) {
    const value = this.INNER_GAPS * scaleFactor;
    return {
      top: value,
      bottom: value,
      left: value,
      right: value
    };
  }
  static get_outer_gaps(scaleFactor = 1) {
    const value = this.OUTER_GAPS * scaleFactor;
    return {
      top: value,
      bottom: value,
      left: value,
      right: value
    };
  }
  static get_layouts_json() {
    try {
      const layouts = JSON.parse(
        this._settings?.get_string(this.KEY_SETTING_LAYOUTS_JSON) || "[]"
      );
      if (layouts.length === 0)
        throw new Error("At least one layout is required");
      return layouts.filter((layout) => layout.tiles.length > 0);
    } catch (ex) {
      this.reset_layouts_json();
      return JSON.parse(
        this._settings?.get_string(this.KEY_SETTING_LAYOUTS_JSON) || "[]"
      );
    }
  }
  static get_selected_layouts() {
    const variant = this._settings?.get_value(
      _Settings.KEY_SETTING_SELECTED_LAYOUTS
    );
    if (!variant) return [];
    const result = [];
    for (let i = 0; i < variant.n_children(); i++) {
      const monitor_variant = variant.get_child_value(i);
      if (!monitor_variant) continue;
      const n_workspaces = monitor_variant.n_children();
      const monitor_result = [];
      for (let j = 0; j < n_workspaces; j++) {
        const layout_variant = monitor_variant.get_child_value(j);
        if (!layout_variant) continue;
        monitor_result.push(layout_variant.get_string()[0]);
      }
      result.push(monitor_result);
    }
    return result;
  }
  static reset_layouts_json() {
    this.save_layouts_json([
      new Layout(
        [
          new Tile2({
            x: 0,
            y: 0,
            height: 0.5,
            width: 0.22,
            groups: [1, 2]
          }),
          // top-left
          new Tile2({
            x: 0,
            y: 0.5,
            height: 0.5,
            width: 0.22,
            groups: [1, 2]
          }),
          // bottom-left
          new Tile2({
            x: 0.22,
            y: 0,
            height: 1,
            width: 0.56,
            groups: [2, 3]
          }),
          // center
          new Tile2({
            x: 0.78,
            y: 0,
            height: 0.5,
            width: 0.22,
            groups: [3, 4]
          }),
          // top-right
          new Tile2({
            x: 0.78,
            y: 0.5,
            height: 0.5,
            width: 0.22,
            groups: [3, 4]
          })
          // bottom-right
        ],
        "Layout 1"
      ),
      new Layout(
        [
          new Tile2({
            x: 0,
            y: 0,
            height: 1,
            width: 0.22,
            groups: [1]
          }),
          new Tile2({
            x: 0.22,
            y: 0,
            height: 1,
            width: 0.56,
            groups: [1, 2]
          }),
          new Tile2({
            x: 0.78,
            y: 0,
            height: 1,
            width: 0.22,
            groups: [2]
          })
        ],
        "Layout 2"
      ),
      new Layout(
        [
          new Tile2({
            x: 0,
            y: 0,
            height: 1,
            width: 0.33,
            groups: [1]
          }),
          new Tile2({
            x: 0.33,
            y: 0,
            height: 1,
            width: 0.67,
            groups: [1]
          })
        ],
        "Layout 3"
      ),
      new Layout(
        [
          new Tile2({
            x: 0,
            y: 0,
            height: 1,
            width: 0.67,
            groups: [1]
          }),
          new Tile2({
            x: 0.67,
            y: 0,
            height: 1,
            width: 0.33,
            groups: [1]
          })
        ],
        "Layout 4"
      )
    ]);
  }
  static save_layouts_json(layouts) {
    this._settings?.set_string(
      this.KEY_SETTING_LAYOUTS_JSON,
      JSON.stringify(layouts)
    );
  }
  static save_selected_layouts(ids) {
    if (ids.length === 0) {
      this._settings?.reset(_Settings.KEY_SETTING_SELECTED_LAYOUTS);
      return;
    }
    const variants = ids.map(
      (monitor_ids) => GLib.Variant.new_strv(monitor_ids)
    );
    const result = GLib.Variant.new_array(null, variants);
    this._settings?.set_value(
      _Settings.KEY_SETTING_SELECTED_LAYOUTS,
      result
    );
  }
  static connect(key, func) {
    return this._settings?.connect(`changed::${key}`, func) || -1;
  }
  static disconnect(id) {
    this._settings?.disconnect(id);
  }
};

// src/utils/signalHandling.ts
var SignalHandling = class {
  _signalsIds;
  constructor() {
    this._signalsIds = {};
  }
  connect(obj, key, fun) {
    const signalId = obj.connect(key, fun);
    this._signalsIds[key] = { id: signalId, obj };
  }
  disconnect(obj) {
    if (!obj) {
      const toDelete = [];
      Object.keys(this._signalsIds).forEach((key) => {
        this._signalsIds[key].obj.disconnect(this._signalsIds[key].id);
        toDelete.push(key);
      });
      const result = toDelete.length > 0;
      toDelete.forEach((key) => delete this._signalsIds[key]);
      return result;
    } else {
      const keyFound = Object.keys(this._signalsIds).find(
        (key) => this._signalsIds[key].obj === obj
      );
      if (keyFound) {
        obj.disconnect(this._signalsIds[keyFound].id);
        delete this._signalsIds[keyFound];
      }
      return keyFound;
    }
  }
};

// src/utils/globalState.ts
import * as Main2 from "resource:///org/gnome/shell/ui/main.js";
var debug = logger("GlobalState");
var GlobalState = class extends GObject.Object {
  _signals;
  _layouts;
  _tilePreviewAnimationTime;
  // if workspaces are reordered, we use this map to know which layouts where selected
  // to each workspace and we save the new ordering in the settings
  _selected_layouts;
  // used to handle reordering of workspaces
  static get() {
    if (!this._instance) this._instance = new GlobalState();
    return this._instance;
  }
  static destroy() {
    if (this._instance) {
      this._instance._signals.disconnect();
      this._instance._layouts = [];
      this._instance = null;
    }
  }
  constructor() {
    super();
    this._signals = new SignalHandling();
    this._layouts = Settings.get_layouts_json();
    this._tilePreviewAnimationTime = 100;
    this._selected_layouts = /* @__PURE__ */ new Map();
    this.validate_selected_layouts();
    Settings.bind(
      Settings.KEY_TILE_PREVIEW_ANIMATION_TIME,
      this,
      "tilePreviewAnimationTime",
      Gio.SettingsBindFlags.GET
    );
    this._signals.connect(
      Settings,
      Settings.KEY_SETTING_LAYOUTS_JSON,
      () => {
        this._layouts = Settings.get_layouts_json();
        this.emit(GlobalState.SIGNAL_LAYOUTS_CHANGED);
      }
    );
    this._signals.connect(
      Settings,
      Settings.KEY_SETTING_SELECTED_LAYOUTS,
      () => {
        const selected_layouts = Settings.get_selected_layouts();
        if (selected_layouts.length === 0) {
          this.validate_selected_layouts();
          return;
        }
        const defaultLayout = this._layouts[0];
        const n_monitors = Main2.layoutManager.monitors.length;
        const n_workspaces = global.workspaceManager.get_n_workspaces();
        for (let i = 0; i < n_workspaces; i++) {
          const ws = global.workspaceManager.get_workspace_by_index(i);
          if (!ws) continue;
          const monitors_layouts = i < selected_layouts.length ? selected_layouts[i] : [defaultLayout.id];
          while (monitors_layouts.length < n_monitors)
            monitors_layouts.push(defaultLayout.id);
          while (monitors_layouts.length > n_monitors)
            monitors_layouts.pop();
          this._selected_layouts.set(ws, monitors_layouts);
        }
      }
    );
    this._signals.connect(
      global.workspaceManager,
      "workspace-added",
      (_2, index) => {
        const n_workspaces = global.workspaceManager.get_n_workspaces();
        const newWs = global.workspaceManager.get_workspace_by_index(index);
        if (!newWs) return;
        debug(`added workspace ${index}`);
        const secondLastWs = global.workspaceManager.get_workspace_by_index(
          n_workspaces - 2
        );
        const secondLastWsLayoutsId = secondLastWs ? this._selected_layouts.get(secondLastWs) ?? [] : [];
        if (secondLastWsLayoutsId.length === 0) {
          secondLastWsLayoutsId.push(
            ...Main2.layoutManager.monitors.map(
              () => this._layouts[0].id
            )
          );
        }
        this._selected_layouts.set(
          newWs,
          secondLastWsLayoutsId
          // Main.layoutManager.monitors.map(() => layout.id),
        );
        const to_be_saved = [];
        for (let i = 0; i < n_workspaces; i++) {
          const ws = global.workspaceManager.get_workspace_by_index(i);
          if (!ws) continue;
          const monitors_layouts = this._selected_layouts.get(ws);
          if (!monitors_layouts) continue;
          to_be_saved.push(monitors_layouts);
        }
        Settings.save_selected_layouts(to_be_saved);
      }
    );
    this._signals.connect(
      global.workspaceManager,
      "workspace-removed",
      (_2) => {
        const newMap = /* @__PURE__ */ new Map();
        const n_workspaces = global.workspaceManager.get_n_workspaces();
        const to_be_saved = [];
        for (let i = 0; i < n_workspaces; i++) {
          const ws = global.workspaceManager.get_workspace_by_index(i);
          if (!ws) continue;
          const monitors_layouts = this._selected_layouts.get(ws);
          if (!monitors_layouts) continue;
          this._selected_layouts.delete(ws);
          newMap.set(ws, monitors_layouts);
          to_be_saved.push(monitors_layouts);
        }
        Settings.save_selected_layouts(to_be_saved);
        this._selected_layouts.clear();
        this._selected_layouts = newMap;
        debug("deleted workspace");
      }
    );
    this._signals.connect(
      global.workspaceManager,
      "workspaces-reordered",
      (_2) => {
        this._save_selected_layouts();
        debug("reordered workspaces");
      }
    );
  }
  validate_selected_layouts() {
    const n_monitors = Main2.layoutManager.monitors.length;
    const old_selected_layouts = Settings.get_selected_layouts();
    for (let i = 0; i < global.workspaceManager.get_n_workspaces(); i++) {
      const ws = global.workspaceManager.get_workspace_by_index(i);
      if (!ws) continue;
      const monitors_layouts = i < old_selected_layouts.length ? old_selected_layouts[i] : [];
      while (monitors_layouts.length < n_monitors)
        monitors_layouts.push(this._layouts[0].id);
      while (monitors_layouts.length > n_monitors) monitors_layouts.pop();
      monitors_layouts.forEach((_2, ind) => {
        if (this._layouts.findIndex(
          (lay) => lay.id === monitors_layouts[ind]
        ) === -1)
          monitors_layouts[ind] = monitors_layouts[0];
      });
      this._selected_layouts.set(ws, monitors_layouts);
    }
    this._save_selected_layouts();
  }
  _save_selected_layouts() {
    const to_be_saved = [];
    const n_workspaces = global.workspaceManager.get_n_workspaces();
    for (let i = 0; i < n_workspaces; i++) {
      const ws = global.workspaceManager.get_workspace_by_index(i);
      if (!ws) continue;
      const monitors_layouts = this._selected_layouts.get(ws);
      if (!monitors_layouts) continue;
      to_be_saved.push(monitors_layouts);
    }
    Settings.save_selected_layouts(to_be_saved);
  }
  get layouts() {
    return this._layouts;
  }
  addLayout(newLay) {
    this._layouts.push(newLay);
    this.layouts = this._layouts;
  }
  deleteLayout(layoutToDelete) {
    const layFoundIndex = this._layouts.findIndex(
      (lay) => lay.id === layoutToDelete.id
    );
    if (layFoundIndex === -1) return;
    this._layouts.splice(layFoundIndex, 1);
    this.layouts = this._layouts;
    this._selected_layouts.forEach((monitors_selected) => {
      if (layoutToDelete.id === monitors_selected[Main2.layoutManager.primaryIndex]) {
        monitors_selected[Main2.layoutManager.primaryIndex] = this._layouts[0].id;
        this._save_selected_layouts();
      }
    });
  }
  editLayout(newLay) {
    const layFoundIndex = this._layouts.findIndex(
      (lay) => lay.id === newLay.id
    );
    if (layFoundIndex === -1) return;
    this._layouts[layFoundIndex] = newLay;
    this.layouts = this._layouts;
  }
  set layouts(layouts) {
    this._layouts = layouts;
    Settings.save_layouts_json(layouts);
    this.emit(GlobalState.SIGNAL_LAYOUTS_CHANGED);
  }
  getSelectedLayoutOfMonitor(monitorIndex, workspaceIndex) {
    const selectedLayouts = Settings.get_selected_layouts();
    if (workspaceIndex < 0 || workspaceIndex >= selectedLayouts.length)
      workspaceIndex = 0;
    const monitors_selected = workspaceIndex < selectedLayouts.length ? selectedLayouts[workspaceIndex] : GlobalState.get().layouts[0].id;
    if (monitorIndex < 0 || monitorIndex >= monitors_selected.length)
      monitorIndex = 0;
    return this._layouts.find(
      (lay) => lay.id === monitors_selected[monitorIndex]
    ) || this._layouts[0];
  }
  get tilePreviewAnimationTime() {
    return this._tilePreviewAnimationTime;
  }
  set tilePreviewAnimationTime(value) {
    this._tilePreviewAnimationTime = value;
  }
  setSelectedLayoutOfMonitor(layoutToSelectId, monitorIndex) {
    const selected = Settings.get_selected_layouts();
    selected[global.workspaceManager.get_active_workspace_index()][monitorIndex] = layoutToSelectId;
    const n_workspaces = global.workspaceManager.get_n_workspaces();
    if (global.workspaceManager.get_active_workspace_index() === n_workspaces - 2) {
      const lastWs = global.workspaceManager.get_workspace_by_index(
        n_workspaces - 1
      );
      if (!lastWs) return;
      const tiledWindows = getWindows(lastWs).find(
        (win) => win.assignedTile && win.get_monitor() === monitorIndex
      );
      if (!tiledWindows) {
        selected[lastWs.index()][monitorIndex] = layoutToSelectId;
      }
    }
    Settings.save_selected_layouts(selected);
  }
};
__publicField(GlobalState, "metaInfo", {
  GTypeName: "GlobalState",
  Signals: {
    "layouts-changed": {
      param_types: []
    }
  },
  Properties: {
    tilePreviewAnimationTime: GObject.ParamSpec.uint(
      "tilePreviewAnimationTime",
      "tilePreviewAnimationTime",
      "Animation time of tile previews in milliseconds",
      GObject.ParamFlags.READWRITE,
      0,
      2e3,
      100
    )
  }
});
__publicField(GlobalState, "SIGNAL_LAYOUTS_CHANGED", "layouts-changed");
__publicField(GlobalState, "_instance");
GlobalState = __decorateClass([
  registerGObjectClass
], GlobalState);

// src/components/tilepreview/tilePreview.ts
var debug2 = logger("TilePreview");
var TilePreview = class extends St.Widget {
  _rect;
  _showing;
  _tile;
  _gaps;
  constructor(params) {
    super(params);
    if (params.parent) params.parent.add_child(this);
    this._showing = false;
    this._rect = params.rect || buildRectangle({});
    this._gaps = new Clutter.Margin();
    this.gaps = params.gaps || new Clutter.Margin();
    this._tile = params.tile || new Tile2({ x: 0, y: 0, width: 0, height: 0, groups: [] });
  }
  set gaps(gaps) {
    const [, scalingFactor] = getScalingFactorOf(this);
    this._gaps.top = gaps.top * scalingFactor;
    this._gaps.right = gaps.right * scalingFactor;
    this._gaps.bottom = gaps.bottom * scalingFactor;
    this._gaps.left = gaps.left * scalingFactor;
  }
  updateBorderRadius(hasNeighborTop, hasNeighborRight, hasNeighborBottom, hasNeighborLeft) {
    this.remove_style_class_name("top-left-border-radius");
    this.remove_style_class_name("top-right-border-radius");
    this.remove_style_class_name("bottom-right-border-radius");
    this.remove_style_class_name("bottom-left-border-radius");
    this.remove_style_class_name("custom-tile-preview");
    const topLeft = hasNeighborTop && hasNeighborLeft;
    const topRight = hasNeighborTop && hasNeighborRight;
    const bottomRight = hasNeighborBottom && hasNeighborRight;
    const bottomLeft = hasNeighborBottom && hasNeighborLeft;
    if (topLeft) this.add_style_class_name("top-left-border-radius");
    if (topRight) this.add_style_class_name("top-right-border-radius");
    if (bottomRight)
      this.add_style_class_name("bottom-right-border-radius");
    if (bottomLeft) this.add_style_class_name("bottom-left-border-radius");
  }
  get gaps() {
    return this._gaps;
  }
  get tile() {
    return this._tile;
  }
  _init() {
    super._init();
    this.set_style_class_name("tile-preview");
    this.hide();
  }
  get innerX() {
    return this._rect.x + this._gaps.left;
  }
  get innerY() {
    return this._rect.y + this._gaps.top;
  }
  get innerWidth() {
    return this._rect.width - this._gaps.right - this._gaps.left;
  }
  get innerHeight() {
    return this._rect.height - this._gaps.top - this._gaps.bottom;
  }
  get rect() {
    return this._rect;
  }
  get showing() {
    return this._showing;
  }
  open(ease = false, position) {
    if (position) this._rect = position;
    const fadeInMove = this._showing;
    this._showing = true;
    this.show();
    if (fadeInMove) {
      this.ease({
        x: this.innerX,
        y: this.innerY,
        width: this.innerWidth,
        height: this.innerHeight,
        opacity: 255,
        duration: ease ? GlobalState.get().tilePreviewAnimationTime : 0,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD
      });
    } else {
      this.set_position(this.innerX, this.innerY);
      this.set_size(this.innerWidth, this.innerHeight);
      this.ease({
        opacity: 255,
        duration: ease ? GlobalState.get().tilePreviewAnimationTime : 0,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD
      });
    }
  }
  openBelow(window, ease = false, position) {
    if (this.get_parent() === global.windowGroup) {
      const windowActor = window.get_compositor_private();
      if (!windowActor) return;
      global.windowGroup.set_child_below_sibling(this, windowActor);
    }
    this.open(ease, position);
  }
  openAbove(window, ease = false, position) {
    if (this.get_parent() === global.windowGroup) {
      global.windowGroup.set_child_above_sibling(this, null);
    }
    this.open(ease, position);
  }
  close(ease = false) {
    if (!this._showing) return;
    this._showing = false;
    this.ease({
      opacity: 0,
      duration: ease ? GlobalState.get().tilePreviewAnimationTime : 0,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => this.hide()
    });
  }
};
TilePreview = __decorateClass([
  registerGObjectClass
], TilePreview);

// src/components/layout/TileUtils.ts
var TileUtils = class {
  static apply_props(tile, container) {
    return buildRectangle({
      x: Math.round(container.width * tile.x + container.x),
      y: Math.round(container.height * tile.y + container.y),
      width: Math.round(container.width * tile.width),
      height: Math.round(container.height * tile.height)
    });
  }
  static apply_props_relative_to(tile, container) {
    return buildRectangle({
      x: Math.round(container.width * tile.x),
      y: Math.round(container.height * tile.y),
      width: Math.round(container.width * tile.width),
      height: Math.round(container.height * tile.height)
    });
  }
  static build_tile(rect, container) {
    return new Tile2({
      x: (rect.x - container.x) / container.width,
      y: (rect.y - container.y) / container.height,
      width: rect.width / container.width,
      height: rect.height / container.height,
      groups: []
    });
  }
};

// src/components/layout/LayoutWidget.ts
var debug3 = logger("LayoutWidget");
var LayoutWidget = class extends St.Widget {
  _previews;
  _containerRect;
  _layout;
  _innerGaps;
  _outerGaps;
  _scalingFactor;
  constructor(params) {
    super({ styleClass: params.styleClass || "" });
    if (params.parent) params.parent.add_child(this);
    this._scalingFactor = 1;
    if (params.scalingFactor) this.scalingFactor = params.scalingFactor;
    this._previews = [];
    this._containerRect = params.containerRect || buildRectangle();
    this._layout = params.layout || new Layout([], "");
    this._innerGaps = params.innerGaps || new Clutter.Margin();
    this._outerGaps = params.outerGaps || new Clutter.Margin();
  }
  set scalingFactor(value) {
    enableScalingFactorSupport(this, value);
    this._scalingFactor = value;
  }
  get scalingFactor() {
    return this._scalingFactor;
  }
  get innerGaps() {
    return this._innerGaps.copy();
  }
  get outerGaps() {
    return this._outerGaps.copy();
  }
  get layout() {
    return this._layout;
  }
  draw_layout() {
    const containerWithoutOuterGaps = buildRectangle({
      x: this._outerGaps.left + this._containerRect.x,
      y: this._outerGaps.top + this._containerRect.y,
      width: this._containerRect.width - this._outerGaps.left - this._outerGaps.right,
      height: this._containerRect.height - this._outerGaps.top - this._outerGaps.bottom
    });
    this._previews = this._layout.tiles.map((tile) => {
      const tileRect = TileUtils.apply_props(
        tile,
        containerWithoutOuterGaps
      );
      const { gaps, isTop, isRight, isBottom, isLeft } = buildTileGaps(
        tileRect,
        this._innerGaps,
        this._outerGaps,
        containerWithoutOuterGaps
      );
      if (isTop) {
        tileRect.height += this._outerGaps.top;
        tileRect.y -= this._outerGaps.top;
      }
      if (isLeft) {
        tileRect.width += this._outerGaps.left;
        tileRect.x -= this._outerGaps.left;
      }
      if (isRight) tileRect.width += this._outerGaps.right;
      if (isBottom) tileRect.height += this._outerGaps.bottom;
      return this.buildTile(this, tileRect, gaps, tile);
    });
  }
  buildTile(_parent, _rect, _margin, _tile) {
    throw new Error(
      "This class shouldn't be instantiated but it should be extended instead"
    );
  }
  relayout(params) {
    let trigger_relayout = this._previews.length === 0;
    if (params?.layout && this._layout !== params.layout) {
      this._layout = params.layout;
      trigger_relayout = true;
    }
    if (params?.innerGaps) {
      trigger_relayout || (trigger_relayout = !this._areGapsEqual(
        this._innerGaps,
        params.innerGaps
      ));
      this._innerGaps = params.innerGaps.copy();
    }
    if (params?.outerGaps && this._outerGaps !== params.outerGaps) {
      trigger_relayout || (trigger_relayout = !this._areGapsEqual(
        this._outerGaps,
        params.outerGaps
      ));
      this._outerGaps = params.outerGaps.copy();
    }
    if (params?.containerRect && !this._containerRect.equal(params.containerRect)) {
      this._containerRect = params.containerRect.copy();
      trigger_relayout = true;
    }
    if (!trigger_relayout) {
      debug3("relayout not needed");
      return false;
    }
    this._previews?.forEach((preview) => {
      if (preview.get_parent() === this) this.remove_child(preview);
      preview.destroy();
    });
    this._previews = [];
    if (this._containerRect.width === 0 || this._containerRect.height === 0)
      return true;
    this.draw_layout();
    this._previews.forEach((lay) => lay.open());
    return true;
  }
  _areGapsEqual(first, second) {
    return first.bottom === second.bottom && first.top === second.top && first.left === second.left && first.right === second.right;
  }
};
LayoutWidget = __decorateClass([
  registerGObjectClass
], LayoutWidget);

// src/settings/settingsOverride.ts
var SettingsOverride = class _SettingsOverride {
  // map schema_id with map of keys and old values
  _overriddenKeys;
  static _instance;
  constructor() {
    this._overriddenKeys = this._jsonToOverriddenKeys(
      Settings.OVERRIDDEN_SETTINGS
    );
  }
  static get() {
    if (!this._instance) this._instance = new _SettingsOverride();
    return this._instance;
  }
  static destroy() {
    if (!this._instance) return;
    this._instance.restoreAll();
    this._instance = null;
  }
  /*
  json will have the following structure
  {
      "schema.id": {
          "overridden.key.one": oldvalue,
          "overridden.key.two": oldvalue
          ...
      },
      ...
  }
  */
  _overriddenKeysToJSON() {
    const obj = {};
    this._overriddenKeys.forEach((override, schemaId) => {
      obj[schemaId] = {};
      override.forEach((oldValue, key) => {
        obj[schemaId][key] = oldValue.print(true);
      });
    });
    return JSON.stringify(obj);
  }
  _jsonToOverriddenKeys(json) {
    const result = /* @__PURE__ */ new Map();
    const obj = JSON.parse(json);
    for (const schemaId in obj) {
      const schemaMap = /* @__PURE__ */ new Map();
      result.set(schemaId, schemaMap);
      const overrideObj = obj[schemaId];
      for (const key in overrideObj) {
        schemaMap.set(
          key,
          GLib.Variant.parse(null, overrideObj[key], null, null)
        );
      }
    }
    return result;
  }
  override(giosettings, keyToOverride, newValue) {
    const schemaId = giosettings.schemaId;
    const schemaMap = this._overriddenKeys.get(schemaId) || /* @__PURE__ */ new Map();
    if (!this._overriddenKeys.has(schemaId))
      this._overriddenKeys.set(schemaId, schemaMap);
    const oldValue = schemaMap.has(keyToOverride) ? schemaMap.get(keyToOverride) : giosettings.get_value(keyToOverride);
    const res = giosettings.set_value(keyToOverride, newValue);
    if (!res) return null;
    if (!schemaMap.has(keyToOverride)) {
      schemaMap.set(keyToOverride, oldValue);
      Settings.OVERRIDDEN_SETTINGS = this._overriddenKeysToJSON();
    }
    return oldValue;
  }
  restoreKey(giosettings, keyToOverride) {
    const overridden = this._overriddenKeys.get(giosettings.schemaId);
    if (!overridden) return null;
    const oldValue = overridden.get(keyToOverride);
    if (!oldValue) return null;
    const res = giosettings.set_value(keyToOverride, oldValue);
    if (res) {
      overridden.delete(keyToOverride);
      if (overridden.size === 0)
        this._overriddenKeys.delete(giosettings.schemaId);
      Settings.OVERRIDDEN_SETTINGS = this._overriddenKeysToJSON();
    }
    return oldValue;
  }
  restoreAll() {
    const schemaToDelete = [];
    this._overriddenKeys.forEach(
      (map, schemaId) => {
        const giosettings = new Gio.Settings({ schemaId });
        const overridden = this._overriddenKeys.get(
          giosettings.schemaId
        );
        if (!overridden) return;
        const toDelete = [];
        overridden.forEach((oldValue, key) => {
          const done = giosettings.set_value(key, oldValue);
          if (done) toDelete.push(key);
        });
        toDelete.forEach((key) => overridden.delete(key));
        if (overridden.size === 0) schemaToDelete.push(schemaId);
      }
    );
    schemaToDelete.forEach((schemaId) => {
      this._overriddenKeys.delete(schemaId);
    });
    if (this._overriddenKeys.size === 0) this._overriddenKeys = /* @__PURE__ */ new Map();
    Settings.OVERRIDDEN_SETTINGS = this._overriddenKeysToJSON();
  }
};

// src/keybindings.ts
import * as Main3 from "resource:///org/gnome/shell/ui/main.js";
var debug4 = logger("KeyBindings");
var KeyBindingsDirection = /* @__PURE__ */ ((KeyBindingsDirection2) => {
  KeyBindingsDirection2[KeyBindingsDirection2["NODIRECTION"] = 1] = "NODIRECTION";
  KeyBindingsDirection2[KeyBindingsDirection2["UP"] = 2] = "UP";
  KeyBindingsDirection2[KeyBindingsDirection2["DOWN"] = 3] = "DOWN";
  KeyBindingsDirection2[KeyBindingsDirection2["LEFT"] = 4] = "LEFT";
  KeyBindingsDirection2[KeyBindingsDirection2["RIGHT"] = 5] = "RIGHT";
  return KeyBindingsDirection2;
})(KeyBindingsDirection || {});
var FocusSwitchDirection = /* @__PURE__ */ ((FocusSwitchDirection2) => {
  FocusSwitchDirection2[FocusSwitchDirection2["NEXT"] = 1] = "NEXT";
  FocusSwitchDirection2[FocusSwitchDirection2["PREV"] = 2] = "PREV";
  return FocusSwitchDirection2;
})(FocusSwitchDirection || {});
var KeyBindings = class extends GObject.Object {
  _signals;
  constructor(extensionSettings) {
    super();
    this._signals = new SignalHandling();
    this._signals.connect(
      Settings,
      Settings.KEY_ENABLE_MOVE_KEYBINDINGS,
      () => {
        this._setupKeyBindings(extensionSettings);
      }
    );
    if (Settings.ENABLE_MOVE_KEYBINDINGS)
      this._setupKeyBindings(extensionSettings);
  }
  _setupKeyBindings(extensionSettings) {
    if (Settings.ENABLE_MOVE_KEYBINDINGS)
      this._applyKeybindings(extensionSettings);
    else this._removeKeybindings();
  }
  _applyKeybindings(extensionSettings) {
    this._overrideNatives(extensionSettings);
    Main3.wm.addKeybinding(
      Settings.SETTING_SPAN_WINDOW_RIGHT,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit("span-window", display, 5 /* RIGHT */);
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_SPAN_WINDOW_LEFT,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit("span-window", display, 4 /* LEFT */);
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_SPAN_WINDOW_UP,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit("span-window", display, 2 /* UP */);
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_SPAN_WINDOW_DOWN,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit("span-window", display, 3 /* DOWN */);
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_SPAN_WINDOW_ALL_TILES,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit("span-window-all-tiles", display);
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_UNTILE_WINDOW,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (dp) => this.emit("untile-window", dp)
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_MOVE_WINDOW_CENTER,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (dp) => this.emit("move-window-center", dp)
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_FOCUS_WINDOW_RIGHT,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit(
          "focus-window-direction",
          display,
          5 /* RIGHT */
        );
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_FOCUS_WINDOW_LEFT,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit(
          "focus-window-direction",
          display,
          4 /* LEFT */
        );
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_FOCUS_WINDOW_UP,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit(
          "focus-window-direction",
          display,
          2 /* UP */
        );
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_FOCUS_WINDOW_DOWN,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit(
          "focus-window-direction",
          display,
          3 /* DOWN */
        );
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_FOCUS_WINDOW_NEXT,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit("focus-window", display, 1 /* NEXT */);
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_FOCUS_WINDOW_PREV,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit("focus-window", display, 2 /* PREV */);
      }
    );
    Main3.wm.addKeybinding(
      Settings.SETTING_HIGHLIGHT_CURRENT_WINDOW,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display) => {
        this.emit("highlight-current-window", display);
      }
    );
    const action = Main3.wm.addKeybinding(
      Settings.SETTING_CYCLE_LAYOUTS,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      (display, _2, event, binding) => {
        const mask = event.get_mask ? event.get_mask() : binding.get_mask();
        this.emit("cycle-layouts", display, action, mask);
      }
    );
  }
  _overrideNatives(extensionSettings) {
    const mutterKeybindings = new Gio.Settings({
      schema_id: "org.gnome.mutter.keybindings"
    });
    this._overrideKeyBinding(
      Settings.SETTING_MOVE_WINDOW_RIGHT,
      (display) => {
        this.emit("move-window", display, 5 /* RIGHT */);
      },
      extensionSettings,
      mutterKeybindings,
      "toggle-tiled-right"
    );
    this._overrideKeyBinding(
      Settings.SETTING_MOVE_WINDOW_LEFT,
      (display) => {
        this.emit("move-window", display, 4 /* LEFT */);
      },
      extensionSettings,
      mutterKeybindings,
      "toggle-tiled-left"
    );
    const desktopWm = new Gio.Settings({
      schema_id: "org.gnome.desktop.wm.keybindings"
    });
    this._overrideKeyBinding(
      Settings.SETTING_MOVE_WINDOW_UP,
      (display) => {
        this.emit("move-window", display, 2 /* UP */);
      },
      extensionSettings,
      desktopWm,
      "maximize"
    );
    this._overrideKeyBinding(
      Settings.SETTING_MOVE_WINDOW_DOWN,
      (display) => {
        this.emit("move-window", display, 3 /* DOWN */);
      },
      extensionSettings,
      desktopWm,
      "unmaximize"
    );
  }
  _overrideKeyBinding(name, handler, extensionSettings, nativeSettings, nativeKeyName) {
    const done = SettingsOverride.get().override(
      nativeSettings,
      nativeKeyName,
      new GLib.Variant("as", [])
    );
    if (!done) {
      debug4(`failed to override ${nativeKeyName}`);
      return;
    }
    Main3.wm.addKeybinding(
      name,
      extensionSettings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      handler
    );
  }
  _removeKeybindings() {
    this._restoreNatives();
    Main3.wm.removeKeybinding(Settings.SETTING_MOVE_WINDOW_RIGHT);
    Main3.wm.removeKeybinding(Settings.SETTING_MOVE_WINDOW_LEFT);
    Main3.wm.removeKeybinding(Settings.SETTING_MOVE_WINDOW_UP);
    Main3.wm.removeKeybinding(Settings.SETTING_MOVE_WINDOW_DOWN);
    Main3.wm.removeKeybinding(Settings.SETTING_SPAN_WINDOW_RIGHT);
    Main3.wm.removeKeybinding(Settings.SETTING_SPAN_WINDOW_LEFT);
    Main3.wm.removeKeybinding(Settings.SETTING_SPAN_WINDOW_UP);
    Main3.wm.removeKeybinding(Settings.SETTING_SPAN_WINDOW_DOWN);
    Main3.wm.removeKeybinding(Settings.SETTING_SPAN_WINDOW_ALL_TILES);
    Main3.wm.removeKeybinding(Settings.SETTING_UNTILE_WINDOW);
    Main3.wm.removeKeybinding(Settings.SETTING_MOVE_WINDOW_CENTER);
    Main3.wm.removeKeybinding(Settings.SETTING_FOCUS_WINDOW_UP);
    Main3.wm.removeKeybinding(Settings.SETTING_FOCUS_WINDOW_DOWN);
    Main3.wm.removeKeybinding(Settings.SETTING_FOCUS_WINDOW_LEFT);
    Main3.wm.removeKeybinding(Settings.SETTING_FOCUS_WINDOW_RIGHT);
    Main3.wm.removeKeybinding(Settings.SETTING_FOCUS_WINDOW_NEXT);
    Main3.wm.removeKeybinding(Settings.SETTING_FOCUS_WINDOW_PREV);
    Main3.wm.removeKeybinding(Settings.SETTING_HIGHLIGHT_CURRENT_WINDOW);
    Main3.wm.removeKeybinding(Settings.SETTING_CYCLE_LAYOUTS);
  }
  _restoreNatives() {
    const mutterKeybindings = new Gio.Settings({
      schema_id: "org.gnome.mutter.keybindings"
    });
    SettingsOverride.get().restoreKey(
      mutterKeybindings,
      "toggle-tiled-right"
    );
    SettingsOverride.get().restoreKey(
      mutterKeybindings,
      "toggle-tiled-left"
    );
    const desktopWm = new Gio.Settings({
      schema_id: "org.gnome.desktop.wm.keybindings"
    });
    SettingsOverride.get().restoreKey(desktopWm, "maximize");
    SettingsOverride.get().restoreKey(desktopWm, "unmaximize");
  }
  destroy() {
    this._removeKeybindings();
  }
};
__publicField(KeyBindings, "metaInfo", {
  GTypeName: "KeyBindings",
  Signals: {
    "move-window": {
      param_types: [Meta.Display.$gtype, GObject.TYPE_INT]
      // Meta.Display, KeyBindingsDirection
    },
    "span-window": {
      param_types: [Meta.Display.$gtype, GObject.TYPE_INT]
      // Meta.Display, KeyBindingsDirection
    },
    "span-window-all-tiles": {
      param_types: [Meta.Display.$gtype]
      // Meta.Display
    },
    "untile-window": {
      param_types: [Meta.Display.$gtype]
      // Meta.Display
    },
    "move-window-center": {
      param_types: [Meta.Display.$gtype]
      // Meta.Display
    },
    "focus-window-direction": {
      param_types: [Meta.Display.$gtype, GObject.TYPE_INT]
      // Meta.Display, KeyBindingsDirection
    },
    "focus-window": {
      param_types: [Meta.Display.$gtype, GObject.TYPE_INT]
      // Meta.Display, FocusSwitchDirection
    },
    "highlight-current-window": {
      param_types: [Meta.Display.$gtype]
      // Meta.Display
    },
    "cycle-layouts": {
      param_types: [
        Meta.Display.$gtype,
        GObject.TYPE_INT,
        GObject.TYPE_INT
      ]
      // Meta.Display, number, number
    }
  }
});
KeyBindings = __decorateClass([
  registerGObjectClass
], KeyBindings);

// src/components/tilingsystem/tilingLayout.ts
var debug5 = logger("TilingLayout");
var DynamicTilePreview = class extends TilePreview {
  _originalRect;
  _canRestore;
  constructor(params, canRestore) {
    super(params);
    this._canRestore = canRestore || false;
    this._originalRect = this.rect.copy();
  }
  get originalRect() {
    return this._originalRect;
  }
  get canRestore() {
    return this._canRestore;
  }
  restore(ease = false) {
    if (!this._canRestore) return false;
    this._rect = this._originalRect.copy();
    if (this.showing) this.open(ease);
    return true;
  }
};
DynamicTilePreview = __decorateClass([
  registerGObjectClass
], DynamicTilePreview);
var TilingLayout = class extends LayoutWidget {
  _showing;
  constructor(layout, innerGaps, outerGaps, workarea, scalingFactor) {
    super({
      containerRect: workarea,
      parent: global.windowGroup,
      layout,
      innerGaps,
      outerGaps,
      scalingFactor
    });
    this._showing = false;
    super.relayout();
  }
  _init() {
    super._init();
    this.hide();
  }
  buildTile(parent, rect, gaps, tile) {
    const prev = new DynamicTilePreview({ parent, rect, gaps, tile }, true);
    prev.updateBorderRadius(
      prev.gaps.top > 0,
      prev.gaps.right > 0,
      prev.gaps.bottom > 0,
      prev.gaps.left > 0
    );
    return prev;
  }
  get showing() {
    return this._showing;
  }
  openBelow(window) {
    if (this._showing) return;
    const windowActor = window.get_compositor_private();
    if (!windowActor) return;
    global.windowGroup.set_child_below_sibling(this, windowActor);
    this.open();
  }
  openAbove(window) {
    if (this._showing) return;
    global.windowGroup.set_child_above_sibling(this, null);
    this.open();
  }
  open(ease = false) {
    if (this._showing) return;
    this.show();
    this._showing = true;
    this.ease({
      x: this.x,
      y: this.y,
      opacity: 255,
      duration: ease ? GlobalState.get().tilePreviewAnimationTime : 0,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD
    });
  }
  close(ease = false) {
    if (!this._showing) return;
    this._showing = false;
    this.ease({
      opacity: 0,
      duration: ease ? GlobalState.get().tilePreviewAnimationTime : 0,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.unhoverAllTiles();
        this.hide();
      }
    });
  }
  _isHovered(currPointerPos, preview) {
    return currPointerPos.x >= preview.x && currPointerPos.x <= preview.x + preview.width && currPointerPos.y >= preview.y && currPointerPos.y <= preview.y + preview.height;
  }
  getTileBelow(currPointerPos, reset) {
    let found = this._previews.find(
      (preview) => this._isHovered(currPointerPos, preview.rect)
    );
    if (!found || !found.canRestore && reset) {
      found = this._previews.find(
        (preview) => preview.canRestore && this._isHovered(currPointerPos, preview.originalRect)
      );
    }
    if (!found) return void 0;
    if (reset && found.originalRect) return found.originalRect;
    return found.rect;
  }
  unhoverAllTiles() {
    const newPreviewsArray = [];
    this._previews.forEach((preview) => {
      if (preview.restore(true)) {
        newPreviewsArray.push(preview);
        preview.open(true);
      } else {
        this.remove_child(preview);
        preview.destroy();
      }
    });
    this._previews = newPreviewsArray;
  }
  hoverTilesInRect(rect, reset) {
    const newPreviewsArray = [];
    this._previews.forEach((preview) => {
      const [hasIntersection, rectangles] = this._subtractRectangles(
        preview.rect,
        rect
      );
      if (hasIntersection) {
        if (rectangles.length > 0) {
          let maxIndex = 0;
          for (let i = 0; i < rectangles.length; i++) {
            if (rectangles[i].area() > rectangles[maxIndex].area())
              maxIndex = i;
          }
          for (let i = 0; i < rectangles.length; i++) {
            if (i === maxIndex) continue;
            const currRect = rectangles[i];
            const gaps = buildTileGaps(
              currRect,
              this._innerGaps,
              this._outerGaps,
              this._containerRect
            ).gaps;
            const innerPreview = new DynamicTilePreview(
              {
                parent: this,
                rect: currRect,
                gaps,
                tile: TileUtils.build_tile(
                  currRect,
                  this._containerRect
                )
              },
              false
            );
            innerPreview.open();
            this.set_child_above_sibling(innerPreview, preview);
            newPreviewsArray.push(innerPreview);
          }
          preview.open(
            false,
            rectangles[maxIndex].union(
              preview.rect.intersect(rect)[1]
            )
          );
          preview.open(true, rectangles[maxIndex]);
          newPreviewsArray.push(preview);
        } else {
          preview.close();
          newPreviewsArray.push(preview);
        }
      } else if (reset) {
        if (preview.restore(true)) {
          preview.open(true);
          newPreviewsArray.push(preview);
        } else {
          this.remove_child(preview);
          preview.destroy();
        }
      } else {
        preview.open(true);
        newPreviewsArray.push(preview);
      }
    });
    this._previews = newPreviewsArray;
  }
  /*
          Given the source rectangle (made by A, B, C, D and Hole), subtract the hole and obtain A, B, C and D.
          Edge cases:
              - The hole may not be inside the source rect (i.e there is no interstaction).
              It returns false and an array with the source rectangle only
              - The hole intersects the source rectangle, it returns true and an array with A, B, C and D rectangles.
              Some of A, B, C and D may not be returned if they don't exist
              - The hole is equal to the source rectangle, it returns true and an empty array since A, B, C and D
              rectangles do not exist
  
          Example:
          -------------------------
          |          A            |
          |-----------------------|
          |  B  |   hole    |  C  |
          |-----------------------|
          |          D            |
          -------------------------
      */
  _subtractRectangles(sourceRect, holeRect) {
    const [hasIntersection, intersection] = sourceRect.intersect(holeRect);
    if (!hasIntersection) return [false, [sourceRect]];
    if (intersection.area() >= sourceRect.area() * 0.98) return [true, []];
    const results = [];
    const heightA = intersection.y - sourceRect.y;
    if (heightA > 0) {
      results.push(
        buildRectangle({
          x: sourceRect.x,
          y: sourceRect.y,
          width: sourceRect.width,
          height: heightA
        })
      );
    }
    const widthB = intersection.x - sourceRect.x;
    if (widthB > 0 && intersection.height > 0) {
      results.push(
        buildRectangle({
          x: sourceRect.x,
          y: intersection.y,
          width: widthB,
          height: intersection.height
        })
      );
    }
    const widthC = sourceRect.x + sourceRect.width - intersection.x - intersection.width;
    if (widthC > 0 && intersection.height > 0) {
      results.push(
        buildRectangle({
          x: intersection.x + intersection.width,
          y: intersection.y,
          width: widthC,
          height: intersection.height
        })
      );
    }
    const heightD = sourceRect.y + sourceRect.height - intersection.y - intersection.height;
    if (heightD > 0) {
      results.push(
        buildRectangle({
          x: sourceRect.x,
          y: intersection.y + intersection.height,
          width: sourceRect.width,
          height: heightD
        })
      );
    }
    return [true, results];
  }
  // enlarge the side of the direction and search a tile that contains that point
  // clamp to ensure we do not go outside of the container area (e.g. the screen)
  findNearestTileDirection(source, direction, clamp, enlarge) {
    if (direction === 1 /* NODIRECTION */) return void 0;
    const sourceCoords = {
      x: source.x + source.width / 2,
      y: source.y + source.height / 2
    };
    switch (direction) {
      case 5 /* RIGHT */:
        sourceCoords.x = source.x + source.width + enlarge;
        break;
      case 4 /* LEFT */:
        sourceCoords.x = source.x - enlarge;
        break;
      case 3 /* DOWN */:
        sourceCoords.y = source.y + source.height + enlarge;
        break;
      case 2 /* UP */:
        sourceCoords.y = source.y - enlarge;
        break;
    }
    if (sourceCoords.x < this._containerRect.x || sourceCoords.x > this._containerRect.width + this._containerRect.x || sourceCoords.y < this._containerRect.y || sourceCoords.y > this._containerRect.height + this._containerRect.y) {
      if (!clamp) return void 0;
      sourceCoords.x = Math.clamp(
        sourceCoords.x,
        this._containerRect.x,
        this._containerRect.width + this._containerRect.x
      );
      sourceCoords.y = Math.clamp(
        sourceCoords.y,
        this._containerRect.y,
        this._containerRect.height + this._containerRect.y
      );
    }
    for (let i = 0; i < this._previews.length; i++) {
      const previewFound = this._previews[i];
      if (isPointInsideRect(sourceCoords, previewFound.rect)) {
        return {
          rect: buildRectangle({
            x: previewFound.innerX,
            y: previewFound.innerY,
            width: previewFound.innerWidth,
            height: previewFound.innerHeight
          }),
          tile: previewFound.tile
        };
      }
    }
    return void 0;
  }
  findNearestTile(source) {
    let previewFound;
    let bestDistance = -1;
    const sourceCenter = {
      x: source.x + source.width / 2,
      y: source.x + source.height / 2
    };
    for (let i = 0; i < this._previews.length; i++) {
      const preview = this._previews[i];
      const previewCenter = {
        x: preview.innerX + preview.innerWidth / 2,
        y: preview.innerY + preview.innerHeight / 2
      };
      const euclideanDistance = squaredEuclideanDistance(
        previewCenter,
        sourceCenter
      );
      if (!previewFound || euclideanDistance < bestDistance) {
        previewFound = preview;
        bestDistance = euclideanDistance;
      }
    }
    if (!previewFound) return void 0;
    return {
      rect: buildRectangle({
        x: previewFound.innerX,
        y: previewFound.innerY,
        width: previewFound.innerWidth,
        height: previewFound.innerHeight
      }),
      tile: previewFound.tile
    };
  }
};
TilingLayout = __decorateClass([
  registerGObjectClass
], TilingLayout);

// src/components/snapassist/snapAssistTile.ts
var debug6 = logger("SnapAssistTile");
var MIN_RADIUS = 2;
var SnapAssistTile = class extends TilePreview {
  _styleChangedSignalID;
  constructor(params) {
    super({
      parent: params.parent,
      rect: params.rect,
      gaps: params.gaps,
      tile: params.tile
    });
    const isLeft = this._tile.x <= 1e-3;
    const isTop = this._tile.y <= 1e-3;
    const isRight = this._tile.x + this._tile.width >= 0.99;
    const isBottom = this._tile.y + this._tile.height >= 0.99;
    const [alreadyScaled, scalingFactor] = getScalingFactorOf(this);
    const radiusValue = (alreadyScaled ? 1 : scalingFactor) * (this.get_theme_node().get_length("border-radius-value") / (alreadyScaled ? scalingFactor : 1));
    const borderWidthValue = (alreadyScaled ? 1 : scalingFactor) * (this.get_theme_node().get_length("border-width-value") / (alreadyScaled ? scalingFactor : 1));
    const radius = [
      this._gaps.top === 0 && this._gaps.left === 0 ? 0 : MIN_RADIUS,
      this._gaps.top === 0 && this._gaps.right === 0 ? 0 : MIN_RADIUS,
      this._gaps.bottom === 0 && this._gaps.right === 0 ? 0 : MIN_RADIUS,
      this._gaps.bottom === 0 && this._gaps.left === 0 ? 0 : MIN_RADIUS
    ];
    if (isTop && isLeft) radius[St.Corner.TOPLEFT] = radiusValue;
    if (isTop && isRight) radius[St.Corner.TOPRIGHT] = radiusValue;
    if (isBottom && isRight) radius[St.Corner.BOTTOMRIGHT] = radiusValue;
    if (isBottom && isLeft) radius[St.Corner.BOTTOMLEFT] = radiusValue;
    const borderWidth = [
      borderWidthValue,
      borderWidthValue,
      borderWidthValue,
      borderWidthValue
    ];
    if (isTop || this._gaps.top > 0) borderWidth[St.Side.TOP] *= 2;
    else borderWidth[St.Side.TOP] = Math.floor(borderWidth[St.Side.TOP]);
    if (isRight || this._gaps.right > 0) borderWidth[St.Side.RIGHT] *= 2;
    else
      borderWidth[St.Side.RIGHT] = Math.floor(borderWidth[St.Side.RIGHT]);
    if (isBottom || this._gaps.bottom > 0) borderWidth[St.Side.BOTTOM] *= 2;
    if (isLeft || this._gaps.left > 0) borderWidth[St.Side.LEFT] *= 2;
    this.set_style(`
            border-radius: ${radius[St.Corner.TOPLEFT]}px ${radius[St.Corner.TOPRIGHT]}px ${radius[St.Corner.BOTTOMRIGHT]}px ${radius[St.Corner.BOTTOMLEFT]}px;
            border-top-width: ${borderWidth[St.Side.TOP]}px;
            border-right-width: ${borderWidth[St.Side.RIGHT]}px;
            border-bottom-width: ${borderWidth[St.Side.BOTTOM]}px;
            border-left-width: ${borderWidth[St.Side.LEFT]}px;`);
    this._applyStyle();
    this._styleChangedSignalID = St.ThemeContext.get_for_stage(
      global.get_stage()
    ).connect("changed", () => {
      this._applyStyle();
    });
    this.connect("destroy", () => this.onDestroy());
  }
  _init() {
    super._init();
    this.set_style_class_name("snap-assist-tile");
  }
  _applyStyle() {
    const [hasColor, { red, green, blue }] = this.get_theme_node().lookup_color("color", true);
    if (!hasColor) return;
    if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
      this.remove_style_class_name("dark");
    } else {
      this.add_style_class_name("dark");
    }
  }
  onDestroy() {
    if (this._styleChangedSignalID) {
      St.ThemeContext.get_for_stage(global.get_stage()).disconnect(
        this._styleChangedSignalID
      );
      this._styleChangedSignalID = void 0;
    }
  }
};
SnapAssistTile = __decorateClass([
  registerGObjectClass
], SnapAssistTile);

// src/components/snapassist/snapAssistLayout.ts
var SnapAssistLayout = class extends LayoutWidget {
  constructor(parent, layout, innerGaps, outerGaps, width, height) {
    super({
      containerRect: buildRectangle({ x: 0, y: 0, width, height }),
      parent,
      layout,
      innerGaps,
      outerGaps
    });
    this.set_size(width, height);
    super.relayout();
  }
  buildTile(parent, rect, gaps, tile) {
    return new SnapAssistTile({ parent, rect, gaps, tile });
  }
  getTileBelow(cursorPos) {
    const [x, y] = this.get_transformed_position();
    for (let i = 0; i < this._previews.length; i++) {
      const preview = this._previews[i];
      const pos = { x: x + preview.rect.x, y: y + preview.rect.y };
      const isHovering = cursorPos.x >= pos.x && cursorPos.x <= pos.x + preview.rect.width && cursorPos.y >= pos.y && cursorPos.y <= pos.y + preview.rect.height;
      if (isHovering) return preview;
    }
  }
};
SnapAssistLayout = __decorateClass([
  registerGObjectClass
], SnapAssistLayout);

// src/utils/gnomesupport.ts
function widgetOrientation(vertical) {
  if (St.BoxLayout.prototype.get_orientation !== void 0) {
    return {
      orientation: vertical ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL
    };
  }
  return { vertical };
}
function buildBlurEffect(sigma) {
  const effect = new Shell.BlurEffect();
  effect.set_mode(Shell.BlurMode.BACKGROUND);
  effect.set_brightness(1);
  if (effect.set_radius) {
    effect.set_radius(sigma * 2);
  } else {
    effect.set_sigma(sigma);
  }
  return effect;
}
function getEventCoords(event) {
  return event.get_coords ? event.get_coords() : [event.x, event.y];
}
function maximizeWindow(window) {
  window.get_maximized ? window.maximize(Meta.MaximizeFlags.BOTH) : window.maximize();
}
function unmaximizeWindow(window) {
  window.get_maximized ? window.unmaximize(Meta.MaximizeFlags.BOTH) : window.unmaximize();
}

// src/components/snapassist/snapAssist.ts
var SNAP_ASSIST_SIGNAL = "snap-assist";
var GAPS = 4;
var SNAP_ASSIST_LAYOUT_WIDTH = 120;
var SNAP_ASSIST_LAYOUT_HEIGHT = 68;
var debug7 = logger("SnapAssist");
var SnapAssistContent = class extends St.BoxLayout {
  _container;
  _showing;
  _signals;
  _snapAssistLayouts;
  _isEnlarged = false;
  _hoveredInfo;
  _padding;
  _blur;
  _snapAssistantThreshold;
  _snapAssistantAnimationTime;
  _monitorIndex;
  constructor(container, monitorIndex) {
    super({
      name: "snap_assist_content",
      xAlign: Clutter.ActorAlign.CENTER,
      yAlign: Clutter.ActorAlign.CENTER,
      reactive: true,
      styleClass: "popup-menu-content snap-assistant"
    });
    this._container = container;
    this._container.add_child(this);
    this._signals = new SignalHandling();
    this._snapAssistLayouts = [];
    this._isEnlarged = false;
    this._showing = true;
    this._padding = 0;
    this._blur = false;
    this._snapAssistantAnimationTime = 100;
    this._monitorIndex = monitorIndex;
    this._snapAssistantThreshold = 54 * getMonitorScalingFactor(this._monitorIndex);
    Settings.bind(
      Settings.KEY_ENABLE_BLUR_SNAP_ASSISTANT,
      this,
      "blur",
      Gio.SettingsBindFlags.GET
    );
    Settings.bind(
      Settings.KEY_SNAP_ASSISTANT_THRESHOLD,
      this,
      "snapAssistantThreshold",
      Gio.SettingsBindFlags.GET
    );
    Settings.bind(
      Settings.KEY_SNAP_ASSISTANT_ANIMATION_TIME,
      this,
      "snapAssistantAnimationTime",
      Gio.SettingsBindFlags.GET
    );
    this._applyStyle();
    this._signals.connect(
      St.ThemeContext.get_for_stage(global.get_stage()),
      "changed",
      () => {
        this._applyStyle();
      }
    );
    this._setLayouts(GlobalState.get().layouts);
    this._signals.connect(
      GlobalState.get(),
      GlobalState.SIGNAL_LAYOUTS_CHANGED,
      () => {
        this._setLayouts(GlobalState.get().layouts);
      }
    );
    this.connect("destroy", () => this._signals.disconnect());
    this.close();
  }
  set blur(value) {
    if (this._blur === value) return;
    this._blur = value;
    this.get_effect("blur")?.set_enabled(value);
    this._applyStyle();
  }
  set snapAssistantThreshold(value) {
    this._snapAssistantThreshold = value * getMonitorScalingFactor(this._monitorIndex);
  }
  set snapAssistantAnimationTime(value) {
    this._snapAssistantAnimationTime = value;
  }
  get showing() {
    return this._showing;
  }
  _init() {
    super._init();
    const effect = buildBlurEffect(36);
    effect.set_name("blur");
    effect.set_enabled(this._blur);
    this.add_effect(effect);
    this.add_style_class_name("popup-menu-content snap-assistant");
  }
  _applyStyle() {
    this.set_style(null);
    const [alreadyScaled, finalScalingFactor] = getScalingFactorOf(this);
    this._padding = (alreadyScaled ? 1 : finalScalingFactor) * (this.get_theme_node().get_length("padding-value") / (alreadyScaled ? finalScalingFactor : 1));
    const backgroundColor = this.get_theme_node().get_background_color().copy();
    const alpha = this._blur ? 0.7 : backgroundColor.alpha;
    this.set_style(`
            padding: ${this._padding}px;
            background-color: rgba(${backgroundColor.red}, ${backgroundColor.green}, ${backgroundColor.blue}, ${alpha}) !important;
        `);
  }
  close(ease = false) {
    if (!this._showing) return;
    this._showing = false;
    this._isEnlarged = false;
    this.set_x(this._container.width / 2 - this.width / 2);
    this.ease({
      y: this._desiredY,
      opacity: 0,
      duration: ease ? this._snapAssistantAnimationTime : 0,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.hide();
      }
    });
  }
  get _desiredY() {
    return this._isEnlarged ? Math.max(
      0,
      this._snapAssistantThreshold - this.height / 2 + this._padding
    ) : -this.height + this._padding;
  }
  open(ease = false) {
    if (!this._showing)
      this.get_parent()?.set_child_above_sibling(this, null);
    this.set_x(this._container.width / 2 - this.width / 2);
    this.show();
    this._showing = true;
    this.ease({
      y: this._desiredY,
      opacity: 255,
      duration: ease ? this._snapAssistantAnimationTime : 0,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD
    });
  }
  _setLayouts(layouts) {
    this._snapAssistLayouts.forEach((lay) => lay.destroy());
    this.remove_all_children();
    const [, scalingFactor] = getScalingFactorOf(this);
    const layoutGaps = buildMarginOf(GAPS);
    const width = SNAP_ASSIST_LAYOUT_WIDTH * scalingFactor;
    const height = SNAP_ASSIST_LAYOUT_HEIGHT * scalingFactor;
    this._snapAssistLayouts = layouts.map((lay, ind) => {
      const saLay = new SnapAssistLayout(
        this,
        lay,
        layoutGaps,
        new Clutter.Margin(),
        width,
        height
      );
      if (ind < layouts.length - 1) {
        this.add_child(
          new St.Widget({ width: this._padding, height: 1 })
        );
      }
      return saLay;
    });
    this.ensure_style();
    this.set_x(this._container.width / 2 - this.width / 2);
  }
  onMovingWindow(window, ease = false, currPointerPos) {
    const wasEnlarged = this._isEnlarged;
    this.handleOpening(window, ease, currPointerPos);
    if (!this._showing || !this._isEnlarged) {
      if (this._hoveredInfo) this._hoveredInfo[0].set_hover(false);
      this._hoveredInfo = void 0;
      if (wasEnlarged) {
        this._container.emit(
          SNAP_ASSIST_SIGNAL,
          new Tile2({ x: 0, y: 0, width: 0, height: 0, groups: [] }),
          ""
        );
      }
      return;
    }
    const layoutHovered = this.handleTileHovering(currPointerPos);
    if (layoutHovered) {
      const snapTile = this._hoveredInfo ? this._hoveredInfo[0] : void 0;
      const snapLay = this._hoveredInfo ? this._hoveredInfo[1] : void 0;
      const tile = snapTile?.tile || new Tile2({ x: 0, y: 0, width: 0, height: 0, groups: [] });
      const layoutId = snapLay?.layout.id ?? "";
      this._container.emit(SNAP_ASSIST_SIGNAL, tile, layoutId);
    }
  }
  handleOpening(window, ease = false, currPointerPos) {
    if (!this._showing) {
      if (this.get_parent() === global.windowGroup) {
        const windowActor = window.get_compositor_private();
        if (!windowActor) return;
        global.windowGroup.set_child_above_sibling(this, windowActor);
      }
    }
    const height = this.height + (this._isEnlarged ? 0 : this._snapAssistantThreshold);
    const minY = this._container.y;
    const maxY = this._container.y + this._desiredY + height;
    const minX = this._container.x + this.x - this._snapAssistantThreshold;
    const maxX = this._container.x + this.x + this.width + this._snapAssistantThreshold;
    const isNear = this.isBetween(minX, currPointerPos.x, maxX) && this.isBetween(minY, currPointerPos.y, maxY);
    if (this._showing && this._isEnlarged === isNear) return;
    this._isEnlarged = isNear;
    this.open(ease);
  }
  handleTileHovering(cursorPos) {
    if (!this._isEnlarged) {
      const changed = this._hoveredInfo !== void 0;
      if (this._hoveredInfo) this._hoveredInfo[0].set_hover(false);
      this._hoveredInfo = void 0;
      return changed;
    }
    let newTileHovered;
    let layoutHovered;
    const layoutsLen = this._snapAssistLayouts.length;
    for (let index = 0; index < layoutsLen; index++) {
      newTileHovered = this._snapAssistLayouts[index].getTileBelow(cursorPos);
      if (newTileHovered) {
        layoutHovered = this._snapAssistLayouts[index];
        break;
      }
    }
    const oldTile = this._hoveredInfo ? this._hoveredInfo[0] : void 0;
    const tileChanged = newTileHovered !== oldTile;
    if (tileChanged) {
      oldTile?.set_hover(false);
      if (newTileHovered === void 0 || layoutHovered === void 0)
        this._hoveredInfo = void 0;
      else this._hoveredInfo = [newTileHovered, layoutHovered];
    }
    if (this._hoveredInfo) this._hoveredInfo[0].set_hover(true);
    return tileChanged;
  }
  isBetween(min, num, max) {
    return min <= num && num <= max;
  }
};
__publicField(SnapAssistContent, "metaInfo", {
  GTypeName: "SnapAssistContent",
  Properties: {
    blur: GObject.ParamSpec.boolean(
      "blur",
      "blur",
      "Enable or disable the blur effect",
      GObject.ParamFlags.READWRITE,
      false
    ),
    snapAssistantThreshold: GObject.ParamSpec.uint(
      "snapAssistantThreshold",
      "snapAssistantThreshold",
      "Distance from the snap assistant to trigger its opening/closing",
      GObject.ParamFlags.READWRITE,
      0,
      2e3,
      16
    ),
    snapAssistantAnimationTime: GObject.ParamSpec.uint(
      "snapAssistantAnimationTime",
      "snapAssistantAnimationTime",
      "Animation time in milliseconds",
      GObject.ParamFlags.READWRITE,
      0,
      2e3,
      180
    )
  }
});
SnapAssistContent = __decorateClass([
  registerGObjectClass
], SnapAssistContent);
var SnapAssist = class extends St.Widget {
  _content;
  constructor(parent, workArea, monitorIndex, scalingFactor) {
    super();
    parent.add_child(this);
    this.workArea = workArea;
    this.set_clip(0, 0, workArea.width, workArea.height);
    if (scalingFactor) enableScalingFactorSupport(this, scalingFactor);
    this._content = new SnapAssistContent(this, monitorIndex);
  }
  set workArea(newWorkArea) {
    this.set_position(newWorkArea.x, newWorkArea.y);
    this.set_width(newWorkArea.width);
    this.set_clip(0, 0, newWorkArea.width, newWorkArea.height);
  }
  onMovingWindow(window, ease = false, currPointerPos) {
    this._content.onMovingWindow(window, ease, currPointerPos);
  }
  close(ease = false) {
    this._content.close(ease);
  }
};
__publicField(SnapAssist, "metaInfo", {
  GTypeName: "SnapAssist",
  Signals: {
    "snap-assist": {
      param_types: [Tile2.$gtype, String.$gtype]
      // tile, layout_id
    }
  }
});
SnapAssist = __decorateClass([
  registerGObjectClass
], SnapAssist);

// src/components/tilepreview/selectionTilePreview.ts
var debug8 = logger("SelectionTilePreview");
var SelectionTilePreview = class extends TilePreview {
  _blur;
  constructor(params) {
    super(params);
    this._blur = false;
    Settings.bind(
      Settings.KEY_ENABLE_BLUR_SELECTED_TILEPREVIEW,
      this,
      "blur",
      Gio.SettingsBindFlags.GET
    );
    this._recolor();
    const styleChangedSignalID = St.ThemeContext.get_for_stage(
      global.get_stage()
    ).connect("changed", () => {
      this._recolor();
    });
    this.connect(
      "destroy",
      () => St.ThemeContext.get_for_stage(global.get_stage()).disconnect(
        styleChangedSignalID
      )
    );
    this._rect.width = this.gaps.left + this.gaps.right;
    this._rect.height = this.gaps.top + this.gaps.bottom;
  }
  set blur(value) {
    if (this._blur === value) return;
    this._blur = value;
    this.get_effect("blur")?.set_enabled(value);
    if (this._blur) this.add_style_class_name("blur-tile-preview");
    else this.remove_style_class_name("blur-tile-preview");
    this._recolor();
  }
  _init() {
    super._init();
    const effect = buildBlurEffect(48);
    effect.set_name("blur");
    effect.set_enabled(this._blur);
    this.add_effect(effect);
    this.add_style_class_name("selection-tile-preview");
  }
  _recolor() {
    this.set_style(null);
    const backgroundColor = this.get_theme_node().get_background_color().copy();
    const newAlpha = Math.max(
      Math.min(backgroundColor.alpha + 35, 255),
      160
    );
    this.set_style(`
            background-color: rgba(${backgroundColor.red}, ${backgroundColor.green}, ${backgroundColor.blue}, ${newAlpha / 255}) !important;
        `);
  }
  close(ease = false) {
    if (!this._showing) return;
    this._rect.width = this.gaps.left + this.gaps.right;
    this._rect.height = this.gaps.top + this.gaps.bottom;
    super.close(ease);
  }
};
__publicField(SelectionTilePreview, "metaInfo", {
  GTypeName: "SelectionTilePreview",
  Properties: {
    blur: GObject.ParamSpec.boolean(
      "blur",
      "blur",
      "Enable or disable the blur effect",
      GObject.ParamFlags.READWRITE,
      false
    )
  }
});
SelectionTilePreview = __decorateClass([
  registerGObjectClass
], SelectionTilePreview);

// src/components/tilingsystem/edgeTilingManager.ts
var TOP_EDGE_TILING_OFFSET = 8;
var QUARTER_PERCENTAGE = 0.5;
var EdgeTilingManager = class extends GObject.Object {
  _workArea;
  _quarterActivationPercentage;
  _edgeTilingOffset;
  // activation zones
  _topLeft;
  _topRight;
  _bottomLeft;
  _bottomRight;
  _topCenter;
  _leftCenter;
  _rightCenter;
  // current active zone
  _activeEdgeTile;
  constructor(initialWorkArea) {
    super();
    this._workArea = buildRectangle();
    this._topLeft = buildRectangle();
    this._topRight = buildRectangle();
    this._bottomLeft = buildRectangle();
    this._bottomRight = buildRectangle();
    this._topCenter = buildRectangle();
    this._leftCenter = buildRectangle();
    this._rightCenter = buildRectangle();
    this._activeEdgeTile = null;
    this.workarea = initialWorkArea;
    this._quarterActivationPercentage = Settings.QUARTER_TILING_THRESHOLD;
    Settings.bind(
      Settings.KEY_QUARTER_TILING_THRESHOLD,
      this,
      "quarterActivationPercentage"
    );
    this._edgeTilingOffset = Settings.EDGE_TILING_OFFSET;
    Settings.bind(
      Settings.KEY_EDGE_TILING_OFFSET,
      this,
      "edgeTilingOffset"
    );
  }
  set quarterActivationPercentage(value) {
    this._quarterActivationPercentage = value / 100;
    this._updateActivationZones();
  }
  set edgeTilingOffset(value) {
    this._edgeTilingOffset = value;
  }
  set workarea(newWorkArea) {
    this._workArea.x = newWorkArea.x;
    this._workArea.y = newWorkArea.y;
    this._workArea.width = newWorkArea.width;
    this._workArea.height = newWorkArea.height;
    this._updateActivationZones();
  }
  _updateActivationZones() {
    const width = Math.ceil(
      this._workArea.width * this._quarterActivationPercentage
    );
    const height = Math.ceil(
      this._workArea.height * this._quarterActivationPercentage
    );
    this._topLeft.x = this._workArea.x;
    this._topLeft.y = this._workArea.y;
    this._topLeft.width = width;
    this._topLeft.height = height;
    this._topRight.x = this._workArea.x + this._workArea.width - this._topLeft.width;
    this._topRight.y = this._topLeft.y;
    this._topRight.width = width;
    this._topRight.height = height;
    this._bottomLeft.x = this._workArea.x;
    this._bottomLeft.y = this._workArea.y + this._workArea.height - height;
    this._bottomLeft.width = width;
    this._bottomLeft.height = height;
    this._bottomRight.x = this._topRight.x;
    this._bottomRight.y = this._bottomLeft.y;
    this._bottomRight.width = width;
    this._bottomRight.height = height;
    this._topCenter.x = this._topLeft.x + this._topLeft.width;
    this._topCenter.y = this._topRight.y;
    this._topCenter.height = this._topRight.height;
    this._topCenter.width = this._topRight.x - this._topCenter.x;
    this._leftCenter.x = this._topLeft.x;
    this._leftCenter.y = this._topLeft.y + this._topLeft.height;
    this._leftCenter.height = this._bottomLeft.y - this._leftCenter.y;
    this._leftCenter.width = this._topLeft.width;
    this._rightCenter.x = this._topRight.x;
    this._rightCenter.y = this._topRight.y + this._topRight.height;
    this._rightCenter.height = this._bottomRight.y - this._rightCenter.y;
    this._rightCenter.width = this._topRight.width;
  }
  canActivateEdgeTiling(pointerPos) {
    return pointerPos.x <= this._workArea.x + this._edgeTilingOffset || pointerPos.y <= this._workArea.y + TOP_EDGE_TILING_OFFSET || pointerPos.x >= this._workArea.x + this._workArea.width - this._edgeTilingOffset || pointerPos.y >= this._workArea.y + this._workArea.height - this._edgeTilingOffset;
  }
  isPerformingEdgeTiling() {
    return this._activeEdgeTile !== null;
  }
  startEdgeTiling(pointerPos) {
    const { x, y } = clampPointInsideRect(pointerPos, this._workArea);
    const previewRect = buildRectangle();
    if (this._activeEdgeTile && isPointInsideRect({ x, y }, this._activeEdgeTile)) {
      return {
        changed: false,
        rect: previewRect
      };
    }
    if (!this._activeEdgeTile) this._activeEdgeTile = buildRectangle();
    previewRect.width = this._workArea.width * QUARTER_PERCENTAGE;
    previewRect.height = this._workArea.height * QUARTER_PERCENTAGE;
    previewRect.y = this._workArea.y;
    previewRect.x = this._workArea.x;
    if (isPointInsideRect({ x, y }, this._topCenter)) {
      previewRect.width = this._workArea.width;
      previewRect.height = this._workArea.height;
      this._activeEdgeTile = this._topCenter;
    } else if (isPointInsideRect({ x, y }, this._leftCenter)) {
      previewRect.width = this._workArea.width * QUARTER_PERCENTAGE;
      previewRect.height = this._workArea.height;
      this._activeEdgeTile = this._leftCenter;
    } else if (isPointInsideRect({ x, y }, this._rightCenter)) {
      previewRect.x = this._workArea.x + this._workArea.width - previewRect.width;
      previewRect.width = this._workArea.width * QUARTER_PERCENTAGE;
      previewRect.height = this._workArea.height;
      this._activeEdgeTile = this._rightCenter;
    } else if (x <= this._workArea.x + this._workArea.width / 2) {
      if (isPointInsideRect({ x, y }, this._topLeft)) {
        this._activeEdgeTile = this._topLeft;
      } else if (isPointInsideRect({ x, y }, this._bottomLeft)) {
        previewRect.y = this._workArea.y + this._workArea.height - previewRect.height;
        this._activeEdgeTile = this._bottomLeft;
      } else {
        return {
          changed: false,
          rect: previewRect
        };
      }
    } else {
      previewRect.x = this._workArea.x + this._workArea.width - previewRect.width;
      if (isPointInsideRect({ x, y }, this._topRight)) {
        this._activeEdgeTile = this._topRight;
      } else if (isPointInsideRect({ x, y }, this._bottomRight)) {
        previewRect.y = this._workArea.y + this._workArea.height - previewRect.height;
        this._activeEdgeTile = this._bottomRight;
      } else {
        return {
          changed: false,
          rect: previewRect
        };
      }
    }
    return {
      changed: true,
      rect: previewRect
    };
  }
  needMaximize() {
    return this._activeEdgeTile !== null && Settings.TOP_EDGE_MAXIMIZE && this._activeEdgeTile === this._topCenter;
  }
  abortEdgeTiling() {
    this._activeEdgeTile = null;
  }
};
__publicField(EdgeTilingManager, "metaInfo", {
  GTypeName: "EdgeTilingManager",
  Properties: {
    quarterActivationPercentage: GObject.ParamSpec.uint(
      "quarterActivationPercentage",
      "quarterActivationPercentage",
      "Threshold to trigger quarter tiling",
      GObject.ParamFlags.READWRITE,
      1,
      50,
      40
    ),
    edgeTilingOffset: GObject.ParamSpec.uint(
      "edgeTilingOffset",
      "edgeTilingOffset",
      "Offset to trigger edge tiling",
      GObject.ParamFlags.READWRITE,
      1,
      250,
      16
    )
  }
});
EdgeTilingManager = __decorateClass([
  registerGObjectClass
], EdgeTilingManager);

// src/components/tilingsystem/touchPointer.ts
var TouchPointer = class _TouchPointer {
  static _instance = null;
  _x;
  _y;
  _windowPos;
  constructor() {
    this._x = -1;
    this._y = -1;
    this._windowPos = buildRectangle();
  }
  static get() {
    if (!this._instance) this._instance = new _TouchPointer();
    return this._instance;
  }
  isTouchDeviceActive() {
    return this._x !== -1 && this._y !== -1 && this._windowPos.x !== -1 && this._windowPos.y !== -1;
  }
  onTouchEvent(x, y) {
    this._x = x;
    this._y = y;
  }
  updateWindowPosition(newSize) {
    this._windowPos.x = newSize.x;
    this._windowPos.y = newSize.y;
  }
  reset() {
    this._x = -1;
    this._y = -1;
    this._windowPos.x = -1;
    this._windowPos.y = -1;
  }
  get_pointer(window) {
    const currPos = window.get_frame_rect();
    this._x += currPos.x - this._windowPos.x;
    this._y += currPos.y - this._windowPos.y;
    this._windowPos.x = currPos.x;
    this._windowPos.y = currPos.y;
    return [this._x, this._y, global.get_pointer()[2]];
  }
};

// src/components/windowManager/tilingShellWindowManager.ts
var debug9 = logger("TilingShellWindowManager");
var CachedWindowProperties = class {
  _is_initialized = false;
  maximized = false;
  constructor(window, manager) {
    this.update(window, manager);
    this._is_initialized = true;
  }
  update(window, manager) {
    const newMaximized = window.maximizedVertically && window.maximizedHorizontally;
    if (this._is_initialized) {
      if (this.maximized && !newMaximized)
        manager.emit("unmaximized", window);
      else if (!this.maximized && newMaximized)
        manager.emit("maximized", window);
    }
    this.maximized = newMaximized;
  }
};
var TilingShellWindowManager = class extends GObject.Object {
  _signals;
  static get() {
    if (!this._instance) this._instance = new TilingShellWindowManager();
    return this._instance;
  }
  static destroy() {
    if (this._instance) {
      this._instance._signals.disconnect();
      this._instance = null;
    }
  }
  constructor() {
    super();
    this._signals = new SignalHandling();
    global.get_window_actors().forEach((winActor) => {
      winActor.metaWindow.__ts_cached = new CachedWindowProperties(winActor.metaWindow, this);
    });
    this._signals.connect(
      global.display,
      "window-created",
      (_2, window) => {
        window.__ts_cached = new CachedWindowProperties(window, this);
      }
    );
    this._signals.connect(
      global.windowManager,
      "minimize",
      (_2, actor) => {
        actor.metaWindow.__ts_cached?.update(
          actor.metaWindow,
          this
        );
      }
    );
    this._signals.connect(
      global.windowManager,
      "unminimize",
      (_2, actor) => {
        actor.metaWindow.__ts_cached?.update(
          actor.metaWindow,
          this
        );
      }
    );
    this._signals.connect(
      global.windowManager,
      "size-changed",
      (_2, actor) => {
        actor.metaWindow.__ts_cached?.update(
          actor.metaWindow,
          this
        );
      }
    );
  }
  static easeMoveWindow(params) {
    const winActor = params.window.get_compositor_private();
    if (!winActor) return;
    const winRect = params.window.get_frame_rect();
    const xExcludingShadow = winRect.x - winActor.get_x();
    const yExcludingShadow = winRect.y - winActor.get_y();
    const staticClone = new Clutter.Clone({
      source: winActor,
      reactive: false,
      scale_x: 1,
      scale_y: 1,
      x: params.from.x,
      y: params.from.y,
      width: params.from.width,
      height: params.from.height,
      pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 })
    });
    global.windowGroup.add_child(staticClone);
    winActor.opacity = 0;
    staticClone.ease({
      x: params.to.x - xExcludingShadow,
      y: params.to.y - yExcludingShadow,
      width: params.to.width + 2 * yExcludingShadow,
      height: params.to.height + 2 * xExcludingShadow,
      duration: params.duration,
      onStopped: () => {
        winActor.opacity = 255;
        winActor.set_scale(1, 1);
        staticClone.destroy();
      }
    });
    winActor.set_pivot_point(0, 0);
    winActor.set_position(params.to.x, params.to.y);
    winActor.set_size(params.to.width, params.to.height);
    const user_op = false;
    if (params.monitorIndex)
      params.window.move_to_monitor(params.monitorIndex);
    params.window.move_frame(user_op, params.to.x, params.to.y);
    params.window.move_resize_frame(
      user_op,
      params.to.x,
      params.to.y,
      params.to.width,
      params.to.height
    );
    winActor.show();
  }
};
__publicField(TilingShellWindowManager, "metaInfo", {
  GTypeName: "TilingShellWindowManager",
  Signals: {
    unmaximized: {
      param_types: [Meta.Window.$gtype]
    },
    maximized: {
      param_types: [Meta.Window.$gtype]
    }
  }
});
__publicField(TilingShellWindowManager, "_instance");
TilingShellWindowManager = __decorateClass([
  registerGObjectClass
], TilingShellWindowManager);

// src/components/windowsSuggestions/suggestedWindowPreview.ts
var WINDOW_OVERLAY_FADE_TIME = 200;
var WINDOW_SCALE_TIME = 200;
var WINDOW_ACTIVE_SIZE_INC = 5;
var ICON_SIZE = 36;
var ICON_OVERLAP = 0.7;
var debug10 = logger("SuggestedWindowPreview");
var SuggestedWindowPreview = class extends Shell.WindowPreview {
  _overlayShown;
  _icon;
  _metaWindow;
  _windowActor;
  _title;
  _previewContainer;
  _stackAbove;
  _destroyed;
  _idleHideOverlayId;
  constructor(metaWindow) {
    super({
      reactive: true,
      can_focus: true,
      accessible_role: Atk.Role.PUSH_BUTTON,
      offscreen_redirect: Clutter.OffscreenRedirect.AUTOMATIC_FOR_OPACITY,
      windowContainer: new Clutter.Actor({
        pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 })
      })
    });
    this._metaWindow = metaWindow;
    this._windowActor = metaWindow.get_compositor_private();
    this._destroyed = false;
    this._idleHideOverlayId = 0;
    this._previewContainer = new St.Widget({
      style_class: "popup-window-preview-container",
      pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }),
      layoutManager: new Clutter.BinLayout(),
      xAlign: Clutter.ActorAlign.CENTER
    });
    this.windowContainer.layout_manager = new Shell.WindowPreviewLayout();
    this.add_child(this._previewContainer);
    this._previewContainer.add_child(this.windowContainer);
    this._addWindow(metaWindow);
    this._stackAbove = null;
    this._windowActor.connectObject("destroy", () => this.destroy(), this);
    this._updateAttachedDialogs();
    this.connect("destroy", this._onDestroy.bind(this));
    this._overlayShown = false;
    const tracker = Shell.WindowTracker.get_default();
    const app = tracker.get_window_app(this._metaWindow);
    this._icon = app.create_icon_texture(ICON_SIZE);
    this._icon.add_style_class_name("window-icon");
    this._icon.add_style_class_name("icon-dropshadow");
    this._icon.set({
      reactive: false,
      pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 })
    });
    this._icon.add_constraint(
      new Clutter.BindConstraint({
        source: this._previewContainer,
        coordinate: Clutter.BindCoordinate.POSITION
      })
    );
    this._icon.add_constraint(
      new Clutter.AlignConstraint({
        source: this._previewContainer,
        align_axis: Clutter.AlignAxis.X_AXIS,
        factor: 0.5
      })
    );
    this._icon.add_constraint(
      new Clutter.AlignConstraint({
        source: this._previewContainer,
        align_axis: Clutter.AlignAxis.Y_AXIS,
        pivot_point: new Graphene.Point({ x: -1, y: ICON_OVERLAP }),
        factor: 1
      })
    );
    this._title = new St.Label({
      visible: false,
      style_class: "window-caption",
      text: this._getCaption(),
      reactive: false
    });
    this._title.clutter_text.single_line_mode = true;
    this._title.add_constraint(
      new Clutter.AlignConstraint({
        source: this._previewContainer,
        align_axis: Clutter.AlignAxis.X_AXIS,
        factor: 0
        // Center horizontally
      })
    );
    this._title.add_constraint(
      new Clutter.AlignConstraint({
        source: this._previewContainer,
        align_axis: Clutter.AlignAxis.Y_AXIS,
        factor: 0,
        // Center vertically
        pivot_point: new Graphene.Point({ x: -1, y: 0 })
      })
    );
    this._title.clutter_text.ellipsize = Pango.EllipsizeMode.END;
    this.label_actor = this._title;
    this._metaWindow.connectObject(
      "notify::title",
      () => this._title.text = this._getCaption(),
      this
    );
    this._previewContainer.add_child(this._title);
    this._previewContainer.add_child(this._icon);
    this.connect("notify::realized", () => {
      if (!this.realized) return;
      this._title.ensure_style();
      this._icon.ensure_style();
    });
  }
  get_window_clone() {
    return this.windowContainer;
  }
  _getCaption() {
    if (this._metaWindow.title) return this._metaWindow.title;
    const tracker = Shell.WindowTracker.get_default();
    const app = tracker.get_window_app(this._metaWindow);
    return app.get_name();
  }
  showOverlay(animate) {
    if (this._overlayShown) return;
    this._overlayShown = true;
    const ongoingTransition = this._title.get_transition("opacity");
    if (animate && ongoingTransition && ongoingTransition.get_interval().peek_final_value() === 255)
      return;
    [this._title].forEach((a) => {
      a.opacity = 0;
      a.show();
      a.ease({
        opacity: 255,
        duration: animate ? WINDOW_OVERLAY_FADE_TIME : 0,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD
      });
    });
    const [width, height] = this.windowContainer.get_size();
    const { scaleFactor } = St.ThemeContext.get_for_stage(
      global.stage
    );
    const activeExtraSize = WINDOW_ACTIVE_SIZE_INC * 2 * scaleFactor;
    const origSize = Math.max(width, height);
    const scale = (origSize + activeExtraSize) / origSize;
    this._previewContainer.ease({
      scaleX: scale,
      scaleY: scale,
      duration: animate ? WINDOW_SCALE_TIME : 0,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD
    });
  }
  hideOverlay(animate) {
    if (!this._overlayShown) return;
    this._overlayShown = false;
    const ongoingTransition = this._title.get_transition("opacity");
    if (animate && ongoingTransition && ongoingTransition.get_interval().peek_final_value() === 0)
      return;
    [this._title].forEach((a) => {
      a.opacity = 255;
      a.ease({
        opacity: 0,
        duration: animate ? WINDOW_OVERLAY_FADE_TIME : 0,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        onComplete: () => a.hide()
      });
    });
    this._previewContainer.ease({
      scaleX: 1,
      scaleY: 1,
      duration: animate ? WINDOW_SCALE_TIME : 0,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD
    });
  }
  _addWindow(metaWindow) {
    this.clone = this.windowContainer.layout_manager.add_window(metaWindow);
  }
  vfunc_has_overlaps() {
    return this._hasAttachedDialogs() || this._icon.visible;
  }
  addDialog(win) {
    let parent = win.get_transient_for();
    while (parent && parent.is_attached_dialog())
      parent = parent.get_transient_for();
    if (win.is_attached_dialog() && parent === this._metaWindow)
      this._addWindow(win);
  }
  _hasAttachedDialogs() {
    return this.windowContainer.layout_manager.get_windows().length > 1;
  }
  _updateAttachedDialogs() {
    const iter = (win) => {
      const actor = win.get_compositor_private();
      if (!actor) return false;
      if (!win.is_attached_dialog()) return false;
      this._addWindow(win);
      win.foreach_transient(iter);
      return true;
    };
    this._metaWindow.foreach_transient(iter);
  }
  // Find the actor just below us, respecting reparenting done by DND code
  _getActualStackAbove() {
    if (this._stackAbove === null) return null;
    return this._stackAbove;
  }
  setStackAbove(actor) {
    this._stackAbove = actor;
    const parent = this.get_parent();
    const actualAbove = this._getActualStackAbove();
    if (actualAbove === null) parent.set_child_below_sibling(this, null);
    else parent.set_child_above_sibling(this, actualAbove);
  }
  _onDestroy() {
    this._destroyed = true;
    if (this._idleHideOverlayId > 0) {
      GLib.source_remove(this._idleHideOverlayId);
      this._idleHideOverlayId = 0;
    }
  }
  vfunc_enter_event(event) {
    this.showOverlay(true);
    return super.vfunc_enter_event(event);
  }
  vfunc_leave_event(event) {
    if (this._destroyed) return super.vfunc_leave_event(event);
    if (!this["has-pointer"]) this.hideOverlay(true);
    return super.vfunc_leave_event(event);
  }
  vfunc_key_focus_in() {
    super.vfunc_key_focus_in();
    this.showOverlay(true);
  }
  vfunc_key_focus_out() {
    super.vfunc_key_focus_out();
    this.hideOverlay(true);
  }
};
__publicField(SuggestedWindowPreview, "metaInfo", {
  GTypeName: "PopupWindowPreview"
});
SuggestedWindowPreview = __decorateClass([
  registerGObjectClass
], SuggestedWindowPreview);

// src/components/windowsSuggestions/masonryLayoutManager.ts
var MASONRY_ROW_MIN_HEIGHT_PERCENTAGE = 0.15;
var MasonryLayoutManager = class extends Clutter.LayoutManager {
  _rowCount;
  _spacing;
  _maxRowHeight;
  _rowHeight;
  constructor(spacing, rowHeight, maxRowHeight) {
    super();
    this._rowCount = 0;
    this._spacing = spacing;
    this._maxRowHeight = maxRowHeight;
    this._rowHeight = rowHeight;
  }
  static computePlacements(children, availableWidth, availableHeight, rowHeight) {
    let rowCount = Math.max(1, Math.ceil(Math.sqrt(children.length)) - 1);
    while (rowCount > 1 && rowHeight < availableHeight * MASONRY_ROW_MIN_HEIGHT_PERCENTAGE) {
      rowCount--;
      rowHeight = availableHeight / rowCount;
    }
    const rowWidths = Array(rowCount).fill(0);
    const placements = [];
    for (const child of children) {
      const [minWidth, natWidth] = child.get_preferred_width(-1);
      const [minHeight, natHeight] = child.get_preferred_height(-1);
      const aspectRatio = natWidth / natHeight;
      const width = rowHeight * aspectRatio;
      let shortestRow = rowWidths.indexOf(Math.min(...rowWidths));
      if (rowWidths[shortestRow] + width > availableWidth && rowWidths[shortestRow] !== 0) {
        shortestRow = rowCount;
        rowWidths.push(0);
        rowCount++;
      }
      const childWidth = Math.clamp(width, width, availableWidth);
      const childHeight = childWidth / aspectRatio;
      placements.push({
        child,
        row: shortestRow,
        width: childWidth,
        height: childHeight,
        x: rowWidths[shortestRow],
        rowWidth: 0
      });
      if (rowWidths[shortestRow] === 0) rowWidths[shortestRow] = width;
      else rowWidths[shortestRow] += width;
    }
    for (const placement of placements)
      placement.rowWidth = rowWidths[placement.row];
    const sortedRowWidths = [...rowWidths].map((v, i) => [
      v,
      i
    ]);
    sortedRowWidths.sort((a, b) => b[0] - a[0]);
    const rowsOrdering = /* @__PURE__ */ new Map();
    sortedRowWidths.forEach((row, oldIndex) => {
      const index = row[1];
      const newIndex = sortedRowWidths.length <= 2 ? oldIndex : (oldIndex + Math.floor(rowCount / 2)) % rowCount;
      rowsOrdering.set(index, newIndex);
    });
    for (const placement of placements)
      placement.row = rowsOrdering.get(placement.row) ?? placement.row;
    const result = Array(rowCount);
    for (const placement of placements) result[placement.row] = [];
    for (const placement of placements) {
      result[placement.row].push({
        actor: placement.child,
        width: placement.width,
        height: placement.height
      });
    }
    return result;
  }
  vfunc_allocate(container, box) {
    const children = container.get_children();
    if (children.length === 0) return;
    console.log(
      box.get_width(),
      container.width,
      box.get_height(),
      container.height
    );
    const availableWidth = container.width - 2 * this._spacing;
    const availableHeight = container.height - 2 * this._spacing;
    const allocationCache = container._allocationCache || /* @__PURE__ */ new Map();
    container._allocationCache = allocationCache;
    if (!children.find((ch) => !allocationCache.has(ch))) {
      children.forEach((ch) => ch.allocate(allocationCache.get(ch)));
      return;
    }
    allocationCache.clear();
    this._rowCount = Math.ceil(Math.sqrt(children.length)) + 1;
    let rowHeight = 0;
    while (this._rowCount > 1 && rowHeight < availableHeight * MASONRY_ROW_MIN_HEIGHT_PERCENTAGE) {
      this._rowCount--;
      rowHeight = (availableHeight - this._spacing * (this._rowCount - 1)) / this._rowCount;
    }
    rowHeight = Math.min(rowHeight, this._maxRowHeight);
    rowHeight = this._rowHeight;
    const rowWidths = Array(this._rowCount).fill(0);
    const placements = [];
    for (const child of children) {
      const [minHeight, naturalHeight] = child.get_preferred_height(-1);
      const [minWidth, naturalWidth] = child.get_preferred_width(naturalHeight);
      const aspectRatio = naturalWidth / naturalHeight;
      const width = rowHeight * aspectRatio;
      let shortestRow = rowWidths.indexOf(Math.min(...rowWidths));
      if (rowWidths[shortestRow] + width > availableWidth && rowWidths[shortestRow] !== 0) {
        shortestRow = this._rowCount;
        rowWidths.push(0);
        this._rowCount++;
      }
      const childWidth = Math.clamp(width, width, availableWidth);
      const childHeight = childWidth / aspectRatio;
      placements.push({
        child,
        row: shortestRow,
        width: childWidth,
        height: childHeight,
        x: rowWidths[shortestRow],
        rowWidth: 0
      });
      if (rowWidths[shortestRow] === 0) rowWidths[shortestRow] = width;
      else rowWidths[shortestRow] += this._spacing + width;
    }
    for (const placement of placements)
      placement.rowWidth = rowWidths[placement.row];
    const sortedRowWidths = [...rowWidths].map((v, i) => [
      v,
      i
    ]);
    sortedRowWidths.sort((a, b) => b[0] - a[0]);
    const rowsOrdering = /* @__PURE__ */ new Map();
    sortedRowWidths.forEach((row, newIndex) => {
      const index = row[1];
      rowsOrdering.set(
        index,
        (newIndex + Math.floor(this._rowCount / 2)) % this._rowCount
      );
    });
    for (const placement of placements)
      placement.row = rowsOrdering.get(placement.row) ?? placement.row;
    const rowYPosition = Array(this._rowCount).fill({ y: 0, height: 0 });
    for (const placement of placements) {
      rowYPosition[placement.row] = {
        y: 0,
        height: placement.height
      };
    }
    rowYPosition[0].y = this._spacing;
    for (let r = 1; r < this._rowCount; r++) {
      rowYPosition[r].y = this._spacing + rowYPosition[r - 1].y + rowYPosition[r - 1].height;
    }
    const contentHeight = rowYPosition[this._rowCount - 1].y + rowYPosition[this._rowCount - 1].height;
    const verticalOffset = this._spacing / 2 + Math.max(0, (availableHeight - contentHeight) / 2);
    for (const placement of placements) {
      const { child, row, width, x, rowWidth, height } = placement;
      const y = box.y1 + rowYPosition[row].y + verticalOffset;
      const horizontalOffset = Math.max(0, (availableWidth - rowWidth) / 2) + this._spacing;
      const xPosition = box.x1 + x + horizontalOffset;
      const newBox = new Clutter.ActorBox({
        x1: xPosition,
        y1: y,
        x2: xPosition + width,
        y2: y + height
      });
      allocationCache.set(child, newBox);
      child.allocate(newBox);
    }
  }
  vfunc_get_preferred_width(container, forHeight) {
    let maxX = 0;
    container.get_children().forEach((ch) => {
      maxX = Math.max(maxX, ch.x + ch.width);
    });
    return [maxX + this._spacing, maxX + this._spacing];
  }
  vfunc_get_preferred_height(container, forWidth) {
    let maxY = 0;
    container.get_children().forEach((ch) => {
      maxY = Math.max(maxY, ch.y + ch.height);
    });
    return [maxY + this._spacing, maxY + this._spacing];
  }
};
MasonryLayoutManager = __decorateClass([
  registerGObjectClass
], MasonryLayoutManager);

// src/components/windowsSuggestions/suggestionsTilePreview.ts
var MASONRY_LAYOUT_SPACING = 32;
var SCROLLBARS_SHOW_ANIM_DURATION = 100;
var SuggestionsTilePreview = class extends TilePreview {
  _blur;
  _container;
  _scrollView;
  constructor(params) {
    super(params);
    this._blur = false;
    this._recolor();
    const styleChangedSignalID = St.ThemeContext.get_for_stage(
      global.get_stage()
    ).connect("changed", () => {
      this._recolor();
    });
    this.connect(
      "destroy",
      () => St.ThemeContext.get_for_stage(global.get_stage()).disconnect(
        styleChangedSignalID
      )
    );
    this.reactive = true;
    this.layout_manager = new Clutter.BinLayout();
    this._container = new St.BoxLayout({
      x_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
      style: `spacing: ${MASONRY_LAYOUT_SPACING}px;`,
      ...widgetOrientation(true)
    });
    this._scrollView = new St.ScrollView({
      style_class: "vfade",
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
      hscrollbar_policy: St.PolicyType.NEVER,
      overlay_scrollbars: true,
      clip_to_allocation: true,
      // Ensure clipping
      x_expand: true,
      y_expand: true
    });
    if (this._scrollView.add_actor)
      this._scrollView.add_actor(this._container);
    else this._scrollView.add_child(this._container);
    this.add_child(this._scrollView);
    if (
      // @ts-expect-error "get_hscroll_bar is valid for GNOME < 48"
      this._scrollView.get_hscroll_bar && // @ts-expect-error "get_vscroll_bar is valid for GNOME < 48"
      this._scrollView.get_vscroll_bar
    ) {
      this._scrollView.get_hscroll_bar().opacity = 0;
      this._scrollView.get_vscroll_bar().opacity = 0;
    }
  }
  set blur(value) {
    if (this._blur === value) return;
    this._blur = value;
  }
  set gaps(newGaps) {
    super.gaps = newGaps;
    this.updateBorderRadius(
      this._gaps.top > 0,
      this._gaps.right > 0,
      this._gaps.bottom > 0,
      this._gaps.left > 0
    );
  }
  _init() {
    super._init();
    const effect = buildBlurEffect(48);
    effect.set_name("blur");
    effect.set_enabled(this._blur);
    this.add_effect(effect);
    this.add_style_class_name("selection-tile-preview");
  }
  _recolor() {
    this.set_style(null);
    const backgroundColor = this.get_theme_node().get_background_color().copy();
    const newAlpha = Math.max(
      Math.min(backgroundColor.alpha + 35, 255),
      160
    );
    this.set_style(`
            background-color: rgba(${backgroundColor.red}, ${backgroundColor.green}, ${backgroundColor.blue}, ${newAlpha / 255}) !important;
        `);
  }
  _showScrollBars() {
    if (
      // @ts-expect-error "get_hscroll_bar is valid for GNOME < 48"
      this._scrollView.get_hscroll_bar && // @ts-expect-error "get_vscroll_bar is valid for GNOME < 48"
      this._scrollView.get_vscroll_bar
    ) {
      [
        // @ts-expect-error "get_hscroll_bar is valid for GNOME < 48"
        this._scrollView.get_hscroll_bar(),
        // @ts-expect-error "get_vscroll_bar is valid for GNOME < 48"
        this._scrollView.get_vscroll_bar()
      ].forEach(
        (bar) => bar?.ease({
          opacity: 255,
          duration: SCROLLBARS_SHOW_ANIM_DURATION
        })
      );
    }
  }
  _hideScrollBars() {
    if (
      // @ts-expect-error "get_hscroll_bar is valid for GNOME < 48"
      this._scrollView.get_hscroll_bar && // @ts-expect-error "get_vscroll_bar is valid for GNOME < 48"
      this._scrollView.get_vscroll_bar
    ) {
      [
        // @ts-expect-error "get_hscroll_bar is valid for GNOME < 48"
        this._scrollView.get_hscroll_bar(),
        // @ts-expect-error "get_vscroll_bar is valid for GNOME < 48"
        this._scrollView.get_vscroll_bar()
      ].forEach(
        (bar) => bar?.ease({
          opacity: 0,
          duration: SCROLLBARS_SHOW_ANIM_DURATION
        })
      );
    }
  }
  vfunc_enter_event(event) {
    this._showScrollBars();
    return super.vfunc_enter_event(event);
  }
  vfunc_leave_event(event) {
    this._hideScrollBars();
    return super.vfunc_leave_event(event);
  }
  addWindows(windows, maxRowHeight) {
    this._container.hide();
    this._container.destroy_all_children();
    windows.forEach((actor) => this._container.add_child(actor));
    this._container.queue_relayout();
    const placements = MasonryLayoutManager.computePlacements(
      windows,
      this.innerWidth - 2 * MASONRY_LAYOUT_SPACING,
      this.innerHeight,
      maxRowHeight
    );
    this._container.remove_all_children();
    this._container.show();
    this._container.add_child(
      new St.Widget({ height: MASONRY_LAYOUT_SPACING })
    );
    placements.forEach((row) => {
      const rowBox = new St.BoxLayout({
        x_align: Clutter.ActorAlign.CENTER,
        style: `spacing: ${MASONRY_LAYOUT_SPACING}px;`
      });
      this._container.add_child(rowBox);
      row.forEach((pl) => {
        rowBox.add_child(pl.actor);
        pl.actor.set_height(pl.height);
        pl.actor.set_width(pl.width);
      });
    });
    this._container.add_child(
      new St.Widget({ height: MASONRY_LAYOUT_SPACING })
    );
  }
  removeAllWindows() {
    this._container.destroy_all_children();
  }
};
__publicField(SuggestionsTilePreview, "metaInfo", {
  GTypeName: "PopupTilePreview",
  Properties: {
    blur: GObject.ParamSpec.boolean(
      "blur",
      "blur",
      "Enable or disable the blur effect",
      GObject.ParamFlags.READWRITE,
      false
    )
  }
});
SuggestionsTilePreview = __decorateClass([
  registerGObjectClass
], SuggestionsTilePreview);

// src/components/windowsSuggestions/tilingLayoutWithSuggestions.ts
import * as Main4 from "resource:///org/gnome/shell/ui/main.js";
var debug11 = logger("TilingLayoutWithSuggestions");
var ANIMATION_SPEED = 200;
var MASONRY_LAYOUT_ROW_HEIGHT = 0.31;
var TilingLayoutWithSuggestions = class extends LayoutWidget {
  _signals;
  _lastTiledWindow;
  _showing;
  _oldPreviews;
  constructor(innerGaps, outerGaps, containerRect, scalingFactor) {
    super({
      containerRect,
      parent: global.windowGroup,
      layout: new Layout([], ""),
      innerGaps,
      outerGaps,
      scalingFactor
    });
    this.canFocus = true;
    this.reactive = true;
    this._signals = new SignalHandling();
    this._lastTiledWindow = null;
    this._showing = false;
    this._oldPreviews = [];
    this.connect("destroy", () => this._signals.disconnect());
  }
  buildTile(parent, rect, gaps, tile) {
    return new SuggestionsTilePreview({
      parent,
      rect,
      gaps,
      tile
    });
  }
  open(tiledWindows, nontiledWindows, window, windowDesiredRect, monitorIndex) {
    if (this._showing) return;
    this._showing = true;
    this._lastTiledWindow = global.display.focusWindow;
    this._showVacantPreviewsOnly(tiledWindows, windowDesiredRect, window);
    this.show();
    this._recursivelyShowPopup(nontiledWindows, monitorIndex);
    this._signals.disconnect();
    this._signals.connect(this, "key-focus-out", () => this.close());
    this._signals.connect(this, "button-press-event", () => {
      this.close();
    });
    this._signals.connect(
      global.stage,
      "key-press-event",
      (_2, event) => {
        const symbol = event.get_key_symbol();
        if (symbol === Clutter.KEY_Escape) this.close();
        return Clutter.EVENT_PROPAGATE;
      }
    );
  }
  _showVacantPreviewsOnly(tiledWindows, windowDesiredRect, window) {
    const vacantPreviews = this._previews.map((prev) => {
      const previewRect = buildRectangle({
        x: prev.innerX,
        y: prev.innerY,
        width: prev.innerWidth,
        height: prev.innerHeight
      });
      return !tiledWindows.find(
        (win) => previewRect.overlap(
          win === window ? windowDesiredRect : win.get_frame_rect()
        )
      );
    });
    const newPreviews = [];
    for (let index = 0; index < this._previews.length; index++) {
      if (vacantPreviews[index]) {
        this._previews[index].open();
        newPreviews.push(this._previews[index]);
      } else {
        this._previews[index].close();
        this._oldPreviews.push(this._previews[index]);
      }
    }
    this._previews = newPreviews;
  }
  _recursivelyShowPopup(nontiledWindows, monitorIndex) {
    if (this._previews.length === 0 || nontiledWindows.length === 0) {
      this.close();
      return;
    }
    let preview = this._previews[0];
    this._previews.forEach((prev) => {
      if (prev.x < preview.x) preview = prev;
    });
    const clones = nontiledWindows.map((nonTiledWin) => {
      const winClone = new SuggestedWindowPreview(nonTiledWin);
      const winActor = nonTiledWin.get_compositor_private();
      winActor.set_pivot_point(0.5, 0.5);
      if (!nonTiledWin.minimized) {
        winActor.ease({
          opacity: 0,
          duration: ANIMATION_SPEED,
          scaleX: 0.9,
          scaleY: 0.9,
          mode: Clutter.AnimationMode.EASE_OUT_QUAD,
          onComplete: () => {
            winActor.hide();
            winActor.set_pivot_point(0, 0);
          }
        });
      }
      winClone.connect("destroy", () => {
        if (nonTiledWin.minimized) {
          winActor.set_pivot_point(0, 0);
          return;
        }
        if (winActor.visible) return;
        winActor.set_pivot_point(0.5, 0.5);
        winActor.show();
        winActor.ease({
          opacity: 255,
          duration: ANIMATION_SPEED,
          scaleX: 1,
          scaleY: 1,
          mode: Clutter.AnimationMode.EASE_OUT_QUAD,
          onStopped: () => winActor.set_pivot_point(0, 0)
        });
      });
      winClone.connect("button-press-event", () => {
        this._lastTiledWindow = nonTiledWin;
        if (nonTiledWin.maximizedHorizontally || nonTiledWin.maximizedVertically)
          unmaximizeWindow(nonTiledWin);
        if (nonTiledWin.is_fullscreen())
          nonTiledWin.unmake_fullscreen();
        if (nonTiledWin.minimized) nonTiledWin.unminimize();
        const winRect = nonTiledWin.get_frame_rect();
        nonTiledWin.originalSize = winRect.copy();
        const cl = winClone.get_window_clone() ?? winClone;
        const [x, y] = cl.get_transformed_position();
        const allocation = cl.get_allocation_box();
        TilingShellWindowManager.easeMoveWindow({
          window: nonTiledWin,
          from: buildRectangle({
            x,
            y,
            width: allocation.x2 - allocation.x1,
            height: allocation.y2 - allocation.y1
          }),
          to: buildRectangle({
            x: preview.innerX,
            y: preview.innerY,
            width: preview.innerWidth,
            height: preview.innerHeight
          }),
          duration: ANIMATION_SPEED * 1.8,
          monitorIndex
        });
        nonTiledWin.assignedTile = new Tile2({
          ...preview.tile
        });
        winClone.opacity = 0;
        const removed = this._previews.splice(
          this._previews.indexOf(preview),
          1
        );
        this._oldPreviews.push(...removed);
        nontiledWindows.splice(nontiledWindows.indexOf(nonTiledWin), 1);
        preview.close(true);
        this._recursivelyShowPopup(nontiledWindows, monitorIndex);
        return Clutter.EVENT_STOP;
      });
      return winClone;
    });
    preview.addWindows(
      clones,
      this._containerRect.height * MASONRY_LAYOUT_ROW_HEIGHT
    );
    clones.forEach((winClone) => {
      winClone.set_opacity(0);
      winClone.set_pivot_point(0.5, 0.5);
      winClone.set_scale(0.6, 0.6);
      winClone.ease({
        opacity: 255,
        duration: Math.floor(ANIMATION_SPEED * 1.8),
        scaleX: 1.03,
        scaleY: 1.03,
        mode: Clutter.AnimationMode.EASE_IN_OUT,
        onComplete: () => {
          winClone.ease({
            delay: 60,
            duration: Math.floor(ANIMATION_SPEED * 2.1),
            scaleX: 1,
            scaleY: 1,
            mode: Clutter.AnimationMode.EASE_IN_OUT
          });
        }
      });
    });
    this.grab_key_focus();
  }
  close() {
    if (!this._showing) return;
    this._showing = false;
    this._signals.disconnect();
    if (this._lastTiledWindow) Main4.activateWindow(this._lastTiledWindow);
    this._previews.push(...this._oldPreviews);
    this._oldPreviews = [];
    this._previews.forEach((prev) => prev.removeAllWindows());
    this.ease({
      opacity: 0,
      duration: GlobalState.get().tilePreviewAnimationTime,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: () => {
        this.hide();
        this._previews.forEach((prev) => prev.open());
      }
    });
  }
};
TilingLayoutWithSuggestions = __decorateClass([
  registerGObjectClass
], TilingLayoutWithSuggestions);

// src/components/tilingsystem/tilingManager.ts
import * as Main5 from "resource:///org/gnome/shell/ui/main.js";
var MINIMUM_DISTANCE_TO_RESTORE_ORIGINAL_SIZE = 90;
var SnapAssistingInfo = class {
  _snapAssistantLayoutId;
  constructor() {
    this._snapAssistantLayoutId = void 0;
  }
  get layoutId() {
    return this._snapAssistantLayoutId ?? "";
  }
  get isSnapAssisting() {
    return this._snapAssistantLayoutId !== void 0;
  }
  update(layoutId) {
    this._snapAssistantLayoutId = !layoutId || layoutId.length === 0 ? void 0 : layoutId;
  }
};
var TilingManager = class {
  _monitor;
  _selectedTilesPreview;
  _snapAssist;
  _workspaceTilingLayout;
  _edgeTilingManager;
  _tilingSuggestionsLayout;
  _workArea;
  _enableScaling;
  _isGrabbingWindow;
  _movingWindowTimerDuration = 15;
  _lastCursorPos = null;
  _grabStartPosition = null;
  _wasSpanMultipleTilesActivated;
  _wasTilingSystemActivated;
  _snapAssistingInfo;
  _movingWindowTimerId = null;
  _signals;
  _debug;
  /**
   * Constructs a new TilingManager instance.
   * @param monitor The monitor to manage tiling for.
   */
  constructor(monitor, enableScaling) {
    this._isGrabbingWindow = false;
    this._wasSpanMultipleTilesActivated = false;
    this._wasTilingSystemActivated = false;
    this._snapAssistingInfo = new SnapAssistingInfo();
    this._enableScaling = enableScaling;
    this._monitor = monitor;
    this._signals = new SignalHandling();
    this._debug = logger(`TilingManager ${monitor.index}`);
    this._workArea = Main5.layoutManager.getWorkAreaForMonitor(
      this._monitor.index
    );
    this._debug(
      `Work area for monitor ${this._monitor.index}: ${this._workArea.x} ${this._workArea.y} ${this._workArea.width}x${this._workArea.height}`
    );
    this._edgeTilingManager = new EdgeTilingManager(this._workArea);
    const monitorScalingFactor = this._enableScaling ? getMonitorScalingFactor(monitor.index) : void 0;
    this._workspaceTilingLayout = /* @__PURE__ */ new Map();
    for (let i = 0; i < global.workspaceManager.get_n_workspaces(); i++) {
      const ws = global.workspaceManager.get_workspace_by_index(i);
      if (!ws) continue;
      const innerGaps = buildMargin(Settings.get_inner_gaps());
      const outerGaps = buildMargin(Settings.get_outer_gaps());
      const layout = GlobalState.get().getSelectedLayoutOfMonitor(
        monitor.index,
        ws.index()
      );
      this._workspaceTilingLayout.set(
        ws,
        new TilingLayout(
          layout,
          innerGaps,
          outerGaps,
          this._workArea,
          monitorScalingFactor
        )
      );
    }
    this._tilingSuggestionsLayout = new TilingLayoutWithSuggestions(
      buildMargin(Settings.get_inner_gaps()),
      buildMargin(Settings.get_outer_gaps()),
      this._workArea,
      monitorScalingFactor
    );
    this._selectedTilesPreview = new SelectionTilePreview({
      parent: global.windowGroup
    });
    this._snapAssist = new SnapAssist(
      Main5.uiGroup,
      this._workArea,
      this._monitor.index,
      monitorScalingFactor
    );
  }
  /**
   * Enables tiling manager by setting up event listeners:
   *  - handle any window's grab begin.
   *  - handle any window's grab end.
   *  - handle grabbed window's movement.
   */
  enable() {
    this._signals.connect(
      Settings,
      Settings.KEY_SETTING_SELECTED_LAYOUTS,
      () => {
        const ws = global.workspaceManager.get_active_workspace();
        if (!ws) return;
        const layout = GlobalState.get().getSelectedLayoutOfMonitor(
          this._monitor.index,
          ws.index()
        );
        this._workspaceTilingLayout.get(ws)?.relayout({ layout });
      }
    );
    this._signals.connect(
      GlobalState.get(),
      GlobalState.SIGNAL_LAYOUTS_CHANGED,
      () => {
        const ws = global.workspaceManager.get_active_workspace();
        if (!ws) return;
        const layout = GlobalState.get().getSelectedLayoutOfMonitor(
          this._monitor.index,
          ws.index()
        );
        this._workspaceTilingLayout.get(ws)?.relayout({ layout });
      }
    );
    this._signals.connect(Settings, Settings.KEY_INNER_GAPS, () => {
      const innerGaps = buildMargin(Settings.get_inner_gaps());
      this._workspaceTilingLayout.forEach(
        (tilingLayout) => tilingLayout.relayout({ innerGaps })
      );
    });
    this._signals.connect(Settings, Settings.KEY_OUTER_GAPS, () => {
      const outerGaps = buildMargin(Settings.get_outer_gaps());
      this._workspaceTilingLayout.forEach(
        (tilingLayout) => tilingLayout.relayout({ outerGaps })
      );
    });
    this._signals.connect(
      global.display,
      "grab-op-begin",
      (_display, window, grabOp) => {
        const moving = (grabOp & ~1024) === 1;
        if (!moving) return;
        this._onWindowGrabBegin(window, grabOp);
      }
    );
    this._signals.connect(
      global.display,
      "grab-op-end",
      (_display, window) => {
        if (!this._isGrabbingWindow) return;
        this._onWindowGrabEnd(window);
      }
    );
    this._signals.connect(
      this._snapAssist,
      "snap-assist",
      this._onSnapAssist.bind(this)
    );
    this._signals.connect(
      global.workspaceManager,
      "active-workspace-changed",
      () => {
        const ws = global.workspaceManager.get_active_workspace();
        if (this._workspaceTilingLayout.has(ws)) return;
        const monitorScalingFactor = this._enableScaling ? getMonitorScalingFactor(this._monitor.index) : void 0;
        const layout = GlobalState.get().getSelectedLayoutOfMonitor(
          this._monitor.index,
          ws.index()
        );
        const innerGaps = buildMargin(Settings.get_inner_gaps());
        const outerGaps = buildMargin(Settings.get_outer_gaps());
        this._debug("created new tiling layout for active workspace");
        this._workspaceTilingLayout.set(
          ws,
          new TilingLayout(
            layout,
            innerGaps,
            outerGaps,
            this._workArea,
            monitorScalingFactor
          )
        );
      }
    );
    this._signals.connect(
      global.workspaceManager,
      "workspace-removed",
      (_2) => {
        const newMap = /* @__PURE__ */ new Map();
        const n_workspaces = global.workspaceManager.get_n_workspaces();
        for (let i = 0; i < n_workspaces; i++) {
          const ws = global.workspaceManager.get_workspace_by_index(i);
          if (!ws) continue;
          const tl = this._workspaceTilingLayout.get(ws);
          if (!tl) continue;
          this._workspaceTilingLayout.delete(ws);
          newMap.set(ws, tl);
        }
        [...this._workspaceTilingLayout.values()].forEach(
          (tl) => tl.destroy()
        );
        this._workspaceTilingLayout.clear();
        this._workspaceTilingLayout = newMap;
        this._debug("deleted workspace");
      }
    );
    this._signals.connect(
      global.display,
      "window-created",
      (_display, window) => {
        if (Settings.ENABLE_AUTO_TILING) this._autoTile(window, true);
      }
    );
    this._signals.connect(
      TilingShellWindowManager.get(),
      "unmaximized",
      (_2, window) => {
        if (Settings.ENABLE_AUTO_TILING) this._autoTile(window, false);
      }
    );
    this._signals.connect(
      TilingShellWindowManager.get(),
      "maximized",
      (_2, window) => {
        delete window.assignedTile;
      }
    );
  }
  onUntileWindow(window, force) {
    const destination = window.originalSize;
    if (!destination) return;
    this._easeWindowRect(window, destination, false, force);
    window.assignedTile = void 0;
  }
  onKeyboardMoveWindow(window, direction, force, spanFlag, clamp) {
    let destination;
    const isMaximized = window.maximizedHorizontally || window.maximizedVertically;
    if (spanFlag && isMaximized) return false;
    const currentWs = window.get_workspace();
    const tilingLayout = this._workspaceTilingLayout.get(currentWs);
    if (!tilingLayout) return false;
    const windowRectCopy = window.get_frame_rect().copy();
    const extWin = window;
    if (isMaximized) {
      switch (direction) {
        case 1 /* NODIRECTION */:
        case 4 /* LEFT */:
        case 5 /* RIGHT */:
          break;
        case 3 /* DOWN */:
          unmaximizeWindow(window);
          return true;
        case 2 /* UP */:
          return false;
      }
    }
    if (direction === 2 /* UP */ && extWin.assignedTile && extWin.assignedTile?.y === 0) {
      maximizeWindow(window);
      return true;
    }
    if (direction === 1 /* NODIRECTION */) {
      const rect = buildRectangle({
        x: this._workArea.x + this._workArea.width / 2 - windowRectCopy.width / 2,
        y: this._workArea.y + this._workArea.height / 2 - windowRectCopy.height / 2,
        width: windowRectCopy.width,
        height: windowRectCopy.height
      });
      destination = {
        rect,
        tile: TileUtils.build_tile(rect, this._workArea)
      };
    } else if (window.get_monitor() === this._monitor.index) {
      const enlargeFactor = Math.max(
        64,
        // if the gaps are all 0 we choose 8 instead
        tilingLayout.innerGaps.right,
        tilingLayout.innerGaps.left,
        tilingLayout.innerGaps.right,
        tilingLayout.innerGaps.bottom
      );
      destination = tilingLayout.findNearestTileDirection(
        windowRectCopy,
        direction,
        clamp,
        enlargeFactor
      );
    } else {
      destination = tilingLayout.findNearestTile(windowRectCopy);
    }
    if (window.get_monitor() === this._monitor.index && destination && !window.maximizedHorizontally && !window.maximizedVertically && window.assignedTile && window.assignedTile?.x === destination.tile.x && window.assignedTile?.y === destination.tile.y && window.assignedTile?.width === destination.tile.width && window.assignedTile?.height === destination.tile.height)
      return true;
    if (!destination) {
      if (spanFlag) return false;
      if (direction === 2 /* UP */ && window.can_maximize()) {
        maximizeWindow(window);
        return true;
      }
      return false;
    }
    if (!window.assignedTile && !isMaximized)
      window.originalSize = windowRectCopy;
    if (spanFlag) {
      destination.rect = destination.rect.union(windowRectCopy);
      destination.tile = TileUtils.build_tile(
        destination.rect,
        this._workArea
      );
    }
    if (isMaximized) unmaximizeWindow(window);
    this._easeWindowRect(window, destination.rect, false, force);
    if (direction !== 1 /* NODIRECTION */) {
      window.assignedTile = new Tile2({
        ...destination.tile
      });
    }
    return true;
  }
  /**
   * Destroys the tiling manager and cleans up resources.
   */
  destroy() {
    if (this._movingWindowTimerId) {
      GLib.Source.remove(this._movingWindowTimerId);
      this._movingWindowTimerId = null;
    }
    this._signals.disconnect();
    this._isGrabbingWindow = false;
    this._snapAssistingInfo.update(void 0);
    this._edgeTilingManager.abortEdgeTiling();
    this._workspaceTilingLayout.forEach((tl) => tl.destroy());
    this._workspaceTilingLayout.clear();
    this._snapAssist.destroy();
    this._selectedTilesPreview.destroy();
    this._tilingSuggestionsLayout.destroy();
  }
  set workArea(newWorkArea) {
    if (newWorkArea.equal(this._workArea)) return;
    this._workArea = newWorkArea;
    this._debug(
      `new work area for monitor ${this._monitor.index}: ${newWorkArea.x} ${newWorkArea.y} ${newWorkArea.width}x${newWorkArea.height}`
    );
    this._workspaceTilingLayout.forEach(
      (tl) => tl.relayout({ containerRect: this._workArea })
    );
    this._snapAssist.workArea = this._workArea;
    this._edgeTilingManager.workarea = this._workArea;
  }
  _onWindowGrabBegin(window, grabOp) {
    if (this._isGrabbingWindow) return;
    TouchPointer.get().updateWindowPosition(window.get_frame_rect());
    this._signals.connect(
      global.stage,
      "touch-event",
      (_source, event) => {
        const [x, y] = event.get_coords();
        TouchPointer.get().onTouchEvent(x, y);
      }
    );
    if (Settings.ENABLE_BLUR_SNAP_ASSISTANT || Settings.ENABLE_BLUR_SELECTED_TILEPREVIEW) {
      this._signals.connect(window, "position-changed", () => {
        if (Settings.ENABLE_BLUR_SELECTED_TILEPREVIEW) {
          this._selectedTilesPreview.get_effect("blur")?.queue_repaint();
        }
        if (Settings.ENABLE_BLUR_SNAP_ASSISTANT) {
          this._snapAssist.get_first_child()?.get_effect("blur")?.queue_repaint();
        }
      });
    }
    this._isGrabbingWindow = true;
    this._movingWindowTimerId = GLib.timeout_add(
      GLib.PRIORITY_DEFAULT_IDLE,
      this._movingWindowTimerDuration,
      this._onMovingWindow.bind(this, window, grabOp)
    );
    this._onMovingWindow(window, grabOp);
  }
  _activationKeyStatus(modifier, key) {
    if (key === -1 /* NONE */) return true;
    let val = 2;
    switch (key) {
      case 0 /* CTRL */:
        val = 2;
        break;
      case 1 /* ALT */:
        val = 3;
        break;
      case 2 /* SUPER */:
        val = 6;
        break;
    }
    return (modifier & 1 << val) !== 0;
  }
  _onMovingWindow(window, grabOp) {
    if (!this._isGrabbingWindow) {
      this._movingWindowTimerId = null;
      return GLib.SOURCE_REMOVE;
    }
    const currentWs = window.get_workspace();
    const tilingLayout = this._workspaceTilingLayout.get(currentWs);
    if (!tilingLayout) return GLib.SOURCE_REMOVE;
    if (!window.allows_resize() || !window.allows_move() || !this._isPointerInsideThisMonitor(window)) {
      tilingLayout.close();
      this._selectedTilesPreview.close(true);
      this._snapAssist.close(true);
      this._snapAssistingInfo.update(void 0);
      this._edgeTilingManager.abortEdgeTiling();
      return GLib.SOURCE_CONTINUE;
    }
    const [x, y, modifier] = TouchPointer.get().isTouchDeviceActive() ? TouchPointer.get().get_pointer(window) : global.get_pointer();
    const extWin = window;
    extWin.assignedTile = void 0;
    const currPointerPos = { x, y };
    if (this._grabStartPosition === null)
      this._grabStartPosition = { x, y };
    if (extWin.originalSize && squaredEuclideanDistance(currPointerPos, this._grabStartPosition) > MINIMUM_DISTANCE_TO_RESTORE_ORIGINAL_SIZE) {
      if (Settings.RESTORE_WINDOW_ORIGINAL_SIZE) {
        const windowRect = window.get_frame_rect();
        const offsetX = (x - windowRect.x) / windowRect.width;
        const offsetY = (y - windowRect.y) / windowRect.height;
        const newSize = buildRectangle({
          x: x - extWin.originalSize.width * offsetX,
          y: y - extWin.originalSize.height * offsetY,
          width: extWin.originalSize.width,
          height: extWin.originalSize.height
        });
        const restartGrab = (
          // @ts-expect-error "grab is available on GNOME 42"
          global.display.end_grab_op && global.display.begin_grab_op
        );
        if (restartGrab) {
          global.display.end_grab_op(global.get_current_time());
        }
        this._easeWindowRect(window, newSize, restartGrab, restartGrab);
        TouchPointer.get().updateWindowPosition(newSize);
        if (restartGrab) {
          extWin.originalSize = void 0;
          global.display.begin_grab_op(
            window,
            grabOp,
            true,
            // pointer already grabbed
            true,
            // frame action
            -1,
            // Button
            modifier,
            global.get_current_time(),
            x,
            y
          );
        }
      }
      extWin.originalSize = void 0;
      this._grabStartPosition = null;
    }
    const isSpanMultiTilesActivated = this._activationKeyStatus(
      modifier,
      Settings.SPAN_MULTIPLE_TILES_ACTIVATION_KEY
    );
    const isTilingSystemActivated = this._activationKeyStatus(
      modifier,
      Settings.TILING_SYSTEM_ACTIVATION_KEY
    );
    const deactivationKey = Settings.TILING_SYSTEM_DEACTIVATION_KEY;
    const isTilingSystemDeactivated = deactivationKey === -1 /* NONE */ ? false : this._activationKeyStatus(modifier, deactivationKey);
    const allowSpanMultipleTiles = Settings.SPAN_MULTIPLE_TILES && isSpanMultiTilesActivated;
    const showTilingSystem = Settings.TILING_SYSTEM && isTilingSystemActivated && !isTilingSystemDeactivated;
    const changedSpanMultipleTiles = Settings.SPAN_MULTIPLE_TILES && isSpanMultiTilesActivated !== this._wasSpanMultipleTilesActivated;
    const changedShowTilingSystem = Settings.TILING_SYSTEM && isTilingSystemActivated !== this._wasTilingSystemActivated;
    if (!changedSpanMultipleTiles && !changedShowTilingSystem && currPointerPos.x === this._lastCursorPos?.x && currPointerPos.y === this._lastCursorPos?.y)
      return GLib.SOURCE_CONTINUE;
    this._lastCursorPos = currPointerPos;
    this._wasTilingSystemActivated = isTilingSystemActivated;
    this._wasSpanMultipleTilesActivated = isSpanMultiTilesActivated;
    if (!showTilingSystem) {
      if (tilingLayout.showing) {
        tilingLayout.close();
        this._selectedTilesPreview.close(true);
      }
      if (Settings.ACTIVE_SCREEN_EDGES && !this._snapAssistingInfo.isSnapAssisting && this._edgeTilingManager.canActivateEdgeTiling(currPointerPos)) {
        const { changed, rect } = this._edgeTilingManager.startEdgeTiling(currPointerPos);
        if (changed)
          this._showEdgeTiling(window, rect, x, y, tilingLayout);
        this._snapAssist.close(true);
      } else {
        if (this._edgeTilingManager.isPerformingEdgeTiling()) {
          this._selectedTilesPreview.close(true);
          this._edgeTilingManager.abortEdgeTiling();
        }
        if (Settings.SNAP_ASSIST) {
          this._snapAssist.onMovingWindow(
            window,
            true,
            currPointerPos
          );
        }
      }
      return GLib.SOURCE_CONTINUE;
    }
    if (!tilingLayout.showing) {
      tilingLayout.openAbove(window);
      this._snapAssist.close(true);
      if (this._edgeTilingManager.isPerformingEdgeTiling()) {
        this._selectedTilesPreview.close(true);
        this._edgeTilingManager.abortEdgeTiling();
      }
    }
    if (this._snapAssistingInfo.isSnapAssisting) {
      this._selectedTilesPreview.close(true);
      this._snapAssistingInfo.update(void 0);
    }
    if (!changedSpanMultipleTiles && isPointInsideRect(currPointerPos, this._selectedTilesPreview.rect))
      return GLib.SOURCE_CONTINUE;
    let selectionRect = tilingLayout.getTileBelow(
      currPointerPos,
      changedSpanMultipleTiles && !allowSpanMultipleTiles
    );
    if (!selectionRect) return GLib.SOURCE_CONTINUE;
    selectionRect = selectionRect.copy();
    if (allowSpanMultipleTiles && this._selectedTilesPreview.showing) {
      selectionRect = selectionRect.union(
        this._selectedTilesPreview.rect
      );
    }
    tilingLayout.hoverTilesInRect(selectionRect, !allowSpanMultipleTiles);
    this.openSelectionTilePreview(selectionRect, true, true, window);
    return GLib.SOURCE_CONTINUE;
  }
  _onWindowGrabEnd(window) {
    this._isGrabbingWindow = false;
    this._grabStartPosition = null;
    this._signals.disconnect(window);
    TouchPointer.get().reset();
    const currentWs = window.get_workspace();
    const tilingLayout = this._workspaceTilingLayout.get(currentWs);
    if (tilingLayout) tilingLayout.close();
    const desiredWindowRect = buildRectangle({
      x: this._selectedTilesPreview.innerX,
      y: this._selectedTilesPreview.innerY,
      width: this._selectedTilesPreview.innerWidth,
      height: this._selectedTilesPreview.innerHeight
    });
    const selectedTilesRect = this._selectedTilesPreview.rect.copy();
    this._selectedTilesPreview.close(true);
    this._snapAssist.close(true);
    this._lastCursorPos = null;
    const isTilingSystemActivated = this._activationKeyStatus(
      global.get_pointer()[2],
      Settings.TILING_SYSTEM_ACTIVATION_KEY
    );
    if (!isTilingSystemActivated && !this._snapAssistingInfo.isSnapAssisting && !this._edgeTilingManager.isPerformingEdgeTiling())
      return;
    const wasSnapAssistingLayout = this._snapAssistingInfo.isSnapAssisting ? GlobalState.get().layouts.find(
      (lay) => lay.id === this._snapAssistingInfo.layoutId
    ) : void 0;
    this._snapAssistingInfo.update(void 0);
    if (this._edgeTilingManager.isPerformingEdgeTiling() && this._edgeTilingManager.needMaximize() && window.can_maximize())
      maximizeWindow(window);
    const wasEdgeTiling = this._edgeTilingManager.isPerformingEdgeTiling();
    this._edgeTilingManager.abortEdgeTiling();
    const canShowTilingSuggestions = wasSnapAssistingLayout && Settings.ENABLE_SNAP_ASSISTANT_WINDOWS_SUGGESTIONS || wasEdgeTiling && Settings.ENABLE_SCREEN_EDGES_WINDOWS_SUGGESTIONS || isTilingSystemActivated && Settings.ENABLE_TILING_SYSTEM_WINDOWS_SUGGESTIONS;
    if (!this._isPointerInsideThisMonitor(window)) return;
    if (desiredWindowRect.width <= 0 || desiredWindowRect.height <= 0)
      return;
    if (window.maximizedHorizontally || window.maximizedVertically) return;
    window.originalSize = window.get_frame_rect().copy();
    window.assignedTile = new Tile2({
      ...TileUtils.build_tile(selectedTilesRect, this._workArea)
    });
    this._easeWindowRect(window, desiredWindowRect);
    if (!tilingLayout || !canShowTilingSuggestions) return;
    const layout = wasEdgeTiling ? new Layout(
      [
        // top-left
        new Tile2({
          x: 0,
          y: 0,
          width: 0.5,
          height: 0.5,
          groups: []
        }),
        // top-right
        new Tile2({
          x: 0.5,
          y: 0,
          width: 0.5,
          height: 0.5,
          groups: []
        }),
        // bottom-left
        new Tile2({
          x: 0,
          y: 0.5,
          width: 0.5,
          height: 0.5,
          groups: []
        }),
        // bottom-right
        new Tile2({
          x: 0.5,
          y: 0.5,
          width: 0.5,
          height: 0.5,
          groups: []
        })
      ],
      "edge-tiling-layout"
    ) : wasSnapAssistingLayout ? wasSnapAssistingLayout : GlobalState.get().getSelectedLayoutOfMonitor(
      this._monitor.index,
      window.get_workspace().index()
    );
    this._openWindowsSuggestions(
      window,
      desiredWindowRect,
      window.get_monitor(),
      layout,
      tilingLayout.innerGaps,
      tilingLayout.outerGaps,
      tilingLayout.scalingFactor
    );
  }
  _openWindowsSuggestions(window, windowDesiredRect, monitorIndex, layout, innerGaps, outerGaps, scalingFactor) {
    const tiledWindows = [];
    const nontiledWindows = [];
    getWindows().forEach((extWin) => {
      if (extWin && !extWin.minimized && extWin.assignedTile)
        tiledWindows.push(extWin);
      else nontiledWindows.push(extWin);
    });
    if (nontiledWindows.length === 0) return;
    this._tilingSuggestionsLayout.destroy();
    this._tilingSuggestionsLayout = new TilingLayoutWithSuggestions(
      innerGaps,
      outerGaps,
      this._workArea,
      scalingFactor
    );
    this._tilingSuggestionsLayout.relayout({ layout });
    this._tilingSuggestionsLayout.open(
      tiledWindows,
      nontiledWindows,
      window,
      windowDesiredRect,
      monitorIndex
    );
  }
  _easeWindowRect(window, destRect, user_op = false, force = false) {
    const windowActor = window.get_compositor_private();
    const beforeRect = window.get_frame_rect();
    if (destRect.x === beforeRect.x && destRect.y === beforeRect.y && destRect.width === beforeRect.width && destRect.height === beforeRect.height)
      return;
    windowActor.remove_all_transitions();
    Main5.wm._prepareAnimationInfo(
      global.windowManager,
      windowActor,
      beforeRect.copy(),
      Meta.SizeChange.UNMAXIMIZE
    );
    window.move_to_monitor(this._monitor.index);
    if (force) window.move_frame(user_op, destRect.x, destRect.y);
    window.move_resize_frame(
      user_op,
      destRect.x,
      destRect.y,
      destRect.width,
      destRect.height
    );
  }
  _onSnapAssist(_2, tile, layoutId) {
    if (tile.width === 0 || tile.height === 0) {
      this._selectedTilesPreview.close(true);
      this._snapAssistingInfo.update(void 0);
      return;
    }
    const scaledRect = TileUtils.apply_props(tile, this._workArea);
    if (scaledRect.x + scaledRect.width > this._workArea.x + this._workArea.width) {
      scaledRect.width -= scaledRect.x + scaledRect.width - this._workArea.x - this._workArea.width;
    }
    if (scaledRect.y + scaledRect.height > this._workArea.y + this._workArea.height) {
      scaledRect.height -= scaledRect.y + scaledRect.height - this._workArea.y - this._workArea.height;
    }
    const currentWs = global.workspaceManager.get_active_workspace();
    const tilingLayout = this._workspaceTilingLayout.get(currentWs);
    if (!tilingLayout) return;
    this._selectedTilesPreview.get_parent()?.set_child_above_sibling(this._selectedTilesPreview, null);
    this.openSelectionTilePreview(scaledRect, false, true, void 0);
    this._snapAssistingInfo.update(layoutId);
  }
  openSelectionTilePreview(position, isAboveLayout, ease, window) {
    const currentWs = global.workspaceManager.get_active_workspace();
    const tilingLayout = this._workspaceTilingLayout.get(currentWs);
    if (!tilingLayout) return;
    this._selectedTilesPreview.gaps = buildTileGaps(
      position,
      tilingLayout.innerGaps,
      tilingLayout.outerGaps,
      this._workArea,
      this._enableScaling ? getScalingFactorOf(tilingLayout)[1] : void 0
    ).gaps;
    this._selectedTilesPreview.get_parent()?.set_child_above_sibling(this._selectedTilesPreview, null);
    const gaps = this._selectedTilesPreview.gaps;
    if (isAboveLayout) {
      this._selectedTilesPreview.updateBorderRadius(
        gaps.top > 0,
        gaps.right > 0,
        gaps.bottom > 0,
        gaps.left > 0
      );
    } else {
      const { isTop, isRight, isBottom, isLeft } = isTileOnContainerBorder(
        buildRectangle({
          x: position.x + gaps.left,
          y: position.y + gaps.top,
          width: position.width - gaps.left - gaps.right,
          height: position.height - gaps.top - gaps.bottom
        }),
        this._workArea
      );
      this._selectedTilesPreview.updateBorderRadius(
        !isTop,
        !isRight,
        !isBottom,
        !isLeft
      );
    }
    if (window)
      this._selectedTilesPreview.openAbove(window, ease, position);
    else this._selectedTilesPreview.open(ease, position);
  }
  /**
   * Checks if pointer is inside the current monitor
   * @returns true if the pointer is inside the current monitor, false otherwise
   */
  _isPointerInsideThisMonitor(window) {
    const [x, y] = TouchPointer.get().isTouchDeviceActive() ? TouchPointer.get().get_pointer(window) : global.get_pointer();
    const pointerMonitorIndex = global.display.get_monitor_index_for_rect(
      buildRectangle({
        x,
        y,
        width: 1,
        height: 1
      })
    );
    return this._monitor.index === pointerMonitorIndex;
  }
  _showEdgeTiling(window, edgeTile, pointerX, pointerY, tilingLayout) {
    this._selectedTilesPreview.gaps = buildTileGaps(
      edgeTile,
      tilingLayout.innerGaps,
      tilingLayout.outerGaps,
      this._workArea,
      this._enableScaling ? getScalingFactorOf(tilingLayout)[1] : void 0
    ).gaps;
    if (!this._selectedTilesPreview.showing) {
      const { left, right, top, bottom } = this._selectedTilesPreview.gaps;
      const initialRect = buildRectangle({
        x: pointerX,
        y: pointerY,
        width: left + right + 8,
        // width without gaps will be 8
        height: top + bottom + 8
        // height without gaps will be 8
      });
      initialRect.x -= initialRect.width / 2;
      initialRect.y -= initialRect.height / 2;
      this._selectedTilesPreview.open(false, initialRect);
    }
    this.openSelectionTilePreview(edgeTile, false, true, window);
  }
  _easeWindowRectFromTile(tile, window, skipAnimation = false) {
    const currentWs = window.get_workspace();
    const tilingLayout = this._workspaceTilingLayout.get(currentWs);
    if (!tilingLayout) return;
    const scaledRect = TileUtils.apply_props(tile, this._workArea);
    if (scaledRect.x + scaledRect.width > this._workArea.x + this._workArea.width) {
      scaledRect.width -= scaledRect.x + scaledRect.width - this._workArea.x - this._workArea.width;
    }
    if (scaledRect.y + scaledRect.height > this._workArea.y + this._workArea.height) {
      scaledRect.height -= scaledRect.y + scaledRect.height - this._workArea.y - this._workArea.height;
    }
    const gaps = buildTileGaps(
      scaledRect,
      tilingLayout.innerGaps,
      tilingLayout.outerGaps,
      this._workArea,
      this._enableScaling ? getScalingFactorOf(tilingLayout)[1] : void 0
    ).gaps;
    const destinationRect = buildRectangle({
      x: scaledRect.x + gaps.left,
      y: scaledRect.y + gaps.top,
      width: scaledRect.width - gaps.left - gaps.right,
      height: scaledRect.height - gaps.top - gaps.bottom
    });
    if (destinationRect.width <= 0 || destinationRect.height <= 0) return;
    const isMaximized = window.maximizedHorizontally || window.maximizedVertically;
    const rememberOriginalSize = !isMaximized;
    if (isMaximized) unmaximizeWindow(window);
    if (rememberOriginalSize && !window.assignedTile) {
      window.originalSize = window.get_frame_rect().copy();
    }
    window.assignedTile = TileUtils.build_tile(
      buildRectangle({
        x: scaledRect.x,
        y: scaledRect.y,
        width: scaledRect.width,
        height: scaledRect.height
      }),
      this._workArea
    );
    if (skipAnimation) {
      window.move_resize_frame(
        false,
        destinationRect.x,
        destinationRect.y,
        destinationRect.width,
        destinationRect.height
      );
    } else {
      this._easeWindowRect(window, destinationRect);
    }
  }
  onTileFromWindowMenu(tile, window) {
    this._easeWindowRectFromTile(tile, window);
  }
  onSpanAllTiles(window) {
    this._easeWindowRectFromTile(
      new Tile2({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        groups: []
      }),
      window
    );
  }
  _autoTile(window, windowCreated) {
    if (window.get_monitor() !== this._monitor.index) return;
    if (window === null || window.windowType !== Meta.WindowType.NORMAL || window.get_transient_for() !== null || window.is_attached_dialog() || window.minimized || window.maximizedHorizontally || window.maximizedVertically)
      return;
    window.assignedTile = void 0;
    const vacantTile = this._findEmptyTile(window);
    if (!vacantTile) return;
    if (windowCreated) {
      const windowActor = window.get_compositor_private();
      const id = windowActor.connect("first-frame", () => {
        if (!window.minimized && !window.maximizedHorizontally && !window.maximizedVertically && window.get_transient_for() === null && !window.is_attached_dialog())
          this._easeWindowRectFromTile(vacantTile, window, true);
        windowActor.disconnect(id);
      });
    } else {
      this._easeWindowRectFromTile(vacantTile, window, true);
    }
  }
  _findEmptyTile(window) {
    const tiledWindows = getWindows().filter((otherWindow) => {
      return otherWindow && otherWindow.assignedTile && !otherWindow.minimized && !otherWindow.maximizedVertically && !otherWindow.maximizedHorizontally;
    }).map((w) => w);
    const tiles = GlobalState.get().getSelectedLayoutOfMonitor(
      window.get_monitor(),
      global.workspaceManager.get_active_workspace_index()
    ).tiles;
    const workArea = Main5.layoutManager.getWorkAreaForMonitor(
      window.get_monitor()
    );
    const vacantTiles = tiles.filter((t) => {
      const tileRect = TileUtils.apply_props(t, workArea);
      return !tiledWindows.find(
        (win) => tileRect.overlap(win.get_frame_rect())
      );
    });
    if (vacantTiles.length === 0) return void 0;
    vacantTiles.sort((a, b) => a.x - b.x);
    let bestTileIndex = 0;
    let bestDistance = Math.abs(
      0.5 - vacantTiles[bestTileIndex].x + vacantTiles[bestTileIndex].width / 2
    );
    for (let index = 1; index < vacantTiles.length; index++) {
      const distance = Math.abs(
        0.5 - (vacantTiles[index].x + vacantTiles[index].width / 2)
      );
      if (bestDistance > distance) {
        bestTileIndex = index;
        bestDistance = distance;
      }
    }
    if (bestTileIndex < 0 || bestTileIndex >= vacantTiles.length)
      return void 0;
    return vacantTiles[bestTileIndex];
  }
};

// src/components/editor/editableTilePreview.ts
var EditableTilePreview = class extends TilePreview {
  _btn;
  _containerRect;
  _sliders;
  _signals;
  constructor(params) {
    super(params);
    this.add_style_class_name("editable-tile-preview");
    this._tile = params.tile;
    this._containerRect = params.containerRect;
    this._sliders = [null, null, null, null];
    this._signals = [null, null, null, null];
    this._btn = new St.Button({
      styleClass: "editable-tile-preview-button",
      xExpand: true,
      trackHover: true
    });
    this.add_child(this._btn);
    this._btn.set_size(this.innerWidth, this.innerHeight);
    this._btn.set_button_mask(St.ButtonMask.ONE | St.ButtonMask.THREE);
    this._updateLabelText();
    this.connect("destroy", this._onDestroy.bind(this));
  }
  set gaps(newGaps) {
    super.gaps = newGaps;
    this.updateBorderRadius(
      this._gaps.top > 0,
      this._gaps.right > 0,
      this._gaps.bottom > 0,
      this._gaps.left > 0
    );
  }
  getSlider(side) {
    return this._sliders[side];
  }
  getAllSliders() {
    return [...this._sliders];
  }
  get hover() {
    return this._btn.hover;
  }
  addSlider(slider, side) {
    const sig = this._signals[side];
    if (sig) this._sliders[side]?.disconnect(sig);
    this._sliders[side] = slider;
    this._signals[side] = slider.connect(
      "slide",
      () => this._onSliderMove(side)
    );
    this._tile.groups = [];
    this._sliders.forEach((sl) => sl && this._tile.groups.push(sl.groupId));
  }
  removeSlider(side) {
    if (this._sliders[side] === null) return;
    const sig = this._signals[side];
    if (sig) this._sliders[side]?.disconnect(sig);
    this._sliders[side] = null;
    this._tile.groups = [];
    this._sliders.forEach((sl) => sl && this._tile.groups.push(sl.groupId));
  }
  updateTile({
    x,
    y,
    width,
    height,
    innerGaps,
    outerGaps
  }) {
    const oldSize = this._rect.copy();
    this._tile.x = x;
    this._tile.y = y;
    this._tile.width = width;
    this._tile.height = height;
    this._rect = TileUtils.apply_props(this._tile, this._containerRect);
    if (innerGaps && outerGaps) {
      this.gaps = buildTileGaps(
        this._rect,
        innerGaps,
        outerGaps,
        this._containerRect
      ).gaps;
    }
    this.set_size(this.innerWidth, this.innerHeight);
    this.set_position(this.innerX, this.innerY);
    this._btn.set_size(this.width, this.height);
    this._updateLabelText();
    const newSize = this._rect.copy();
    this.emit("size-changed", oldSize, newSize);
  }
  connect(signal, callback) {
    if (signal === "clicked" || signal === "notify::hover" || signal === "motion-event")
      return this._btn.connect(signal, callback);
    return super.connect(signal, callback);
  }
  _updateLabelText() {
    this._btn.label = `${this.innerWidth}x${this.innerHeight}`;
  }
  _onSliderMove(side) {
    const slider = this._sliders[side];
    if (slider === null) return;
    const posHoriz = (slider.x + slider.width / 2 - this._containerRect.x) / this._containerRect.width;
    const posVert = (slider.y + slider.height / 2 - this._containerRect.y) / this._containerRect.height;
    switch (side) {
      case St.Side.TOP:
        this._tile.height += this._tile.y - posVert;
        this._tile.y = posVert;
        break;
      case St.Side.RIGHT:
        this._tile.width = posHoriz - this._tile.x;
        break;
      case St.Side.BOTTOM:
        this._tile.height = posVert - this._tile.y;
        break;
      case St.Side.LEFT:
        this._tile.width += this._tile.x - posHoriz;
        this._tile.x = posHoriz;
        break;
    }
    this.updateTile({ ...this._tile });
  }
  _onDestroy() {
    this._signals.forEach(
      (id, side) => id && this._sliders[side]?.disconnect(id)
    );
  }
};
__publicField(EditableTilePreview, "metaInfo", {
  Signals: {
    "size-changed": {
      param_types: [Mtk.Rectangle.$gtype, Mtk.Rectangle.$gtype]
      // oldSize, newSize
    }
  },
  GTypeName: "EditableTilePreview"
});
__publicField(EditableTilePreview, "MIN_TILE_SIZE", 140);
EditableTilePreview = __decorateClass([
  registerGObjectClass
], EditableTilePreview);

// src/components/editor/slider.ts
var Slider2 = class extends St.Button {
  _sliderSize = 48;
  _groupId;
  _signals;
  _dragging;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _grab;
  _horizontalDir;
  _lastEventCoord;
  _previousTiles;
  _nextTiles;
  _minTileCoord;
  _maxTileCoord;
  _scalingFactor;
  constructor(parent, groupId, x, y, horizontal) {
    super({
      styleClass: "layout-editor-slider",
      canFocus: true,
      xExpand: false,
      trackHover: true
    });
    parent.add_child(this);
    this._signals = /* @__PURE__ */ new Map();
    this._groupId = groupId;
    this._horizontalDir = horizontal;
    const [, scalingFactor] = getScalingFactorOf(this);
    this._scalingFactor = scalingFactor;
    this.set_width(this.desiredWidth);
    this.set_height(this.desiredHeight);
    this._previousTiles = [];
    this._nextTiles = [];
    this._minTileCoord = Number.MAX_VALUE;
    this._maxTileCoord = Number.MIN_VALUE;
    this._dragging = false;
    this._lastEventCoord = null;
    this.set_position(
      Math.round(Math.round(x - this.width / 2)),
      Math.round(y - this.height / 2)
    );
    this.connect(
      "notify::hover",
      () => global.display.set_cursor(this.preferredCursor)
    );
    this.connect("destroy", this._onDestroy.bind(this));
  }
  get groupId() {
    return this._groupId;
  }
  get desiredWidth() {
    return (this._horizontalDir ? 12 : this._sliderSize) * this._scalingFactor;
  }
  get desiredHeight() {
    return (this._horizontalDir ? this._sliderSize : 12) * this._scalingFactor;
  }
  get preferredCursor() {
    const horizCursor = Meta.Cursor.WEST_RESIZE ?? Meta.Cursor.W_RESIZE;
    const vertCursor = Meta.Cursor.NORTH_RESIZE ?? Meta.Cursor.N_RESIZE;
    return this.hover || this._dragging ? this._horizontalDir ? horizCursor : vertCursor : Meta.Cursor.DEFAULT;
  }
  addTile(tile) {
    const isNext = this._horizontalDir ? this.x <= tile.rect.x : this.y <= tile.rect.y;
    if (isNext) this._nextTiles.push(tile);
    else this._previousTiles.push(tile);
    const side = this._horizontalDir ? isNext ? St.Side.LEFT : St.Side.RIGHT : isNext ? St.Side.TOP : St.Side.BOTTOM;
    tile.addSlider(this, side);
    this._minTileCoord = Math.min(
      this._minTileCoord,
      this._horizontalDir ? tile.rect.y : tile.rect.x
    );
    this._maxTileCoord = Math.max(
      this._maxTileCoord,
      this._horizontalDir ? tile.rect.y + tile.rect.height : tile.rect.x + tile.rect.width
    );
    this._updatePosition();
    this._createTileSignals(tile);
  }
  _onTileSizeChanged(tile, oldSize, newSize) {
    if (this._horizontalDir) {
      if (this._minTileCoord !== oldSize.y && this._maxTileCoord !== oldSize.y + oldSize.height)
        return;
      if (this._minTileCoord === oldSize.y)
        this._minTileCoord = newSize.y;
      if (this._maxTileCoord === oldSize.y + oldSize.height)
        this._maxTileCoord = newSize.y + newSize.height;
    } else {
      if (this._minTileCoord !== oldSize.x && this._maxTileCoord !== oldSize.x + oldSize.width)
        return;
      if (this._minTileCoord === oldSize.x)
        this._minTileCoord = newSize.x;
      if (this._maxTileCoord === oldSize.x + oldSize.width)
        this._maxTileCoord = newSize.x + newSize.width;
    }
    this._updatePosition();
  }
  _updatePosition() {
    this.set_width(this.desiredWidth);
    this.set_height(this.desiredHeight);
    const newCoord = (this._minTileCoord + this._maxTileCoord) / 2;
    if (this._horizontalDir)
      this.set_y(Math.round(newCoord - this.height / 2));
    else this.set_x(Math.round(newCoord - this.width / 2));
  }
  _onTileDeleted(tile) {
    const isNext = this._horizontalDir ? this.x <= tile.rect.x : this.y <= tile.rect.y;
    const array = isNext ? this._nextTiles : this._previousTiles;
    const index = array.indexOf(tile, 0);
    if (index >= 0) array.splice(index, 1);
    const sig = this._signals.get(tile);
    if (sig) {
      sig.forEach((id) => tile.disconnect(id));
      this._signals.delete(tile);
    }
  }
  onTileSplit(tileToRemove, newTiles) {
    if (newTiles.length === 0) return;
    const isNext = this._horizontalDir ? this.x <= tileToRemove.rect.x : this.y <= tileToRemove.rect.y;
    const array = isNext ? this._nextTiles : this._previousTiles;
    const index = array.indexOf(tileToRemove);
    if (index < 0) return;
    const side = this._horizontalDir ? isNext ? St.Side.LEFT : St.Side.RIGHT : isNext ? St.Side.TOP : St.Side.BOTTOM;
    const sig = this._signals.get(tileToRemove);
    if (sig) {
      sig.forEach((id) => tileToRemove.disconnect(id));
      this._signals.delete(tileToRemove);
    }
    array[index] = newTiles[0];
    newTiles[0].addSlider(this, side);
    this._createTileSignals(newTiles[0]);
    for (let i = 1; i < newTiles.length; i++) {
      const tile = newTiles[i];
      array.push(tile);
      tile.addSlider(this, side);
      this._createTileSignals(tile);
    }
  }
  _createTileSignals(tile) {
    if (this._signals.has(tile)) return;
    this._signals.set(tile, []);
    this._signals.get(tile)?.push(
      tile.connect(
        "size-changed",
        this._onTileSizeChanged.bind(this)
      )
    );
    this._signals.get(tile)?.push(tile.connect("destroy", this._onTileDeleted.bind(this)));
  }
  deleteSlider(tileToDelete, innerGaps, outerGaps) {
    const isNext = this._horizontalDir ? this.x <= tileToDelete.rect.x : this.y <= tileToDelete.rect.y;
    const array = isNext ? this._nextTiles : this._previousTiles;
    if (array.length > 1 || array[0] !== tileToDelete) return false;
    array.pop();
    const oppositeSide = this._horizontalDir ? isNext ? St.Side.RIGHT : St.Side.LEFT : isNext ? St.Side.BOTTOM : St.Side.TOP;
    const extendTilesArray = isNext ? this._previousTiles : this._nextTiles;
    extendTilesArray.forEach((tileToExtend) => {
      tileToExtend.updateTile({
        x: !isNext && this._horizontalDir ? tileToDelete.tile.x : tileToExtend.tile.x,
        y: !isNext && !this._horizontalDir ? tileToDelete.tile.y : tileToExtend.tile.y,
        width: this._horizontalDir ? tileToExtend.tile.width + tileToDelete.tile.width : tileToExtend.tile.width,
        height: this._horizontalDir ? tileToExtend.tile.height : tileToExtend.tile.height + tileToDelete.tile.height,
        innerGaps,
        outerGaps
      });
      tileToExtend.removeSlider(oppositeSide);
      tileToDelete.getSlider(oppositeSide)?.addTile(tileToExtend);
    });
    return true;
  }
  vfunc_button_press_event(event) {
    return this._startDragging(event);
  }
  vfunc_button_release_event() {
    if (this._dragging) return this._endDragging();
    return Clutter.EVENT_PROPAGATE;
  }
  vfunc_motion_event(event) {
    if (this._dragging) {
      const [stageX, stageY] = getEventCoords(event);
      this._move(stageX, stageY);
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }
  _startDragging(event) {
    if (this._dragging) return Clutter.EVENT_PROPAGATE;
    this._dragging = true;
    global.display.set_cursor(this.preferredCursor);
    this._grab = global.stage.grab(this);
    const [stageX, stageY] = getEventCoords(event);
    this._move(stageX, stageY);
    return Clutter.EVENT_STOP;
  }
  _endDragging() {
    if (this._dragging) {
      if (this._grab) {
        this._grab.dismiss();
        this._grab = null;
      }
      this._dragging = false;
      this._lastEventCoord = null;
    }
    global.display.set_cursor(this.preferredCursor);
    return Clutter.EVENT_STOP;
  }
  _move(eventX, eventY) {
    eventX = Math.round(eventX);
    eventY = Math.round(eventY);
    if (this._lastEventCoord !== null) {
      const movement = {
        x: this._horizontalDir ? eventX - this._lastEventCoord.x : 0,
        y: this._horizontalDir ? 0 : eventY - this._lastEventCoord.y
      };
      for (const prevTile of this._previousTiles) {
        if (prevTile.rect.width + movement.x < EditableTilePreview.MIN_TILE_SIZE || prevTile.rect.height + movement.y < EditableTilePreview.MIN_TILE_SIZE)
          return;
      }
      for (const nextTile of this._nextTiles) {
        if (nextTile.rect.width - movement.x < EditableTilePreview.MIN_TILE_SIZE || nextTile.rect.height - movement.y < EditableTilePreview.MIN_TILE_SIZE)
          return;
      }
      this.set_position(this.x + movement.x, this.y + movement.y);
      this.emit("slide", this._horizontalDir ? movement.x : movement.y);
    }
    this._lastEventCoord = { x: eventX, y: eventY };
  }
  _onDestroy() {
    this._signals.forEach(
      (ids, tile) => ids.forEach((id) => tile.disconnect(id))
    );
    this._minTileCoord = Number.MAX_VALUE;
    this._maxTileCoord = Number.MIN_VALUE;
    this._previousTiles = [];
    this._nextTiles = [];
    this._lastEventCoord = null;
    this._endDragging();
  }
};
__publicField(Slider2, "metaInfo", {
  Signals: {
    slide: {
      param_types: [GObject.TYPE_INT]
      // movement
    }
  },
  GTypeName: "Slider"
});
Slider2 = __decorateClass([
  registerGObjectClass
], Slider2);

// src/components/editor/hoverLine.ts
var HoverLine = class extends St.Widget {
  _hoverTimer;
  _size;
  _hoveredTile;
  constructor(parent) {
    super({ styleClass: "hover-line" });
    parent.add_child(this);
    this._hoveredTile = null;
    const [, scalingFactor] = getScalingFactorOf(this);
    this._size = 16 * scalingFactor;
    this.hide();
    this._hoverTimer = GLib.timeout_add(
      GLib.PRIORITY_DEFAULT_IDLE,
      100,
      this._handleModifierChange.bind(this)
    );
    this.connect("destroy", this._onDestroy.bind(this));
  }
  handleTileDestroy(tile) {
    if (this._hoveredTile === tile) {
      this._hoveredTile = null;
      this.hide();
    }
  }
  handleMouseMove(tile, x, y) {
    this._hoveredTile = tile;
    const modifier = Shell.Global.get().get_pointer()[2];
    const splitHorizontally = (modifier & Clutter.ModifierType.CONTROL_MASK) === 0;
    this._drawLine(splitHorizontally, x, y);
  }
  _handleModifierChange() {
    if (!this._hoveredTile) return GLib.SOURCE_CONTINUE;
    if (!this._hoveredTile.hover) {
      this.hide();
      return GLib.SOURCE_CONTINUE;
    }
    const [x, y, modifier] = global.get_pointer();
    const splitHorizontally = (modifier & Clutter.ModifierType.CONTROL_MASK) === 0;
    this._drawLine(
      splitHorizontally,
      x - (this.get_parent()?.x || 0),
      y - (this.get_parent()?.y || 0)
    );
    return GLib.SOURCE_CONTINUE;
  }
  _drawLine(splitHorizontally, x, y) {
    if (!this._hoveredTile) return;
    if (splitHorizontally) {
      const newX = x - this._size / 2;
      if (newX < this._hoveredTile.x || newX + this._size > this._hoveredTile.x + this._hoveredTile.width)
        return;
      this.set_size(this._size, this._hoveredTile.height);
      this.set_position(newX, this._hoveredTile.y);
    } else {
      const newY = y - this._size / 2;
      if (newY < this._hoveredTile.y || newY + this._size > this._hoveredTile.y + this._hoveredTile.height)
        return;
      this.set_size(this._hoveredTile.width, this._size);
      this.set_position(this._hoveredTile.x, newY);
    }
    this.show();
  }
  _onDestroy() {
    GLib.Source.remove(this._hoverTimer);
    this._hoveredTile = null;
  }
};
HoverLine = __decorateClass([
  registerGObjectClass
], HoverLine);

// src/components/editor/layoutEditor.ts
import * as Main6 from "resource:///org/gnome/shell/ui/main.js";
var LayoutEditor = class extends St.Widget {
  _layout;
  _containerRect;
  _innerGaps;
  _outerGaps;
  _hoverWidget;
  _sliders;
  _minimizedWindows;
  constructor(layout, monitor, enableScaling) {
    super({ styleClass: "layout-editor" });
    Main6.layoutManager.addChrome(this);
    global.windowGroup.bind_property(
      "visible",
      this,
      "visible",
      GObject.BindingFlags.DEFAULT
    );
    if (enableScaling) {
      const scalingFactor = getMonitorScalingFactor(monitor.index);
      enableScalingFactorSupport(this, scalingFactor);
    }
    const workArea = Main6.layoutManager.getWorkAreaForMonitor(
      monitor.index
    );
    this.set_position(workArea.x, workArea.y);
    this.set_size(workArea.width, workArea.height);
    this._innerGaps = buildMargin(Settings.get_inner_gaps());
    this._outerGaps = buildMargin(Settings.get_outer_gaps());
    this._sliders = [];
    this._containerRect = buildRectangle({
      x: 0,
      y: 0,
      width: workArea.width,
      height: workArea.height
    });
    this._minimizedWindows = getWindowsOfMonitor(monitor).filter(
      (win) => !win.is_hidden()
    );
    this._minimizedWindows.forEach(
      (win) => win.can_minimize() && win.minimize()
    );
    this._hoverWidget = new HoverLine(this);
    this._layout = layout;
    this._drawEditor();
    this.grab_key_focus();
    this.connect("destroy", this._onDestroy.bind(this));
  }
  get layout() {
    return this._layout;
  }
  set layout(newLayout) {
    this.destroy_all_children();
    this._sliders = [];
    this._hoverWidget = new HoverLine(this);
    this._layout = newLayout;
    this._drawEditor();
  }
  _drawEditor() {
    const groups = /* @__PURE__ */ new Map();
    this._layout.tiles.forEach((tile) => {
      const rect = TileUtils.apply_props(tile, this._containerRect);
      const prev = this._buildEditableTile(tile, rect);
      tile.groups.forEach((id) => {
        if (!groups.has(id)) groups.set(id, []);
        groups.get(id)?.push(prev);
      });
    });
    groups.forEach((tiles, groupdId) => {
      let lines = tiles.flatMap((t) => [
        {
          c: Math.round(t.tile.x * 1e3) / 1e3,
          end: false,
          r: t.rect.x
        },
        {
          c: Math.round((t.tile.x + t.tile.width) * 1e3) / 1e3,
          end: true,
          r: t.rect.x + t.rect.width
        }
      ]).sort((a, b) => a.c - b.c !== 0 ? a.c - b.c : a.end ? -1 : 1);
      let count = 0;
      let coord = -1;
      let horizontal = false;
      for (const line of lines) {
        count += line.end ? -1 : 1;
        if (count === 0 && line !== lines[lines.length - 1]) {
          coord = line.r;
          horizontal = true;
          break;
        }
      }
      if (coord === -1) {
        lines = tiles.flatMap((t) => [
          {
            c: Math.round(t.tile.y * 1e3) / 1e3,
            end: false,
            r: t.rect.y
          },
          {
            c: Math.round((t.tile.y + t.tile.height) * 1e3) / 1e3,
            end: true,
            r: t.rect.y + t.rect.height
          }
        ]).sort(
          (a, b) => a.c - b.c !== 0 ? a.c - b.c : a.end ? -1 : 1
        );
        count = 0;
        for (const line of lines) {
          count += line.end ? -1 : 1;
          if (count === 0 && line !== lines[lines.length - 1]) {
            coord = line.r;
            break;
          }
        }
      }
      const slider = this._buildSlider(horizontal, coord, groupdId);
      this._sliders.push(slider);
      tiles.forEach((editable) => slider.addTile(editable));
    });
  }
  _buildEditableTile(tile, rect) {
    const gaps = buildTileGaps(
      rect,
      this._innerGaps,
      this._outerGaps,
      this._containerRect
    ).gaps;
    const editableTile = new EditableTilePreview({
      parent: this,
      tile,
      containerRect: this._containerRect,
      rect,
      gaps
    });
    editableTile.open();
    editableTile.connect("clicked", (_2, clicked_button) => {
      if (clicked_button === St.ButtonMask.ONE)
        this.splitTile(editableTile);
      else if (clicked_button === 3) this.deleteTile(editableTile);
    });
    editableTile.connect("motion-event", (_2, event) => {
      const [stageX, stageY] = getEventCoords(event);
      this._hoverWidget.handleMouseMove(
        editableTile,
        stageX - this.x,
        stageY - this.y
      );
      return Clutter.EVENT_PROPAGATE;
    });
    editableTile.connect("notify::hover", () => {
      const [stageX, stageY] = Shell.Global.get().get_pointer();
      this._hoverWidget.handleMouseMove(
        editableTile,
        stageX - this.x,
        stageY - this.y
      );
    });
    if (this._sliders.length > 0)
      this.set_child_below_sibling(editableTile, this._sliders[0]);
    return editableTile;
  }
  splitTile(editableTile) {
    const oldTile = editableTile.tile;
    const index = this._layout.tiles.indexOf(oldTile);
    if (index < 0) return;
    const [x, y, modifier] = global.get_pointer();
    const splitX = (x - this.x) / this._containerRect.width;
    const splitY = (y - this.y) / this._containerRect.height;
    const splitHorizontally = (modifier & Clutter.ModifierType.CONTROL_MASK) === 0;
    const prevTile = new Tile2({
      x: oldTile.x,
      y: oldTile.y,
      width: splitHorizontally ? splitX - oldTile.x : oldTile.width,
      height: splitHorizontally ? oldTile.height : splitY - oldTile.y,
      groups: []
    });
    const nextTile = new Tile2({
      x: splitHorizontally ? splitX : oldTile.x,
      y: splitHorizontally ? oldTile.y : splitY,
      width: splitHorizontally ? oldTile.width - prevTile.width : oldTile.width,
      height: splitHorizontally ? oldTile.height : oldTile.height - prevTile.height,
      groups: []
    });
    const prevRect = TileUtils.apply_props(prevTile, this._containerRect);
    const nextRect = TileUtils.apply_props(nextTile, this._containerRect);
    if (prevRect.height < EditableTilePreview.MIN_TILE_SIZE || prevRect.width < EditableTilePreview.MIN_TILE_SIZE || nextRect.height < EditableTilePreview.MIN_TILE_SIZE || nextRect.width < EditableTilePreview.MIN_TILE_SIZE)
      return;
    this._layout.tiles[index] = prevTile;
    this._layout.tiles.push(nextTile);
    const prevEditableTile = this._buildEditableTile(prevTile, prevRect);
    const nextEditableTile = this._buildEditableTile(nextTile, nextRect);
    const slider = this._buildSlider(
      splitHorizontally,
      splitHorizontally ? nextEditableTile.rect.x : nextEditableTile.rect.y
    );
    this._sliders.push(slider);
    slider.addTile(prevEditableTile);
    slider.addTile(nextEditableTile);
    if (splitHorizontally) {
      editableTile.getSlider(St.Side.TOP)?.onTileSplit(editableTile, [
        prevEditableTile,
        nextEditableTile
      ]);
      editableTile.getSlider(St.Side.BOTTOM)?.onTileSplit(editableTile, [
        prevEditableTile,
        nextEditableTile
      ]);
      editableTile.getSlider(St.Side.LEFT)?.onTileSplit(editableTile, [prevEditableTile]);
      editableTile.getSlider(St.Side.RIGHT)?.onTileSplit(editableTile, [nextEditableTile]);
    } else {
      editableTile.getSlider(St.Side.LEFT)?.onTileSplit(editableTile, [
        prevEditableTile,
        nextEditableTile
      ]);
      editableTile.getSlider(St.Side.RIGHT)?.onTileSplit(editableTile, [
        prevEditableTile,
        nextEditableTile
      ]);
      editableTile.getSlider(St.Side.TOP)?.onTileSplit(editableTile, [prevEditableTile]);
      editableTile.getSlider(St.Side.BOTTOM)?.onTileSplit(editableTile, [nextEditableTile]);
    }
    this._hoverWidget.handleTileDestroy(editableTile);
    editableTile.destroy();
  }
  deleteTile(editableTile) {
    for (const slider of editableTile.getAllSliders()) {
      if (slider === null) continue;
      const success = slider.deleteSlider(
        editableTile,
        this._innerGaps,
        this._outerGaps
      );
      if (success) {
        this._layout.tiles = this._layout.tiles.filter(
          (tile) => tile !== editableTile.tile
        );
        this._sliders = this._sliders.filter((sl) => sl !== slider);
        this._hoverWidget.handleTileDestroy(editableTile);
        editableTile.destroy();
        slider.destroy();
        return;
      }
    }
  }
  _buildSlider(isHorizontal, coord, groupId) {
    if (!groupId) {
      const groups = this._sliders.map((slider) => slider.groupId).sort();
      groupId = groups.length === 0 ? 1 : groups[groups.length - 1] + 1;
      for (let i = 1; i < groups.length; i++) {
        if (groups[i - 1] + 1 < groups[i]) {
          groupId = groups[i - 1] + 1;
          break;
        }
      }
    }
    return new Slider2(this, groupId, coord, coord, isHorizontal);
  }
  _onDestroy() {
    this._minimizedWindows.forEach((win) => win.unminimize());
    this.destroy_all_children();
    this._sliders = [];
    super.destroy();
  }
};
LayoutEditor = __decorateClass([
  registerGObjectClass
], LayoutEditor);

// src/indicator/utils.ts
var createButton = (iconName, text, path) => {
  const btn = createIconButton(iconName, path, 8);
  btn.set_style("padding-left: 5px !important;");
  btn.child.add_child(
    new St.Label({
      marginBottom: 4,
      marginTop: 4,
      text,
      yAlign: Clutter.ActorAlign.CENTER
    })
  );
  return btn;
};
var createIconButton = (iconName, path, spacing = 0) => {
  const btn = new St.Button({
    styleClass: "message-list-clear-button button",
    canFocus: true,
    xExpand: true,
    style: "padding-left: 5px !important; padding-right: 5px !important;",
    child: new St.BoxLayout({
      clipToAllocation: true,
      xAlign: Clutter.ActorAlign.CENTER,
      yAlign: Clutter.ActorAlign.CENTER,
      reactive: true,
      xExpand: true,
      style: spacing > 0 ? `spacing: ${spacing}px` : ""
    })
  });
  const icon = new St.Icon({
    iconSize: 16,
    yAlign: Clutter.ActorAlign.CENTER,
    style: "padding: 6px"
  });
  if (path)
    icon.gicon = Gio.icon_new_for_string(`${path}/icons/${iconName}.svg`);
  else icon.iconName = iconName;
  btn.child.add_child(icon);
  return btn;
};

// src/indicator/layoutButton.ts
var LayoutButtonWidget = class extends LayoutWidget {
  constructor(parent, layout, gapSize, height, width) {
    super({
      parent,
      layout,
      containerRect: buildRectangle({ x: 0, y: 0, width, height }),
      innerGaps: buildMarginOf(gapSize),
      outerGaps: new Clutter.Margin()
    });
    this.relayout();
  }
  buildTile(parent, rect, gaps, tile) {
    return new SnapAssistTile({ parent, rect, gaps, tile });
  }
};
LayoutButtonWidget = __decorateClass([
  registerGObjectClass
], LayoutButtonWidget);
var LayoutButton = class extends St.Button {
  constructor(parent, layout, gapSize, height, width) {
    super({
      styleClass: "layout-button button",
      xExpand: false,
      yExpand: false
    });
    parent.add_child(this);
    const scalingFactor = getScalingFactorOf(this)[1];
    this.child = new St.Widget();
    new LayoutButtonWidget(
      this.child,
      layout,
      gapSize,
      height * scalingFactor,
      width * scalingFactor
    );
  }
};
LayoutButton = __decorateClass([
  registerGObjectClass
], LayoutButton);

// src/translations.ts
import { gettext as _, ngettext, pgettext } from "resource:///org/gnome/shell/extensions/extension.js";

// src/polyfill.ts
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
function openPrefs() {
  if (Extension.openPrefs) {
    Extension.openPrefs();
  } else {
    Extension.lookupByUUID(
      "tilingshell@ferrarodomenico.com"
    )?.openPreferences();
  }
}

// src/indicator/defaultMenu.ts
import * as Main7 from "resource:///org/gnome/shell/ui/main.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
var debug12 = logger("DefaultMenu");
var LayoutsRow = class extends St.BoxLayout {
  _layoutsBox;
  _layoutsButtons;
  _label;
  _monitor;
  constructor(parent, layouts, selectedId, showMonitorName, monitor) {
    super({
      xAlign: Clutter.ActorAlign.CENTER,
      yAlign: Clutter.ActorAlign.CENTER,
      xExpand: true,
      yExpand: true,
      style: "spacing: 8px",
      ...widgetOrientation(true)
    });
    this._layoutsBox = new St.BoxLayout({
      xAlign: Clutter.ActorAlign.CENTER,
      yAlign: Clutter.ActorAlign.CENTER,
      xExpand: true,
      yExpand: true,
      styleClass: "layouts-box-layout"
    });
    this._monitor = monitor;
    this._label = new St.Label({
      text: `Monitor ${this._monitor.index + 1}`,
      styleClass: "monitor-layouts-title"
    });
    this.add_child(this._label);
    if (!showMonitorName) this._label.hide();
    this.add_child(this._layoutsBox);
    parent.add_child(this);
    const selectedIndex = layouts.findIndex((lay) => lay.id === selectedId);
    const hasGaps = Settings.get_inner_gaps(1).top > 0;
    const layoutHeight = 36;
    const layoutWidth = 64;
    this._layoutsButtons = layouts.map((lay, ind) => {
      const btn = new LayoutButton(
        this._layoutsBox,
        lay,
        hasGaps ? 2 : 0,
        layoutHeight,
        layoutWidth
      );
      btn.connect(
        "clicked",
        () => !btn.checked && this.emit("selected-layout", lay.id)
      );
      if (ind === selectedIndex) btn.set_checked(true);
      return btn;
    });
  }
  selectLayout(selectedId) {
    const selectedIndex = GlobalState.get().layouts.findIndex(
      (lay) => lay.id === selectedId
    );
    this._layoutsButtons.forEach(
      (btn, ind) => btn.set_checked(ind === selectedIndex)
    );
  }
  updateMonitorName(showMonitorName, monitorsDetails) {
    if (!showMonitorName) this._label.hide();
    else this._label.show();
    const details = monitorsDetails.find(
      (m) => m.x === this._monitor.x && m.y === this._monitor.y
    );
    if (!details) return;
    this._label.set_text(details.name);
  }
};
__publicField(LayoutsRow, "metaInfo", {
  GTypeName: "LayoutsRow",
  Signals: {
    "selected-layout": {
      param_types: [GObject.TYPE_STRING]
    }
  }
});
LayoutsRow = __decorateClass([
  registerGObjectClass
], LayoutsRow);
var DefaultMenu = class {
  _signals;
  _indicator;
  _layoutsRows;
  _container;
  _scalingFactor;
  _children;
  constructor(indicator, enableScalingFactor) {
    this._indicator = indicator;
    this._signals = new SignalHandling();
    this._children = [];
    const layoutsPopupMenu = new PopupMenu.PopupBaseMenuItem({
      style_class: "indicator-menu-item"
    });
    this._children.push(layoutsPopupMenu);
    this._container = new St.BoxLayout({
      xAlign: Clutter.ActorAlign.CENTER,
      yAlign: Clutter.ActorAlign.CENTER,
      xExpand: true,
      yExpand: true,
      styleClass: "default-menu-container",
      ...widgetOrientation(true)
    });
    layoutsPopupMenu.add_child(this._container);
    this._indicator.menu.addMenuItem(
      layoutsPopupMenu
    );
    if (enableScalingFactor) {
      const monitor = Main7.layoutManager.findMonitorForActor(
        this._container
      );
      const scalingFactor = getMonitorScalingFactor(
        monitor?.index || Main7.layoutManager.primaryIndex
      );
      enableScalingFactorSupport(this._container, scalingFactor);
    }
    this._scalingFactor = getScalingFactorOf(this._container)[1];
    this._layoutsRows = [];
    this._drawLayouts();
    this._signals.connect(
      Settings,
      Settings.KEY_SETTING_LAYOUTS_JSON,
      () => {
        this._drawLayouts();
      }
    );
    this._signals.connect(Settings, Settings.KEY_INNER_GAPS, () => {
      this._drawLayouts();
    });
    this._signals.connect(
      Settings,
      Settings.KEY_SETTING_SELECTED_LAYOUTS,
      () => {
        this._updateScaling();
        if (this._layoutsRows.length !== getMonitors().length)
          this._drawLayouts();
        const selected_layouts = Settings.get_selected_layouts();
        const wsIndex = global.workspaceManager.get_active_workspace_index();
        getMonitors().forEach((m, index) => {
          const selectedId = wsIndex < selected_layouts.length ? selected_layouts[wsIndex][index] : GlobalState.get().layouts[0].id;
          this._layoutsRows[index].selectLayout(selectedId);
        });
      }
    );
    this._signals.connect(
      global.workspaceManager,
      "active-workspace-changed",
      () => {
        const selected_layouts = Settings.get_selected_layouts();
        const wsIndex = global.workspaceManager.get_active_workspace_index();
        getMonitors().forEach((m, index) => {
          const selectedId = wsIndex < selected_layouts.length ? selected_layouts[wsIndex][index] : GlobalState.get().layouts[0].id;
          this._layoutsRows[index].selectLayout(selectedId);
        });
      }
    );
    this._signals.connect(Main7.layoutManager, "monitors-changed", () => {
      if (!enableScalingFactor) return;
      const monitor = Main7.layoutManager.findMonitorForActor(
        this._container
      );
      const scalingFactor = getMonitorScalingFactor(
        monitor?.index || Main7.layoutManager.primaryIndex
      );
      enableScalingFactorSupport(this._container, scalingFactor);
      this._updateScaling();
      if (this._layoutsRows.length !== getMonitors().length)
        this._drawLayouts();
      this._computeMonitorsDetails();
    });
    this._computeMonitorsDetails();
    const buttonsPopupMenu = this._buildEditingButtonsRow();
    this._indicator.menu.addMenuItem(
      buttonsPopupMenu
    );
    this._children.push(buttonsPopupMenu);
  }
  // compute monitors details and update labels asynchronously (if we have successful results...)
  _computeMonitorsDetails() {
    if (getMonitors().length === 1) {
      this._layoutsRows.forEach((lr) => lr.updateMonitorName(false, []));
      return;
    }
    try {
      const proc = Gio.Subprocess.new(
        ["gjs", "-m", `${this._indicator.path}/monitorDescription.js`],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
      );
      proc.communicate_utf8_async(
        null,
        null,
        (pr, res) => {
          if (!pr) return;
          const [, stdout, stderr] = pr.communicate_utf8_finish(res);
          if (pr.get_successful()) {
            debug12(stdout);
            const monitorsDetails = JSON.parse(stdout);
            this._layoutsRows.forEach(
              (lr) => lr.updateMonitorName(true, monitorsDetails)
            );
          } else {
            debug12("error:", stderr);
          }
        }
      );
    } catch (e) {
      debug12(e);
    }
  }
  _updateScaling() {
    const newScalingFactor = getScalingFactorOf(this._container)[1];
    if (this._scalingFactor === newScalingFactor) return;
    this._scalingFactor = newScalingFactor;
    this._drawLayouts();
  }
  _buildEditingButtonsRow() {
    const buttonsBoxLayout = new St.BoxLayout({
      xAlign: Clutter.ActorAlign.CENTER,
      yAlign: Clutter.ActorAlign.CENTER,
      xExpand: true,
      yExpand: true,
      styleClass: "buttons-box-layout"
    });
    const editLayoutsBtn = createButton(
      "edit-symbolic",
      `${_("Edit Layouts")}...`,
      this._indicator.path
    );
    editLayoutsBtn.connect(
      "clicked",
      () => this._indicator.openLayoutEditor()
    );
    buttonsBoxLayout.add_child(editLayoutsBtn);
    const newLayoutBtn = createButton(
      "add-symbolic",
      `${_("New Layout")}...`,
      this._indicator.path
    );
    newLayoutBtn.connect(
      "clicked",
      () => this._indicator.newLayoutOnClick(true)
    );
    buttonsBoxLayout.add_child(newLayoutBtn);
    const prefsBtn = createIconButton(
      "prefs-symbolic",
      this._indicator.path
    );
    prefsBtn.connect("clicked", () => {
      openPrefs();
      this._indicator.menu.toggle();
    });
    buttonsBoxLayout.add_child(prefsBtn);
    const buttonsPopupMenu = new PopupMenu.PopupBaseMenuItem({
      style_class: "indicator-menu-item"
    });
    buttonsPopupMenu.add_child(buttonsBoxLayout);
    return buttonsPopupMenu;
  }
  _drawLayouts() {
    const layouts = GlobalState.get().layouts;
    this._container.destroy_all_children();
    this._layoutsRows = [];
    const selected_layouts = Settings.get_selected_layouts();
    const ws_index = global.workspaceManager.get_active_workspace_index();
    const monitors = getMonitors();
    this._layoutsRows = monitors.map((monitor) => {
      const ws_selected_layouts = ws_index < selected_layouts.length ? selected_layouts[ws_index] : [];
      const selectedId = monitor.index < ws_selected_layouts.length ? ws_selected_layouts[monitor.index] : GlobalState.get().layouts[0].id;
      const row = new LayoutsRow(
        this._container,
        layouts,
        selectedId,
        monitors.length > 1,
        monitor
      );
      row.connect(
        "selected-layout",
        (r, layoutId) => {
          this._indicator.selectLayoutOnClick(
            monitor.index,
            layoutId
          );
        }
      );
      return row;
    });
  }
  destroy() {
    this._signals.disconnect();
    this._layoutsRows.forEach((lr) => lr.destroy());
    this._layoutsRows = [];
    this._children.forEach((c) => c.destroy());
    this._children = [];
  }
};

// src/indicator/editingMenu.ts
import * as PopupMenu2 from "resource:///org/gnome/shell/ui/popupMenu.js";
var EditingMenu = class {
  _indicator;
  constructor(indicator) {
    this._indicator = indicator;
    const boxLayout = new St.BoxLayout({
      styleClass: "buttons-box-layout",
      xExpand: true,
      style: "spacing: 8px",
      ...widgetOrientation(true)
    });
    const openMenuBtn = createButton(
      "menu-symbolic",
      _("Menu"),
      this._indicator.path
    );
    openMenuBtn.connect("clicked", () => this._indicator.openMenu(false));
    boxLayout.add_child(openMenuBtn);
    const infoMenuBtn = createButton(
      "info-symbolic",
      _("Info"),
      this._indicator.path
    );
    infoMenuBtn.connect("clicked", () => this._indicator.openMenu(true));
    boxLayout.add_child(infoMenuBtn);
    const saveBtn = createButton(
      "save-symbolic",
      _("Save"),
      this._indicator.path
    );
    saveBtn.connect("clicked", () => {
      this._indicator.menu.toggle();
      this._indicator.saveLayoutOnClick();
    });
    boxLayout.add_child(saveBtn);
    const cancelBtn = createButton(
      "cancel-symbolic",
      _("Cancel"),
      this._indicator.path
    );
    cancelBtn.connect("clicked", () => {
      this._indicator.menu.toggle();
      this._indicator.cancelLayoutOnClick();
    });
    boxLayout.add_child(cancelBtn);
    const menuItem = new PopupMenu2.PopupBaseMenuItem({
      style_class: "indicator-menu-item"
    });
    menuItem.add_child(boxLayout);
    this._indicator.menu.addMenuItem(menuItem);
  }
  destroy() {
    this._indicator.menu.removeAll();
  }
};

// src/components/editor/editorDialog.ts
import * as ModalDialog from "resource:///org/gnome/shell/ui/modalDialog.js";
import * as Main8 from "resource:///org/gnome/shell/ui/main.js";
var EditorDialog = class extends ModalDialog.ModalDialog {
  _layoutHeight = 72;
  _layoutWidth = 128;
  // 16:9 ratio. -> (16*layoutHeight) / 9 and then rounded to int
  _gapsSize = 3;
  _layoutsBoxLayout;
  constructor(params) {
    super({
      destroyOnClose: true,
      styleClass: "editor-dialog"
    });
    if (params.enableScaling) {
      const monitor = Main8.layoutManager.findMonitorForActor(this);
      const scalingFactor = getMonitorScalingFactor(
        monitor?.index || Main8.layoutManager.primaryIndex
      );
      enableScalingFactorSupport(this, scalingFactor);
    }
    this.contentLayout.add_child(
      new St.Label({
        text: _("Select the layout to edit"),
        xAlign: Clutter.ActorAlign.CENTER,
        xExpand: true,
        styleClass: "editor-dialog-title"
      })
    );
    this._layoutsBoxLayout = new St.BoxLayout({
      styleClass: "layouts-box-layout",
      xAlign: Clutter.ActorAlign.CENTER
    });
    this.contentLayout.add_child(this._layoutsBoxLayout);
    if (!params.legend) {
      this._drawLayouts({
        layouts: GlobalState.get().layouts,
        ...params
      });
    }
    this.addButton({
      label: _("Close"),
      default: true,
      key: Clutter.KEY_Escape,
      action: () => params.onClose()
    });
    if (params.legend) {
      this._makeLegendDialog({
        onClose: params.onClose,
        path: params.path
      });
    }
  }
  _makeLegendDialog(params) {
    const suggestion1 = new St.BoxLayout();
    suggestion1.add_child(
      new St.Label({
        text: "LEFT CLICK",
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "button kbd",
        xExpand: false,
        pseudoClass: "active"
      })
    );
    suggestion1.add_child(
      new St.Label({
        text: ` ${_("to split a tile")}.`,
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "",
        xExpand: false
      })
    );
    const suggestion2 = new St.BoxLayout();
    suggestion2.add_child(
      new St.Label({
        text: "LEFT CLICK",
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "button kbd",
        xExpand: false,
        pseudoClass: "active"
      })
    );
    suggestion2.add_child(
      new St.Label({
        text: " + ",
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "",
        xExpand: false
      })
    );
    suggestion2.add_child(
      new St.Label({
        text: "CTRL",
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "button kbd",
        xExpand: false,
        pseudoClass: "active"
      })
    );
    suggestion2.add_child(
      new St.Label({
        text: ` ${_("to split a tile vertically")}.`,
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "",
        xExpand: false
      })
    );
    const suggestion3 = new St.BoxLayout();
    suggestion3.add_child(
      new St.Label({
        text: "RIGHT CLICK",
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "button kbd",
        xExpand: false,
        pseudoClass: "active"
      })
    );
    suggestion3.add_child(
      new St.Label({
        text: ` ${_("to delete a tile")}.`,
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "",
        xExpand: false
      })
    );
    const suggestion4 = new St.BoxLayout({
      xExpand: true,
      margin_top: 16
    });
    suggestion4.add_child(
      new St.Icon({
        iconSize: 16,
        yAlign: Clutter.ActorAlign.CENTER,
        gicon: Gio.icon_new_for_string(
          `${params.path}/icons/indicator-symbolic.svg`
        ),
        styleClass: "button kbd",
        pseudoClass: "active"
      })
    );
    suggestion4.add_child(
      new St.Label({
        text: ` ${_("use the indicator button to save or cancel")}.`,
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        styleClass: "",
        xExpand: false
      })
    );
    const legend = new St.BoxLayout({
      styleClass: "legend",
      ...widgetOrientation(true)
    });
    legend.add_child(suggestion1);
    legend.add_child(suggestion2);
    legend.add_child(suggestion3);
    legend.add_child(suggestion4);
    this.contentLayout.destroy_all_children();
    this.contentLayout.add_child(
      new St.Label({
        text: _("How to use the editor"),
        xAlign: Clutter.ActorAlign.CENTER,
        xExpand: true,
        styleClass: "editor-dialog-title"
      })
    );
    this.contentLayout.add_child(legend);
    this.clearButtons();
    this.addButton({
      label: _("Start editing"),
      default: true,
      key: Clutter.KEY_Escape,
      action: params.onClose
    });
  }
  _drawLayouts(params) {
    const gaps = Settings.get_inner_gaps(1).top > 0 ? this._gapsSize : 0;
    this._layoutsBoxLayout.destroy_all_children();
    params.layouts.forEach((lay, btnInd) => {
      const box2 = new St.BoxLayout({
        xAlign: Clutter.ActorAlign.CENTER,
        styleClass: "layout-button-container",
        ...widgetOrientation(true)
      });
      this._layoutsBoxLayout.add_child(box2);
      const btn = new LayoutButton(
        box2,
        lay,
        gaps,
        this._layoutHeight,
        this._layoutWidth
      );
      if (params.layouts.length > 1) {
        const deleteBtn = new St.Button({
          xExpand: false,
          xAlign: Clutter.ActorAlign.CENTER,
          styleClass: "message-list-clear-button icon-button button delete-layout-button"
        });
        deleteBtn.child = new St.Icon({
          gicon: Gio.icon_new_for_string(
            `${params.path}/icons/delete-symbolic.svg`
          ),
          iconSize: 16
        });
        deleteBtn.connect("clicked", () => {
          params.onDeleteLayout(btnInd, lay);
          this._drawLayouts({
            ...params,
            layouts: GlobalState.get().layouts
          });
        });
        box2.add_child(deleteBtn);
      }
      btn.connect("clicked", () => {
        params.onSelectLayout(btnInd, lay);
        this._makeLegendDialog({
          onClose: params.onClose,
          path: params.path
        });
      });
      return btn;
    });
    const box = new St.BoxLayout({
      xAlign: Clutter.ActorAlign.CENTER,
      styleClass: "layout-button-container",
      ...widgetOrientation(true)
    });
    this._layoutsBoxLayout.add_child(box);
    const newLayoutBtn = new LayoutButton(
      box,
      new Layout(
        [new Tile2({ x: 0, y: 0, width: 1, height: 1, groups: [] })],
        "New Layout"
      ),
      gaps,
      this._layoutHeight,
      this._layoutWidth
    );
    const icon = new St.Icon({
      gicon: Gio.icon_new_for_string(
        `${params.path}/icons/add-symbolic.svg`
      ),
      iconSize: 32
    });
    icon.set_size(newLayoutBtn.child.width, newLayoutBtn.child.height);
    newLayoutBtn.child.add_child(icon);
    newLayoutBtn.connect("clicked", () => {
      params.onNewLayout();
      this._makeLegendDialog({
        onClose: params.onClose,
        path: params.path
      });
    });
  }
};
EditorDialog = __decorateClass([
  registerGObjectClass
], EditorDialog);

// src/indicator/indicator.ts
import * as Main9 from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
var IndicatorState = /* @__PURE__ */ ((IndicatorState2) => {
  IndicatorState2[IndicatorState2["DEFAULT"] = 1] = "DEFAULT";
  IndicatorState2[IndicatorState2["CREATE_NEW"] = 2] = "CREATE_NEW";
  IndicatorState2[IndicatorState2["EDITING_LAYOUT"] = 3] = "EDITING_LAYOUT";
  return IndicatorState2;
})(IndicatorState || {});
var Indicator3 = class extends PanelMenu.Button {
  _layoutEditor;
  _editorDialog;
  _currentMenu;
  _state;
  _enableScaling;
  _path;
  _keyPressEvent;
  constructor(path, uuid) {
    super(0.5, "Tiling Shell Indicator", false);
    Main9.panel.addToStatusArea(uuid, this, 1, "right");
    Settings.bind(
      Settings.KEY_SHOW_INDICATOR,
      this,
      "visible",
      Gio.SettingsBindFlags.GET
    );
    const icon = new St.Icon({
      gicon: Gio.icon_new_for_string(
        `${path}/icons/indicator-symbolic.svg`
      ),
      styleClass: "system-status-icon indicator-icon"
    });
    this.add_child(icon);
    this._layoutEditor = null;
    this._editorDialog = null;
    this._currentMenu = null;
    this._state = 1 /* DEFAULT */;
    this._keyPressEvent = null;
    this._enableScaling = false;
    this._path = path;
    this.connect("destroy", this._onDestroy.bind(this));
  }
  get path() {
    return this._path;
  }
  set enableScaling(value) {
    if (this._enableScaling === value) return;
    this._enableScaling = value;
    if (this._currentMenu && this._state === 1 /* DEFAULT */) {
      this._currentMenu.destroy();
      this._currentMenu = new DefaultMenu(this, this._enableScaling);
    }
  }
  enable() {
    this.menu.removeAll();
    this._currentMenu = new DefaultMenu(this, this._enableScaling);
  }
  selectLayoutOnClick(monitorIndex, layoutToSelectId) {
    GlobalState.get().setSelectedLayoutOfMonitor(
      layoutToSelectId,
      monitorIndex
    );
    this.menu.toggle();
  }
  newLayoutOnClick(showLegendOnly) {
    this.menu.close(true);
    const newLayout = new Layout(
      [
        new Tile2({ x: 0, y: 0, width: 0.3, height: 1, groups: [1] }),
        new Tile2({ x: 0.3, y: 0, width: 0.7, height: 1, groups: [1] })
      ],
      `${Shell.Global.get().get_current_time()}`
    );
    if (this._layoutEditor) {
      this._layoutEditor.layout = newLayout;
    } else {
      this._layoutEditor = new LayoutEditor(
        newLayout,
        Main9.layoutManager.monitors[Main9.layoutManager.primaryIndex],
        this._enableScaling
      );
    }
    this._setState(2 /* CREATE_NEW */);
    if (showLegendOnly) this.openMenu(true);
  }
  openMenu(showLegend) {
    if (this._editorDialog) return;
    this._editorDialog = new EditorDialog({
      enableScaling: this._enableScaling,
      onNewLayout: () => {
        this.newLayoutOnClick(false);
      },
      onDeleteLayout: (ind, lay) => {
        GlobalState.get().deleteLayout(lay);
        if (this._layoutEditor && this._layoutEditor.layout.id === lay.id)
          this.cancelLayoutOnClick();
      },
      onSelectLayout: (ind, lay) => {
        const layCopy = new Layout(
          lay.tiles.map(
            (t) => new Tile2({
              x: t.x,
              y: t.y,
              width: t.width,
              height: t.height,
              groups: [...t.groups]
            })
          ),
          lay.id
        );
        if (this._layoutEditor) {
          this._layoutEditor.layout = layCopy;
        } else {
          this._layoutEditor = new LayoutEditor(
            layCopy,
            Main9.layoutManager.monitors[Main9.layoutManager.primaryIndex],
            this._enableScaling
          );
        }
        this._setState(3 /* EDITING_LAYOUT */);
      },
      onClose: () => {
        this._editorDialog?.destroy();
        this._editorDialog = null;
      },
      path: this._path,
      legend: showLegend
    });
    this._editorDialog.open();
  }
  openLayoutEditor() {
    this.openMenu(false);
  }
  saveLayoutOnClick() {
    if (this._layoutEditor === null || this._state === 1 /* DEFAULT */)
      return;
    const newLayout = this._layoutEditor.layout;
    if (this._state === 2 /* CREATE_NEW */)
      GlobalState.get().addLayout(newLayout);
    else GlobalState.get().editLayout(newLayout);
    this.menu.toggle();
    this._layoutEditor.destroy();
    this._layoutEditor = null;
    this._setState(1 /* DEFAULT */);
  }
  cancelLayoutOnClick() {
    if (this._layoutEditor === null || this._state === 1 /* DEFAULT */)
      return;
    this.menu.toggle();
    this._layoutEditor.destroy();
    this._layoutEditor = null;
    this._setState(1 /* DEFAULT */);
  }
  _setState(newState) {
    if (this._state === newState) return;
    this._state = newState;
    this._currentMenu?.destroy();
    switch (newState) {
      case 1 /* DEFAULT */:
        this._currentMenu = new DefaultMenu(this, this._enableScaling);
        if (!Settings.SHOW_INDICATOR) this.hide();
        if (this._keyPressEvent) {
          global.stage.disconnect(this._keyPressEvent);
          this._keyPressEvent = null;
        }
        break;
      case 2 /* CREATE_NEW */:
      case 3 /* EDITING_LAYOUT */:
        if (this._keyPressEvent)
          global.stage.disconnect(this._keyPressEvent);
        this._keyPressEvent = global.stage.connect_after(
          "key-press-event",
          (_2, event) => {
            const symbol = event.get_key_symbol();
            if (symbol === Clutter.KEY_Escape)
              this.cancelLayoutOnClick();
            return Clutter.EVENT_PROPAGATE;
          }
        );
        this._currentMenu = new EditingMenu(this);
        this.show();
        break;
    }
  }
  _onDestroy() {
    this._editorDialog?.destroy();
    this._editorDialog = null;
    this._layoutEditor?.destroy();
    this._layoutEditor = null;
    this._currentMenu?.destroy();
    this._currentMenu = null;
    this.menu.removeAll();
  }
};
Indicator3 = __decorateClass([
  registerGObjectClass
], Indicator3);

// src/dbus.ts
var node = `<node>
    <interface name="org.gnome.Shell.Extensions.TilingShell">
        <method name="openLayoutEditor" />
    </interface>
</node>`;
var DBus = class {
  _dbus;
  constructor() {
    this._dbus = null;
  }
  enable(ext) {
    if (this._dbus) return;
    this._dbus = Gio.DBusExportedObject.wrapJSObject(node, ext);
    this._dbus.export(
      Gio.DBus.session,
      "/org/gnome/Shell/Extensions/TilingShell"
    );
  }
  disable() {
    this._dbus?.flush();
    this._dbus?.unexport();
    this._dbus = null;
  }
};

// src/components/tilingsystem/resizeManager.ts
var ResizingManager = class {
  _signals;
  constructor() {
    this._signals = null;
  }
  enable() {
    if (this._signals) this._signals.disconnect();
    this._signals = new SignalHandling();
    this._signals.connect(
      global.display,
      "grab-op-begin",
      (_display, window, grabOp) => {
        const moving = grabOp === Meta.GrabOp.KEYBOARD_MOVING || grabOp === Meta.GrabOp.MOVING;
        if (moving || !Settings.RESIZE_COMPLEMENTING_WINDOWS) return;
        this._onWindowResizingBegin(window, grabOp & ~1024);
      }
    );
    this._signals.connect(
      global.display,
      "grab-op-end",
      (_display, window, grabOp) => {
        const moving = grabOp === Meta.GrabOp.KEYBOARD_MOVING || grabOp === Meta.GrabOp.MOVING;
        if (moving) return;
        this._onWindowResizingEnd(window);
      }
    );
  }
  destroy() {
    if (this._signals) this._signals.disconnect();
  }
  _onWindowResizingBegin(window, grabOp) {
    if (!window || !window.assignedTile || !this._signals)
      return;
    const verticalSide = [false, 0];
    const horizontalSide = [false, 0];
    switch (grabOp) {
      case Meta.GrabOp.RESIZING_N:
      case Meta.GrabOp.RESIZING_NE:
      case Meta.GrabOp.RESIZING_NW:
      case Meta.GrabOp.KEYBOARD_RESIZING_N:
      case Meta.GrabOp.KEYBOARD_RESIZING_NE:
      case Meta.GrabOp.KEYBOARD_RESIZING_NW:
        verticalSide[0] = true;
        verticalSide[1] = St.Side.TOP;
        break;
      case Meta.GrabOp.RESIZING_S:
      case Meta.GrabOp.RESIZING_SE:
      case Meta.GrabOp.RESIZING_SW:
      case Meta.GrabOp.KEYBOARD_RESIZING_S:
      case Meta.GrabOp.KEYBOARD_RESIZING_SE:
      case Meta.GrabOp.KEYBOARD_RESIZING_SW:
        verticalSide[0] = true;
        verticalSide[1] = St.Side.BOTTOM;
        break;
    }
    switch (grabOp) {
      case Meta.GrabOp.RESIZING_E:
      case Meta.GrabOp.RESIZING_NE:
      case Meta.GrabOp.RESIZING_SE:
      case Meta.GrabOp.KEYBOARD_RESIZING_E:
      case Meta.GrabOp.KEYBOARD_RESIZING_NE:
      case Meta.GrabOp.KEYBOARD_RESIZING_SE:
        horizontalSide[0] = true;
        horizontalSide[1] = St.Side.RIGHT;
        break;
      case Meta.GrabOp.RESIZING_W:
      case Meta.GrabOp.RESIZING_NW:
      case Meta.GrabOp.RESIZING_SW:
      case Meta.GrabOp.KEYBOARD_RESIZING_W:
      case Meta.GrabOp.KEYBOARD_RESIZING_NW:
      case Meta.GrabOp.KEYBOARD_RESIZING_SW:
        horizontalSide[0] = true;
        horizontalSide[1] = St.Side.LEFT;
        break;
    }
    if (!verticalSide[0] && !horizontalSide[0]) return;
    const otherTiledWindows = getWindows().filter(
      (otherWindow) => otherWindow && otherWindow.assignedTile && otherWindow !== window && !otherWindow.minimized
    );
    if (otherTiledWindows.length === 0) return;
    const verticalAdjacentWindows = verticalSide[0] ? this._findAdjacent(
      window,
      verticalSide[1],
      new Set(otherTiledWindows)
    ) : [];
    const horizontalAdjacentWindows = horizontalSide[0] ? this._findAdjacent(
      window,
      horizontalSide[1],
      new Set(otherTiledWindows)
    ) : [];
    const windowsMap = /* @__PURE__ */ new Map();
    verticalAdjacentWindows.forEach(([otherWin, sideOtherWin]) => {
      windowsMap.set(otherWin, [
        otherWin,
        otherWin.get_frame_rect().copy(),
        sideOtherWin,
        // resize vertically
        -1
        // resize horizontally
      ]);
    });
    horizontalAdjacentWindows.forEach(([otherWin, sideOtherWin]) => {
      const val = windowsMap.get(otherWin);
      if (val) {
        val[3] = sideOtherWin;
      } else {
        windowsMap.set(otherWin, [
          otherWin,
          otherWin.get_frame_rect().copy(),
          -1,
          // resize vertically
          sideOtherWin
          // resize horizontally
        ]);
      }
    });
    const windowsToResize = Array.from(windowsMap.values());
    this._signals.connect(
      window,
      "size-changed",
      this._onResizingWindow.bind(
        this,
        window,
        window.get_frame_rect().copy(),
        verticalSide[1],
        horizontalSide[1],
        windowsToResize
      )
    );
  }
  _oppositeSide(side) {
    switch (side) {
      case St.Side.TOP:
        return St.Side.BOTTOM;
      case St.Side.BOTTOM:
        return St.Side.TOP;
      case St.Side.LEFT:
        return St.Side.RIGHT;
      case St.Side.RIGHT:
        return St.Side.LEFT;
    }
  }
  _findAdjacent(window, side, remainingWindows) {
    const result = [];
    const adjacentWindows = [];
    const windowRect = window.get_frame_rect();
    const borderRect = windowRect.copy();
    const innerGaps = Settings.get_inner_gaps();
    if (innerGaps.top === 0) innerGaps.top = 2;
    if (innerGaps.bottom === 0) innerGaps.bottom = 2;
    if (innerGaps.left === 0) innerGaps.left = 2;
    if (innerGaps.right === 0) innerGaps.right = 2;
    const errorFactor = innerGaps.right * 4;
    switch (side) {
      case St.Side.TOP:
        borderRect.height = innerGaps.top + errorFactor;
        borderRect.y -= innerGaps.top + errorFactor;
        break;
      case St.Side.BOTTOM:
        borderRect.y += borderRect.height;
        borderRect.height = innerGaps.bottom + errorFactor;
        break;
      case St.Side.LEFT:
        borderRect.width = innerGaps.left + errorFactor;
        borderRect.x -= innerGaps.left + errorFactor;
        break;
      case St.Side.RIGHT:
        borderRect.x += borderRect.width;
        borderRect.width = innerGaps.right + errorFactor;
        break;
    }
    const oppositeSide = this._oppositeSide(side);
    const newRemainingWindows = /* @__PURE__ */ new Set();
    remainingWindows.forEach((otherWin) => {
      const otherWinRect = otherWin.get_frame_rect();
      let [hasIntersection, intersection] = otherWin.get_frame_rect().intersect(borderRect);
      switch (side) {
        case St.Side.RIGHT:
          hasIntersection && (hasIntersection = intersection.x <= otherWinRect.x);
          break;
        case St.Side.LEFT:
          hasIntersection && (hasIntersection = intersection.x + intersection.width >= otherWinRect.x + otherWinRect.width);
          break;
        case St.Side.BOTTOM:
          hasIntersection && (hasIntersection = intersection.y <= otherWinRect.y);
          break;
        case St.Side.TOP:
          hasIntersection && (hasIntersection = intersection.y + intersection.height >= otherWinRect.y + otherWinRect.height);
          break;
      }
      if (hasIntersection) {
        result.push([otherWin, oppositeSide]);
        adjacentWindows.push(otherWin);
      } else {
        newRemainingWindows.add(otherWin);
      }
    });
    adjacentWindows.forEach((otherWin) => {
      this._findAdjacent(
        otherWin,
        oppositeSide,
        newRemainingWindows
      ).forEach((recursionResult) => {
        result.push(recursionResult);
        newRemainingWindows.delete(recursionResult[0]);
      });
    });
    return result;
  }
  _onWindowResizingEnd(window) {
    if (this._signals) this._signals.disconnect(window);
  }
  _onResizingWindow(window, startingRect, resizeVerticalSide, resizeHorizontalSide, windowsToResize) {
    const currentRect = window.get_frame_rect();
    const resizedRect = {
      x: currentRect.x - startingRect.x,
      y: currentRect.y - startingRect.y,
      width: currentRect.width - startingRect.width,
      height: currentRect.height - startingRect.height
    };
    windowsToResize.forEach(
      ([otherWindow, otherWindowRect, verticalSide, horizontalSide]) => {
        const isSameVerticalSide = verticalSide !== -1 && verticalSide === resizeVerticalSide;
        const isSameHorizontalSide = horizontalSide !== -1 && horizontalSide === resizeHorizontalSide;
        const rect = [
          otherWindowRect.x,
          otherWindowRect.y,
          otherWindowRect.width,
          otherWindowRect.height
        ];
        if (horizontalSide === St.Side.LEFT) {
          rect[2] = otherWindowRect.width - (isSameHorizontalSide ? resizedRect.x : resizedRect.width);
          rect[0] = otherWindowRect.x + (isSameHorizontalSide ? resizedRect.x : resizedRect.width);
        } else if (horizontalSide === St.Side.RIGHT) {
          rect[2] = otherWindowRect.width + (isSameHorizontalSide ? resizedRect.width : resizedRect.x);
        }
        if (verticalSide === St.Side.TOP) {
          rect[3] = otherWindowRect.height - (isSameVerticalSide ? resizedRect.y : resizedRect.height);
          rect[1] = otherWindowRect.y + (isSameVerticalSide ? resizedRect.y : resizedRect.height);
        } else if (verticalSide === St.Side.BOTTOM) {
          rect[3] = otherWindowRect.height + (isSameVerticalSide ? resizedRect.height : resizedRect.y);
        }
        otherWindow.move_resize_frame(
          false,
          Math.max(0, rect[0]),
          Math.max(0, rect[1]),
          Math.max(0, rect[2]),
          Math.max(0, rect[3])
        );
      }
    );
  }
};

// src/components/snapassist/snapAssistTileButton.ts
var SnapAssistTileButton = class extends SnapAssistTile {
  _btn;
  constructor(params) {
    super(params);
    this._btn = new St.Button({
      xExpand: true,
      yExpand: true,
      trackHover: true
    });
    this.add_child(this._btn);
    this._btn.set_size(this.innerWidth, this.innerHeight);
    this._btn.connect(
      "notify::hover",
      () => this.set_hover(this._btn.hover)
    );
  }
  get tile() {
    return this._tile;
  }
  get checked() {
    return this._btn.checked;
  }
  set_checked(newVal) {
    this._btn.set_checked(newVal);
  }
  connect(signal, callback) {
    if (signal === "clicked") return this._btn.connect(signal, callback);
    return super.connect(signal, callback);
  }
};
SnapAssistTileButton = __decorateClass([
  registerGObjectClass
], SnapAssistTileButton);

// src/components/window_menu/layoutTileButtons.ts
var LayoutTileButtons = class extends LayoutWidget {
  constructor(parent, layout, gapSize, height, width) {
    super({
      parent,
      layout,
      containerRect: buildRectangle(),
      innerGaps: buildMarginOf(gapSize),
      outerGaps: buildMarginOf(gapSize),
      styleClass: "window-menu-layout"
    });
    const [, scalingFactor] = getScalingFactorOf(this);
    this.relayout({
      containerRect: buildRectangle({
        x: 0,
        y: 0,
        width: width * scalingFactor,
        height: height * scalingFactor
      })
    });
    this._fixFloatingPointErrors();
  }
  buildTile(parent, rect, gaps, tile) {
    return new SnapAssistTileButton({ parent, rect, gaps, tile });
  }
  get buttons() {
    return this._previews;
  }
  _fixFloatingPointErrors() {
    const xMap = /* @__PURE__ */ new Map();
    const yMap = /* @__PURE__ */ new Map();
    this._previews.forEach((prev) => {
      const tile = prev.tile;
      const newX = xMap.get(tile.x);
      if (!newX) xMap.set(tile.x, prev.rect.x);
      const newY = yMap.get(tile.y);
      if (!newY) yMap.set(tile.y, prev.rect.y);
      if (newX || newY) {
        prev.open(
          false,
          buildRectangle({
            x: newX ?? prev.rect.x,
            y: newY ?? prev.rect.y,
            width: prev.rect.width,
            height: prev.rect.height
          })
        );
      }
      xMap.set(
        tile.x + tile.width,
        xMap.get(tile.x + tile.width) ?? prev.rect.x + prev.rect.width
      );
      yMap.set(
        tile.y + tile.height,
        yMap.get(tile.y + tile.height) ?? prev.rect.y + prev.rect.height
      );
    });
  }
};
LayoutTileButtons = __decorateClass([
  registerGObjectClass
], LayoutTileButtons);

// src/components/window_menu/layoutIcon.ts
var LayoutIcon = class extends LayoutWidget {
  constructor(parent, importantTiles, tiles, innerGaps, outerGaps, width, height) {
    super({
      parent,
      layout: new Layout(tiles, ""),
      innerGaps: innerGaps.copy(),
      outerGaps: outerGaps.copy(),
      containerRect: buildRectangle(),
      styleClass: "layout-icon button"
    });
    const [, scalingFactor] = getScalingFactorOf(this);
    width *= scalingFactor;
    height *= scalingFactor;
    super.relayout({
      containerRect: buildRectangle({ x: 0, y: 0, width, height })
    });
    this.set_size(width, height);
    this.set_x_expand(false);
    this.set_y_expand(false);
    importantTiles.forEach((t) => {
      const preview = this._previews.find(
        (snap) => snap.tile.x === t.x && snap.tile.y === t.y
      );
      if (preview) preview.add_style_class_name("important");
    });
  }
  buildTile(parent, rect, gaps, tile) {
    return new SnapAssistTile({ parent, rect, gaps, tile });
  }
};
LayoutIcon = __decorateClass([
  registerGObjectClass
], LayoutIcon);

// src/components/window_menu/overriddenWindowMenu.ts
import * as windowMenu from "resource:///org/gnome/shell/ui/windowMenu.js";
import * as PopupMenu4 from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Main10 from "resource:///org/gnome/shell/ui/main.js";
var LAYOUT_ICON_WIDTH = 46;
var LAYOUT_ICON_HEIGHT = 32;
var INNER_GAPS = 2;
function buildMenuWithLayoutIcon(title, popupMenu, importantTiles, tiles, innerGaps) {
  popupMenu.add_child(
    new St.Label({
      text: title,
      yAlign: Clutter.ActorAlign.CENTER,
      xExpand: true
    })
  );
  const layoutIcon = new LayoutIcon(
    popupMenu,
    importantTiles,
    tiles,
    buildMarginOf(innerGaps),
    buildMarginOf(4),
    LAYOUT_ICON_WIDTH,
    LAYOUT_ICON_HEIGHT
  );
  layoutIcon.set_x_align(Clutter.ActorAlign.END);
}
var OverriddenWindowMenu = class extends GObject.Object {
  static get() {
    if (this._instance === null)
      this._instance = new OverriddenWindowMenu();
    return this._instance;
  }
  static enable() {
    if (this._enabled) return;
    const owm = this.get();
    OverriddenWindowMenu._old_buildMenu = windowMenu.WindowMenu.prototype._buildMenu;
    windowMenu.WindowMenu.prototype._buildMenu = owm.newBuildMenu;
    this._enabled = true;
  }
  static disable() {
    if (!this._enabled) return;
    windowMenu.WindowMenu.prototype._buildMenu = OverriddenWindowMenu._old_buildMenu;
    this._old_buildMenu = null;
    this._enabled = false;
  }
  static destroy() {
    this.disable();
    this._instance = null;
  }
  // the function will be treated as a method of class WindowMenu
  newBuildMenu(window) {
    const oldFunction = OverriddenWindowMenu._old_buildMenu?.bind(this);
    if (oldFunction) oldFunction(window);
    const layouts = GlobalState.get().layouts;
    if (layouts.length === 0) return;
    const workArea = Main10.layoutManager.getWorkAreaForMonitor(
      window.get_monitor()
    );
    const tiledWindows = getWindows().map((otherWindow) => {
      return otherWindow && !otherWindow.minimized && otherWindow.assignedTile ? otherWindow : void 0;
    }).filter((w) => w !== void 0);
    const tiles = GlobalState.get().getSelectedLayoutOfMonitor(
      window.get_monitor(),
      global.workspaceManager.get_active_workspace_index()
    ).tiles;
    const vacantTiles = tiles.filter((t) => {
      const tileRect = TileUtils.apply_props(t, workArea);
      return !tiledWindows.find(
        (win) => tileRect.overlap(win.get_frame_rect())
      );
    });
    const enableScaling = window.get_monitor() === Main10.layoutManager.primaryIndex;
    const scalingFactor = getMonitorScalingFactor(window.get_monitor());
    if (vacantTiles.length > 0) {
      vacantTiles.sort((a, b) => a.x - b.x);
      let bestTileIndex = 0;
      let bestDistance = Math.abs(
        0.5 - vacantTiles[bestTileIndex].x + vacantTiles[bestTileIndex].width / 2
      );
      for (let index = 1; index < vacantTiles.length; index++) {
        const distance = Math.abs(
          0.5 - (vacantTiles[index].x + vacantTiles[index].width / 2)
        );
        if (bestDistance > distance) {
          bestTileIndex = index;
          bestDistance = distance;
        }
      }
      this.addMenuItem(new PopupMenu4.PopupSeparatorMenuItem());
      const vacantPopupMenu = new PopupMenu4.PopupBaseMenuItem();
      this.addMenuItem(vacantPopupMenu);
      if (enableScaling)
        enableScalingFactorSupport(vacantPopupMenu, scalingFactor);
      buildMenuWithLayoutIcon(
        _("Move to best tile"),
        vacantPopupMenu,
        [vacantTiles[bestTileIndex]],
        tiles,
        INNER_GAPS
      );
      vacantPopupMenu.connect("activate", () => {
        OverriddenWindowMenu.get().emit(
          "tile-clicked",
          vacantTiles[bestTileIndex],
          window
        );
      });
    }
    if (vacantTiles.length > 1) {
      const vacantLeftPopupMenu = new PopupMenu4.PopupBaseMenuItem();
      this.addMenuItem(vacantLeftPopupMenu);
      if (enableScaling)
        enableScalingFactorSupport(vacantLeftPopupMenu, scalingFactor);
      buildMenuWithLayoutIcon(
        _("Move to leftmost tile"),
        vacantLeftPopupMenu,
        [vacantTiles[0]],
        tiles,
        INNER_GAPS
      );
      vacantLeftPopupMenu.connect("activate", () => {
        OverriddenWindowMenu.get().emit(
          "tile-clicked",
          vacantTiles[0],
          window
        );
      });
      const tilesFromRightToLeft = vacantTiles.slice(0).sort((a, b) => b.x === a.x ? a.y - b.y : b.x - a.x);
      const vacantRightPopupMenu = new PopupMenu4.PopupBaseMenuItem();
      this.addMenuItem(vacantRightPopupMenu);
      if (enableScaling)
        enableScalingFactorSupport(vacantRightPopupMenu, scalingFactor);
      buildMenuWithLayoutIcon(
        _("Move to rightmost tile"),
        vacantRightPopupMenu,
        [tilesFromRightToLeft[0]],
        tiles,
        INNER_GAPS
      );
      vacantRightPopupMenu.connect("activate", () => {
        OverriddenWindowMenu.get().emit(
          "tile-clicked",
          tilesFromRightToLeft[0],
          window
        );
      });
    }
    this.addMenuItem(new PopupMenu4.PopupSeparatorMenuItem());
    const layoutsPopupMenu = new PopupMenu4.PopupBaseMenuItem();
    this.addMenuItem(layoutsPopupMenu);
    const container = new St.BoxLayout({
      xAlign: Clutter.ActorAlign.START,
      yAlign: Clutter.ActorAlign.CENTER,
      xExpand: true,
      yExpand: true,
      style: "spacing: 16px !important",
      ...widgetOrientation(true)
    });
    layoutsPopupMenu.add_child(container);
    const layoutsPerRow = 4;
    const rows = [];
    for (let index = 0; index < layouts.length; index += layoutsPerRow) {
      const box = new St.BoxLayout({
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.CENTER,
        xExpand: true,
        yExpand: true,
        style: "spacing: 6px;"
      });
      rows.push(box);
      container.add_child(box);
    }
    if (enableScaling)
      enableScalingFactorSupport(layoutsPopupMenu, scalingFactor);
    const layoutHeight = 30;
    const layoutWidth = 52;
    layouts.forEach((lay, ind) => {
      const row = rows[Math.floor(ind / layoutsPerRow)];
      const layoutWidget = new LayoutTileButtons(
        row,
        lay,
        INNER_GAPS,
        layoutHeight,
        layoutWidth
      );
      layoutWidget.set_x_align(Clutter.ActorAlign.END);
      layoutWidget.buttons.forEach((btn) => {
        btn.connect("clicked", () => {
          OverriddenWindowMenu.get().emit(
            "tile-clicked",
            btn.tile,
            window
          );
          layoutsPopupMenu.activate(Clutter.get_current_event());
        });
      });
    });
  }
  static connect(key, func) {
    return this.get().connect(key, func) || -1;
  }
  static disconnect(id) {
    this.get().disconnect(id);
  }
};
__publicField(OverriddenWindowMenu, "metaInfo", {
  GTypeName: "OverriddenWindowMenu",
  Signals: {
    "tile-clicked": {
      param_types: [Tile2.$gtype, Meta.Window.$gtype]
    }
  }
});
__publicField(OverriddenWindowMenu, "_instance", null);
__publicField(OverriddenWindowMenu, "_old_buildMenu");
__publicField(OverriddenWindowMenu, "_enabled", false);
OverriddenWindowMenu = __decorateClass([
  registerGObjectClass
], OverriddenWindowMenu);

// src/components/windowBorderManager.ts
Gio._promisify(Shell.Screenshot, "composite_to_stream");
var DEFAULT_BORDER_RADIUS = 11;
var SMART_BORDER_RADIUS_DELAY = 460;
var SMART_BORDER_RADIUS_FIRST_FRAME_DELAY = 240;
var debug13 = logger("WindowBorderManager");
var WindowBorder = class extends St.Bin {
  _signals;
  _window;
  _interfaceSettings;
  _windowMonitor;
  _bindings;
  _enableScaling;
  _borderRadiusValue;
  _timeout;
  _delayedSmartBorderRadius;
  _borderWidth;
  constructor(win, enableScaling) {
    super({
      style_class: "window-border"
    });
    this._signals = new SignalHandling();
    this._bindings = [];
    this._borderWidth = 1;
    this._window = win;
    this._interfaceSettings = new Gio.Settings({
      schema_id: "org.gnome.desktop.interface"
    });
    this._windowMonitor = win.get_monitor();
    this._enableScaling = enableScaling;
    this._delayedSmartBorderRadius = false;
    const smartRadius = Settings.ENABLE_SMART_WINDOW_BORDER_RADIUS;
    this._borderRadiusValue = [
      DEFAULT_BORDER_RADIUS,
      DEFAULT_BORDER_RADIUS,
      smartRadius ? 0 : DEFAULT_BORDER_RADIUS,
      smartRadius ? 0 : DEFAULT_BORDER_RADIUS
    ];
    this.close();
    global.windowGroup.add_child(this);
    this.trackWindow(win, true);
    this.connect("destroy", () => {
      this._bindings.forEach((b) => b.unbind());
      this._bindings = [];
      this._signals.disconnect();
      if (this._timeout) clearTimeout(this._timeout);
      this._timeout = void 0;
    });
  }
  trackWindow(win, force = false) {
    if (!force && this._window === win) return;
    this._bindings.forEach((b) => b.unbind());
    this._bindings = [];
    this._signals.disconnect();
    this._window = win;
    this.close();
    const winActor = this._window.get_compositor_private();
    this._bindings = [
      "scale-x",
      "scale-y",
      "translation_x",
      "translation_y"
    ].map(
      (prop) => winActor.bind_property(
        prop,
        this,
        prop,
        GObject.BindingFlags.DEFAULT
        // if winActor changes, this will change
      )
    );
    const winRect = this._window.get_frame_rect();
    this.set_position(
      winRect.x - this._borderWidth,
      winRect.y - this._borderWidth
    );
    this.set_size(
      winRect.width + 2 * this._borderWidth,
      winRect.height + 2 * this._borderWidth
    );
    if (Settings.ENABLE_SMART_WINDOW_BORDER_RADIUS) {
      const cached_radius = this._window.__ts_cached_radius;
      if (cached_radius) {
        this._borderRadiusValue[St.Corner.TOPLEFT] = cached_radius[St.Corner.TOPLEFT];
        this._borderRadiusValue[St.Corner.TOPRIGHT] = cached_radius[St.Corner.TOPRIGHT];
        this._borderRadiusValue[St.Corner.BOTTOMLEFT] = cached_radius[St.Corner.BOTTOMLEFT];
        this._borderRadiusValue[St.Corner.BOTTOMRIGHT] = cached_radius[St.Corner.BOTTOMRIGHT];
      }
    }
    this.updateStyle();
    const isMaximized = this._window.maximizedVertically && this._window.maximizedHorizontally;
    if (this._window.is_fullscreen() || isMaximized || this._window.minimized || !winActor.visible)
      this.close();
    else this.open();
    this._signals.connect(global.display, "restacked", () => {
      global.windowGroup.set_child_above_sibling(this, null);
    });
    this._signals.connect(this._window, "position-changed", () => {
      if (this._window.maximizedVertically || this._window.maximizedHorizontally || this._window.minimized || this._window.is_fullscreen()) {
        this.remove_all_transitions();
        this.close();
        return;
      }
      if (this._delayedSmartBorderRadius && Settings.ENABLE_SMART_WINDOW_BORDER_RADIUS) {
        this._delayedSmartBorderRadius = false;
        this._runComputeBorderRadiusTimeout(winActor);
      }
      const rect = this._window.get_frame_rect();
      this.set_position(
        rect.x - this._borderWidth,
        rect.y - this._borderWidth
      );
      if (this._windowMonitor !== win.get_monitor()) {
        this._windowMonitor = win.get_monitor();
        this.updateStyle();
      }
      this.open();
    });
    this._signals.connect(this._window, "size-changed", () => {
      if (this._window.maximizedVertically || this._window.maximizedHorizontally || this._window.minimized || this._window.is_fullscreen()) {
        this.remove_all_transitions();
        this.close();
        return;
      }
      if (this._delayedSmartBorderRadius && Settings.ENABLE_SMART_WINDOW_BORDER_RADIUS) {
        this._delayedSmartBorderRadius = false;
        this._runComputeBorderRadiusTimeout(winActor);
      }
      const rect = this._window.get_frame_rect();
      this.set_size(
        rect.width + 2 * this._borderWidth,
        rect.height + 2 * this._borderWidth
      );
      if (this._windowMonitor !== win.get_monitor()) {
        this._windowMonitor = win.get_monitor();
        this.updateStyle();
      }
      this.open();
    });
    if (Settings.ENABLE_SMART_WINDOW_BORDER_RADIUS) {
      const firstFrameId = winActor.connect_after("first-frame", () => {
        if (this._window.maximizedHorizontally || this._window.maximizedVertically || this._window.is_fullscreen()) {
          this._delayedSmartBorderRadius = true;
          return;
        }
        this._runComputeBorderRadiusTimeout(winActor);
        winActor.disconnect(firstFrameId);
      });
    }
  }
  _runComputeBorderRadiusTimeout(winActor) {
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = void 0;
    this._timeout = setTimeout(() => {
      this._computeBorderRadius(winActor).then(() => this.updateStyle());
      if (this._timeout) clearTimeout(this._timeout);
      this._timeout = void 0;
    }, SMART_BORDER_RADIUS_FIRST_FRAME_DELAY);
  }
  async _computeBorderRadius(winActor) {
    const width = 3;
    const height = winActor.metaWindow.get_frame_rect().height;
    if (height <= 0) return;
    const content = winActor.paint_to_content(
      buildRectangle({
        x: winActor.metaWindow.get_frame_rect().x,
        y: winActor.metaWindow.get_frame_rect().y,
        height,
        width
      })
    );
    if (!content) return;
    const texture = content.get_texture();
    const stream = Gio.MemoryOutputStream.new_resizable();
    const x = 0;
    const y = 0;
    const pixbuf = await Shell.Screenshot.composite_to_stream(
      texture,
      x,
      y,
      width,
      height,
      1,
      null,
      0,
      0,
      1,
      stream
    );
    const pixels = pixbuf.get_pixels();
    const alphaThreshold = 240;
    for (let i = 0; i < height; i++) {
      if (pixels[i * width * 4 + 3] > alphaThreshold) {
        this._borderRadiusValue[St.Corner.TOPLEFT] = i;
        this._borderRadiusValue[St.Corner.TOPRIGHT] = this._borderRadiusValue[St.Corner.TOPLEFT];
        break;
      }
    }
    for (let i = height - 1; i >= height - this._borderRadiusValue[St.Corner.TOPLEFT] - 2; i--) {
      if (pixels[i * width * 4 + 3] > alphaThreshold) {
        this._borderRadiusValue[St.Corner.BOTTOMLEFT] = height - i - 1;
        this._borderRadiusValue[St.Corner.BOTTOMRIGHT] = this._borderRadiusValue[St.Corner.BOTTOMLEFT];
        break;
      }
    }
    stream.close(null);
    const cached_radius = [
      DEFAULT_BORDER_RADIUS,
      DEFAULT_BORDER_RADIUS,
      0,
      0
    ];
    cached_radius[St.Corner.TOPLEFT] = this._borderRadiusValue[St.Corner.TOPLEFT];
    cached_radius[St.Corner.TOPRIGHT] = this._borderRadiusValue[St.Corner.TOPRIGHT];
    cached_radius[St.Corner.BOTTOMLEFT] = this._borderRadiusValue[St.Corner.BOTTOMLEFT];
    cached_radius[St.Corner.BOTTOMRIGHT] = this._borderRadiusValue[St.Corner.BOTTOMRIGHT];
    this._window.__ts_cached_radius = cached_radius;
  }
  _getGnomeAccentColor() {
    try {
      const accentColorName = this._interfaceSettings.get_string("accent-color");
      debug13("accentColorName", accentColorName);
      return accentColorName;
      const gnomeAccentColorMapping = {
        blue: "#3584e4",
        teal: "#2190a4",
        green: "#3a944a",
        yellow: "#c88800",
        orange: "#ed5b00",
        red: "#e62d42",
        pink: "#d56199",
        purple: "#9141ac",
        slate: "#6f8396"
      };
      return gnomeAccentColorMapping[accentColorName];
    } catch (_unused) {
      return "#000000";
    }
  }
  updateStyle() {
    const monitorScalingFactor = this._enableScaling ? getMonitorScalingFactor(this._window.get_monitor()) : void 0;
    enableScalingFactorSupport(this, monitorScalingFactor);
    const [alreadyScaled, scalingFactor] = getScalingFactorOf(this);
    const borderWidth = (alreadyScaled ? 1 : scalingFactor) * (Settings.WINDOW_BORDER_WIDTH / (alreadyScaled ? scalingFactor : 1));
    const borderColor = Settings.WINDOW_USE_CUSTOM_BORDER_COLOR ? Settings.WINDOW_BORDER_COLOR : "-st-accent-color";
    const radius = this._borderRadiusValue.map((val) => {
      const valWithBorder = val === 0 ? val : val + borderWidth;
      return (alreadyScaled ? 1 : scalingFactor) * (valWithBorder / (alreadyScaled ? scalingFactor : 1));
    });
    const scalingFactorSupportString = monitorScalingFactor ? `${getScalingFactorSupportString(monitorScalingFactor)};` : "";
    this.set_style(
      `border-color: ${borderColor}; border-width: ${borderWidth}px; border-radius: ${radius[St.Corner.TOPLEFT]}px ${radius[St.Corner.TOPRIGHT]}px ${radius[St.Corner.BOTTOMRIGHT]}px ${radius[St.Corner.BOTTOMLEFT]}px; ${scalingFactorSupportString}`
    );
    if (this._borderWidth !== borderWidth) {
      const diff = this._borderWidth - borderWidth;
      this._borderWidth = borderWidth;
      this.set_size(
        this.get_width() - 2 * diff,
        this.get_height() - 2 * diff
      );
      this.set_position(this.get_x() + diff, this.get_y() + diff);
    }
  }
  open() {
    if (this.visible) return;
    this.show();
    this.ease({
      opacity: 255,
      duration: 200,
      mode: Clutter.AnimationMode.EASE,
      delay: 130
    });
  }
  close() {
    this.set_opacity(0);
    this.hide();
  }
};
WindowBorder = __decorateClass([
  registerGObjectClass
], WindowBorder);
var WindowBorderManager = class {
  _signals;
  _border;
  _enableScaling;
  _interfaceSettings;
  constructor(enableScaling) {
    this._signals = new SignalHandling();
    this._border = null;
    this._enableScaling = enableScaling;
    this._interfaceSettings = new Gio.Settings({
      schema_id: "org.gnome.desktop.interface"
    });
  }
  enable() {
    if (Settings.ENABLE_WINDOW_BORDER) this._turnOn();
    this._signals.connect(
      Settings,
      Settings.KEY_ENABLE_WINDOW_BORDER,
      () => {
        if (Settings.ENABLE_WINDOW_BORDER) this._turnOn();
        else this._turnOff();
      }
    );
  }
  _turnOn() {
    this._onWindowFocused();
    this._signals.connect(
      global.display,
      "notify::focus-window",
      this._onWindowFocused.bind(this)
    );
    this._signals.connect(
      Settings,
      Settings.KEY_WINDOW_BORDER_COLOR,
      () => this._border?.updateStyle()
    );
    this._signals.connect(
      Settings,
      Settings.KEY_WINDOW_USE_CUSTOM_BORDER_COLOR,
      () => this._border?.updateStyle()
    );
    this._interfaceSettings.connect(
      "changed::accent-color",
      () => this._border?.updateStyle()
    );
    this._signals.connect(
      Settings,
      Settings.KEY_WINDOW_BORDER_WIDTH,
      () => this._border?.updateStyle()
    );
  }
  _turnOff() {
    this.destroy();
    this.enable();
  }
  destroy() {
    this._signals.disconnect();
    this._border?.destroy();
    this._border = null;
  }
  _onWindowFocused() {
    const metaWindow = global.display.focus_window;
    if (!metaWindow || metaWindow.get_wm_class() === null || metaWindow.get_wm_class() === "gjs") {
      this._border?.destroy();
      this._border = null;
      return;
    }
    if (!this._border)
      this._border = new WindowBorder(metaWindow, this._enableScaling);
    else this._border.trackWindow(metaWindow);
  }
};

// src/components/altTab/tilePreviewWithWindow.ts
var TilePreviewWithWindow = class extends TilePreview {
  constructor(params) {
    super(params);
    if (params.parent) params.parent.add_child(this);
    this._showing = false;
    this._rect = params.rect || buildRectangle({});
    this._gaps = new Clutter.Margin();
    this.gaps = params.gaps || new Clutter.Margin();
    this._tile = params.tile || new Tile2({ x: 0, y: 0, width: 0, height: 0, groups: [] });
  }
  set gaps(gaps) {
    this._gaps = gaps.copy();
    if (this._gaps.top === 0 && this._gaps.bottom === 0 && this._gaps.right === 0 && this._gaps.left === 0)
      this.remove_style_class_name("custom-tile-preview");
    else this.add_style_class_name("custom-tile-preview");
  }
  _init() {
    super._init();
    this.remove_style_class_name("tile-preview");
  }
};
TilePreviewWithWindow = __decorateClass([
  registerGObjectClass
], TilePreviewWithWindow);

// src/components/altTab/MetaWindowGroup.ts
var debug14 = logger("MetaWindowGroup");
var MetaWindowGroup = class {
  _windows;
  _unmanagedCounter;
  // count how many windows are unmanaged
  _unmanagedEventHandler;
  /**
   * Initializes a WindowsGroup with a list of Meta.Window instances.
   * @param windows - An array of Meta.Window objects to manage as a group.
   */
  constructor(windows) {
    this._windows = windows;
    this._unmanagedCounter = 0;
    this._unmanagedEventHandler = null;
    this._windows.forEach(
      (win) => win.connect("unmanaged", () => {
        this._unmanagedCounter++;
        if (this._unmanagedEventHandler && this._unmanagedCounter === this._windows.length)
          this._unmanagedEventHandler();
      })
    );
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) return Reflect.get(target, prop, receiver);
        if (typeof this._windows[0]?.[prop] === "function") {
          return (...args) => {
            this._windows.forEach(
              (win) => (
                // @ts-expect-error "This is expected"
                // eslint-disable-next-line @typescript-eslint/ban-types
                win[prop](...args)
              )
            );
          };
        }
        return this._windows[0]?.[prop];
      }
    });
  }
  get_workspace() {
    return this._windows[0].get_workspace();
  }
  activate(time) {
    this._windows.forEach((win) => {
      win.activate(time);
      time = global.get_current_time();
    });
  }
  connect(...args) {
    return this._windows[0].connect(...args);
  }
  connectObject(...args) {
    return this._windows[0].connectObject(...args);
  }
  onAllWindowsUnmanaged(fn) {
    this._unmanagedEventHandler = fn;
  }
};

// src/components/altTab/MultipleWindowsIcon.ts
var debug15 = logger("MultipleWindowsIcon");
var OUTER_GAPS = 2;
var MultipleWindowsIcon = class extends LayoutWidget {
  _label;
  _window;
  constructor(params) {
    super({
      layout: new Layout(params.tiles, ""),
      innerGaps: params.innerGaps.copy(),
      outerGaps: buildMarginOf(OUTER_GAPS)
    });
    this.set_size(params.width, params.height);
    super.relayout({
      containerRect: buildRectangle({
        x: 0,
        y: 0,
        width: params.width,
        height: params.height
      })
    });
    this._previews.forEach((preview, index) => {
      const window = params.windows[index];
      if (!window) {
        preview.hide();
        return;
      }
      const winClone = new Clutter.Clone({
        source: window.get_compositor_private(),
        width: preview.innerWidth,
        height: preview.innerHeight
      });
      preview.add_child(winClone);
    });
    this._label = new St.Label({
      text: _("Tiled windows")
    });
    this._window = new MetaWindowGroup(params.windows);
    let rightMostPercentage = 0;
    params.tiles.forEach((t) => {
      if (t.x + t.width > rightMostPercentage)
        rightMostPercentage = t.x + t.width;
    });
    this.set_width(params.width * rightMostPercentage);
  }
  buildTile(parent, rect, gaps, tile) {
    return new TilePreviewWithWindow({ parent, rect, gaps, tile });
  }
  get window() {
    return this._window;
  }
  get label() {
    return this._label;
  }
};
MultipleWindowsIcon = __decorateClass([
  registerGObjectClass
], MultipleWindowsIcon);

// src/components/altTab/overriddenAltTab.ts
import * as AltTab from "resource:///org/gnome/shell/ui/altTab.js";
var GAPS2 = 3;
var debug16 = logger("OverriddenAltTab");
var OverriddenAltTab = class _OverriddenAltTab {
  static _instance = null;
  static _old_show;
  static _enabled = false;
  // AltTab has these private fields
  _switcherList;
  _items;
  static get() {
    if (this._instance === null) this._instance = new _OverriddenAltTab();
    return this._instance;
  }
  static enable() {
    if (this._enabled) return;
    const owm = this.get();
    _OverriddenAltTab._old_show = AltTab.WindowSwitcherPopup.prototype.show;
    AltTab.WindowSwitcherPopup.prototype.show = owm.newShow;
    this._enabled = true;
  }
  static disable() {
    if (!this._enabled) return;
    AltTab.WindowSwitcherPopup.prototype.show = _OverriddenAltTab._old_show;
    this._old_show = null;
    this._enabled = false;
  }
  static destroy() {
    this.disable();
    this._instance = null;
  }
  // the function will be treated as a method of class WindowMenu
  newShow(backward, binding, mask) {
    this._switcherList._list.get_layout_manager().homogeneous = false;
    this._switcherList._squareItems = false;
    const oldFunction = _OverriddenAltTab._old_show?.bind(this);
    const res = !oldFunction || oldFunction(backward, binding, mask);
    const tiledWindows = this._getWindowList().filter((win) => win.assignedTile);
    if (tiledWindows.length <= 1) return res;
    const tiles = tiledWindows.map((win) => win.assignedTile).filter((tile) => tile !== void 0);
    const inner_gaps = Settings.get_inner_gaps();
    const height = this._items[0].height;
    const width = Math.floor(height * 16 / 9);
    const gaps = GAPS2 * St.ThemeContext.get_for_stage(global.stage).scale_factor;
    const groupWindowsIcon = new MultipleWindowsIcon({
      tiles,
      width,
      height,
      innerGaps: buildMargin({
        top: inner_gaps.top === 0 ? 0 : gaps,
        bottom: inner_gaps.bottom === 0 ? 0 : gaps,
        left: inner_gaps.left === 0 ? 0 : gaps,
        right: inner_gaps.right === 0 ? 0 : gaps
      }),
      windows: tiledWindows
    });
    this._switcherList.addItem(groupWindowsIcon, groupWindowsIcon.label);
    this._items.push(groupWindowsIcon);
    groupWindowsIcon.window.onAllWindowsUnmanaged(() => {
      this._switcherList._removeWindow(groupWindowsIcon.window);
    });
    return res;
  }
  _getWindowList() {
    return getWindows();
  }
};

// src/components/layoutSwitcher/layoutSwitcher.ts
import * as SwitcherPopup from "resource:///org/gnome/shell/ui/switcherPopup.js";
import * as Main12 from "resource:///org/gnome/shell/ui/main.js";
var LAYOUT_HEIGHT = 72;
var LAYOUT_WIDTH = 128;
var GAPS3 = 3;
var LayoutSwitcherList = class extends SwitcherPopup.SwitcherList {
  // those are defined in the parent but we lack them in the type definition
  
  
  _buttons;
  constructor(items, parent, monitorScalingFactor) {
    super(false);
    this.add_style_class_name("layout-switcher-list");
    this._buttons = [];
    parent.add_child(this);
    enableScalingFactorSupport(this, monitorScalingFactor);
    items.forEach((lay) => this._addLayoutItem(lay));
    parent.remove_child(this);
  }
  _addLayoutItem(layout) {
    const box = new St.BoxLayout({
      style_class: "alt-tab-app",
      ...widgetOrientation(true)
    });
    this.addItem(box, new St.Widget());
    this._buttons.push(
      new LayoutButton(
        box,
        layout,
        Settings.get_inner_gaps(1).top > 0 ? GAPS3 : 0,
        LAYOUT_HEIGHT,
        LAYOUT_WIDTH
      )
    );
  }
  highlight(index, justOutline) {
    this._buttons[index].set_checked(true);
    super.highlight(index, justOutline);
    this._items[this._highlighted].remove_style_pseudo_class("outlined");
    this._items[this._highlighted].remove_style_pseudo_class("selected");
  }
  unhighlight(index) {
    this._buttons[index].set_checked(false);
  }
};
LayoutSwitcherList = __decorateClass([
  registerGObjectClass
], LayoutSwitcherList);
var LayoutSwitcherPopup = class extends SwitcherPopup.SwitcherPopup {
  // those are defined in the parent but we lack them in the type definition
  
  
  
  _action;
  constructor(action, enableScaling) {
    super(GlobalState.get().layouts);
    this._action = action;
    const monitorScalingFactor = enableScaling ? getMonitorScalingFactor(this._getCurrentMonitorIndex()) : void 0;
    this._switcherList = new LayoutSwitcherList(
      this._items,
      this,
      monitorScalingFactor
    );
  }
  _initialSelection(backward, _binding) {
    const selectedLay = GlobalState.get().getSelectedLayoutOfMonitor(
      this._getCurrentMonitorIndex(),
      global.workspaceManager.get_active_workspace_index()
    );
    this._selectedIndex = GlobalState.get().layouts.findIndex(
      (lay) => lay.id === selectedLay.id
    );
    if (backward) this._select(this._previous());
    else this._select(this._next());
  }
  _keyPressHandler(keysym, action) {
    if (keysym === Clutter.KEY_Left) this._select(this._previous());
    else if (keysym === Clutter.KEY_Right) this._select(this._next());
    else if (action !== this._action) return Clutter.EVENT_PROPAGATE;
    else this._select(this._next());
    return Clutter.EVENT_STOP;
  }
  _select(num) {
    this._switcherList.unhighlight(this._selectedIndex);
    super._select(num);
  }
  _finish(timestamp) {
    super._finish(timestamp);
    GlobalState.get().setSelectedLayoutOfMonitor(
      this._items[this._selectedIndex].id,
      this._getCurrentMonitorIndex()
    );
  }
  _getCurrentMonitorIndex() {
    const focusWindow = global.display.focus_window;
    if (focusWindow) return focusWindow.get_monitor();
    return Main12.layoutManager.primaryIndex;
  }
};
LayoutSwitcherPopup = __decorateClass([
  registerGObjectClass
], LayoutSwitcherPopup);

// src/extension.ts
import * as Main13 from "resource:///org/gnome/shell/ui/main.js";
import * as Config from "resource:///org/gnome/shell/misc/config.js";
var debug17 = logger("extension");
var TilingShellExtension = class extends Extension {
  _indicator;
  _tilingManagers;
  _fractionalScalingEnabled;
  _dbus;
  _signals;
  _keybindings;
  _resizingManager;
  _windowBorderManager;
  constructor(metadata) {
    super(metadata);
    this._signals = null;
    this._fractionalScalingEnabled = false;
    this._tilingManagers = [];
    this._indicator = null;
    this._dbus = null;
    this._keybindings = null;
    this._resizingManager = null;
    this._windowBorderManager = null;
  }
  createIndicator() {
    this._indicator = new Indicator3(this.path, this.uuid);
    this._indicator.enableScaling = !this._fractionalScalingEnabled;
    this._indicator.enable();
  }
  _validateSettings() {
    if (Settings.LAST_VERSION_NAME_INSTALLED === "17.0") {
      debug17("apply compatibility changes");
      Settings.WINDOW_USE_CUSTOM_BORDER_COLOR = Settings.ENABLE_WINDOW_BORDER;
    }
  }
  _onInstall() {
    const GNOME_VERSION_MAJOR = Number(
      Config.PACKAGE_VERSION.split(".")[0]
    );
    Settings.WINDOW_USE_CUSTOM_BORDER_COLOR = GNOME_VERSION_MAJOR < 47;
  }
  enable() {
    if (this._signals) this._signals.disconnect();
    this._signals = new SignalHandling();
    Settings.initialize(this.getSettings());
    if (Settings.LAST_VERSION_NAME_INSTALLED === "0") {
      this._onInstall();
      if (this.metadata["version-name"]) {
        Settings.LAST_VERSION_NAME_INSTALLED = this.metadata["version-name"] || "0";
      }
    }
    this._validateSettings();
    TilingShellWindowManager.get();
    this._fractionalScalingEnabled = this._isFractionalScalingEnabled(
      new Gio.Settings({ schema: "org.gnome.mutter" })
    );
    if (this._keybindings) this._keybindings.destroy();
    this._keybindings = new KeyBindings(this.getSettings());
    if (Settings.ACTIVE_SCREEN_EDGES) {
      SettingsOverride.get().override(
        new Gio.Settings({ schemaId: "org.gnome.mutter" }),
        "edge-tiling",
        new GLib.Variant("b", false)
      );
    }
    if (Main13.layoutManager._startingUp) {
      this._signals.connect(
        Main13.layoutManager,
        "startup-complete",
        () => {
          this._createTilingManagers();
          this._setupSignals();
        }
      );
    } else {
      this._createTilingManagers();
      this._setupSignals();
    }
    this._resizingManager = new ResizingManager();
    this._resizingManager.enable();
    if (this._windowBorderManager) this._windowBorderManager.destroy();
    this._windowBorderManager = new WindowBorderManager(
      !this._fractionalScalingEnabled
    );
    this._windowBorderManager.enable();
    this.createIndicator();
    if (this._dbus) this._dbus.disable();
    this._dbus = new DBus();
    this._dbus.enable(this);
    if (Settings.OVERRIDE_WINDOW_MENU) OverriddenWindowMenu.enable();
    if (Settings.OVERRIDE_ALT_TAB) OverriddenAltTab.enable();
    debug17("extension is enabled");
  }
  openLayoutEditor() {
    this._indicator?.openLayoutEditor();
  }
  _createTilingManagers() {
    debug17("building a tiling manager for each monitor");
    this._tilingManagers.forEach((tm) => tm.destroy());
    this._tilingManagers = getMonitors().map(
      (monitor) => new TilingManager(monitor, !this._fractionalScalingEnabled)
    );
    this._tilingManagers.forEach((tm) => tm.enable());
  }
  _setupSignals() {
    if (!this._signals) return;
    this._signals.connect(global.display, "workareas-changed", () => {
      const allMonitors = getMonitors();
      if (this._tilingManagers.length !== allMonitors.length) {
        GlobalState.get().validate_selected_layouts();
        this._createTilingManagers();
      } else {
        this._tilingManagers.forEach((tm, index) => {
          tm.workArea = Main13.layoutManager.getWorkAreaForMonitor(index);
        });
      }
    });
    this._signals.connect(
      new Gio.Settings({ schema: "org.gnome.mutter" }),
      "changed::experimental-features",
      (_mutterSettings) => {
        if (!_mutterSettings) return;
        const fractionalScalingEnabled = this._isFractionalScalingEnabled(_mutterSettings);
        if (this._fractionalScalingEnabled === fractionalScalingEnabled)
          return;
        this._fractionalScalingEnabled = fractionalScalingEnabled;
        this._createTilingManagers();
        if (this._indicator) {
          this._indicator.enableScaling = !this._fractionalScalingEnabled;
        }
        if (this._windowBorderManager)
          this._windowBorderManager.destroy();
        this._windowBorderManager = new WindowBorderManager(
          this._fractionalScalingEnabled
        );
        this._windowBorderManager.enable();
      }
    );
    if (this._keybindings) {
      this._signals.connect(
        this._keybindings,
        "move-window",
        (kb, dp, dir) => {
          this._onKeyboardMoveWin(dp, dir, false);
        }
      );
      this._signals.connect(
        this._keybindings,
        "span-window",
        (kb, dp, dir) => {
          this._onKeyboardMoveWin(dp, dir, true);
        }
      );
      this._signals.connect(
        this._keybindings,
        "span-window-all-tiles",
        (kb, dp) => {
          const window = dp.focus_window;
          const monitorIndex = window.get_monitor();
          const manager = this._tilingManagers[monitorIndex];
          if (manager) manager.onSpanAllTiles(window);
        }
      );
      this._signals.connect(
        this._keybindings,
        "untile-window",
        this._onKeyboardUntileWindow.bind(this)
      );
      this._signals.connect(
        this._keybindings,
        "move-window-center",
        (kb, dp) => {
          this._onKeyboardMoveWin(
            dp,
            1 /* NODIRECTION */,
            false
          );
        }
      );
      this._signals.connect(
        this._keybindings,
        "focus-window",
        (kb, dp, dir) => {
          this._onKeyboardFocusWin(dp, dir);
        }
      );
      this._signals.connect(
        this._keybindings,
        "focus-window-direction",
        (kb, dp, dir) => {
          this._onKeyboardFocusWinDirection(dp, dir);
        }
      );
      this._signals.connect(
        this._keybindings,
        "highlight-current-window",
        (kb, dp) => {
          const focus_window = dp.get_focus_window();
          getWindows(
            global.workspaceManager.get_active_workspace()
          ).forEach((win) => {
            if (win !== focus_window && win.can_minimize())
              win.minimize();
          });
          Main13.activateWindow(
            focus_window,
            global.get_current_time()
          );
        }
      );
      this._signals.connect(
        this._keybindings,
        "cycle-layouts",
        (_2, dp, action, mask) => {
          const switcher = new LayoutSwitcherPopup(
            action,
            !this._fractionalScalingEnabled
          );
          if (!switcher.show(false, "", mask)) switcher.destroy();
        }
      );
    }
    this._signals.connect(
      Settings,
      Settings.KEY_ACTIVE_SCREEN_EDGES,
      () => {
        const gioSettings = new Gio.Settings({
          schemaId: "org.gnome.mutter"
        });
        if (Settings.ACTIVE_SCREEN_EDGES) {
          debug17("disable native edge tiling");
          SettingsOverride.get().override(
            gioSettings,
            "edge-tiling",
            new GLib.Variant("b", false)
          );
        } else {
          debug17("bring back native edge tiling");
          SettingsOverride.get().restoreKey(
            gioSettings,
            "edge-tiling"
          );
        }
      }
    );
    this._signals.connect(
      Settings,
      Settings.KEY_OVERRIDE_WINDOW_MENU,
      () => {
        if (Settings.OVERRIDE_WINDOW_MENU)
          OverriddenWindowMenu.enable();
        else OverriddenWindowMenu.disable();
      }
    );
    this._signals.connect(
      OverriddenWindowMenu,
      "tile-clicked",
      (_2, tile, window) => {
        const monitorIndex = window.get_monitor();
        const manager = this._tilingManagers[monitorIndex];
        if (manager) manager.onTileFromWindowMenu(tile, window);
      }
    );
    this._signals.connect(Settings, Settings.KEY_OVERRIDE_ALT_TAB, () => {
      if (Settings.OVERRIDE_ALT_TAB) OverriddenAltTab.enable();
      else OverriddenAltTab.disable();
    });
  }
  /* todo private _moveMaximizedToWorkspace(
          wm: Shell.WM,
          winActor: Meta.WindowActor,
          change: Meta.SizeChange,
      ) {
          const window = winActor.metaWindow;
          if (
              window.wmClass === null ||
              change !== Meta.SizeChange.MAXIMIZE || // handle maximize changes only
              (window.maximizedHorizontally && window.maximizedVertically) || // handle maximized window only
              window.is_attached_dialog() || // skip dialogs
              window.is_on_all_workspaces() ||
              window.windowType !== Meta.WindowType.NORMAL || // handle normal windows only
              window.wmClass === 'gjs'
          )
              return;
  
          const prevWorkspace = window.get_workspace();
          // if it is the only window in the workspace, no new workspace is needed
          if (
              !prevWorkspace
                  .list_windows()
                  .find(
                      (otherWin) =>
                          otherWin !== window &&
                          otherWin.windowType === Meta.WindowType.NORMAL &&
                          !otherWin.is_always_on_all_workspaces() &&
                          otherWin.wmClass !== null &&
                          otherWin.wmClass !== 'gjs',
                  )
          )
              return;
  
          // disable GNOME default fade out animation
          // @ts-expect-error Main.wm has "_sizeChangeWindowDone" function
          Main.wm._sizeChangeWindowDone(global.windowManager, winActor);
  
          const wasActive = prevWorkspace.active;
          // create a new workspace, do not focus it
          const newWorkspace = global.workspace_manager.append_new_workspace(
              false,
              global.get_current_time(),
          );
          // place the workspace after the current one
          global.workspace_manager.reorder_workspace(
              newWorkspace,
              prevWorkspace.index() + 1,
          );
          // queue focus the workspace, focusing the window too. This will trigger workspace slide-in animation
          if (wasActive) window._queue_focus_ws = newWorkspace;
      }
  
      private _onSizeChanged(wm: Shell.WM, winActor: Meta.WindowActor) {
          const window = winActor.metaWindow;
  
          if (!window._queue_focus_ws) return;
          const ws = window._queue_focus_ws;
          delete window._queue_focus_ws;
  
          console.log(`_onSizeChanged ${ws}`);
          // move the window
          ws.activate_with_focus(window, global.get_current_time());
          window.change_workspace(ws);
          // todo check the following
          // If the selected window is on a different workspace, we don't
          // want it to disappear, then slide in with the workspace; instead,
          // always activate it on the active workspace ...
          activeWs.activate_with_focus(window, global.get_current_time());
  
          // ... then slide it over to the original workspace if necessary
          Main.wm.actionMoveWindow(window, ws);
  
      }*/
  _onKeyboardMoveWin(display, direction, spanFlag) {
    const focus_window = display.get_focus_window();
    if (!focus_window || !focus_window.has_focus() || focus_window.get_wm_class() && focus_window.get_wm_class() === "gjs" || focus_window.is_fullscreen())
      return;
    if ((focus_window.maximizedHorizontally || focus_window.maximizedVertically) && spanFlag)
      return;
    if ((focus_window.maximizedHorizontally || focus_window.maximizedVertically) && direction === 3 /* DOWN */) {
      unmaximizeWindow(focus_window);
      return;
    }
    const monitorTilingManager = this._tilingManagers[focus_window.get_monitor()];
    if (!monitorTilingManager) return;
    if (Settings.ENABLE_AUTO_TILING && (focus_window.maximizedHorizontally || focus_window.maximizedVertically)) {
      unmaximizeWindow(focus_window);
      return;
    }
    let displayDirection = Meta.DisplayDirection.DOWN;
    switch (direction) {
      case 4 /* LEFT */:
        displayDirection = Meta.DisplayDirection.LEFT;
        break;
      case 5 /* RIGHT */:
        displayDirection = Meta.DisplayDirection.RIGHT;
        break;
      case 2 /* UP */:
        displayDirection = Meta.DisplayDirection.UP;
        break;
    }
    const neighborMonitorIndex = display.get_monitor_neighbor_index(
      focus_window.get_monitor(),
      displayDirection
    );
    const success = monitorTilingManager.onKeyboardMoveWindow(
      focus_window,
      direction,
      false,
      spanFlag,
      neighborMonitorIndex === -1
      // clamp if there is NOT a monitor in this direction
    );
    if (success || direction === 1 /* NODIRECTION */ || neighborMonitorIndex === -1)
      return;
    if ((focus_window.maximizedHorizontally || focus_window.maximizedVertically) && direction === 2 /* UP */) {
      Main13.wm.skipNextEffect(focus_window.get_compositor_private());
      unmaximizeWindow(focus_window);
      focus_window.assignedTile = void 0;
    }
    const neighborTilingManager = this._tilingManagers[neighborMonitorIndex];
    if (!neighborTilingManager) return;
    neighborTilingManager.onKeyboardMoveWindow(
      focus_window,
      direction,
      true,
      spanFlag,
      false
    );
  }
  _onKeyboardFocusWinDirection(display, direction) {
    const focus_window = display.get_focus_window();
    if (!focus_window || !focus_window.has_focus() || focus_window.get_wm_class() && focus_window.get_wm_class() === "gjs")
      return;
    let bestWindow;
    let bestWindowDistance = -1;
    const focusWindowRect = focus_window.get_frame_rect();
    const focusWindowCenter = {
      x: focusWindowRect.x + focusWindowRect.width / 2,
      y: focusWindowRect.y + focusWindowRect.height / 2
    };
    const windowList = filterUnfocusableWindows(
      focus_window.get_workspace().list_windows()
    );
    const onlyTiledWindows = Settings.ENABLE_DIRECTIONAL_FOCUS_TILED_ONLY;
    windowList.filter((win) => {
      if (win === focus_window || win.minimized) return false;
      if (onlyTiledWindows && win.assignedTile === void 0)
        return false;
      const winRect = win.get_frame_rect();
      switch (direction) {
        case 5 /* RIGHT */:
          return winRect.x > focusWindowRect.x;
        case 4 /* LEFT */:
          return winRect.x < focusWindowRect.x;
        case 2 /* UP */:
          return winRect.y < focusWindowRect.y;
        case 3 /* DOWN */:
          return winRect.y > focusWindowRect.y;
      }
      return false;
    }).forEach((win) => {
      const winRect = win.get_frame_rect();
      const winCenter = {
        x: winRect.x + winRect.width / 2,
        y: winRect.y + winRect.height / 2
      };
      const euclideanDistance = squaredEuclideanDistance(
        winCenter,
        focusWindowCenter
      );
      if (!bestWindow || euclideanDistance < bestWindowDistance || euclideanDistance === bestWindowDistance && bestWindow.get_frame_rect().y > winRect.y) {
        bestWindow = win;
        bestWindowDistance = euclideanDistance;
      }
    });
    if (!bestWindow) return;
    bestWindow.activate(global.get_current_time());
  }
  _onKeyboardFocusWin(display, direction) {
    const focus_window = display.get_focus_window();
    if (!focus_window || !focus_window.has_focus() || focus_window.get_wm_class() && focus_window.get_wm_class() === "gjs")
      return;
    const windowList = filterUnfocusableWindows(
      focus_window.get_workspace().list_windows()
    );
    const focusParent = focus_window.get_transient_for() || focus_window;
    const focusedIdx = windowList.findIndex((win) => {
      return win === focusParent;
    });
    let nextIndex = -1;
    switch (direction) {
      case 2 /* PREV */:
        if (focusedIdx === 0 && Settings.WRAPAROUND_FOCUS) {
          windowList[windowList.length - 1].activate(
            global.get_current_time()
          );
        } else {
          windowList[focusedIdx - 1].activate(
            global.get_current_time()
          );
        }
        break;
      case 1 /* NEXT */:
        nextIndex = (focusedIdx + 1) % windowList.length;
        if (nextIndex > 0 || Settings.WRAPAROUND_FOCUS)
          windowList[nextIndex].activate(global.get_current_time());
        break;
    }
  }
  _onKeyboardUntileWindow(kb, display) {
    const focus_window = display.get_focus_window();
    if (!focus_window || !focus_window.has_focus() || focus_window.windowType !== Meta.WindowType.NORMAL || focus_window.get_wm_class() && focus_window.get_wm_class() === "gjs")
      return;
    if (focus_window.maximizedHorizontally || focus_window.maximizedVertically)
      unmaximizeWindow(focus_window);
    const monitorTilingManager = this._tilingManagers[focus_window.get_monitor()];
    if (!monitorTilingManager) return;
    monitorTilingManager.onUntileWindow(focus_window, true);
  }
  _isFractionalScalingEnabled(_mutterSettings) {
    return _mutterSettings.get_strv("experimental-features").find(
      (feat) => feat === "scale-monitor-framebuffer" || feat === "x11-randr-fractional-scaling"
    ) !== void 0;
  }
  disable() {
    this._keybindings?.destroy();
    this._keybindings = null;
    this._indicator?.destroy();
    this._indicator = null;
    this._tilingManagers.forEach((tm) => tm.destroy());
    this._tilingManagers = [];
    this._signals?.disconnect();
    this._signals = null;
    this._resizingManager?.destroy();
    this._resizingManager = null;
    this._windowBorderManager?.destroy();
    this._windowBorderManager = null;
    this._dbus?.disable();
    this._dbus = null;
    this._fractionalScalingEnabled = false;
    OverriddenWindowMenu.destroy();
    OverriddenAltTab.destroy();
    SettingsOverride.destroy();
    GlobalState.destroy();
    Settings.destroy();
    TilingShellWindowManager.destroy();
    debug17("extension is disabled");
  }
};
export {
  TilingShellExtension as default
};
/*!
 * Tiling Shell: advanced and modern window management for GNOME
 *
 * Copyright (C) 2025 Domenico Ferraro
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
