// src/gi.shared.ts
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";

// src/gi.prefs.ts
import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

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

// src/utils/logger.ts
function rect_to_string(rect) {
  return `{x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}}`;
}
var logger = (prefix) => (...content) => console.log("[tilingshell]", `[${prefix}]`, ...content);

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

// src/settings/settingsExport.ts
var dconfPath = "/org/gnome/shell/extensions/tilingshell/";
var excludedKeys = [
  Settings.KEY_SETTING_LAYOUTS_JSON,
  Settings.KEY_LAST_VERSION_NAME_INSTALLED,
  Settings.KEY_OVERRIDDEN_SETTINGS
];
var SettingsExport = class {
  _gioSettings;
  constructor(gioSettings) {
    this._gioSettings = gioSettings;
  }
  exportToString() {
    return this._excludeKeys(this._dumpDconf());
  }
  importFromString(content) {
    this.restoreToDefault();
    const proc = Gio.Subprocess.new(
      ["dconf", "load", dconfPath],
      Gio.SubprocessFlags.STDIN_PIPE
    );
    proc.communicate_utf8(content, null);
    if (!proc.get_successful()) {
      this.restoreToDefault();
      throw new Error(
        "Failed to import dconf dump file. Restoring to default..."
      );
    }
  }
  restoreToDefault() {
    Settings.ACTIVE_SCREEN_EDGES = false;
    Settings.ENABLE_MOVE_KEYBINDINGS = false;
    SettingsOverride.get().restoreAll();
    this._gioSettings.list_keys().filter((key) => key.length > 0 && !excludedKeys.includes(key)).forEach((key) => this._gioSettings.reset(key));
  }
  _dumpDconf() {
    const proc = Gio.Subprocess.new(
      ["dconf", "dump", dconfPath],
      Gio.SubprocessFlags.STDOUT_PIPE
    );
    const [, dump] = proc.communicate_utf8(null, null);
    if (proc.get_successful()) return dump;
    else throw new Error("Failed to dump dconf");
  }
  _excludeKeys(dconfDump) {
    if (dconfDump.length === 0) throw new Error("Empty dconf dump");
    const keyFile = new GLib.KeyFile();
    const length = new TextEncoder().encode(dconfDump).length;
    if (!keyFile.load_from_data(dconfDump, length, GLib.KeyFileFlags.NONE))
      throw new Error("Failed to load from dconf dump");
    const [key_list] = keyFile.get_keys("/");
    key_list.forEach((key) => {
      if (excludedKeys.includes(key)) keyFile.remove_key("/", key);
    });
    const [data] = keyFile.to_data();
    if (data) return data;
    else throw new Error("Failed to exclude dconf keys");
  }
};

// src/prefs.ts
var _a;
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import * as Config from "resource:///org/gnome/Shell/Extensions/js/misc/config.js";
var debug = logger("prefs");
function buildPrefsWidget() {
  return new Gtk.Label({
    label: "Preferences"
  });
}
var TilingShellExtensionPreferences = class extends ExtensionPreferences {
  GNOME_VERSION_MAJOR = Number(Config.PACKAGE_VERSION.split(".")[0]);
  /**
   * This function is called when the preferences window is first created to fill
   * the `Adw.PreferencesWindow`.
   *
   * @param {Adw.PreferencesWindow} window - The preferences window
   */
  fillPreferencesWindow(window) {
    Settings.initialize(this.getSettings());
    const prefsPage = new Adw.PreferencesPage({
      name: "general",
      title: _("General"),
      iconName: "dialog-information-symbolic"
    });
    window.add(prefsPage);
    const appearenceGroup = new Adw.PreferencesGroup({
      title: _("Appearance"),
      description: _("Configure the appearance of Tiling Shell")
    });
    prefsPage.add(appearenceGroup);
    const showIndicatorRow = this._buildSwitchRow(
      Settings.KEY_SHOW_INDICATOR,
      _("Show Indicator"),
      _("Whether to show the panel indicator")
    );
    appearenceGroup.add(showIndicatorRow);
    const innerGapsRow = this._buildSpinButtonRow(
      Settings.KEY_INNER_GAPS,
      _("Inner gaps"),
      _("Gaps between windows")
    );
    appearenceGroup.add(innerGapsRow);
    const outerGapsRow = this._buildSpinButtonRow(
      Settings.KEY_OUTER_GAPS,
      _("Outer gaps"),
      _("Gaps between a window and the monitor borders")
    );
    appearenceGroup.add(outerGapsRow);
    const blurRow = new Adw.ExpanderRow({
      title: _("Blur (experimental feature)"),
      subtitle: _(
        "Apply blur effect to Snap Assistant and tile previews"
      )
    });
    appearenceGroup.add(blurRow);
    const snapAssistantThresholdRow = this._buildSpinButtonRow(
      Settings.KEY_SNAP_ASSISTANT_THRESHOLD,
      _("Snap Assistant threshold"),
      _(
        "Minimum distance from the Snap Assistant to the pointer to open it"
      ),
      0,
      512
    );
    appearenceGroup.add(snapAssistantThresholdRow);
    blurRow.add_row(
      this._buildSwitchRow(
        Settings.KEY_ENABLE_BLUR_SNAP_ASSISTANT,
        _("Snap Assistant"),
        _("Apply blur effect to Snap Assistant")
      )
    );
    blurRow.add_row(
      this._buildSwitchRow(
        Settings.KEY_ENABLE_BLUR_SELECTED_TILEPREVIEW,
        _("Selected tile preview"),
        _("Apply blur effect to selected tile preview")
      )
    );
    const windowBorderExpanderRow = new Adw.ExpanderRow({
      title: _("Window border"),
      subtitle: _("Show a border around focused window")
    });
    appearenceGroup.add(windowBorderExpanderRow);
    windowBorderExpanderRow.add_row(
      this._buildSwitchRow(
        Settings.KEY_ENABLE_WINDOW_BORDER,
        _("Enable"),
        _("Show a border around focused window")
      )
    );
    windowBorderExpanderRow.add_row(
      this._buildSwitchRow(
        Settings.KEY_ENABLE_SMART_WINDOW_BORDER_RADIUS,
        _("Smart border radius"),
        _("Dynamically adapt to the window\u2019s actual border radius")
      )
    );
    windowBorderExpanderRow.add_row(
      this._buildSpinButtonRow(
        Settings.KEY_WINDOW_BORDER_WIDTH,
        _("Width"),
        _("The size of the border"),
        1
      )
    );
    const colorButton = this._buildColorButton(
      this._getRGBAFromString(Settings.WINDOW_BORDER_COLOR),
      (val) => Settings.WINDOW_BORDER_COLOR = val
    );
    const windowBorderColorRow = new Adw.ActionRow({
      title: _("Border color"),
      subtitle: _("Choose the color of the border")
    });
    windowBorderColorRow.add_suffix(colorButton);
    colorButton.set_visible(Settings.WINDOW_USE_CUSTOM_BORDER_COLOR);
    if (this.GNOME_VERSION_MAJOR >= 47) {
      const customColorDropDown = this._buildCustomColorDropDown(
        Settings.WINDOW_USE_CUSTOM_BORDER_COLOR,
        (use_custom_color) => {
          colorButton.set_visible(use_custom_color);
          Settings.WINDOW_USE_CUSTOM_BORDER_COLOR = use_custom_color;
        }
      );
      windowBorderColorRow.add_suffix(customColorDropDown);
    }
    windowBorderExpanderRow.add_row(windowBorderColorRow);
    const animationsRow = new Adw.ExpanderRow({
      title: _("Animations"),
      subtitle: _("Customize animations")
    });
    appearenceGroup.add(animationsRow);
    animationsRow.add_row(
      this._buildSpinButtonRow(
        Settings.KEY_SNAP_ASSISTANT_ANIMATION_TIME,
        _("Snap assistant animation time"),
        _("The snap assistant animation time in milliseconds"),
        0,
        2e3
      )
    );
    animationsRow.add_row(
      this._buildSpinButtonRow(
        Settings.KEY_TILE_PREVIEW_ANIMATION_TIME,
        _("Tiles animation time"),
        _("The tiles animation time in milliseconds"),
        0,
        2e3
      )
    );
    const behaviourGroup = new Adw.PreferencesGroup({
      title: _("Behaviour"),
      description: _("Configure the behaviour of Tiling Shell")
    });
    prefsPage.add(behaviourGroup);
    const snapAssistRow = this._buildSwitchRow(
      Settings.KEY_SNAP_ASSIST,
      _("Enable Snap Assistant"),
      _("Move the window on top of the screen to snap assist it")
    );
    behaviourGroup.add(snapAssistRow);
    const enableTilingSystemRow = this._buildSwitchRow(
      Settings.KEY_TILING_SYSTEM,
      _("Enable Tiling System"),
      _("Hold the activation key while moving a window to tile it"),
      this._buildActivationKeysDropDown(
        Settings.TILING_SYSTEM_ACTIVATION_KEY,
        (val) => Settings.TILING_SYSTEM_ACTIVATION_KEY = val
      )
    );
    behaviourGroup.add(enableTilingSystemRow);
    const tilingSystemDeactivationRow = this._buildDropDownRow(
      _("Tiling System deactivation key"),
      _(
        "Hold the deactivation key while moving a window to deactivate the tiling system"
      ),
      Settings.TILING_SYSTEM_DEACTIVATION_KEY,
      (val) => Settings.TILING_SYSTEM_DEACTIVATION_KEY = val
    );
    behaviourGroup.add(tilingSystemDeactivationRow);
    const spanMultipleTilesRow = this._buildSwitchRow(
      Settings.KEY_SPAN_MULTIPLE_TILES,
      _("Span multiple tiles"),
      _("Hold the activation key to span multiple tiles"),
      this._buildActivationKeysDropDown(
        Settings.SPAN_MULTIPLE_TILES_ACTIVATION_KEY,
        (val) => Settings.SPAN_MULTIPLE_TILES_ACTIVATION_KEY = val
      )
    );
    behaviourGroup.add(spanMultipleTilesRow);
    const autoTilingRow = this._buildSwitchRow(
      Settings.KEY_ENABLE_AUTO_TILING,
      _("Enable Auto Tiling"),
      _("Automatically tile new windows to the best tile")
    );
    behaviourGroup.add(autoTilingRow);
    const resizeComplementingRow = this._buildSwitchRow(
      Settings.KEY_RESIZE_COMPLEMENTING_WINDOWS,
      _("Enable auto-resize of the complementing tiled windows"),
      _(
        "When a tiled window is resized, auto-resize the other tiled windows near it"
      )
    );
    behaviourGroup.add(resizeComplementingRow);
    const restoreToOriginalSizeRow = this._buildSwitchRow(
      Settings.KEY_RESTORE_WINDOW_ORIGINAL_SIZE,
      _("Restore window size"),
      _(
        "Whether to restore the windows to their original size when untiled"
      )
    );
    behaviourGroup.add(restoreToOriginalSizeRow);
    const overrideWindowMenuRow = this._buildSwitchRow(
      Settings.KEY_OVERRIDE_WINDOW_MENU,
      _("Add snap assistant and auto-tile buttons to window menu"),
      _(
        "Add snap assistant and auto-tile buttons in the menu that shows up when you right click on a window title"
      )
    );
    behaviourGroup.add(overrideWindowMenuRow);
    const overrideAltTabRow = this._buildSwitchRow(
      Settings.KEY_OVERRIDE_ALT_TAB,
      _("Add tiled windows to ALT+TAB menu"),
      _(
        "Add the tiled windows to the ALT+TAB menu to open all the tiled windows at once"
      )
    );
    behaviourGroup.add(overrideAltTabRow);
    const activeScreenEdgesGroup = new Adw.PreferencesGroup({
      title: _("Screen Edges"),
      description: _(
        "Drag windows against the top, left and right screen edges to resize them"
      ),
      headerSuffix: new Gtk.Switch({
        vexpand: false,
        valign: Gtk.Align.CENTER
      })
    });
    Settings.bind(
      Settings.KEY_ACTIVE_SCREEN_EDGES,
      activeScreenEdgesGroup.headerSuffix,
      "active"
    );
    const topEdgeMaximize = this._buildSwitchRow(
      Settings.KEY_TOP_EDGE_MAXIMIZE,
      _("Drag against top edge to maximize window"),
      _("Drag windows against the top edge to maximize them")
    );
    Settings.bind(
      Settings.KEY_ACTIVE_SCREEN_EDGES,
      topEdgeMaximize,
      "sensitive"
    );
    activeScreenEdgesGroup.add(topEdgeMaximize);
    const quarterTiling = this._buildScaleRow(
      _("Quarter tiling activation area"),
      _("Activation area to trigger quarter tiling (%% of the screen)"),
      (sc) => {
        Settings.QUARTER_TILING_THRESHOLD = sc.get_value();
      },
      Settings.QUARTER_TILING_THRESHOLD,
      1,
      50,
      1
    );
    Settings.bind(
      Settings.KEY_ACTIVE_SCREEN_EDGES,
      quarterTiling,
      "sensitive"
    );
    activeScreenEdgesGroup.add(quarterTiling);
    const edgeTilingOffset = this._buildScaleRow(
      _("Edge tiling offset"),
      _("Offset from the screen edge to trigger edge tiling (in pixels)"),
      (sc) => {
        Settings.EDGE_TILING_OFFSET = sc.get_value();
      },
      Settings.EDGE_TILING_OFFSET,
      1,
      250,
      1
    );
    Settings.bind(
      Settings.KEY_ACTIVE_SCREEN_EDGES,
      edgeTilingOffset,
      "sensitive"
    );
    activeScreenEdgesGroup.add(edgeTilingOffset);
    prefsPage.add(activeScreenEdgesGroup);
    const windowsSuggestionsGroup = new Adw.PreferencesGroup({
      title: _("Windows suggestions"),
      description: _("Enable and disable windows suggestions")
    });
    prefsPage.add(behaviourGroup);
    const tilingSystemWindowSuggestionRow = this._buildSwitchRow(
      Settings.KEY_ENABLE_TILING_SYSTEM_WINDOWS_SUGGESTIONS,
      _("Enable window suggestions for the tiling system"),
      _(
        "Provides smart suggestions to fill empty tiles when using the tiling system"
      )
    );
    windowsSuggestionsGroup.add(tilingSystemWindowSuggestionRow);
    const snapAssistWindowSuggestionRow = this._buildSwitchRow(
      Settings.KEY_ENABLE_SNAP_ASSISTANT_WINDOWS_SUGGESTIONS,
      _("Enable window suggestions for the snap assistant"),
      _(
        "Offers suggestions to populate empty tiles when using the snap assistant"
      )
    );
    windowsSuggestionsGroup.add(snapAssistWindowSuggestionRow);
    const screenEdgesWindowSuggestionRow = this._buildSwitchRow(
      Settings.KEY_ENABLE_SCREEN_EDGES_WINDOWS_SUGGESTIONS,
      _("Enable window suggestions for screen edge snapping"),
      _(
        "Suggests windows to occupy empty tiles when snapping to screen edges"
      )
    );
    windowsSuggestionsGroup.add(screenEdgesWindowSuggestionRow);
    prefsPage.add(windowsSuggestionsGroup);
    const layoutsGroup = new Adw.PreferencesGroup({
      title: _("Layouts"),
      description: _("Configure the layouts of Tiling Shell")
    });
    prefsPage.add(layoutsGroup);
    const editLayoutsBtn = this._buildButtonRow(
      _("Edit layouts"),
      _("Edit layouts"),
      _("Open the layouts editor"),
      () => this._openLayoutEditor()
    );
    layoutsGroup.add(editLayoutsBtn);
    const exportLayoutsBtn = this._buildButtonRow(
      _("Export layouts"),
      _("Export layouts"),
      _("Export layouts to a file"),
      () => {
        const fc = this._buildFileChooserDialog(
          _("Export layouts"),
          Gtk.FileChooserAction.SAVE,
          window,
          _("Save"),
          _("Cancel"),
          new Gtk.FileFilter({
            suffixes: ["json"],
            name: "JSON"
          }),
          (_source, response_id) => {
            try {
              if (response_id === Gtk.ResponseType.ACCEPT) {
                const file = _source.get_file();
                if (!file) throw new Error("no file selected");
                debug(
                  `Create file with path ${file.get_path()}`
                );
                const content = JSON.stringify(
                  Settings.get_layouts_json()
                );
                file.replace_contents_bytes_async(
                  new TextEncoder().encode(content),
                  null,
                  false,
                  Gio.FileCreateFlags.REPLACE_DESTINATION,
                  null,
                  (thisFile, res) => {
                    try {
                      thisFile?.replace_contents_finish(
                        res
                      );
                    } catch (e) {
                      debug(e);
                    }
                  }
                );
              }
            } catch (error) {
              debug(error);
            }
            _source.destroy();
          }
        );
        fc.set_current_name("tilingshell-layouts.json");
        fc.show();
      }
    );
    layoutsGroup.add(exportLayoutsBtn);
    const importLayoutsBtn = this._buildButtonRow(
      _("Import layouts"),
      _("Import layouts"),
      _("Import layouts from a file"),
      () => {
        const fc = this._buildFileChooserDialog(
          _("Select layouts file"),
          Gtk.FileChooserAction.OPEN,
          window,
          _("Open"),
          _("Cancel"),
          new Gtk.FileFilter({
            suffixes: ["json"],
            name: "JSON"
          }),
          (_source, response_id) => {
            try {
              if (response_id === Gtk.ResponseType.ACCEPT) {
                const file = _source.get_file();
                if (!file) {
                  _source.destroy();
                  return;
                }
                debug(`Selected path ${file.get_path()}`);
                const [success, content] = file.load_contents(null);
                if (success) {
                  let importedLayouts = JSON.parse(
                    new TextDecoder("utf-8").decode(
                      content
                    )
                  );
                  if (importedLayouts.length === 0) {
                    throw new Error(
                      "At least one layout is required"
                    );
                  }
                  importedLayouts = importedLayouts.filter(
                    (layout) => layout.tiles.length > 0
                  );
                  const newLayouts = Settings.get_layouts_json();
                  newLayouts.push(...importedLayouts);
                  Settings.save_layouts_json(newLayouts);
                } else {
                  debug("Error while opening file");
                }
              }
            } catch (error) {
              debug(error);
            }
            _source.destroy();
          }
        );
        fc.show();
      }
    );
    layoutsGroup.add(importLayoutsBtn);
    const resetBtn = this._buildButtonRow(
      _("Reset layouts"),
      _("Reset layouts"),
      _("Bring back the default layouts"),
      () => {
        Settings.reset_layouts_json();
        const layouts = Settings.get_layouts_json();
        const newSelectedLayouts = Settings.get_selected_layouts().map(
          (monitors_selected) => monitors_selected.map(() => layouts[0].id)
        );
        Settings.save_selected_layouts(newSelectedLayouts);
      },
      "destructive-action"
    );
    layoutsGroup.add(resetBtn);
    const keybindingsGroup = new Adw.PreferencesGroup({
      title: _("Keybindings"),
      description: _(
        "Use hotkeys to perform actions on the focused window"
      ),
      headerSuffix: new Gtk.Switch({
        vexpand: false,
        valign: Gtk.Align.CENTER
      })
    });
    Settings.bind(
      Settings.KEY_ENABLE_MOVE_KEYBINDINGS,
      keybindingsGroup.headerSuffix,
      "active"
    );
    prefsPage.add(keybindingsGroup);
    const gioSettings = this.getSettings();
    const keybindings = [
      [
        Settings.SETTING_MOVE_WINDOW_RIGHT,
        // settings key
        _("Move window to right tile"),
        // title
        _("Move the focused window to the tile on its right"),
        // subtitle
        false,
        // is set
        true
        // is on main page
      ],
      [
        Settings.SETTING_MOVE_WINDOW_LEFT,
        _("Move window to left tile"),
        _("Move the focused window to the tile on its left"),
        false,
        true
      ],
      [
        Settings.SETTING_MOVE_WINDOW_UP,
        _("Move window to tile above"),
        _("Move the focused window to the tile above"),
        false,
        true
      ],
      [
        Settings.SETTING_MOVE_WINDOW_DOWN,
        _("Move window to tile below"),
        _("Move the focused window to the tile below"),
        false,
        true
      ],
      [
        Settings.SETTING_SPAN_WINDOW_RIGHT,
        _("Span window to right tile"),
        _("Span the focused window to the tile on its right"),
        false,
        false
      ],
      [
        Settings.SETTING_SPAN_WINDOW_LEFT,
        _("Span window to left tile"),
        _("Span the focused window to the tile on its left"),
        false,
        false
      ],
      [
        Settings.SETTING_SPAN_WINDOW_UP,
        _("Span window above"),
        _("Span the focused window to the tile above"),
        false,
        false
      ],
      [
        Settings.SETTING_SPAN_WINDOW_DOWN,
        _("Span window down"),
        _("Span the focused window to the tile below"),
        false,
        false
      ],
      [
        Settings.SETTING_SPAN_WINDOW_ALL_TILES,
        _("Span window to all tiles"),
        _("Span the focused window to all the tiles"),
        false,
        false
      ],
      [
        Settings.SETTING_UNTILE_WINDOW,
        _("Untile focused window"),
        void 0,
        false,
        false
      ],
      [
        Settings.SETTING_MOVE_WINDOW_CENTER,
        // settings key
        _("Move window to the center"),
        // title
        _("Move the focused window to the center of the screen"),
        // subtitle
        false,
        // is set
        false
        // is on main page
      ],
      [
        Settings.SETTING_FOCUS_WINDOW_RIGHT,
        _("Focus window to the right"),
        _(
          "Focus the window to the right of the current focused window"
        ),
        false,
        false
      ],
      [
        Settings.SETTING_FOCUS_WINDOW_LEFT,
        _("Focus window to the left"),
        _("Focus the window to the left of the current focused window"),
        false,
        false
      ],
      [
        Settings.SETTING_FOCUS_WINDOW_UP,
        _("Focus window above"),
        _("Focus the window above the current focused window"),
        false,
        false
      ],
      [
        Settings.SETTING_FOCUS_WINDOW_DOWN,
        _("Focus window below"),
        _("Focus the window below the current focused window"),
        false,
        false
      ],
      [
        Settings.SETTING_FOCUS_WINDOW_NEXT,
        _("Focus next window"),
        _("Focus the window next to the current focused window"),
        false,
        false
      ],
      [
        Settings.SETTING_FOCUS_WINDOW_PREV,
        _("Focus previous window"),
        _("Focus the window prior to the current focused window"),
        false,
        false
      ],
      [
        Settings.SETTING_HIGHLIGHT_CURRENT_WINDOW,
        _("Highlight focused window"),
        _(
          "Minimize all the other windows and show only the focused window"
        ),
        false,
        false
      ],
      [
        Settings.SETTING_CYCLE_LAYOUTS,
        _("Cycle layouts"),
        _("Cycle through available workspace layouts"),
        false,
        false
      ]
    ];
    for (let i = 0; i < keybindings.length; i++) {
      keybindings[i][3] = gioSettings.get_strv(keybindings[i][0])[0].length > 0;
    }
    keybindings.forEach(
      ([settingsKey, title, subtitle, isSet, isOnMainPage]) => {
        if (!isSet && !isOnMainPage) return;
        const row = this._buildShortcutButtonRow(
          settingsKey,
          gioSettings,
          title,
          subtitle
        );
        Settings.bind(
          Settings.KEY_ENABLE_MOVE_KEYBINDINGS,
          row,
          "sensitive"
        );
        keybindingsGroup.add(row);
      }
    );
    const openKeybindingsDialogRow = new Adw.ActionRow({
      title: _("View and Customize all the Shortcuts"),
      activatable: true
    });
    openKeybindingsDialogRow.add_suffix(
      new Gtk.Image({
        icon_name: "go-next-symbolic",
        valign: Gtk.Align.CENTER
      })
    );
    Settings.bind(
      Settings.KEY_ENABLE_MOVE_KEYBINDINGS,
      openKeybindingsDialogRow,
      "sensitive"
    );
    keybindingsGroup.add(openKeybindingsDialogRow);
    const keybindingsDialog = new Adw.PreferencesWindow({
      searchEnabled: true,
      modal: true,
      hide_on_close: true,
      transient_for: window,
      width_request: 480,
      height_request: 320
    });
    openKeybindingsDialogRow.connect(
      "activated",
      () => keybindingsDialog.present()
    );
    const keybindingsPage = new Adw.PreferencesPage({
      name: _("View and Customize Shortcuts"),
      title: _("View and Customize Shortcuts"),
      iconName: "dialog-information-symbolic"
    });
    keybindingsDialog.add(keybindingsPage);
    const keybindingsDialogGroup = new Adw.PreferencesGroup();
    keybindingsPage.add(keybindingsDialogGroup);
    keybindings.forEach(([settingsKey, title, subtitle]) => {
      const row = this._buildShortcutButtonRow(
        settingsKey,
        gioSettings,
        title,
        subtitle
      );
      Settings.bind(
        Settings.KEY_ENABLE_MOVE_KEYBINDINGS,
        row,
        "sensitive"
      );
      keybindingsDialogGroup.add(row);
    });
    const wrapAroundRow = this._buildSwitchRow(
      Settings.KEY_WRAPAROUND_FOCUS,
      _("Enable next/previous window focus to wrap around"),
      _(
        "When focusing next or previous window, wrap around at the window edge"
      )
    );
    keybindingsGroup.add(wrapAroundRow);
    const directionalFocusTiledWindows = this._buildSwitchRow(
      Settings.KEY_ENABLE_DIRECTIONAL_FOCUS_TILED_ONLY,
      _("Restrict directional focus to tiled windows"),
      _(
        "When using directional focus navigation, only consider tiled windows"
      )
    );
    keybindingsGroup.add(directionalFocusTiledWindows);
    const importExportGroup = new Adw.PreferencesGroup({
      title: _("Import, export and reset"),
      description: _(
        "Import, export and reset the settings of Tiling Shell"
      )
    });
    prefsPage.add(importExportGroup);
    const exportSettingsBtn = this._buildButtonRow(
      _("Export settings"),
      _("Export settings"),
      _("Export settings to a file"),
      () => {
        const fc = this._buildFileChooserDialog(
          _("Export settings to a text file"),
          Gtk.FileChooserAction.SAVE,
          window,
          _("Save"),
          _("Cancel"),
          new Gtk.FileFilter({
            suffixes: ["txt"],
            name: _("Text file")
          }),
          (_source, response_id) => {
            try {
              if (response_id === Gtk.ResponseType.ACCEPT) {
                const file = _source.get_file();
                if (!file) throw new Error("no file selected");
                debug(
                  `Create file with path ${file.get_path()}`
                );
                const settingsExport = new SettingsExport(
                  this.getSettings()
                );
                const content = settingsExport.exportToString();
                file.replace_contents_bytes_async(
                  new TextEncoder().encode(content),
                  null,
                  false,
                  Gio.FileCreateFlags.REPLACE_DESTINATION,
                  null,
                  (thisFile, res) => {
                    try {
                      thisFile?.replace_contents_finish(
                        res
                      );
                    } catch (e) {
                      debug(e);
                    }
                  }
                );
              }
            } catch (error) {
              debug(error);
            }
            _source.destroy();
          }
        );
        fc.set_current_name("tilingshell-settings.txt");
        fc.show();
      }
    );
    importExportGroup.add(exportSettingsBtn);
    const importSettingsBtn = this._buildButtonRow(
      _("Import settings"),
      _("Import settings"),
      _("Import settings from a file"),
      () => {
        const fc = this._buildFileChooserDialog(
          _("Select a text file to import from"),
          Gtk.FileChooserAction.OPEN,
          window,
          _("Open"),
          _("Cancel"),
          new Gtk.FileFilter({
            suffixes: ["txt"],
            name: "Text file"
          }),
          (_source, response_id) => {
            try {
              if (response_id === Gtk.ResponseType.ACCEPT) {
                const file = _source.get_file();
                if (!file) {
                  _source.destroy();
                  return;
                }
                debug(`Selected path ${file.get_path()}`);
                const [success, content] = file.load_contents(null);
                if (success) {
                  const imported = new TextDecoder(
                    "utf-8"
                  ).decode(content);
                  const settingsExport = new SettingsExport(
                    this.getSettings()
                  );
                  settingsExport.importFromString(imported);
                } else {
                  debug("Error while opening file");
                }
              }
            } catch (error) {
              debug(error);
            }
            _source.destroy();
          }
        );
        fc.show();
      }
    );
    importExportGroup.add(importSettingsBtn);
    const resetSettingsBtn = this._buildButtonRow(
      _("Reset settings"),
      _("Reset settings"),
      _("Bring back the default settings"),
      () => new SettingsExport(this.getSettings()).restoreToDefault(),
      "destructive-action"
    );
    importExportGroup.add(resetSettingsBtn);
    const footerGroup = new Adw.PreferencesGroup();
    prefsPage.add(footerGroup);
    const buttons = new Gtk.Box({
      hexpand: false,
      spacing: 8,
      margin_bottom: 16,
      halign: Gtk.Align.CENTER
    });
    buttons.append(
      this._buildLinkButton(
        `\u2665\uFE0E ${_("Donate on ko-fi")}`,
        "https://ko-fi.com/domferr"
      )
    );
    buttons.append(
      this._buildLinkButton(
        _("Report a bug"),
        "https://github.com/domferr/tilingshell/issues/new?template=bug_report.md"
      )
    );
    buttons.append(
      this._buildLinkButton(
        _("Request a feature"),
        "https://github.com/domferr/tilingshell/issues/new?template=feature_request.md"
      )
    );
    footerGroup.add(buttons);
    footerGroup.add(
      new Gtk.Label({
        label: _(
          "Have issues, you want to suggest a new feature or contribute?"
        ),
        margin_bottom: 4
      })
    );
    footerGroup.add(
      new Gtk.Label({
        label: `${_("Open a new issue on")} <a href="https://github.com/domferr/tilingshell">GitHub</a>!`,
        useMarkup: true,
        margin_bottom: 32
      })
    );
    if (this.metadata["version-name"]) {
      footerGroup.add(
        new Gtk.Label({
          label: `\xB7 Tiling Shell v${this.metadata["version-name"]} \xB7`
        })
      );
    }
    window.searchEnabled = true;
    window.connect("close-request", () => {
      Settings.destroy();
    });
    return Promise.resolve();
  }
  _buildSwitchRow(settingsKey, title, subtitle, suffix) {
    const gtkSwitch = new Gtk.Switch({
      vexpand: false,
      valign: Gtk.Align.CENTER
    });
    const adwRow = new Adw.ActionRow({
      title,
      subtitle,
      activatableWidget: gtkSwitch
    });
    if (suffix) adwRow.add_suffix(suffix);
    adwRow.add_suffix(gtkSwitch);
    Settings.bind(settingsKey, gtkSwitch, "active");
    return adwRow;
  }
  _buildDropDownRow(title, subtitle, initialValue, onChange, styleClass) {
    const dropDown = this._buildActivationKeysDropDown(
      initialValue,
      onChange,
      styleClass
    );
    dropDown.set_vexpand(false);
    dropDown.set_valign(Gtk.Align.CENTER);
    const adwRow = new Adw.ActionRow({
      title,
      subtitle,
      activatableWidget: dropDown
    });
    adwRow.add_suffix(dropDown);
    return adwRow;
  }
  _buildSpinButtonRow(settingsKey, title, subtitle, min = 0, max = 32) {
    const spinBtn = Gtk.SpinButton.new_with_range(min, max, 1);
    spinBtn.set_vexpand(false);
    spinBtn.set_valign(Gtk.Align.CENTER);
    const adwRow = new Adw.ActionRow({
      title,
      subtitle,
      activatableWidget: spinBtn
    });
    adwRow.add_suffix(spinBtn);
    Settings.bind(settingsKey, spinBtn, "value");
    return adwRow;
  }
  _buildButtonRow(label, title, subtitle, onClick, styleClass) {
    const btn = Gtk.Button.new_with_label(label);
    if (styleClass) btn.add_css_class(styleClass);
    btn.connect("clicked", onClick);
    btn.set_vexpand(false);
    btn.set_valign(Gtk.Align.CENTER);
    const adwRow = new Adw.ActionRow({
      title,
      subtitle,
      activatableWidget: btn
    });
    adwRow.add_suffix(btn);
    return adwRow;
  }
  _openLayoutEditor() {
    try {
      Gio.DBus.session.call_sync(
        "org.gnome.Shell",
        "/org/gnome/Shell/Extensions/TilingShell",
        "org.gnome.Shell.Extensions.TilingShell",
        "openLayoutEditor",
        null,
        null,
        Gio.DBusCallFlags.NONE,
        -1,
        null
      );
    } catch (e) {
      if (e instanceof Gio.DBusError) Gio.DBusError.strip_remote_error(e);
      console.error(e);
    }
  }
  _buildActivationKeysDropDown(initialValue, onChange, styleClass) {
    const options = new Gtk.StringList();
    const activationKeys = [
      0 /* CTRL */,
      1 /* ALT */,
      2 /* SUPER */
    ];
    activationKeys.forEach((k) => options.append(ActivationKey[k]));
    options.append("(None)");
    const dropdown = new Gtk.DropDown({
      model: options,
      selected: initialValue
    });
    dropdown.connect("notify::selected-item", (dd) => {
      const index = dd.get_selected();
      const selected = index < 0 || index >= activationKeys.length ? -1 /* NONE */ : activationKeys[index];
      onChange(selected);
    });
    if (styleClass) dropdown.add_css_class(styleClass);
    dropdown.set_vexpand(false);
    dropdown.set_valign(Gtk.Align.CENTER);
    return dropdown;
  }
  _buildLinkButton(label, uri) {
    const btn = new Gtk.Button({
      label,
      hexpand: false
    });
    btn.connect("clicked", () => {
      Gtk.show_uri(null, uri, Gdk.CURRENT_TIME);
    });
    return btn;
  }
  _buildShortcutButtonRow(settingsKey, gioSettings, title, subtitle, styleClass) {
    const btn = new ShortcutSettingButton(settingsKey, gioSettings);
    if (styleClass) btn.add_css_class(styleClass);
    btn.set_vexpand(false);
    btn.set_valign(Gtk.Align.CENTER);
    const adwRow = new Adw.ActionRow({
      title,
      activatableWidget: btn
    });
    if (subtitle) adwRow.set_subtitle(subtitle);
    adwRow.add_suffix(btn);
    return adwRow;
  }
  _buildScaleRow(title, subtitle, onChange, initialValue, min, max, step) {
    const scale = Gtk.Scale.new_with_range(
      Gtk.Orientation.HORIZONTAL,
      min,
      max,
      step
    );
    scale.set_value(initialValue);
    scale.set_vexpand(false);
    scale.set_valign(Gtk.Align.CENTER);
    const adwRow = new Adw.ActionRow({
      title,
      subtitle,
      activatableWidget: scale
    });
    scale.connect("value-changed", onChange);
    scale.set_size_request(150, -1);
    scale.set_digits(0);
    scale.set_draw_value(true);
    adwRow.add_suffix(scale);
    return adwRow;
  }
  _getRGBAFromString(str) {
    const rgba = new Gdk.RGBA();
    rgba.parse(str);
    return rgba;
  }
  _buildColorButton(rgba, onChange) {
    const colorButton = new Gtk.ColorButton({
      rgba,
      use_alpha: true,
      valign: Gtk.Align.CENTER
    });
    colorButton.connect("color-set", () => {
      onChange(colorButton.get_rgba().to_string());
    });
    return colorButton;
  }
  _buildCustomColorDropDown(initialValue, onChange, styleClass) {
    const options = new Gtk.StringList();
    options.append(_("Choose custom color"));
    options.append(_("Use system accent color"));
    const dropdown = new Gtk.DropDown({
      model: options,
      selected: initialValue ? 0 : 1
    });
    dropdown.connect("notify::selected-item", (dd) => {
      const index = dd.get_selected();
      const selected = index === 0;
      onChange(selected);
    });
    if (styleClass) dropdown.add_css_class(styleClass);
    dropdown.set_vexpand(false);
    dropdown.set_valign(Gtk.Align.CENTER);
    return dropdown;
  }
  _buildFileChooserDialog(title, action, window, accept, cancel, filter, onResponse) {
    const fc = new Gtk.FileChooserNative({
      title,
      action,
      select_multiple: false,
      modal: true,
      accept_label: accept,
      cancel_label: cancel
    });
    window.connect("map", () => {
      fc.set_transient_for(window);
    });
    if (this.GNOME_VERSION_MAJOR >= 43) fc.set_filter(filter);
    fc.set_current_folder(Gio.File.new_for_path(GLib.get_home_dir()));
    fc.connect("response", onResponse);
    return fc;
  }
};
var ShortcutSettingButton = (_a = class extends Gtk.Button {
  _editor;
  _label;
  _shortcut;
  _settingsKey;
  _gioSettings;
  constructor(settingsKey, gioSettings) {
    super({
      halign: Gtk.Align.CENTER,
      hexpand: false,
      vexpand: false,
      has_frame: false
    });
    this._shortcut = "";
    this._settingsKey = settingsKey;
    this._gioSettings = gioSettings;
    this._editor = null;
    this._label = new Gtk.ShortcutLabel({
      disabled_text: _("New accelerator\u2026"),
      valign: Gtk.Align.CENTER,
      hexpand: false,
      vexpand: false
    });
    this.connect("clicked", this._onActivated.bind(this));
    gioSettings.connect(`changed::${settingsKey}`, () => {
      [this.shortcut] = gioSettings.get_strv(settingsKey);
      this._label.set_accelerator(this.shortcut);
    });
    [this.shortcut] = gioSettings.get_strv(settingsKey);
    this._label.set_accelerator(this.shortcut);
    this.set_child(this._label);
  }
  set shortcut(value) {
    this._shortcut = value;
  }
  get shortcut() {
    return this._shortcut;
  }
  _onActivated(widget) {
    const ctl = new Gtk.EventControllerKey();
    const content = new Adw.StatusPage({
      title: _("New accelerator\u2026"),
      // description: this._description,
      icon_name: "preferences-desktop-keyboard-shortcuts-symbolic",
      description: _("Use Backspace to clear")
    });
    this._editor = new Adw.Window({
      modal: true,
      hide_on_close: true,
      // @ts-expect-error "widget has get_root function"
      transient_for: widget.get_root(),
      width_request: 480,
      height_request: 320,
      content
    });
    this._editor.add_controller(ctl);
    ctl.connect("key-pressed", this._onKeyPressed.bind(this));
    this._editor.present();
  }
  _onKeyPressed(_widget, keyval, keycode, state) {
    let mask = state & Gtk.accelerator_get_default_mod_mask();
    mask &= ~Gdk.ModifierType.LOCK_MASK;
    if (!mask && keyval === Gdk.KEY_Escape) {
      this._editor?.close();
      return Gdk.EVENT_STOP;
    }
    if (keyval === Gdk.KEY_BackSpace) {
      this._updateShortcut("");
      this._editor?.close();
      return Gdk.EVENT_STOP;
    }
    if (!this.isValidBinding(mask, keycode, keyval) || !this.isValidAccel(mask, keyval))
      return Gdk.EVENT_STOP;
    if (!keyval && !keycode) {
      this._editor?.destroy();
      return Gdk.EVENT_STOP;
    } else {
      const val = Gtk.accelerator_name_with_keycode(
        null,
        keyval,
        keycode,
        mask
      );
      this._updateShortcut(val);
    }
    this._editor?.destroy();
    return Gdk.EVENT_STOP;
  }
  _updateShortcut(val) {
    this.shortcut = val;
    this._label.set_accelerator(this.shortcut);
    this._gioSettings.set_strv(this._settingsKey, [this.shortcut]);
    this.emit("changed", this.shortcut);
  }
  // Functions from https://gitlab.gnome.org/GNOME/gnome-control-center/-/blob/main/panels/keyboard/keyboard-shortcuts.c
  keyvalIsForbidden(keyval) {
    return [
      // Navigation keys
      Gdk.KEY_Home,
      Gdk.KEY_Left,
      Gdk.KEY_Up,
      Gdk.KEY_Right,
      Gdk.KEY_Down,
      Gdk.KEY_Page_Up,
      Gdk.KEY_Page_Down,
      Gdk.KEY_End,
      Gdk.KEY_Tab,
      // Return
      Gdk.KEY_KP_Enter,
      Gdk.KEY_Return,
      Gdk.KEY_Mode_switch
    ].includes(keyval);
  }
  isValidBinding(mask, keycode, keyval) {
    return !(mask === 0 || // @ts-expect-error "Gdk has SHIFT_MASK"
    mask === Gdk.SHIFT_MASK && keycode !== 0 && (keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z || keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z || keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9 || keyval >= Gdk.KEY_kana_fullstop && keyval <= Gdk.KEY_semivoicedsound || keyval >= Gdk.KEY_Arabic_comma && keyval <= Gdk.KEY_Arabic_sukun || keyval >= Gdk.KEY_Serbian_dje && keyval <= Gdk.KEY_Cyrillic_HARDSIGN || keyval >= Gdk.KEY_Greek_ALPHAaccent && keyval <= Gdk.KEY_Greek_omega || keyval >= Gdk.KEY_hebrew_doublelowline && keyval <= Gdk.KEY_hebrew_taf || keyval >= Gdk.KEY_Thai_kokai && keyval <= Gdk.KEY_Thai_lekkao || keyval >= Gdk.KEY_Hangul_Kiyeog && keyval <= Gdk.KEY_Hangul_J_YeorinHieuh || keyval === Gdk.KEY_space && mask === 0 || this.keyvalIsForbidden(keyval)));
  }
  isValidAccel(mask, keyval) {
    return Gtk.accelerator_valid(keyval, mask) || keyval === Gdk.KEY_Tab && mask !== 0;
  }
}, GObject.registerClass(
  {
    Properties: {
      shortcut: GObject.ParamSpec.string(
        "shortcut",
        "shortcut",
        "The shortcut",
        GObject.ParamFlags.READWRITE,
        ""
      )
    },
    Signals: {
      changed: { param_types: [GObject.TYPE_STRING] }
    }
  },
  _a
), _a);
export {
  TilingShellExtensionPreferences as default
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
