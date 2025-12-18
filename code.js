"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/code/main.ts
  var require_main = __commonJS({
    "src/code/main.ts"(exports) {
      console.clear();
      figma.showUI(__html__, {
        width: 1200,
        height: 800,
        themeColors: true,
        title: "PirulinoColorete - Design Architect"
      });
      function parseColor(input) {
        const str = input.trim().toLowerCase();
        if (str.startsWith("#")) {
          return parseHex(str);
        }
        const match = str.match(/^([a-z]+)\((.+)\)$/);
        if (match) {
          const type = match[1];
          const params = match[2].split(/[,\s/]+/).filter((x) => x.length > 0);
          if ((type === "rgb" || type === "rgba") && params.length >= 3) {
            return parseRgbParams(params);
          }
          if (type === "oklch" && params.length >= 3) {
            return parseOklchParams(params);
          }
        }
        return null;
      }
      function parseHex(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
          return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
          };
        }
        const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
        if (shortResult) {
          return {
            r: parseInt(shortResult[1] + shortResult[1], 16) / 255,
            g: parseInt(shortResult[2] + shortResult[2], 16) / 255,
            b: parseInt(shortResult[3] + shortResult[3], 16) / 255
          };
        }
        return null;
      }
      function parseRgbParams(params) {
        const getValue = (raw) => {
          const val = parseFloat(raw);
          if (raw.includes("%"))
            return val / 100 * 255;
          return val;
        };
        return {
          r: getValue(params[0]) / 255,
          g: getValue(params[1]) / 255,
          b: getValue(params[2]) / 255
        };
      }
      function parseOklchParams(params) {
        let L = parseFloat(params[0]);
        if (params[0].includes("%") && L > 1)
          L = L / 100;
        const C = parseFloat(params[1]);
        const H = parseFloat(params[2]);
        return oklchToRgb(L, C, H);
      }
      function oklchToRgb(l, c, h) {
        const hRad = h * (Math.PI / 180);
        const L = l;
        const a = c * Math.cos(hRad);
        const b = c * Math.sin(hRad);
        const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
        const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
        const s_ = L - 0.0894841775 * a - 1.291485548 * b;
        const l3 = l_ * l_ * l_;
        const m3 = m_ * m_ * m_;
        const s3 = s_ * s_ * s_;
        const rLinear = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
        const srgbTransfer = (val) => {
          if (val <= 31308e-7)
            return 12.92 * val;
          return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
        };
        return {
          r: Math.max(0, Math.min(1, srgbTransfer(rLinear))),
          g: Math.max(0, Math.min(1, srgbTransfer(gLinear))),
          b: Math.max(0, Math.min(1, srgbTransfer(bLinear)))
        };
      }
      function rgbToOklch(r, g, b) {
        const srgbInverseTransfer = (val) => {
          if (val <= 0.04045)
            return val / 12.92;
          return Math.pow((val + 0.055) / 1.055, 2.4);
        };
        const rLin = srgbInverseTransfer(r);
        const gLin = srgbInverseTransfer(g);
        const bLin = srgbInverseTransfer(b);
        const l = Math.cbrt(0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin);
        const m = Math.cbrt(0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin);
        const s = Math.cbrt(0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin);
        const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
        const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
        const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
        const C = Math.sqrt(a * a + bVal * bVal);
        let H = Math.atan2(bVal, a) * (180 / Math.PI);
        if (H < 0)
          H += 360;
        return { l: L, c: C, h: H };
      }
      function rgbToHex(r, g, b) {
        let rVal, gVal, bVal;
        if (typeof r === "object") {
          rVal = r.r;
          gVal = r.g;
          bVal = r.b;
        } else {
          rVal = r;
          gVal = g;
          bVal = b;
        }
        const toHex = (val) => {
          const hex = Math.round(Math.max(0, Math.min(1, val)) * 255).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };
        return `#${toHex(rVal)}${toHex(gVal)}${toHex(bVal)}`;
      }
      function rgbToOklchString(r, g, b) {
        const { l, c, h } = rgbToOklch(r, g, b);
        return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
      }
      var SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      function calculateScale(baseColor) {
        const base = rgbToOklch(baseColor.r, baseColor.g, baseColor.b);
        const targetL = {
          50: 0.975,
          500: base.l,
          950: 0.28
        };
        const chromaFactors = {
          50: 0.08,
          100: 0.2,
          200: 0.45,
          300: 0.75,
          400: 0.92,
          500: 1,
          600: 0.92,
          700: 0.8,
          800: 0.65,
          900: 0.5,
          950: 0.4
        };
        const getLightness = (step) => {
          if (step === 500)
            return base.l;
          if (step < 500) {
            const t = (step - 50) / 450;
            return targetL[50] * (1 - t) + base.l * t;
          } else {
            const t = (step - 500) / 450;
            return base.l * (1 - t) + targetL[950] * t;
          }
        };
        const scale = {};
        for (const step of SCALE_STEPS) {
          const l = getLightness(step);
          const c = base.c * chromaFactors[step];
          scale[step] = oklchToRgb(l, c, base.h);
        }
        return scale;
      }
      function getLuminance(r, g, b) {
        const toLinear = (v) => {
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
      }
      function getContrastRatio(lum1, lum2) {
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
      }
      function getWCAGRating(ratio) {
        if (ratio >= 7)
          return ["AAA", "AA"];
        if (ratio >= 4.5)
          return ["AA"];
        if (ratio >= 3)
          return ["AA Large"];
        return ["Fail"];
      }
      function slugify(text) {
        return text.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
      }
      function rgbToP3(r, g, b) {
        const linearize = (v) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        const lr = linearize(r);
        const lg = linearize(g);
        const lb = linearize(b);
        const X = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
        const Y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
        const Z = 0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb;
        const p3r_lin = 2.4934969 * X - 0.9313836 * Y - 0.4027107 * Z;
        const p3g_lin = -0.8294889 * X + 1.762664 * Y + 0.0236246 * Z;
        const p3b_lin = 0.0358458 * X - 0.0761723 * Y + 0.9568845 * Z;
        const gamma = (v) => v <= 31308e-7 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
        const p3r = Math.max(0, Math.min(1, gamma(p3r_lin)));
        const p3g = Math.max(0, Math.min(1, gamma(p3g_lin)));
        const p3b = Math.max(0, Math.min(1, gamma(p3b_lin)));
        return `color(display-p3 ${p3r.toFixed(3)} ${p3g.toFixed(3)} ${p3b.toFixed(3)})`;
      }
      function getOrCreateColorCardComponent() {
        return __async(this, null, function* () {
          const componentName = "Color Card v7";
          const existing = figma.currentPage.findOne((n) => n.type === "COMPONENT" && n.name === componentName);
          if (existing) {
            const hasP3 = existing.children.find((n) => n.name === "P3");
            if (hasP3)
              return existing;
            existing.remove();
          }
          yield figma.loadFontAsync({ family: "Inter", style: "Bold" });
          yield figma.loadFontAsync({ family: "Inter", style: "Medium" });
          yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
          const component = figma.createComponent();
          component.name = componentName;
          component.layoutMode = "VERTICAL";
          component.resize(240, 260);
          component.primaryAxisSizingMode = "FIXED";
          component.counterAxisSizingMode = "FIXED";
          component.paddingLeft = 20;
          component.paddingRight = 20;
          component.paddingTop = 20;
          component.paddingBottom = 20;
          component.itemSpacing = 4;
          component.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.5, b: 0.9 } }];
          component.cornerRadius = 16;
          const createText = (name, fontSize, fontStyle) => {
            const t = figma.createText();
            t.name = name;
            t.fontName = { family: "Inter", style: fontStyle };
            t.fontSize = fontSize;
            t.characters = name;
            t.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
            return t;
          };
          component.appendChild(createText("Name", 20, "Bold"));
          const spacer = figma.createFrame();
          spacer.name = "Spacer";
          spacer.layoutMode = "VERTICAL";
          spacer.fills = [];
          component.appendChild(spacer);
          spacer.layoutGrow = 1;
          component.appendChild(createText("WCAG Black", 11, "Medium"));
          component.appendChild(createText("WCAG White", 11, "Medium"));
          const smallSpacer = figma.createFrame();
          smallSpacer.name = "Small Spacer";
          smallSpacer.fills = [];
          component.appendChild(smallSpacer);
          smallSpacer.resize(220, 8);
          smallSpacer.layoutAlign = "STRETCH";
          smallSpacer.layoutGrow = 0;
          component.appendChild(createText("CSS Var", 11, "Bold"));
          component.appendChild(createText("Hex", 11, "Regular"));
          component.appendChild(createText("RGBA", 11, "Regular"));
          component.appendChild(createText("OKLCH", 11, "Regular"));
          component.appendChild(createText("P3", 11, "Regular"));
          component.appendChild(createText("Lum", 11, "Regular"));
          return component;
        });
      }
      function loadCollections() {
        return __async(this, null, function* () {
          try {
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            const payload = collections.map((c) => ({ id: c.id, name: c.name }));
            figma.ui.postMessage({ type: "load-collections", payload });
          } catch (error) {
            console.error("Error loading collections:", error);
          }
        });
      }
      function getGroups(collectionId, mode = "tab1") {
        return __async(this, null, function* () {
          try {
            const allVariables = yield figma.variables.getLocalVariablesAsync();
            const collectionVariables = allVariables.filter((v) => v.variableCollectionId === collectionId);
            const groupSet = /* @__PURE__ */ new Set();
            collectionVariables.forEach((v) => {
              const parts = v.name.split("/");
              if (parts.length > 1) {
                groupSet.add(parts[0]);
              }
            });
            const payload = Array.from(groupSet).sort();
            const typeMap = {
              "tab2": "load-groups-tab2",
              "measures": "load-groups-measures",
              "tab1": "load-groups"
            };
            figma.ui.postMessage({ type: typeMap[mode] || "load-groups", payload });
          } catch (error) {
            console.error("Error loading groups:", error);
          }
        });
      }
      function getGroupsCustom(collectionId, returnEventType) {
        return __async(this, null, function* () {
          try {
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            const collection = collections.find((c) => c.id === collectionId);
            if (!collection)
              return;
            const vars = yield figma.variables.getLocalVariablesAsync();
            const groupNames = /* @__PURE__ */ new Set();
            vars.filter((v) => v.variableCollectionId === collectionId).forEach((v) => {
              if (v.name.includes("/")) {
                groupNames.add(v.name.split("/")[0]);
              }
            });
            figma.ui.postMessage({ type: returnEventType, payload: Array.from(groupNames).sort() });
          } catch (err) {
            console.error(err);
          }
        });
      }
      function getUniqueFonts() {
        return __async(this, null, function* () {
          try {
            const fonts = yield figma.listAvailableFontsAsync();
            const families = new Set(fonts.map((f) => f.fontName.family));
            figma.ui.postMessage({ type: "load-fonts", payload: Array.from(families).sort() });
          } catch (err) {
            console.error("Error loading fonts:", err);
            figma.notify("Error loading fonts: " + err.message);
          }
        });
      }
      function createVariables(scale, config) {
        return __async(this, null, function* () {
          try {
            const { colorName, collectionId, groupName } = config;
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            const collection = collections.find((c) => c.id === collectionId);
            if (!collection)
              throw new Error("Collection not found");
            const modeId = collection.defaultModeId;
            figma.ui.postMessage({ type: "progress-start", payload: "Creating Variables..." });
            const allVars = yield figma.variables.getLocalVariablesAsync();
            for (const [step, color] of Object.entries(scale)) {
              const fullPath = groupName ? `${groupName}/${colorName}/${colorName}-${step}` : `${colorName}/${colorName}-${step}`;
              let variable = allVars.find((v) => v.variableCollectionId === collectionId && v.name === fullPath);
              if (!variable) {
                variable = figma.variables.createVariable(fullPath, collection, "COLOR");
              }
              variable.setValueForMode(modeId, color);
            }
            figma.ui.postMessage({ type: "variables-created-success" });
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify(`Created variables for ${colorName} successfully!`);
          } catch (err) {
            console.error(err);
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify("Error creating variables: " + err.message);
          }
        });
      }
      function createMeasureVariables(values, config) {
        return __async(this, null, function* () {
          try {
            const { collectionId, groupName } = config;
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            const collection = collections.find((c) => c.id === collectionId);
            if (!collection)
              throw new Error("Collection not found");
            const modeId = collection.defaultModeId;
            figma.ui.postMessage({ type: "progress-start", payload: "Creating Measures..." });
            const allVars = yield figma.variables.getLocalVariablesAsync();
            for (const value of values) {
              const safeValueStr = value.toString().replace(".", "_");
              const name = `${safeValueStr}px`;
              const safeGroupName = groupName ? groupName.replace(/\./g, "_") : "";
              const fullPath = safeGroupName ? `${safeGroupName}/${name}` : name;
              let variable = allVars.find((v) => v.variableCollectionId === collectionId && v.name === fullPath);
              if (!variable) {
                variable = figma.variables.createVariable(fullPath, collection, "FLOAT");
              }
              variable.setValueForMode(modeId, value);
            }
            figma.ui.postMessage({ type: "measures-created-success" });
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify(`Created ${values.length} measure variables!`);
          } catch (err) {
            console.error(err);
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify("Error creating measures: " + err.message);
          }
        });
      }
      function exportVariables(collectionId, groupName, options) {
        return __async(this, null, function* () {
          var _a;
          try {
            figma.ui.postMessage({ type: "progress-start", payload: "Exporting variables..." });
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            const allVariables = yield figma.variables.getLocalVariablesAsync();
            let targetCollections = collections;
            if (collectionId) {
              targetCollections = collections.filter((c) => c.id === collectionId);
            }
            const exportVars = [];
            for (const collection of targetCollections) {
              const collectionVars = allVariables.filter((v) => v.variableCollectionId === collection.id);
              const filtered = groupName ? collectionVars.filter((v) => v.name.startsWith(groupName + "/") || v.name === groupName) : collectionVars;
              for (const variable of filtered) {
                const values = {};
                let isAlias = false;
                let aliasPath;
                for (const mode of collection.modes) {
                  const rawValue = variable.valuesByMode[mode.modeId];
                  if (rawValue && typeof rawValue === "object" && "type" in rawValue && rawValue.type === "VARIABLE_ALIAS") {
                    isAlias = true;
                    if (options.resolveRefs) {
                      const aliasVar = allVariables.find((v) => v.id === rawValue.id);
                      if (aliasVar) {
                        aliasPath = aliasVar.name;
                        const aliasValue = aliasVar.valuesByMode[Object.keys(aliasVar.valuesByMode)[0]];
                        values[mode.name] = formatValue(aliasValue, variable.resolvedType, options.colorFormat);
                      }
                    } else {
                      const aliasVar = allVariables.find((v) => v.id === rawValue.id);
                      if (aliasVar) {
                        values[mode.name] = `{${aliasVar.name}}`;
                        aliasPath = aliasVar.name;
                      }
                    }
                  } else {
                    values[mode.name] = formatValue(rawValue, variable.resolvedType, options.colorFormat);
                  }
                }
                if (options.includeModes || Object.keys(values).length === 1) {
                  exportVars.push({
                    name: variable.name,
                    type: variable.resolvedType,
                    collection: collection.name,
                    values,
                    isAlias,
                    aliasPath,
                    description: variable.description || void 0
                  });
                } else {
                  const defaultMode = (_a = collection.modes[0]) == null ? void 0 : _a.name;
                  if (defaultMode && values[defaultMode] !== void 0) {
                    exportVars.push({
                      name: variable.name,
                      type: variable.resolvedType,
                      collection: collection.name,
                      values: { default: values[defaultMode] },
                      isAlias,
                      aliasPath,
                      description: variable.description || void 0
                    });
                  }
                }
              }
            }
            let output;
            switch (options.format) {
              case "json":
                output = formatAsJSON(exportVars, options);
                break;
              case "css":
                output = formatAsCSS(exportVars, options);
                break;
              case "scss":
                output = formatAsSCSS(exportVars, options);
                break;
              case "tailwind":
                output = formatAsTailwind(exportVars, options);
                break;
              case "typescript":
                output = formatAsTypeScript(exportVars, options);
                break;
              default:
                output = formatAsJSON(exportVars, options);
            }
            figma.ui.postMessage({
              type: "export-variables-result",
              payload: {
                output,
                count: exportVars.length,
                format: options.format
              }
            });
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify(`Exported ${exportVars.length} variables!`);
          } catch (err) {
            console.error("Export error:", err);
            figma.ui.postMessage({ type: "progress-end" });
            figma.ui.postMessage({
              type: "export-variables-result",
              payload: { output: `// Error: ${err.message}`, count: 0, format: options.format }
            });
            figma.notify("Error exporting: " + err.message);
          }
        });
      }
      function formatValue(value, type, colorFormat = "hex") {
        if (value === null || value === void 0)
          return null;
        if (type === "COLOR" && typeof value === "object" && "r" in value) {
          const c = value;
          const alpha = c.a !== void 0 ? c.a : 1;
          switch (colorFormat) {
            case "hex":
              return rgbToHex(c.r, c.g, c.b);
            case "rgba":
              return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha.toFixed(2)})`;
            case "hsl": {
              const max = Math.max(c.r, c.g, c.b);
              const min = Math.min(c.r, c.g, c.b);
              const l = (max + min) / 2;
              let h = 0, s = 0;
              if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                  case c.r:
                    h = ((c.g - c.b) / d + (c.g < c.b ? 6 : 0)) / 6;
                    break;
                  case c.g:
                    h = ((c.b - c.r) / d + 2) / 6;
                    break;
                  case c.b:
                    h = ((c.r - c.g) / d + 4) / 6;
                    break;
                }
              }
              if (alpha < 1) {
                return `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${alpha.toFixed(2)})`;
              }
              return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
            }
            case "oklch":
              return rgbToOklchString(c.r, c.g, c.b);
            case "p3":
              return rgbToP3(c.r, c.g, c.b);
            default:
              return rgbToHex(c.r, c.g, c.b);
          }
        }
        return value;
      }
      function transformName(name, convention) {
        const parts = name.split("/");
        const processedParts = [];
        for (let i = 0; i < parts.length; i++) {
          let part = parts[i];
          if (i === 0 && part.endsWith("s") && part.length > 1) {
            part = part.slice(0, -1);
          }
          if (i < parts.length - 1) {
            const nextPart = parts[i + 1].toLowerCase();
            const currentLower = part.toLowerCase();
            if (nextPart.startsWith(currentLower + "-") || nextPart.startsWith(currentLower + "_")) {
              continue;
            }
          }
          processedParts.push(part);
        }
        const combinedName = processedParts.join("-");
        switch (convention) {
          case "kebab":
            return combinedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          case "camel":
            return combinedName.split(/[^a-zA-Z0-9]+/).map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
          case "snake":
            return combinedName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
          default:
            return combinedName;
        }
      }
      function formatAsJSON(vars, options) {
        const result = {};
        for (const v of vars) {
          const key = transformName(v.name, options.naming);
          const entry = {};
          const modeKeys = Object.keys(v.values);
          if (modeKeys.length === 1) {
            entry.value = v.values[modeKeys[0]];
          } else {
            entry.values = v.values;
          }
          if (options.includeMetadata) {
            entry.type = v.type.toLowerCase();
            if (v.description)
              entry.description = v.description;
          }
          result[key] = Object.keys(entry).length === 1 && "value" in entry ? entry.value : entry;
        }
        return JSON.stringify(result, null, 2);
      }
      function formatAsCSS(vars, options) {
        const lines = [];
        const byMode = {};
        const formatCSSValue = (value) => {
          if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
            const aliasPath = value.slice(1, -1);
            const cssVarName = transformName(aliasPath, options.naming);
            return `var(--${cssVarName})`;
          }
          return String(value);
        };
        const normalizeModeName = (mode) => {
          const lower = mode.toLowerCase();
          if (lower === "mode 1" || lower === "default" || lower === "desktop")
            return "desktop";
          if (lower === "mode 2")
            return "tablet";
          if (lower === "mode 3")
            return "mobile";
          return lower;
        };
        for (const v of vars) {
          const varName = `--${transformName(v.name, options.naming)}`;
          for (const [mode, value] of Object.entries(v.values)) {
            const normalizedMode = normalizeModeName(mode);
            if (!byMode[normalizedMode])
              byMode[normalizedMode] = [];
            byMode[normalizedMode].push(`  ${varName}: ${formatCSSValue(value)};`);
          }
        }
        const modeOrder = Object.keys(byMode);
        const priority = ["desktop", "default", "tablet", "mobile", "light", "dark"];
        modeOrder.sort((a, b) => {
          const aIdx = priority.indexOf(a);
          const bIdx = priority.indexOf(b);
          if (aIdx === -1 && bIdx === -1)
            return 0;
          if (aIdx === -1)
            return 1;
          if (bIdx === -1)
            return -1;
          return aIdx - bIdx;
        });
        let isFirst = true;
        for (const mode of modeOrder) {
          const cssVars = byMode[mode];
          if (isFirst) {
            lines.push(":root {");
            lines.push(...cssVars);
            lines.push("}");
            isFirst = false;
          } else {
            let selector;
            if (mode === "dark") {
              selector = '[data-theme="dark"]';
            } else if (mode === "light") {
              selector = '[data-theme="light"]';
            } else {
              selector = `[data-mode="${mode}"]`;
            }
            lines.push("");
            lines.push(`${selector} {`);
            lines.push(...cssVars);
            lines.push("}");
          }
        }
        return lines.join("\n");
      }
      function formatAsSCSS(vars, options) {
        const lines = ["// Design Tokens - Generated by PirulinoColorete", ""];
        const formatSCSSValue = (value) => {
          if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
            const aliasPath = value.slice(1, -1);
            const scssVarName = transformName(aliasPath, options.naming);
            return `$${scssVarName}`;
          }
          return String(value);
        };
        for (const v of vars) {
          const varName = `$${transformName(v.name, options.naming)}`;
          const modeKeys = Object.keys(v.values);
          if (modeKeys.length === 1) {
            lines.push(`${varName}: ${formatSCSSValue(v.values[modeKeys[0]])};`);
          } else {
            lines.push(`${varName}: (`);
            for (const [mode, value] of Object.entries(v.values)) {
              lines.push(`  ${mode.toLowerCase()}: ${formatSCSSValue(value)},`);
            }
            lines.push(");");
          }
        }
        return lines.join("\n");
      }
      function formatAsTailwind(vars, options) {
        const colors = {};
        const spacing = {};
        const fontSize = {};
        const borderRadius = {};
        const borderWidth = {};
        const other = {};
        const formatTailwindValue = (value) => {
          if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
            const aliasPath = value.slice(1, -1);
            const tokenName = transformName(aliasPath, options.naming);
            return tokenName;
          }
          return value;
        };
        const normalizeModeName = (mode) => {
          const lower = mode.toLowerCase();
          if (lower === "mode 1" || lower === "default")
            return "DEFAULT";
          if (lower === "mode 2")
            return "tablet";
          if (lower === "mode 3")
            return "mobile";
          return lower;
        };
        const config = {
          theme: {
            extend: {}
          }
        };
        const categories = {
          colors,
          spacing,
          fontSize,
          borderRadius,
          borderWidth,
          // Add more Tailwind categories
          fontFamily: {},
          fontWeight: {},
          letterSpacing: {},
          lineHeight: {},
          opacity: {},
          blur: {},
          boxShadow: {},
          transitionDuration: {},
          // Catch-all for everything else
          extend: other
        };
        for (const v of vars) {
          const key = transformName(v.name, options.naming);
          const modeKeys = Object.keys(v.values);
          const nameLower = v.name.toLowerCase();
          let finalValue;
          if (modeKeys.length > 1 && options.includeModes) {
            const modeValues = {};
            for (const [mode, val] of Object.entries(v.values)) {
              const normalizedMode = normalizeModeName(mode);
              const formatted = formatTailwindValue(val);
              modeValues[normalizedMode] = typeof formatted === "number" ? `${formatted}px` : formatted;
            }
            finalValue = modeValues;
          } else {
            const rawValue = Object.values(v.values)[0];
            finalValue = formatTailwindValue(rawValue);
          }
          if (v.type === "COLOR") {
            categories.colors[key] = finalValue;
          } else if (nameLower.includes("font-family") || nameLower.includes("fontfamily")) {
            categories.fontFamily[key] = finalValue;
          } else if (nameLower.includes("font-weight") || nameLower.includes("fontweight")) {
            categories.fontWeight[key] = finalValue;
          } else if (nameLower.includes("letter-spacing") || nameLower.includes("letterspacing")) {
            categories.letterSpacing[key] = finalValue;
          } else if (nameLower.includes("line-height") || nameLower.includes("lineheight")) {
            categories.lineHeight[key] = finalValue;
          } else if (nameLower.includes("opacity")) {
            categories.opacity[key] = finalValue;
          } else if (nameLower.includes("blur")) {
            categories.blur[key] = finalValue;
          } else if (nameLower.includes("shadow")) {
            categories.boxShadow[key] = finalValue;
          } else if (nameLower.includes("duration")) {
            categories.transitionDuration[key] = finalValue;
          } else if (nameLower.includes("spacing") || nameLower.includes("gap") || nameLower.includes("padding") || nameLower.includes("margin")) {
            categories.spacing[key] = typeof finalValue === "number" ? `${finalValue}px` : finalValue;
          } else if (nameLower.includes("font-size") || nameLower.includes("size") && !nameLower.includes("border")) {
            categories.fontSize[key] = typeof finalValue === "number" ? `${finalValue}px` : finalValue;
          } else if (nameLower.includes("radius")) {
            categories.borderRadius[key] = typeof finalValue === "number" ? `${finalValue}px` : finalValue;
          } else if (nameLower.includes("border") && nameLower.includes("width")) {
            categories.borderWidth[key] = typeof finalValue === "number" ? `${finalValue}px` : finalValue;
          } else {
            categories.extend[key] = finalValue;
          }
        }
        const extend = config.theme;
        if (Object.keys(categories.colors).length)
          extend.extend.colors = categories.colors;
        if (Object.keys(categories.spacing).length)
          extend.extend.spacing = categories.spacing;
        if (Object.keys(categories.fontSize).length)
          extend.extend.fontSize = categories.fontSize;
        if (Object.keys(categories.fontFamily).length)
          extend.extend.fontFamily = categories.fontFamily;
        if (Object.keys(categories.fontWeight).length)
          extend.extend.fontWeight = categories.fontWeight;
        if (Object.keys(categories.letterSpacing).length)
          extend.extend.letterSpacing = categories.letterSpacing;
        if (Object.keys(categories.lineHeight).length)
          extend.extend.lineHeight = categories.lineHeight;
        if (Object.keys(categories.borderRadius).length)
          extend.extend.borderRadius = categories.borderRadius;
        if (Object.keys(categories.borderWidth).length)
          extend.extend.borderWidth = categories.borderWidth;
        if (Object.keys(categories.opacity).length)
          extend.extend.opacity = categories.opacity;
        if (Object.keys(categories.blur).length)
          extend.extend.blur = categories.blur;
        if (Object.keys(categories.boxShadow).length)
          extend.extend.boxShadow = categories.boxShadow;
        if (Object.keys(categories.transitionDuration).length)
          extend.extend.transitionDuration = categories.transitionDuration;
        if (Object.keys(categories.extend).length)
          extend.extend.other = categories.extend;
        return `// tailwind.config.js
module.exports = ${JSON.stringify(config, null, 2)}`;
      }
      function formatAsTypeScript(vars, options) {
        const lines = ["// Design Tokens - Generated by PirulinoColorete", ""];
        const formatTSValue = (value) => {
          if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
            const aliasPath = value.slice(1, -1);
            const tokenName = transformName(aliasPath, options.naming);
            return tokenName;
          }
          return value;
        };
        lines.push("export const tokens = {");
        for (const v of vars) {
          const key = transformName(v.name, options.naming);
          const modeKeys = Object.keys(v.values);
          const formattedValues = {};
          for (const [mode, val] of Object.entries(v.values)) {
            formattedValues[mode] = formatTSValue(val);
          }
          const value = modeKeys.length === 1 ? formattedValues[modeKeys[0]] : formattedValues;
          if (v.description && options.includeMetadata) {
            lines.push(`  /** ${v.description} */`);
          }
          const valueStr = typeof value === "string" ? `"${value}"` : JSON.stringify(value);
          lines.push(`  ${key}: ${valueStr},`);
        }
        lines.push("} as const;");
        lines.push("");
        lines.push("export type TokenKey = keyof typeof tokens;");
        return lines.join("\n");
      }
      function importIconsFromSvg(icons, options) {
        return __async(this, null, function* () {
          try {
            figma.ui.postMessage({ type: "icons-import-progress", percent: 60, message: "Creating icons..." });
            const iconsFrame = figma.createFrame();
            iconsFrame.name = `${options.prefix}Library`;
            iconsFrame.layoutMode = "HORIZONTAL";
            iconsFrame.layoutWrap = "WRAP";
            iconsFrame.primaryAxisSizingMode = "FIXED";
            iconsFrame.counterAxisSizingMode = "AUTO";
            iconsFrame.resize(800, iconsFrame.height);
            iconsFrame.itemSpacing = 16;
            iconsFrame.counterAxisSpacing = 16;
            iconsFrame.paddingTop = 24;
            iconsFrame.paddingBottom = 24;
            iconsFrame.paddingLeft = 24;
            iconsFrame.paddingRight = 24;
            iconsFrame.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
            const created = [];
            let processed = 0;
            for (const icon of icons) {
              try {
                const nameParts = icon.name.split(":");
                const iconName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
                const cleanName = iconName.replace(/-/g, "_");
                const svgNode = figma.createNodeFromSvg(icon.svg);
                const scale = options.size / Math.max(svgNode.width, svgNode.height);
                svgNode.resize(svgNode.width * scale, svgNode.height * scale);
                if (options.asComponents) {
                  const component = figma.createComponent();
                  component.name = `${options.prefix}${cleanName}`;
                  component.resize(options.size, options.size);
                  component.layoutMode = "HORIZONTAL";
                  component.primaryAxisSizingMode = "FIXED";
                  component.counterAxisSizingMode = "FIXED";
                  component.primaryAxisAlignItems = "CENTER";
                  component.counterAxisAlignItems = "CENTER";
                  component.fills = [];
                  const flattenedIcon = figma.flatten([svgNode]);
                  flattenedIcon.name = "Icon";
                  component.appendChild(flattenedIcon);
                  flattenedIcon.x = (component.width - flattenedIcon.width) / 2;
                  flattenedIcon.y = (component.height - flattenedIcon.height) / 2;
                  if (options.addColorProperty) {
                    const strokes = flattenedIcon.strokes;
                    const fills = flattenedIcon.fills;
                    if (Array.isArray(strokes) && strokes.length > 0) {
                      flattenedIcon.strokes = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
                    }
                    if (Array.isArray(fills) && fills.length > 0) {
                      flattenedIcon.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
                    }
                  }
                  iconsFrame.appendChild(component);
                  created.push(component);
                } else {
                  const flattenedIcon = figma.flatten([svgNode]);
                  flattenedIcon.name = `${options.prefix}${cleanName}`;
                  iconsFrame.appendChild(flattenedIcon);
                }
                processed++;
                const percent = 60 + Math.round(processed / icons.length * 35);
                figma.ui.postMessage({
                  type: "icons-import-progress",
                  percent,
                  message: `Creating ${processed}/${icons.length}...`
                });
              } catch (iconError) {
                console.error(`Error creating icon ${icon.name}:`, iconError);
              }
            }
            iconsFrame.x = figma.viewport.center.x - iconsFrame.width / 2;
            iconsFrame.y = figma.viewport.center.y - iconsFrame.height / 2;
            figma.currentPage.appendChild(iconsFrame);
            figma.currentPage.selection = [iconsFrame];
            figma.viewport.scrollAndZoomIntoView([iconsFrame]);
            figma.ui.postMessage({ type: "icons-import-progress", percent: 100, message: "Complete!" });
            figma.ui.postMessage({ type: "icons-import-complete", count: processed });
            figma.notify(`Imported ${processed} icons! \u2705`);
          } catch (error) {
            console.error("Icon import error:", error);
            figma.notify("Error importing icons: " + error.message);
          }
        });
      }
      function scanExistingIcons(prefix) {
        return __async(this, null, function* () {
          try {
            const icons = [];
            const allNodes = figma.currentPage.findAll((node) => {
              return node.type === "COMPONENT" && node.name.startsWith(prefix);
            });
            for (const node of allNodes) {
              const displayName = node.name.replace(prefix, "");
              icons.push({
                id: node.id,
                name: node.name,
                displayName
              });
            }
            const libraryFrame = figma.currentPage.findOne((node) => {
              return node.type === "FRAME" && node.name === `${prefix}Library`;
            });
            figma.ui.postMessage({
              type: "existing-icons-loaded",
              icons,
              libraryFrameId: (libraryFrame == null ? void 0 : libraryFrame.id) || null,
              prefix
            });
          } catch (error) {
            console.error("Error scanning icons:", error);
            figma.ui.postMessage({ type: "existing-icons-loaded", icons: [], libraryFrameId: null });
          }
        });
      }
      function deleteIcons(iconIds) {
        return __async(this, null, function* () {
          try {
            let deleted = 0;
            for (const id of iconIds) {
              const node = yield figma.getNodeByIdAsync(id);
              if (node) {
                node.remove();
                deleted++;
              }
            }
            figma.notify(`Deleted ${deleted} icon(s)`);
            figma.ui.postMessage({ type: "icons-deleted", count: deleted });
          } catch (error) {
            console.error("Error deleting icons:", error);
            figma.notify("Error deleting icons");
          }
        });
      }
      function addIconsToLibrary(icons, options, libraryFrameId) {
        return __async(this, null, function* () {
          try {
            let iconsFrame;
            if (libraryFrameId) {
              const existingFrame = yield figma.getNodeByIdAsync(libraryFrameId);
              if (existingFrame && existingFrame.type === "FRAME") {
                iconsFrame = existingFrame;
              } else {
                iconsFrame = createIconLibraryFrame(options.prefix);
              }
            } else {
              const existing = figma.currentPage.findOne((node) => {
                return node.type === "FRAME" && node.name === `${options.prefix}Library`;
              });
              if (existing && existing.type === "FRAME") {
                iconsFrame = existing;
              } else {
                iconsFrame = createIconLibraryFrame(options.prefix);
              }
            }
            figma.ui.postMessage({ type: "icons-import-progress", percent: 60, message: "Adding to library..." });
            let processed = 0;
            for (const icon of icons) {
              try {
                const nameParts = icon.name.split(":");
                const iconName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
                const cleanName = iconName.replace(/-/g, "_");
                const fullName = `${options.prefix}${cleanName}`;
                const existing = iconsFrame.findOne((node) => node.name === fullName);
                if (existing) {
                  processed++;
                  continue;
                }
                const svgNode = figma.createNodeFromSvg(icon.svg);
                const scale = options.size / Math.max(svgNode.width, svgNode.height);
                svgNode.resize(svgNode.width * scale, svgNode.height * scale);
                if (options.asComponents) {
                  const component = figma.createComponent();
                  component.name = fullName;
                  component.resize(options.size, options.size);
                  component.layoutMode = "HORIZONTAL";
                  component.primaryAxisSizingMode = "FIXED";
                  component.counterAxisSizingMode = "FIXED";
                  component.primaryAxisAlignItems = "CENTER";
                  component.counterAxisAlignItems = "CENTER";
                  component.fills = [];
                  const flattenedIcon = figma.flatten([svgNode]);
                  flattenedIcon.name = "Icon";
                  component.appendChild(flattenedIcon);
                  flattenedIcon.x = (component.width - flattenedIcon.width) / 2;
                  flattenedIcon.y = (component.height - flattenedIcon.height) / 2;
                  if (options.addColorProperty) {
                    const strokes = flattenedIcon.strokes;
                    const fills = flattenedIcon.fills;
                    if (Array.isArray(strokes) && strokes.length > 0) {
                      flattenedIcon.strokes = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
                    }
                    if (Array.isArray(fills) && fills.length > 0) {
                      flattenedIcon.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
                    }
                  }
                  iconsFrame.appendChild(component);
                } else {
                  const flattenedIcon = figma.flatten([svgNode]);
                  flattenedIcon.name = fullName;
                  iconsFrame.appendChild(flattenedIcon);
                }
                processed++;
                const percent = 60 + Math.round(processed / icons.length * 35);
                figma.ui.postMessage({
                  type: "icons-import-progress",
                  percent,
                  message: `Adding ${processed}/${icons.length}...`
                });
              } catch (iconError) {
                console.error(`Error adding icon ${icon.name}:`, iconError);
              }
            }
            figma.currentPage.selection = [iconsFrame];
            figma.viewport.scrollAndZoomIntoView([iconsFrame]);
            figma.ui.postMessage({ type: "icons-import-progress", percent: 100, message: "Complete!" });
            figma.ui.postMessage({ type: "icons-import-complete", count: processed });
            figma.notify(`Added ${processed} icon(s) to library! \u2705`);
          } catch (error) {
            console.error("Error adding icons:", error);
            figma.notify("Error adding icons: " + error.message);
          }
        });
      }
      function createIconLibraryFrame(prefix) {
        const frame = figma.createFrame();
        frame.name = `${prefix}Library`;
        frame.layoutMode = "HORIZONTAL";
        frame.layoutWrap = "WRAP";
        frame.primaryAxisSizingMode = "FIXED";
        frame.counterAxisSizingMode = "AUTO";
        frame.resize(800, frame.height);
        frame.itemSpacing = 16;
        frame.counterAxisSpacing = 16;
        frame.paddingTop = 24;
        frame.paddingBottom = 24;
        frame.paddingLeft = 24;
        frame.paddingRight = 24;
        frame.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
        frame.x = figma.viewport.center.x - frame.width / 2;
        frame.y = figma.viewport.center.y - frame.height / 2;
        figma.currentPage.appendChild(frame);
        return frame;
      }
      function createAtomsCollection(findVar) {
        return __async(this, null, function* () {
          var _a, _b, _c;
          const collections = yield figma.variables.getLocalVariableCollectionsAsync();
          let atomsCollection = collections.find((c) => c.name === "Atoms");
          if (!atomsCollection) {
            atomsCollection = figma.variables.createVariableCollection("Atoms");
          }
          const existingModes = atomsCollection.modes;
          let desktopModeId = (_a = existingModes.find((m) => m.name === "Desktop")) == null ? void 0 : _a.modeId;
          let tabletModeId = (_b = existingModes.find((m) => m.name === "Tablet")) == null ? void 0 : _b.modeId;
          let mobileModeId = (_c = existingModes.find((m) => m.name === "Mobile")) == null ? void 0 : _c.modeId;
          if (existingModes.length === 1 && !desktopModeId) {
            atomsCollection.renameMode(existingModes[0].modeId, "Desktop");
            desktopModeId = existingModes[0].modeId;
          }
          if (!tabletModeId) {
            tabletModeId = atomsCollection.addMode("Tablet");
          }
          if (!mobileModeId) {
            mobileModeId = atomsCollection.addMode("Mobile");
          }
          const modeIds = {
            desktop: desktopModeId,
            tablet: tabletModeId,
            mobile: mobileModeId
          };
          const atomVariableDefinitions = [
            // Button variables
            { name: "Button/padding-y", type: "FLOAT", desktop: ["padding/y/md"], tablet: ["padding/y/sm"], mobile: ["padding/y/xs"] },
            { name: "Button/padding-x", type: "FLOAT", desktop: ["padding/x/lg"], tablet: ["padding/x/md"], mobile: ["padding/x/sm"] },
            { name: "Button/font-size", type: "FLOAT", desktop: ["Typography/Body/base", "Body/base"], tablet: ["Typography/Body/sm", "Body/sm"], mobile: ["Typography/Body/sm", "Body/sm"] },
            { name: "Button/icon-size", type: "FLOAT", desktop: ["Icon-Size/lg"], tablet: ["Icon-Size/md"], mobile: ["Icon-Size/sm"] },
            { name: "Button/gap", type: "FLOAT", desktop: ["gap/md"], tablet: ["gap/sm"], mobile: ["gap/xs"] },
            { name: "Button/radius", type: "FLOAT", desktop: ["radius/md"], tablet: ["radius/sm"], mobile: ["radius/sm"] },
            // Input variables
            { name: "Input/padding-y", type: "FLOAT", desktop: ["padding/y/md"], tablet: ["padding/y/sm"], mobile: ["padding/y/xs"] },
            { name: "Input/padding-x", type: "FLOAT", desktop: ["padding/x/lg"], tablet: ["padding/x/md"], mobile: ["padding/x/sm"] },
            { name: "Input/font-size", type: "FLOAT", desktop: ["Typography/Body/base", "Body/base"], tablet: ["Typography/Body/sm", "Body/sm"], mobile: ["Typography/Body/sm", "Body/sm"] },
            { name: "Input/icon-size", type: "FLOAT", desktop: ["Icon-Size/lg"], tablet: ["Icon-Size/md"], mobile: ["Icon-Size/sm"] },
            { name: "Input/gap", type: "FLOAT", desktop: ["gap/md"], tablet: ["gap/sm"], mobile: ["gap/xs"] },
            { name: "Input/radius", type: "FLOAT", desktop: ["radius/md"], tablet: ["radius/sm"], mobile: ["radius/sm"] },
            // Badge variables
            { name: "Badge/padding-y", type: "FLOAT", desktop: ["padding/y/sm"], tablet: ["padding/y/xs"], mobile: ["padding/y/xs"] },
            { name: "Badge/padding-x", type: "FLOAT", desktop: ["padding/x/md"], tablet: ["padding/x/sm"], mobile: ["padding/x/xs"] },
            { name: "Badge/font-size", type: "FLOAT", desktop: ["Typography/Body/sm", "Body/sm"], tablet: ["Typography/Body/xs", "Body/xs"], mobile: ["Typography/Body/xs", "Body/xs"] },
            { name: "Badge/icon-size", type: "FLOAT", desktop: ["Icon-Size/md"], tablet: ["Icon-Size/sm"], mobile: ["Icon-Size/sm"] },
            { name: "Badge/gap", type: "FLOAT", desktop: ["gap/sm"], tablet: ["gap/xs"], mobile: ["gap/xs"] },
            { name: "Badge/radius", type: "FLOAT", desktop: ["radius/full", "radius/lg"], tablet: ["radius/full", "radius/md"], mobile: ["radius/full", "radius/sm"] }
          ];
          const atomVars = {};
          const allVariables = yield figma.variables.getLocalVariablesAsync();
          for (const def of atomVariableDefinitions) {
            let atomVar = allVariables.find(
              (v) => v.variableCollectionId === atomsCollection.id && v.name === def.name
            );
            if (!atomVar) {
              atomVar = figma.variables.createVariable(def.name, atomsCollection, def.type);
            }
            const desktopAlias = findVar(def.desktop, def.type);
            const tabletAlias = findVar(def.tablet, def.type);
            const mobileAlias = findVar(def.mobile, def.type);
            if (desktopAlias) {
              atomVar.setValueForMode(modeIds.desktop, { type: "VARIABLE_ALIAS", id: desktopAlias.id });
            } else {
              const fallbacks = {
                "Button/padding-y": 12,
                "Button/padding-x": 24,
                "Button/font-size": 16,
                "Button/icon-size": 24,
                "Button/gap": 12,
                "Button/radius": 8,
                "Input/padding-y": 12,
                "Input/padding-x": 16,
                "Input/font-size": 16,
                "Input/icon-size": 20,
                "Input/gap": 8,
                "Input/radius": 8,
                "Badge/padding-y": 4,
                "Badge/padding-x": 12,
                "Badge/font-size": 14,
                "Badge/icon-size": 16,
                "Badge/gap": 4,
                "Badge/radius": 999
              };
              atomVar.setValueForMode(modeIds.desktop, fallbacks[def.name] || 16);
            }
            if (tabletAlias) {
              atomVar.setValueForMode(modeIds.tablet, { type: "VARIABLE_ALIAS", id: tabletAlias.id });
            } else {
              const fallbacks = {
                "Button/padding-y": 10,
                "Button/padding-x": 20,
                "Button/font-size": 14,
                "Button/icon-size": 20,
                "Button/gap": 8,
                "Button/radius": 6,
                "Input/padding-y": 10,
                "Input/padding-x": 14,
                "Input/font-size": 14,
                "Input/icon-size": 18,
                "Input/gap": 6,
                "Input/radius": 6,
                "Badge/padding-y": 3,
                "Badge/padding-x": 10,
                "Badge/font-size": 12,
                "Badge/icon-size": 14,
                "Badge/gap": 3,
                "Badge/radius": 999
              };
              atomVar.setValueForMode(modeIds.tablet, fallbacks[def.name] || 14);
            }
            if (mobileAlias) {
              atomVar.setValueForMode(modeIds.mobile, { type: "VARIABLE_ALIAS", id: mobileAlias.id });
            } else {
              const fallbacks = {
                "Button/padding-y": 8,
                "Button/padding-x": 16,
                "Button/font-size": 12,
                "Button/icon-size": 16,
                "Button/gap": 6,
                "Button/radius": 4,
                "Input/padding-y": 8,
                "Input/padding-x": 12,
                "Input/font-size": 12,
                "Input/icon-size": 16,
                "Input/gap": 4,
                "Input/radius": 4,
                "Badge/padding-y": 2,
                "Badge/padding-x": 8,
                "Badge/font-size": 10,
                "Badge/icon-size": 12,
                "Badge/gap": 2,
                "Badge/radius": 999
              };
              atomVar.setValueForMode(modeIds.mobile, fallbacks[def.name] || 12);
            }
            atomVars[def.name] = atomVar;
          }
          return { collection: atomsCollection, modeIds, atomVars };
        });
      }
      function generateAtomicComponents(config) {
        return __async(this, null, function* () {
          try {
            figma.ui.postMessage({ type: "progress-start", payload: "Generating atomic components..." });
            const allVariables = yield figma.variables.getLocalVariablesAsync();
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            const themeCollection = collections.find((c) => c.id === config.themeCollectionId);
            if (!themeCollection) {
              throw new Error("Theme collection not found");
            }
            const themeVars = allVariables.filter((v) => v.variableCollectionId === config.themeCollectionId);
            const aliasesVars = config.aliasesCollectionId ? allVariables.filter((v) => v.variableCollectionId === config.aliasesCollectionId) : [];
            const findVar = (searchTerms, type) => {
              const vars = [...themeVars, ...aliasesVars];
              for (const term of searchTerms) {
                const found = vars.find((v) => {
                  const match = v.name.toLowerCase().includes(term.toLowerCase());
                  if (type)
                    return match && v.resolvedType === type;
                  return match;
                });
                if (found)
                  return found;
              }
              return void 0;
            };
            figma.ui.postMessage({ type: "atoms-generation-progress", payload: { percent: 5, message: "Creating Atoms variables..." } });
            const { atomVars } = yield createAtomsCollection(findVar);
            let container;
            if (config.output === "page") {
              container = figma.createPage();
              container.name = `${config.prefix}Components`;
              figma.currentPage = container;
            } else {
              container = figma.createFrame();
              container.name = `${config.prefix}Components`;
              container.layoutMode = "VERTICAL";
              container.primaryAxisSizingMode = "AUTO";
              container.counterAxisSizingMode = "AUTO";
              container.itemSpacing = 48;
              container.paddingTop = 48;
              container.paddingBottom = 48;
              container.paddingLeft = 48;
              container.paddingRight = 48;
              container.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
            }
            let componentCount = 0;
            if (config.components.buttons) {
              const { variants } = config.components.buttons;
              figma.ui.postMessage({ type: "atoms-generation-progress", payload: { percent: 10, message: "Creating buttons..." } });
              const buttonComponents = [];
              const states = ["Default", "Hover", "Active", "Disabled"];
              for (const variant of variants) {
                for (const state of states) {
                  const originalAsComponents = config.asComponents;
                  config.asComponents = true;
                  const btn = yield createButton(variant, state.toLowerCase(), config, findVar, atomVars);
                  const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
                  btn.name = `Variant=${variantCapitalized}, State=${state}`;
                  buttonComponents.push(btn);
                  componentCount++;
                  config.asComponents = originalAsComponents;
                }
              }
              if (buttonComponents.length > 0) {
                const buttonComponentSet = figma.combineAsVariants(buttonComponents, container);
                buttonComponentSet.name = `${config.prefix}Button`;
                buttonComponentSet.layoutMode = "HORIZONTAL";
                buttonComponentSet.layoutWrap = "WRAP";
                buttonComponentSet.primaryAxisSizingMode = "AUTO";
                buttonComponentSet.counterAxisSizingMode = "AUTO";
                buttonComponentSet.itemSpacing = 16;
                buttonComponentSet.counterAxisSpacing = 16;
                buttonComponentSet.paddingTop = 24;
                buttonComponentSet.paddingBottom = 24;
                buttonComponentSet.paddingLeft = 24;
                buttonComponentSet.paddingRight = 24;
              }
            }
            if (config.components.inputs) {
              const { variants, states } = config.components.inputs;
              figma.ui.postMessage({ type: "atoms-generation-progress", payload: { percent: 40, message: "Creating inputs..." } });
              const inputComponents = [];
              for (const variant of variants) {
                for (const state of states) {
                  const originalAsComponents = config.asComponents;
                  config.asComponents = true;
                  const input = yield createInput(variant, state, config, findVar, atomVars);
                  const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
                  const stateCapitalized = state.charAt(0).toUpperCase() + state.slice(1);
                  input.name = `Type=${variantCapitalized}, State=${stateCapitalized}`;
                  inputComponents.push(input);
                  componentCount++;
                  config.asComponents = originalAsComponents;
                }
              }
              if (inputComponents.length > 0) {
                const inputComponentSet = figma.combineAsVariants(inputComponents, container);
                inputComponentSet.name = `${config.prefix}Input`;
                inputComponentSet.layoutMode = "HORIZONTAL";
                inputComponentSet.layoutWrap = "WRAP";
                inputComponentSet.primaryAxisSizingMode = "AUTO";
                inputComponentSet.counterAxisSizingMode = "AUTO";
                inputComponentSet.itemSpacing = 16;
                inputComponentSet.counterAxisSpacing = 16;
                inputComponentSet.paddingTop = 24;
                inputComponentSet.paddingBottom = 24;
                inputComponentSet.paddingLeft = 24;
                inputComponentSet.paddingRight = 24;
              }
            }
            if (config.components.badges) {
              const { variants } = config.components.badges;
              figma.ui.postMessage({ type: "atoms-generation-progress", payload: { percent: 70, message: "Creating badges..." } });
              const badgeComponents = [];
              for (const variant of variants) {
                const originalAsComponents = config.asComponents;
                config.asComponents = true;
                const badge = yield createBadge(variant, config, findVar, atomVars);
                const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
                badge.name = `Variant=${variantCapitalized}`;
                badgeComponents.push(badge);
                componentCount++;
                config.asComponents = originalAsComponents;
              }
              if (badgeComponents.length > 0) {
                const badgeComponentSet = figma.combineAsVariants(badgeComponents, container);
                badgeComponentSet.name = `${config.prefix}Badge`;
                badgeComponentSet.layoutMode = "HORIZONTAL";
                badgeComponentSet.layoutWrap = "WRAP";
                badgeComponentSet.primaryAxisSizingMode = "AUTO";
                badgeComponentSet.counterAxisSizingMode = "AUTO";
                badgeComponentSet.itemSpacing = 16;
                badgeComponentSet.counterAxisSpacing = 16;
                badgeComponentSet.paddingTop = 24;
                badgeComponentSet.paddingBottom = 24;
                badgeComponentSet.paddingLeft = 24;
                badgeComponentSet.paddingRight = 24;
              }
            }
            figma.ui.postMessage({ type: "progress-end" });
            figma.ui.postMessage({ type: "atoms-generation-complete", payload: { count: componentCount } });
            figma.notify(`Generated ${componentCount} atomic components!`);
          } catch (err) {
            console.error("Error generating components:", err);
            figma.ui.postMessage({ type: "progress-end" });
            figma.ui.postMessage({ type: "atoms-generation-error", payload: err.message });
            figma.notify("Error: " + err.message);
          }
        });
      }
      function findIconComponent() {
        return __async(this, arguments, function* (preferredNames = ["add_rounded", "add", "plus"]) {
          let allNodes = figma.currentPage.findAll(
            (node) => node.type === "COMPONENT" && (node.name.toLowerCase().includes("icon") || node.name.toLowerCase().includes("add") || node.name.toLowerCase().includes("plus"))
          );
          for (const name of preferredNames) {
            const found = allNodes.find(
              (c) => c.name.toLowerCase().includes(name.toLowerCase()) || c.name.toLowerCase().replace(/[_-]/g, "").includes(name.toLowerCase().replace(/[_-]/g, ""))
            );
            if (found)
              return found;
          }
          if (allNodes.length > 0)
            return allNodes[0];
          try {
            yield figma.loadAllPagesAsync();
            allNodes = figma.root.findAll(
              (node) => node.type === "COMPONENT" && (node.name.toLowerCase().includes("icon") || node.name.toLowerCase().includes("add") || node.name.toLowerCase().includes("plus"))
            );
            for (const name of preferredNames) {
              const found = allNodes.find(
                (c) => c.name.toLowerCase().includes(name.toLowerCase()) || c.name.toLowerCase().replace(/[_-]/g, "").includes(name.toLowerCase().replace(/[_-]/g, ""))
              );
              if (found)
                return found;
            }
            if (allNodes.length > 0)
              return allNodes[0];
          } catch (e) {
            console.log("Could not load all pages, using current page only");
          }
          return null;
        });
      }
      function applyColorToIconSubtree(node, colorVar) {
        const colorPaint = figma.variables.setBoundVariableForPaint(
          { type: "SOLID", color: { r: 1, g: 1, b: 1 } },
          "color",
          colorVar
        );
        if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
          if (node.type !== "FRAME" && node.type !== "INSTANCE" && node.type !== "COMPONENT") {
            node.fills = [colorPaint];
          }
        }
        if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
          if (node.type !== "FRAME" && node.type !== "INSTANCE" && node.type !== "COMPONENT") {
            node.strokes = [colorPaint];
          }
        }
        if ("children" in node) {
          for (const child of node.children) {
            applyColorToIconSubtree(child, colorVar);
          }
        }
      }
      function createIconInstanceWithVar(name, sizeVar, colorVar, preferredNames) {
        return __async(this, null, function* () {
          const iconComponent = yield findIconComponent(preferredNames);
          if (iconComponent) {
            const instance = iconComponent.createInstance();
            instance.name = name;
            instance.fills = [];
            if (sizeVar) {
              instance.setBoundVariable("width", sizeVar);
              instance.setBoundVariable("height", sizeVar);
            } else {
              instance.resize(20, 20);
            }
            if (colorVar) {
              applyColorToIconSubtree(instance, colorVar);
            }
            return instance;
          }
          const iconFrame = figma.createFrame();
          iconFrame.name = name;
          iconFrame.layoutMode = "HORIZONTAL";
          iconFrame.primaryAxisSizingMode = "FIXED";
          iconFrame.counterAxisSizingMode = "FIXED";
          iconFrame.primaryAxisAlignItems = "CENTER";
          iconFrame.counterAxisAlignItems = "CENTER";
          iconFrame.fills = [];
          if (sizeVar) {
            iconFrame.setBoundVariable("width", sizeVar);
            iconFrame.setBoundVariable("height", sizeVar);
          } else {
            iconFrame.resize(20, 20);
          }
          const rect = figma.createRectangle();
          rect.name = "Placeholder";
          rect.resize(12, 12);
          if (colorVar) {
            rect.fills = [figma.variables.setBoundVariableForPaint(
              { type: "SOLID", color: { r: 1, g: 1, b: 1 } },
              "color",
              colorVar
            )];
          } else {
            rect.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 0.3 }];
          }
          iconFrame.appendChild(rect);
          iconFrame.cornerRadius = 4;
          return iconFrame;
        });
      }
      function createButton(variant, state, config, findVar, atomVars) {
        return __async(this, null, function* () {
          const btn = config.asComponents ? figma.createComponent() : figma.createFrame();
          btn.name = `Button/${variant}/${state}`;
          btn.layoutMode = "HORIZONTAL";
          btn.primaryAxisSizingMode = "AUTO";
          btn.counterAxisSizingMode = "AUTO";
          btn.primaryAxisAlignItems = "CENTER";
          btn.counterAxisAlignItems = "CENTER";
          const vPaddingVar = atomVars["Button/padding-y"];
          if (vPaddingVar) {
            btn.setBoundVariable("paddingTop", vPaddingVar);
            btn.setBoundVariable("paddingBottom", vPaddingVar);
          } else {
            btn.paddingTop = 12;
            btn.paddingBottom = 12;
          }
          const hPaddingVar = atomVars["Button/padding-x"];
          if (hPaddingVar) {
            btn.setBoundVariable("paddingLeft", hPaddingVar);
            btn.setBoundVariable("paddingRight", hPaddingVar);
          } else {
            btn.paddingLeft = 24;
            btn.paddingRight = 24;
          }
          const radiusVar = atomVars["Button/radius"];
          if (radiusVar) {
            btn.setBoundVariable("topLeftRadius", radiusVar);
            btn.setBoundVariable("topRightRadius", radiusVar);
            btn.setBoundVariable("bottomLeftRadius", radiusVar);
            btn.setBoundVariable("bottomRightRadius", radiusVar);
          } else {
            btn.cornerRadius = 8;
          }
          let bgVarTerms = [];
          let textVarTerms = [];
          if (variant === "primary") {
            if (state === "hover")
              bgVarTerms = ["action/primaryhover", "primaryhover"];
            else if (state === "active")
              bgVarTerms = ["action/primaryactive", "primaryactive"];
            else if (state === "disabled")
              bgVarTerms = ["action/primarydisabled", "primarydisabled"];
            else
              bgVarTerms = ["action/primary"];
            textVarTerms = ["text/inverse", "inverse"];
          } else if (variant === "secondary") {
            if (state === "hover")
              bgVarTerms = ["action/secondaryhover", "secondaryhover"];
            else
              bgVarTerms = ["action/secondary"];
            textVarTerms = ["text/primary"];
          } else if (variant === "ghost") {
            if (state === "hover")
              bgVarTerms = ["action/ghosthover", "ghosthover"];
            else
              bgVarTerms = ["action/ghost", "background/primary"];
            textVarTerms = ["text/brand", "action/primary"];
          } else if (variant === "destructive") {
            if (state === "hover")
              bgVarTerms = ["action/destructivehover", "destructivehover"];
            else
              bgVarTerms = ["action/destructive"];
            textVarTerms = ["text/inverse", "inverse"];
          }
          const bgVar = findVar(bgVarTerms, "COLOR");
          if (bgVar) {
            btn.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }, "color", bgVar)];
          } else {
            btn.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.6, b: 0.9 } }];
          }
          if (variant === "secondary" || variant === "ghost") {
            const borderVar = findVar(["border/default"], "COLOR");
            if (borderVar) {
              btn.strokes = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }, "color", borderVar)];
              btn.strokeWeight = 1;
            }
          }
          if (state === "disabled") {
            btn.opacity = 0.5;
          }
          const textVar = findVar(textVarTerms, "COLOR");
          const iconSizeVar = atomVars["Button/icon-size"];
          const iconLeft = yield createIconInstanceWithVar("IconLeft", iconSizeVar, textVar);
          iconLeft.visible = false;
          btn.appendChild(iconLeft);
          const text = figma.createText();
          text.name = "Label";
          yield figma.loadFontAsync({ family: "Inter", style: "Medium" });
          text.fontName = { family: "Inter", style: "Medium" };
          const defaultLabel = variant.charAt(0).toUpperCase() + variant.slice(1);
          text.characters = defaultLabel;
          const fontSizeVar = atomVars["Button/font-size"];
          if (fontSizeVar) {
            text.setBoundVariable("fontSize", fontSizeVar);
          } else {
            text.fontSize = 16;
          }
          if (textVar) {
            text.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", textVar)];
          }
          btn.appendChild(text);
          const iconRight = yield createIconInstanceWithVar("IconRight", iconSizeVar, textVar);
          iconRight.visible = false;
          btn.appendChild(iconRight);
          const gapVar = atomVars["Button/gap"];
          if (gapVar) {
            btn.setBoundVariable("itemSpacing", gapVar);
          } else {
            btn.itemSpacing = 12;
          }
          if (config.asComponents && btn.type === "COMPONENT") {
            const component = btn;
            const textPropName = component.addComponentProperty("Text", "TEXT", defaultLabel);
            text.componentPropertyReferences = { characters: textPropName };
            const showIconLeftProp = component.addComponentProperty("showIconLeft", "BOOLEAN", false);
            iconLeft.componentPropertyReferences = { visible: showIconLeftProp };
            const showIconRightProp = component.addComponentProperty("showIconRight", "BOOLEAN", false);
            iconRight.componentPropertyReferences = { visible: showIconRightProp };
            if (iconLeft.type === "INSTANCE") {
              const mainCompLeft = yield iconLeft.getMainComponentAsync();
              if (mainCompLeft) {
                const swapLeftProp = component.addComponentProperty("SwapIconLeft", "INSTANCE_SWAP", mainCompLeft.id);
                iconLeft.componentPropertyReferences = __spreadProps(__spreadValues({}, iconLeft.componentPropertyReferences), {
                  mainComponent: swapLeftProp
                });
              }
            }
            if (iconRight.type === "INSTANCE") {
              const mainCompRight = yield iconRight.getMainComponentAsync();
              if (mainCompRight) {
                const swapRightProp = component.addComponentProperty("SwapIconRight", "INSTANCE_SWAP", mainCompRight.id);
                iconRight.componentPropertyReferences = __spreadProps(__spreadValues({}, iconRight.componentPropertyReferences), {
                  mainComponent: swapRightProp
                });
              }
            }
          }
          return btn;
        });
      }
      function createInput(variant, state, config, findVar, atomVars) {
        return __async(this, null, function* () {
          const input = config.asComponents ? figma.createComponent() : figma.createFrame();
          input.name = `Input/${variant}/${state}`;
          input.layoutMode = "HORIZONTAL";
          input.primaryAxisSizingMode = "FIXED";
          input.counterAxisSizingMode = "AUTO";
          input.counterAxisAlignItems = "CENTER";
          input.resize(240, input.height);
          const vPaddingVar = atomVars["Input/padding-y"];
          if (vPaddingVar) {
            input.setBoundVariable("paddingTop", vPaddingVar);
            input.setBoundVariable("paddingBottom", vPaddingVar);
          } else {
            input.paddingTop = 12;
            input.paddingBottom = 12;
          }
          const hPaddingVar = atomVars["Input/padding-x"];
          if (hPaddingVar) {
            input.setBoundVariable("paddingLeft", hPaddingVar);
            input.setBoundVariable("paddingRight", hPaddingVar);
          } else {
            input.paddingLeft = 16;
            input.paddingRight = 16;
          }
          const radiusVar = atomVars["Input/radius"];
          if (radiusVar) {
            input.setBoundVariable("topLeftRadius", radiusVar);
            input.setBoundVariable("topRightRadius", radiusVar);
            input.setBoundVariable("bottomLeftRadius", radiusVar);
            input.setBoundVariable("bottomRightRadius", radiusVar);
          } else {
            input.cornerRadius = 8;
          }
          const bgVar = findVar(["surface/card", "surface/primary", "background/primary"], "COLOR");
          if (bgVar) {
            input.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", bgVar)];
          } else {
            input.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
          }
          let borderTerms = ["border/default"];
          if (state === "focus")
            borderTerms = ["border/focus"];
          else if (state === "error")
            borderTerms = ["border/error", "status/error"];
          else if (state === "success")
            borderTerms = ["border/success", "status/success"];
          else if (state === "disabled")
            borderTerms = ["border/disabled"];
          const borderVar = findVar(borderTerms, "COLOR");
          if (borderVar) {
            input.strokes = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }, "color", borderVar)];
          } else {
            input.strokes = [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }];
          }
          input.strokeWeight = state === "focus" ? 2 : 1;
          if (state === "disabled") {
            input.opacity = 0.5;
          }
          const iconColorVar = findVar(["text/secondary", "icon/default"], "COLOR");
          const iconSizeVar = atomVars["Input/icon-size"];
          let iconLeft = null;
          let iconRight = null;
          if (variant !== "textarea") {
            iconLeft = yield createIconInstanceWithVar("IconLeft", iconSizeVar, iconColorVar);
            iconLeft.visible = false;
            input.appendChild(iconLeft);
          }
          const text = figma.createText();
          text.name = "Placeholder";
          yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
          text.fontName = { family: "Inter", style: "Regular" };
          text.characters = state === "disabled" ? "Disabled" : variant === "textarea" ? "Enter text..." : "Placeholder";
          const fontSizeVar = atomVars["Input/font-size"];
          if (fontSizeVar) {
            text.setBoundVariable("fontSize", fontSizeVar);
          } else {
            text.fontSize = 16;
          }
          text.layoutGrow = 1;
          const textVar = findVar(["text/placeholder", "text/tertiary"], "COLOR");
          if (textVar) {
            text.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }, "color", textVar)];
          }
          input.appendChild(text);
          if (variant === "text") {
            iconRight = yield createIconInstanceWithVar("IconRight", iconSizeVar, iconColorVar);
            iconRight.visible = false;
            input.appendChild(iconRight);
          }
          if (variant === "select") {
            const chevron = yield createIconInstanceWithVar("Chevron", iconSizeVar, iconColorVar, ["expand_more", "chevron_down", "arrow_drop_down"]);
            input.appendChild(chevron);
          }
          if (variant !== "textarea") {
            const gapVar = atomVars["Input/gap"];
            if (gapVar) {
              input.setBoundVariable("itemSpacing", gapVar);
            } else {
              input.itemSpacing = 8;
            }
          }
          if (variant === "textarea") {
            input.layoutMode = "VERTICAL";
            input.resize(240, 100);
            input.primaryAxisSizingMode = "FIXED";
          }
          if (config.asComponents && input.type === "COMPONENT") {
            const component = input;
            const defaultPlaceholder = text.characters;
            const propName = component.addComponentProperty("Placeholder", "TEXT", defaultPlaceholder);
            text.componentPropertyReferences = { characters: propName };
            if (iconLeft) {
              const showIconLeftProp = component.addComponentProperty("showIconLeft", "BOOLEAN", false);
              iconLeft.componentPropertyReferences = { visible: showIconLeftProp };
              if (iconLeft.type === "INSTANCE") {
                const mainCompLeft = yield iconLeft.getMainComponentAsync();
                if (mainCompLeft) {
                  const swapLeftProp = component.addComponentProperty("SwapIconLeft", "INSTANCE_SWAP", mainCompLeft.id);
                  iconLeft.componentPropertyReferences = __spreadProps(__spreadValues({}, iconLeft.componentPropertyReferences), {
                    mainComponent: swapLeftProp
                  });
                }
              }
            }
            if (iconRight && variant === "text") {
              const showIconRightProp = component.addComponentProperty("showIconRight", "BOOLEAN", false);
              iconRight.componentPropertyReferences = { visible: showIconRightProp };
              if (iconRight.type === "INSTANCE") {
                const mainCompRight = yield iconRight.getMainComponentAsync();
                if (mainCompRight) {
                  const swapRightProp = component.addComponentProperty("SwapIconRight", "INSTANCE_SWAP", mainCompRight.id);
                  iconRight.componentPropertyReferences = __spreadProps(__spreadValues({}, iconRight.componentPropertyReferences), {
                    mainComponent: swapRightProp
                  });
                }
              }
            }
          }
          return input;
        });
      }
      function createBadge(variant, config, findVar, atomVars) {
        return __async(this, null, function* () {
          const badge = config.asComponents ? figma.createComponent() : figma.createFrame();
          badge.name = `Badge/${variant}`;
          badge.layoutMode = "HORIZONTAL";
          badge.primaryAxisSizingMode = "AUTO";
          badge.counterAxisSizingMode = "AUTO";
          badge.primaryAxisAlignItems = "CENTER";
          badge.counterAxisAlignItems = "CENTER";
          const vPaddingVar = atomVars["Badge/padding-y"];
          if (vPaddingVar) {
            badge.setBoundVariable("paddingTop", vPaddingVar);
            badge.setBoundVariable("paddingBottom", vPaddingVar);
          } else {
            badge.paddingTop = 4;
            badge.paddingBottom = 4;
          }
          const hPaddingVar = atomVars["Badge/padding-x"];
          if (hPaddingVar) {
            badge.setBoundVariable("paddingLeft", hPaddingVar);
            badge.setBoundVariable("paddingRight", hPaddingVar);
          } else {
            badge.paddingLeft = 12;
            badge.paddingRight = 12;
          }
          const radiusVar = atomVars["Badge/radius"];
          if (radiusVar) {
            badge.setBoundVariable("topLeftRadius", radiusVar);
            badge.setBoundVariable("topRightRadius", radiusVar);
            badge.setBoundVariable("bottomLeftRadius", radiusVar);
            badge.setBoundVariable("bottomRightRadius", radiusVar);
          } else {
            badge.cornerRadius = 999;
          }
          let bgTerms = [];
          let textTerms = [];
          if (variant === "neutral") {
            bgTerms = ["surface/card", "background/secondary"];
            textTerms = ["text/primary"];
          } else if (variant === "primary") {
            bgTerms = ["action/primary"];
            textTerms = ["text/inverse"];
          } else if (variant === "success") {
            bgTerms = ["status/success"];
            textTerms = ["text/inverse"];
          } else if (variant === "warning") {
            bgTerms = ["status/warning"];
            textTerms = ["text/inverse"];
          } else if (variant === "error") {
            bgTerms = ["status/error"];
            textTerms = ["text/inverse"];
          }
          const bgVar = findVar(bgTerms, "COLOR");
          if (bgVar) {
            badge.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }, "color", bgVar)];
          } else {
            badge.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
          }
          if (variant === "neutral") {
            const borderVar = findVar(["border/default"], "COLOR");
            if (borderVar) {
              badge.strokes = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }, "color", borderVar)];
              badge.strokeWeight = 1;
            }
          }
          const textVar = findVar(textTerms, "COLOR");
          const iconSizeVar = atomVars["Badge/icon-size"];
          const iconLeft = yield createIconInstanceWithVar("IconLeft", iconSizeVar, textVar);
          iconLeft.visible = false;
          badge.appendChild(iconLeft);
          const text = figma.createText();
          yield figma.loadFontAsync({ family: "Inter", style: "Medium" });
          text.fontName = { family: "Inter", style: "Medium" };
          const labelMap = {
            neutral: "Label",
            primary: "New",
            success: "Success",
            warning: "Warning",
            error: "Error"
          };
          text.characters = labelMap[variant] || "Badge";
          const fontSizeVar = atomVars["Badge/font-size"];
          if (fontSizeVar) {
            text.setBoundVariable("fontSize", fontSizeVar);
          } else {
            text.fontSize = 14;
          }
          if (textVar) {
            text.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", textVar)];
          }
          badge.appendChild(text);
          const iconRight = yield createIconInstanceWithVar("IconRight", iconSizeVar, textVar);
          iconRight.visible = false;
          badge.appendChild(iconRight);
          const gapVar = atomVars["Badge/gap"];
          if (gapVar) {
            badge.setBoundVariable("itemSpacing", gapVar);
          } else {
            badge.itemSpacing = 4;
          }
          if (config.asComponents && badge.type === "COMPONENT") {
            const component = badge;
            const defaultLabel = text.characters;
            const propName = component.addComponentProperty("Text", "TEXT", defaultLabel);
            text.componentPropertyReferences = { characters: propName };
            const showIconLeftProp = component.addComponentProperty("showIconLeft", "BOOLEAN", false);
            iconLeft.componentPropertyReferences = { visible: showIconLeftProp };
            const showIconRightProp = component.addComponentProperty("showIconRight", "BOOLEAN", false);
            iconRight.componentPropertyReferences = { visible: showIconRightProp };
            if (iconLeft.type === "INSTANCE") {
              const mainCompLeft = yield iconLeft.getMainComponentAsync();
              if (mainCompLeft) {
                const swapLeftProp = component.addComponentProperty("SwapIconLeft", "INSTANCE_SWAP", mainCompLeft.id);
                iconLeft.componentPropertyReferences = __spreadProps(__spreadValues({}, iconLeft.componentPropertyReferences), {
                  mainComponent: swapLeftProp
                });
              }
            }
            if (iconRight.type === "INSTANCE") {
              const mainCompRight = yield iconRight.getMainComponentAsync();
              if (mainCompRight) {
                const swapRightProp = component.addComponentProperty("SwapIconRight", "INSTANCE_SWAP", mainCompRight.id);
                iconRight.componentPropertyReferences = __spreadProps(__spreadValues({}, iconRight.componentPropertyReferences), {
                  mainComponent: swapRightProp
                });
              }
            }
          }
          return badge;
        });
      }
      function createTypographyVariables(data) {
        return __async(this, null, function* () {
          try {
            const { families, weights, spacing, sizes, config } = data;
            const { collectionId, groupName } = config;
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            const collection = collections.find((c) => c.id === collectionId);
            if (!collection)
              throw new Error("Collection not found");
            const modeId = collection.defaultModeId;
            figma.ui.postMessage({ type: "progress-start", payload: "Creating Typography..." });
            const weightNames = {
              100: "Thin",
              200: "ExtraLight",
              300: "Light",
              400: "Regular",
              500: "Medium",
              600: "SemiBold",
              700: "Bold",
              800: "ExtraBold",
              900: "Black",
              950: "ExtraBlack"
            };
            const sizeNames = {
              8: "3xs",
              10: "2xs",
              12: "xs",
              14: "sm",
              16: "base",
              18: "lg",
              20: "xl",
              24: "2xl",
              30: "3xl",
              36: "4xl",
              48: "5xl",
              60: "6xl",
              72: "7xl"
            };
            const buildPath = (...parts) => {
              const safeGroup = groupName ? groupName.replace(/\./g, "_") : "";
              return [safeGroup, ...parts].filter(Boolean).join("/");
            };
            const allVars = yield figma.variables.getLocalVariablesAsync();
            const findOrCreate = (path, type) => __async(this, null, function* () {
              let variable = allVars.find((v) => v.variableCollectionId === collectionId && v.name === path);
              if (!variable) {
                variable = figma.variables.createVariable(path, collection, type);
              }
              return variable;
            });
            for (const [key, familyName] of Object.entries(families)) {
              if (!familyName)
                continue;
              const nameKey = key.charAt(0).toUpperCase() + key.slice(1);
              const path = buildPath("Font Family", nameKey);
              const variable = yield findOrCreate(path, "STRING");
              variable.setValueForMode(modeId, familyName);
            }
            for (const w of weights) {
              const humanName = weightNames[w] || String(w);
              const path = buildPath("Font Weight", humanName);
              const variable = yield findOrCreate(path, "FLOAT");
              variable.setValueForMode(modeId, w);
            }
            const letterSpacingNames = {
              [-6]: "ultra-tight",
              [-5]: "extra-tight",
              [-4]: "very-tight",
              [-3]: "tight",
              [-2]: "semi-tight",
              [-1]: "slightly-tight",
              [0]: "normal",
              [1]: "slightly-wide",
              [2]: "semi-wide",
              [3]: "wide",
              [4]: "very-wide",
              [5]: "extra-wide",
              [6]: "ultra-wide"
            };
            for (const s of spacing) {
              let humanName = letterSpacingNames[s];
              if (!humanName) {
                if (s < 0) {
                  humanName = `tight-${Math.abs(s)}`;
                } else if (s > 0) {
                  humanName = `wide-${s}`;
                } else {
                  humanName = "normal";
                }
              }
              const path = buildPath("Letter Spacing", humanName);
              const variable = yield findOrCreate(path, "FLOAT");
              const actualValue = s === 0 ? 0 : s / 100;
              variable.setValueForMode(modeId, actualValue);
            }
            if (sizes && sizes.length > 0) {
              for (const s of sizes) {
                const humanName = sizeNames[s] || String(s);
                const path = buildPath("Font Size", humanName);
                const variable = yield findOrCreate(path, "FLOAT");
                variable.setValueForMode(modeId, s);
              }
            }
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify("Typography variables created!");
          } catch (err) {
            console.error(err);
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify("Error: " + err.message);
          }
        });
      }
      function createSemanticTokens(config) {
        return __async(this, null, function* () {
          try {
            const { sourceCollectionId, measureGroup, typoGroup, targetName } = config;
            figma.ui.postMessage({ type: "progress-start", payload: "Creating Responsive Tokens..." });
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            let targetCollection = collections.find((c) => c.name === targetName);
            if (!targetCollection) {
              targetCollection = figma.variables.createVariableCollection(targetName);
            }
            if (targetCollection.modes.length > 0) {
              targetCollection.renameMode(targetCollection.modes[0].modeId, "Desktop");
            }
            const ensureMode = (name) => {
              const existing = targetCollection.modes.find((m) => m.name === name);
              if (existing)
                return existing.modeId;
              return targetCollection.addMode(name);
            };
            const desktopMode = targetCollection.modes.find((m) => m.name === "Desktop");
            if (!desktopMode)
              throw new Error("Desktop mode not found");
            const desktopId = desktopMode.modeId;
            const tabletId = ensureMode("Tablet");
            const mobileId = ensureMode("Mobile");
            const allVars = yield figma.variables.getLocalVariablesAsync();
            const findSource = (group, leafName) => {
              const paths = [
                `${group}/${leafName}`,
                `${group}/Font Size/${leafName}`,
                `${group}/Font Weight/${leafName}`
              ];
              for (const path of paths) {
                const found2 = allVars.find((v) => v.variableCollectionId === sourceCollectionId && v.name === path);
                if (found2)
                  return found2;
              }
              const leafLower = leafName.toLowerCase();
              const found = allVars.find(
                (v) => v.variableCollectionId === sourceCollectionId && v.name.toLowerCase().includes(group.toLowerCase()) && v.name.toLowerCase().endsWith("/" + leafLower)
              );
              if (found)
                return found;
              const foundFloat = allVars.find(
                (v) => v.variableCollectionId === sourceCollectionId && v.resolvedType === "FLOAT" && v.name.toLowerCase().endsWith("/" + leafLower)
              );
              if (foundFloat)
                return foundFloat;
              return void 0;
            };
            const findSourceOrNextLarger = (group, leafName) => {
              const exact = findSource(group, leafName);
              if (exact)
                return exact;
              const numMatch = leafName.match(/^(\d+(?:\.\d+)?)/);
              if (!numMatch)
                return void 0;
              const targetNum = parseFloat(numMatch[1]);
              const measureVars = allVars.filter(
                (v) => v.variableCollectionId === sourceCollectionId && v.resolvedType === "FLOAT" && v.name.startsWith(group + "/")
              );
              const candidates = [];
              for (const mv of measureVars) {
                const nameParts = mv.name.split("/");
                const lastPart = nameParts[nameParts.length - 1];
                const valMatch = lastPart.match(/^(\d+(?:\.\d+)?)/);
                if (valMatch) {
                  const val = parseFloat(valMatch[1]);
                  if (val >= targetNum) {
                    candidates.push({ variable: mv, value: val });
                  }
                }
              }
              candidates.sort((a, b) => a.value - b.value);
              return candidates.length > 0 ? candidates[0].variable : void 0;
            };
            const findOrCreateVar = (path) => __async(this, null, function* () {
              let v = allVars.find((varObj) => varObj.variableCollectionId === targetCollection.id && varObj.name === path);
              if (!v) {
                try {
                  v = figma.variables.createVariable(path, targetCollection, "FLOAT");
                  allVars.push(v);
                } catch (e) {
                  if (e.message && e.message.includes("duplicate variable name")) {
                    const freshVars = yield figma.variables.getLocalVariablesAsync();
                    v = freshVars.find((varObj) => varObj.variableCollectionId === targetCollection.id && varObj.name === path);
                    if (!v)
                      throw new Error(`Could not find or create variable ${path} (Duplicate Error)`);
                  } else {
                    throw e;
                  }
                }
              }
              return v;
            });
            const totalSteps = 13;
            let currentStep = 0;
            const updateProgress = (message) => __async(this, null, function* () {
              currentStep++;
              figma.ui.postMessage({
                type: "progress-update",
                payload: {
                  current: currentStep,
                  total: totalSteps,
                  message
                }
              });
              yield new Promise((resolve) => setTimeout(resolve, 50));
            });
            yield updateProgress("Creating letter-spacing aliases...");
            const letterSpacingMap = [
              { name: "Typography/Letter-Spacing/tighter", desktop: "very-tight", tablet: "tight", mobile: "semi-tight" },
              { name: "Typography/Letter-Spacing/tight", desktop: "semi-tight", tablet: "slightly-tight", mobile: "slightly-tight" },
              { name: "Typography/Letter-Spacing/normal", desktop: "normal", tablet: "normal", mobile: "normal" },
              { name: "Typography/Letter-Spacing/wide", desktop: "very-wide", tablet: "semi-wide", mobile: "slightly-wide" },
              { name: "Typography/Letter-Spacing/wider", desktop: "extra-wide", tablet: "very-wide", mobile: "wide" }
            ];
            for (const item of letterSpacingMap) {
              const v = yield findOrCreateVar(item.name);
              const setModeVal = (modeId, val) => {
                const sourceVar = findSource(typoGroup, val);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                }
              };
              setModeVal(desktopId, item.desktop);
              setModeVal(tabletId, item.tablet);
              setModeVal(mobileId, item.mobile);
            }
            yield updateProgress("Creating radius aliases...");
            const radiusMap = [
              { name: "Radius/none", desktop: "0px", tablet: "0px", mobile: "0px" },
              { name: "Radius/2xs", desktop: "2px", tablet: "2px", mobile: "2px" },
              { name: "Radius/xs", desktop: "4px", tablet: "4px", mobile: "2px" },
              { name: "Radius/sm", desktop: "6px", tablet: "4px", mobile: "4px" },
              { name: "Radius/md", desktop: "8px", tablet: "6px", mobile: "4px" },
              { name: "Radius/lg", desktop: "12px", tablet: "8px", mobile: "6px" },
              { name: "Radius/xl", desktop: "16px", tablet: "12px", mobile: "8px" },
              { name: "Radius/2xl", desktop: "24px", tablet: "16px", mobile: "12px" },
              { name: "Radius/3xl", desktop: "32px", tablet: "24px", mobile: "16px" },
              { name: "Radius/full", desktop: "full", tablet: "full", mobile: "full" }
              // Special case
            ];
            for (const item of radiusMap) {
              const v = yield findOrCreateVar(item.name);
              const setModeVal = (modeId, val) => {
                if (val === "full") {
                  v.setValueForMode(modeId, 9999);
                  return;
                }
                const sourceVar = findSource(measureGroup, val);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                } else {
                  const numVal = parseFloat(val) || 0;
                  v.setValueForMode(modeId, numVal);
                }
              };
              setModeVal(desktopId, item.desktop);
              setModeVal(tabletId, item.tablet);
              setModeVal(mobileId, item.mobile);
            }
            yield updateProgress("Creating border-width aliases...");
            const borderMap = [
              { name: "Border Width/none", desktop: "0px", tablet: "0px", mobile: "0px" },
              { name: "Border Width/hairline", desktop: "0_5px", tablet: "0_5px", mobile: "0_5px" },
              { name: "Border Width/thin", desktop: "1px", tablet: "1px", mobile: "1px" },
              { name: "Border Width/medium", desktop: "2px", tablet: "2px", mobile: "1px" },
              { name: "Border Width/thick", desktop: "4px", tablet: "2px", mobile: "2px" },
              { name: "Border Width/heavy", desktop: "8px", tablet: "4px", mobile: "2px" }
            ];
            for (const item of borderMap) {
              const v = yield findOrCreateVar(item.name);
              const setModeVal = (modeId, val) => {
                const sourceVar = findSource(measureGroup, val);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                }
              };
              setModeVal(desktopId, item.desktop);
              setModeVal(tabletId, item.tablet);
              setModeVal(mobileId, item.mobile);
            }
            yield updateProgress("Creating typography aliases...");
            const textMap = [
              // Headings
              { name: "Typography/Heading/h1", desktop: "5xl", tablet: "4xl", mobile: "3xl" },
              { name: "Typography/Heading/h2", desktop: "4xl", tablet: "3xl", mobile: "2xl" },
              { name: "Typography/Heading/h3", desktop: "3xl", tablet: "2xl", mobile: "xl" },
              { name: "Typography/Heading/h4", desktop: "2xl", tablet: "xl", mobile: "lg" },
              { name: "Typography/Heading/h5", desktop: "xl", tablet: "lg", mobile: "base" },
              { name: "Typography/Heading/h6", desktop: "lg", tablet: "base", mobile: "sm" },
              // Display
              { name: "Typography/Display/h1", desktop: "7xl", tablet: "6xl", mobile: "5xl" },
              { name: "Typography/Display/h2", desktop: "6xl", tablet: "5xl", mobile: "4xl" },
              // Body - All size variants for UI components (expanded for Atoms)
              { name: "Typography/Body/2xs", desktop: "2xs", tablet: "2xs", mobile: "2xs" },
              { name: "Typography/Body/xs", desktop: "xs", tablet: "2xs", mobile: "2xs" },
              { name: "Typography/Body/sm", desktop: "sm", tablet: "xs", mobile: "xs" },
              { name: "Typography/Body/base", desktop: "base", tablet: "sm", mobile: "sm" },
              { name: "Typography/Body/lg", desktop: "lg", tablet: "base", mobile: "base" },
              { name: "Typography/Body/xl", desktop: "xl", tablet: "lg", mobile: "lg" },
              { name: "Typography/Body/2xl", desktop: "2xl", tablet: "xl", mobile: "lg" },
              // UI / Label
              { name: "Typography/Label/lg", desktop: "base", tablet: "sm", mobile: "sm" },
              { name: "Typography/Label/base", desktop: "sm", tablet: "xs", mobile: "xs" },
              { name: "Typography/Label/sm", desktop: "xs", tablet: "2xs", mobile: "2xs" },
              // Code
              { name: "Typography/Code/base", desktop: "sm", tablet: "sm", mobile: "xs" }
            ];
            for (const item of textMap) {
              const v = yield findOrCreateVar(item.name);
              const setModeVal = (modeId, sizeName) => {
                const sourceVar = findSource(typoGroup, sizeName);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                }
              };
              setModeVal(desktopId, item.desktop);
              setModeVal(tabletId, item.tablet);
              setModeVal(mobileId, item.mobile);
            }
            yield updateProgress("Creating spacing/gap aliases...");
            const spaceMap = [
              { name: "Spacing/Gap/3xs", desktop: "2px", tablet: "2px", mobile: "1px" },
              { name: "Spacing/Gap/2xs", desktop: "4px", tablet: "4px", mobile: "2px" },
              { name: "Spacing/Gap/xs", desktop: "8px", tablet: "6px", mobile: "4px" },
              { name: "Spacing/Gap/sm", desktop: "12px", tablet: "10px", mobile: "8px" },
              { name: "Spacing/Gap/md", desktop: "16px", tablet: "14px", mobile: "12px" },
              { name: "Spacing/Gap/lg", desktop: "24px", tablet: "20px", mobile: "16px" },
              { name: "Spacing/Gap/xl", desktop: "32px", tablet: "28px", mobile: "24px" },
              { name: "Spacing/Gap/2xl", desktop: "48px", tablet: "40px", mobile: "32px" },
              { name: "Spacing/Gap/3xl", desktop: "64px", tablet: "56px", mobile: "48px" },
              { name: "Spacing/Gap/4xl", desktop: "96px", tablet: "80px", mobile: "64px" }
            ];
            for (const item of spaceMap) {
              const v = yield findOrCreateVar(item.name);
              const setSpaceMode = (modeId, val) => {
                const safeName = val.replace(".", "_");
                const sourceVar = findSource(measureGroup, safeName);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                }
              };
              setSpaceMode(desktopId, item.desktop);
              setSpaceMode(tabletId, item.tablet);
              setSpaceMode(mobileId, item.mobile);
            }
            yield updateProgress("Creating padding aliases...");
            const paddingScale = [
              { size: "3xs", desktop: "2px", tablet: "2px", mobile: "1px" },
              { size: "2xs", desktop: "4px", tablet: "4px", mobile: "2px" },
              { size: "xs", desktop: "8px", tablet: "6px", mobile: "4px" },
              { size: "sm", desktop: "12px", tablet: "10px", mobile: "8px" },
              { size: "md", desktop: "16px", tablet: "14px", mobile: "12px" },
              { size: "lg", desktop: "24px", tablet: "20px", mobile: "16px" },
              { size: "xl", desktop: "32px", tablet: "28px", mobile: "24px" },
              { size: "2xl", desktop: "48px", tablet: "40px", mobile: "32px" },
              { size: "3xl", desktop: "64px", tablet: "56px", mobile: "48px" },
              { size: "4xl", desktop: "96px", tablet: "80px", mobile: "64px" }
            ];
            const directions = ["top", "right", "bottom", "left"];
            for (const dir of directions) {
              for (const scale of paddingScale) {
                const v = yield findOrCreateVar(`Spacing/Padding/${dir}/${scale.size}`);
                const setMode = (modeId, val) => {
                  const safeName = val.replace(".", "_");
                  const sourceVar = findSource(measureGroup, safeName);
                  if (sourceVar) {
                    v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                  }
                };
                setMode(desktopId, scale.desktop);
                setMode(tabletId, scale.tablet);
                setMode(mobileId, scale.mobile);
              }
            }
            yield updateProgress("Creating margin aliases...");
            for (const dir of directions) {
              for (const scale of paddingScale) {
                const v = yield findOrCreateVar(`Spacing/Margin/${dir}/${scale.size}`);
                const setMode = (modeId, val) => {
                  const safeName = val.replace(".", "_");
                  const sourceVar = findSource(measureGroup, safeName);
                  if (sourceVar) {
                    v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                  }
                };
                setMode(desktopId, scale.desktop);
                setMode(tabletId, scale.tablet);
                setMode(mobileId, scale.mobile);
              }
            }
            yield updateProgress("Creating axis padding aliases...");
            const axes = ["x", "y"];
            for (const axis of axes) {
              for (const scale of paddingScale) {
                const v = yield findOrCreateVar(`Spacing/Padding/${axis}/${scale.size}`);
                const setMode = (modeId, val) => {
                  const safeName = val.replace(".", "_");
                  const sourceVar = findSource(measureGroup, safeName);
                  if (sourceVar) {
                    v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                  }
                };
                setMode(desktopId, scale.desktop);
                setMode(tabletId, scale.tablet);
                setMode(mobileId, scale.mobile);
              }
            }
            yield updateProgress("Creating axis margin aliases...");
            for (const axis of axes) {
              for (const scale of paddingScale) {
                const v = yield findOrCreateVar(`Spacing/Margin/${axis}/${scale.size}`);
                const setMode = (modeId, val) => {
                  const safeName = val.replace(".", "_");
                  const sourceVar = findSource(measureGroup, safeName);
                  if (sourceVar) {
                    v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                  }
                };
                setMode(desktopId, scale.desktop);
                setMode(tabletId, scale.tablet);
                setMode(mobileId, scale.mobile);
              }
            }
            yield updateProgress("Creating effects aliases...");
            const opacityMap = [
              { name: "Effects/Opacity/0", value: 0 },
              { name: "Effects/Opacity/5", value: 0.05 },
              { name: "Effects/Opacity/10", value: 0.1 },
              { name: "Effects/Opacity/25", value: 0.25 },
              { name: "Effects/Opacity/50", value: 0.5 },
              { name: "Effects/Opacity/75", value: 0.75 },
              { name: "Effects/Opacity/90", value: 0.9 },
              { name: "Effects/Opacity/95", value: 0.95 },
              { name: "Effects/Opacity/100", value: 1 }
            ];
            const blurMap = [
              { name: "Effects/Blur/none", value: 0 },
              { name: "Effects/Blur/sm", value: 4 },
              { name: "Effects/Blur/md", value: 8 },
              { name: "Effects/Blur/lg", value: 16 },
              { name: "Effects/Blur/xl", value: 24 },
              { name: "Effects/Blur/2xl", value: 40 }
            ];
            const durationMap = [
              { name: "Effects/Duration/instant", value: 0 },
              { name: "Effects/Duration/fast", value: 150 },
              { name: "Effects/Duration/normal", value: 300 },
              { name: "Effects/Duration/slow", value: 500 },
              { name: "Effects/Duration/slower", value: 700 }
            ];
            for (const item of textMap) {
              const v = yield findOrCreateVar(item.name);
              const setMode = (modeId, valName) => {
                const sourceVar = findSource(typoGroup, valName);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                  console.log(`\u2705 Linked ${item.name} \u2192 ${sourceVar.name}`);
                } else {
                  const fallbackVar = allVars.find(
                    (fv) => fv.variableCollectionId === sourceCollectionId && fv.name.toLowerCase().includes(valName.toLowerCase()) && fv.resolvedType === "FLOAT"
                  );
                  if (fallbackVar) {
                    v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: fallbackVar.id });
                    console.log(`\u2705 Fallback linked ${item.name} \u2192 ${fallbackVar.name}`);
                  } else {
                    console.warn(`\u26A0\uFE0F No source found for ${item.name} (looking for "${valName}" in ${typoGroup})`);
                  }
                }
              };
              setMode(desktopId, item.desktop);
              setMode(tabletId, item.tablet);
              setMode(mobileId, item.mobile);
            }
            const processGenericEffects = (map) => __async(this, null, function* () {
              for (const item of map) {
                let v = allVars.find((varObj) => varObj.variableCollectionId === targetCollection.id && varObj.name === item.name);
                if (!v)
                  v = figma.variables.createVariable(item.name, targetCollection, "FLOAT");
                v.setValueForMode(desktopId, item.value);
                v.setValueForMode(tabletId, item.value);
                v.setValueForMode(mobileId, item.value);
              }
            });
            yield processGenericEffects(opacityMap);
            yield processGenericEffects(durationMap);
            for (const item of blurMap) {
              let v = allVars.find((varObj) => varObj.variableCollectionId === targetCollection.id && varObj.name === item.name);
              if (!v)
                v = figma.variables.createVariable(item.name, targetCollection, "FLOAT");
              const safeName = `${item.value}px`.replace(".", "_");
              const sourceVar = findSource(measureGroup, safeName);
              if (sourceVar) {
                v.setValueForMode(desktopId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                v.setValueForMode(tabletId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                v.setValueForMode(mobileId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
              } else {
                v.setValueForMode(desktopId, item.value);
                v.setValueForMode(tabletId, item.value);
                v.setValueForMode(mobileId, item.value);
              }
            }
            for (const item of spaceMap) {
              const v = yield findOrCreateVar(item.name);
              const setSpaceMode = (modeId, val) => {
                const safeName = val.replace(".", "_");
                const sourceVar = findSource(measureGroup, safeName);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                }
              };
              setSpaceMode(desktopId, item.desktop);
              setSpaceMode(tabletId, item.tablet);
              setSpaceMode(mobileId, item.mobile);
            }
            yield updateProgress("Creating shadow aliases...");
            const shadowMap = [
              { name: "Effects/Shadow/xs", y: 1, blur: 2, spread: 0 },
              { name: "Effects/Shadow/sm", y: 1, blur: 3, spread: 0 },
              { name: "Effects/Shadow/md", y: 4, blur: 6, spread: -1 },
              { name: "Effects/Shadow/lg", y: 10, blur: 15, spread: -3 },
              { name: "Effects/Shadow/xl", y: 20, blur: 25, spread: -5 },
              { name: "Effects/Shadow/2xl", y: 25, blur: 50, spread: -12 }
            ];
            for (const shadow of shadowMap) {
              const createAttrVar = (attr, val) => __async(this, null, function* () {
                const path = `${shadow.name}/${attr}`;
                let v = yield findOrCreateVar(path);
                const safeName = `${Math.abs(val)}px`.replace(".", "_");
                const sourceVar = findSource(measureGroup, safeName);
                if (sourceVar) {
                  v.setValueForMode(desktopId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                  v.setValueForMode(tabletId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                  v.setValueForMode(mobileId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                } else {
                  v.setValueForMode(desktopId, val);
                  v.setValueForMode(tabletId, val);
                  v.setValueForMode(mobileId, val);
                }
              });
              yield createAttrVar("Y", shadow.y);
              yield createAttrVar("Blur", shadow.blur);
              yield createAttrVar("Spread", shadow.spread);
            }
            yield updateProgress("Creating icon-size aliases...");
            const iconSizeMap = [
              { name: "Icon-Size/sm", desktop: "16px", tablet: "14px", mobile: "12px" },
              { name: "Icon-Size/md", desktop: "20px", tablet: "18px", mobile: "16px" },
              { name: "Icon-Size/lg", desktop: "24px", tablet: "20px", mobile: "18px" },
              { name: "Icon-Size/xl", desktop: "32px", tablet: "28px", mobile: "24px" }
            ];
            for (const item of iconSizeMap) {
              const v = yield findOrCreateVar(item.name);
              const setIconSizeMode = (modeId, val) => {
                const sourceVar = findSourceOrNextLarger(measureGroup, val);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                } else {
                  const numVal = parseFloat(val) || 0;
                  v.setValueForMode(modeId, numVal);
                }
              };
              setIconSizeMode(desktopId, item.desktop);
              setIconSizeMode(tabletId, item.tablet);
              setIconSizeMode(mobileId, item.mobile);
            }
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify("Semantic tokens created successfully!");
            figma.ui.postMessage({ type: "aliases-created" });
          } catch (err) {
            console.error(err);
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify("Error: " + err.message);
          }
        });
      }
      function loadPalettes(collectionId, groupName) {
        return __async(this, null, function* () {
          try {
            const palettes = [];
            if (!collectionId) {
              figma.ui.postMessage({ type: "load-palettes", payload: [] });
              return;
            }
            const allVariables = yield figma.variables.getLocalVariablesAsync();
            const variables = allVariables.filter((v) => v.variableCollectionId === collectionId);
            const paletteNames = /* @__PURE__ */ new Set();
            const safeGroupName = (groupName == null ? void 0 : groupName.trim()) || "";
            variables.forEach((v) => {
              if (v.resolvedType === "COLOR" && v.name.includes("/")) {
                const name = v.name;
                if (safeGroupName) {
                  const prefix = safeGroupName + "/";
                  if (name.startsWith(prefix)) {
                    const parts = name.split("/");
                    if (parts.length >= 2) {
                      paletteNames.add(parts.slice(0, -1).join("/"));
                    }
                  }
                } else {
                  const parts = name.split("/");
                  if (parts.length >= 2) {
                    paletteNames.add(parts.slice(0, -1).join("/"));
                  }
                }
              }
            });
            paletteNames.forEach((name) => {
              palettes.push({ name, collectionId });
            });
            if (palettes.length === 0) {
              figma.notify(`\u26A0\uFE0F No palettes found in ${groupName ? "group" : "collection"}.`);
            }
            figma.ui.postMessage({ type: "load-palettes", payload: palettes });
          } catch (error) {
            console.error("Error loading palettes:", error);
            figma.notify("\u274C Error loading palettes: " + error.message);
            figma.ui.postMessage({ type: "load-palettes", payload: [] });
          }
        });
      }
      function extractPaletteColors(vars, allVarsMap) {
        const result = {};
        const resolveValue = (val) => {
          if (!val)
            return null;
          if (typeof val === "object" && "r" in val) {
            return rgbToHex(val).toUpperCase();
          }
          if (typeof val === "object" && "type" in val && val.type === "VARIABLE_ALIAS" && allVarsMap) {
            const target = allVarsMap[val.id];
            if (target) {
              const targetModeId = Object.keys(target.valuesByMode)[0];
              return resolveValue(target.valuesByMode[targetModeId]);
            }
          }
          return null;
        };
        vars.forEach((v) => {
          const safeName = v.name.trim();
          const match = safeName.match(/[\/\-\s_]([0-9]+)$/) || safeName.match(/([0-9]+)$/);
          if (match) {
            const scale = match[1];
            const modeId = Object.keys(v.valuesByMode)[0];
            const value = v.valuesByMode[modeId];
            const hex = resolveValue(value);
            if (hex)
              result[scale] = hex;
          }
        });
        return result;
      }
      function generateTheme(accentPalette, neutralPalette, statusPalettes, themeName, isRegenerate, _tokenOverrides) {
        return __async(this, null, function* () {
          try {
            const allVariables = yield figma.variables.getLocalVariablesAsync();
            const allVarsMap = {};
            allVariables.forEach((v) => allVarsMap[v.id] = v);
            const filterByPalette = (paletteName) => {
              if (!paletteName)
                return [];
              return allVariables.filter(
                (v) => v.resolvedType === "COLOR" && (v.name.startsWith(paletteName + "/") || v.name.startsWith(paletteName + "-") || v.name.startsWith(paletteName))
              );
            };
            const accentVars = filterByPalette(accentPalette);
            const neutralVars = filterByPalette(neutralPalette);
            const successVars = (statusPalettes == null ? void 0 : statusPalettes.success) ? filterByPalette(statusPalettes.success) : [];
            const warningVars = (statusPalettes == null ? void 0 : statusPalettes.warning) ? filterByPalette(statusPalettes.warning) : [];
            const errorVars = (statusPalettes == null ? void 0 : statusPalettes.error) ? filterByPalette(statusPalettes.error) : [];
            if (accentVars.length === 0 || neutralVars.length === 0) {
              figma.notify("\u274C Selected primary palettes not found");
              return;
            }
            const findVar = (vars, scale) => {
              const regex = new RegExp(`[\\/\\-\\s_]${scale}$`);
              return vars.find((v) => regex.test(v.name));
            };
            const map = { bgLight: "50", bgDark: "950", textLight: "900", textDark: "50", actionLight: "600", actionDark: "500" };
            const tokens = {};
            const TOKEN_SCHEMA = [
              // Backgrounds
              { name: "Background/primary", light: map.bgLight, dark: map.bgDark },
              { name: "Background/secondary", light: "100", dark: "800" },
              { name: "Background/tertiary", light: "200", dark: "700" },
              { name: "Background/brand", light: "100", dark: "900", useAccent: true },
              { name: "Background/inverse", light: "900", dark: "50" },
              // Text
              { name: "Text/primary", light: map.textLight, dark: map.textDark },
              { name: "Text/secondary", light: "700", dark: "300" },
              { name: "Text/tertiary", light: "600", dark: "400" },
              { name: "Text/brand", light: "700", dark: "300", useAccent: true },
              { name: "Text/link", light: "600", dark: "400", useAccent: true },
              { name: "Text/linkHover", light: "700", dark: "300", useAccent: true },
              { name: "Text/inverse", light: "50", dark: "900" },
              { name: "Text/disabled", light: "400", dark: "600" },
              { name: "Text/placeholder", light: "400", dark: "500" },
              // Surface
              { name: "Surface/primary", light: "50", dark: "900" },
              { name: "Surface/card", light: "50", dark: "800" },
              { name: "Surface/modal", light: "50", dark: "800" },
              { name: "Surface/overlay", light: "900", dark: "950" },
              { name: "Surface/elevated", light: "50", dark: "700" },
              { name: "Surface/hover", light: "100", dark: "750" },
              { name: "Surface/pressed", light: "200", dark: "700" },
              { name: "Surface/disabled", light: "100", dark: "800" },
              // Border
              { name: "Border/default", light: "200", dark: "700" },
              { name: "Border/subtle", light: "100", dark: "800" },
              { name: "Border/strong", light: "400", dark: "500" },
              { name: "Border/focus", light: "500", dark: "400", useAccent: true },
              { name: "Border/disabled", light: "200", dark: "700" },
              { name: "Border/error", light: "500", dark: "400", useStatus: "error" },
              { name: "Border/success", light: "500", dark: "400", useStatus: "success" },
              { name: "Border/warning", light: "500", dark: "400", useStatus: "warning" },
              // Action
              { name: "Action/primary", light: map.actionLight, dark: map.actionDark, useAccent: true },
              { name: "Action/primaryHover", light: "700", dark: "300", useAccent: true },
              { name: "Action/primaryActive", light: "800", dark: "200", useAccent: true },
              { name: "Action/primaryDisabled", light: "300", dark: "700", useAccent: true },
              { name: "Action/secondary", light: "100", dark: "800" },
              { name: "Action/secondaryHover", light: "200", dark: "700" },
              { name: "Action/ghost", light: "50", dark: "900" },
              { name: "Action/ghostHover", light: "100", dark: "800" },
              { name: "Action/destructive", light: "600", dark: "500", useStatus: "error" },
              { name: "Action/destructiveHover", light: "700", dark: "400", useStatus: "error" },
              // Status
              { name: "Status/success", light: "600", dark: "400", useStatus: "success" },
              { name: "Status/successBg", light: "50", dark: "900", useStatus: "success" },
              { name: "Status/warning", light: "600", dark: "400", useStatus: "warning" },
              { name: "Status/warningBg", light: "50", dark: "900", useStatus: "warning" },
              { name: "Status/error", light: "600", dark: "400", useStatus: "error" },
              { name: "Status/errorBg", light: "50", dark: "900", useStatus: "error" },
              { name: "Status/info", light: "600", dark: "400", useAccent: true },
              { name: "Status/infoBg", light: "50", dark: "900", useAccent: true },
              // Icons
              { name: "Icon/primary", light: "700", dark: "300" },
              { name: "Icon/secondary", light: "500", dark: "400" },
              { name: "Icon/brand", light: "600", dark: "400", useAccent: true },
              { name: "Icon/disabled", light: "300", dark: "600" },
              { name: "Icon/inverse", light: "50", dark: "900" },
              // Interactive (focus states)
              { name: "Interactive/focus", light: "500", dark: "400", useAccent: true },
              { name: "Interactive/focusRing", light: "400", dark: "500", useAccent: true }
            ];
            const resolveVar = (entry, mode) => {
              const scale = entry[mode];
              if (!scale)
                return null;
              let collection = neutralVars;
              if (entry.useAccent)
                collection = accentVars;
              else if (entry.useStatus === "success")
                collection = successVars;
              else if (entry.useStatus === "warning")
                collection = warningVars;
              else if (entry.useStatus === "error")
                collection = errorVars;
              let v = findVar(collection, scale);
              if (!v && mode === "light" && (scale === "0" || scale === "50")) {
                v = findVar(collection, "100") || findVar(collection, "200");
              }
              if (!v && mode === "dark" && (scale === "950" || scale === "900")) {
                v = findVar(collection, "800") || findVar(collection, "700");
              }
              return v || null;
            };
            for (const entry of TOKEN_SCHEMA) {
              const lightVar = resolveVar(entry, "light");
              const darkVar = resolveVar(entry, "dark");
              if (lightVar && darkVar) {
                const lightColor = lightVar.valuesByMode[Object.keys(lightVar.valuesByMode)[0]];
                const darkColor = darkVar.valuesByMode[Object.keys(darkVar.valuesByMode)[0]];
                tokens[entry.name] = {
                  light: { id: lightVar.id, name: lightVar.name, hex: rgbToHex(lightColor) },
                  dark: { id: darkVar.id, name: darkVar.name, hex: rgbToHex(darkColor) }
                };
              }
            }
            const paletteData = {
              accent: extractPaletteColors(accentVars, allVarsMap),
              neutral: extractPaletteColors(neutralVars, allVarsMap),
              success: extractPaletteColors(successVars, allVarsMap),
              warning: extractPaletteColors(warningVars, allVarsMap),
              error: extractPaletteColors(errorVars, allVarsMap)
            };
            const getPreviewData = (mode) => {
              const get = (name) => {
                const t = tokens[name];
                if (!t)
                  return mode === "light" ? "#ffffff" : "#1e1e1e";
                return mode === "light" ? t.light.hex : t.dark.hex;
              };
              return {
                bg: {
                  primary: get("Background/primary"),
                  secondary: get("Background/secondary"),
                  tertiary: get("Background/tertiary")
                },
                text: {
                  primary: get("Text/primary"),
                  secondary: get("Text/secondary"),
                  brand: get("Text/brand")
                },
                surface: {
                  card: get("Surface/card"),
                  modal: get("Surface/modal"),
                  overlay: get("Surface/overlay")
                },
                border: {
                  default: get("Border/default"),
                  focus: get("Border/focus"),
                  error: get("Border/error")
                },
                action: {
                  primary: get("Action/primary"),
                  primaryHover: get("Action/primaryHover"),
                  secondary: get("Action/secondary"),
                  destructive: get("Action/destructive")
                },
                status: {
                  success: get("Status/success"),
                  successBg: get("Status/successBg"),
                  warning: get("Status/warning"),
                  warningBg: get("Status/warningBg"),
                  error: get("Status/error"),
                  errorBg: get("Status/errorBg")
                }
              };
            };
            const messageType = isRegenerate ? "theme-regenerated" : "theme-generated";
            figma.ui.postMessage({
              type: messageType,
              payload: {
                themeName,
                tokens,
                validation: { passed: Object.keys(tokens).length, warnings: [] },
                accentPalette,
                neutralPalette,
                paletteData,
                preview: {
                  light: getPreviewData("light"),
                  dark: getPreviewData("dark")
                }
              }
            });
          } catch (error) {
            console.error("Generate Theme Error:", error);
            figma.notify("\u274C Error generating theme: " + error.message);
          }
        });
      }
      function createThemeCollection(themeData) {
        return __async(this, null, function* () {
          try {
            figma.ui.postMessage({ type: "progress-start", payload: "Creating Theme Collection..." });
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            let collection = collections.find((c) => c.name === themeData.themeName);
            if (!collection) {
              collection = figma.variables.createVariableCollection(themeData.themeName);
            }
            if (collection.modes.length > 0) {
              collection.renameMode(collection.modes[0].modeId, "Light");
            }
            const ensureMode = (name) => {
              const existing = collection.modes.find((m) => m.name === name);
              if (existing)
                return existing.modeId;
              return collection.addMode(name);
            };
            const lightMode = collection.modes.find((m) => m.name === "Light");
            if (!lightMode)
              throw new Error("Light mode not found");
            const lightId = lightMode.modeId;
            const darkId = ensureMode("Dark");
            const allVars = yield figma.variables.getLocalVariablesAsync();
            for (const [tokenName, token] of Object.entries(themeData.tokens)) {
              let variable = allVars.find((v) => v.variableCollectionId === collection.id && v.name === tokenName);
              if (!variable) {
                variable = figma.variables.createVariable(tokenName, collection, "COLOR");
              }
              if (token.light.id && !token.light.isSynthetic) {
                variable.setValueForMode(lightId, { type: "VARIABLE_ALIAS", id: token.light.id });
              } else {
                const hex = token.light.hex;
                const parsed = parseHex(hex);
                if (parsed)
                  variable.setValueForMode(lightId, parsed);
              }
              if (token.dark.id && !token.dark.isSynthetic) {
                variable.setValueForMode(darkId, { type: "VARIABLE_ALIAS", id: token.dark.id });
              } else {
                const hex = token.dark.hex;
                const parsed = parseHex(hex);
                if (parsed)
                  variable.setValueForMode(darkId, parsed);
              }
            }
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify(`Theme "${themeData.themeName}" created successfully! \u2705`);
            yield loadCollections();
          } catch (err) {
            console.error(err);
            figma.ui.postMessage({ type: "progress-end" });
            figma.notify("Error creating theme: " + err.message);
          }
        });
      }
      function loadThemeFromCollection(collectionId) {
        return __async(this, null, function* () {
          try {
            const collections = yield figma.variables.getLocalVariableCollectionsAsync();
            const collection = collections.find((c) => c.id === collectionId);
            if (!collection)
              throw new Error("Collection not found");
            const allVariables = yield figma.variables.getLocalVariablesAsync();
            const themeVars = allVariables.filter((v) => v.variableCollectionId === collectionId && v.resolvedType === "COLOR");
            const tokens = {};
            const allVarsMap = {};
            allVariables.forEach((v) => allVarsMap[v.id] = v);
            const lightMode = collection.modes.find((m) => m.name.toLowerCase().includes("light"));
            const darkMode = collection.modes.find((m) => m.name.toLowerCase().includes("dark"));
            if (!lightMode || !darkMode) {
              figma.notify("\u26A0\uFE0F Theme must have Light and Dark modes");
              return;
            }
            const referencedVarIds = /* @__PURE__ */ new Set();
            const sourceCollectionIds = /* @__PURE__ */ new Set();
            const tokenToSourcePath = {};
            for (const variable of themeVars) {
              const lightVal = variable.valuesByMode[lightMode.modeId];
              const darkVal = variable.valuesByMode[darkMode.modeId];
              const resolveToHex = (val, mode) => {
                if (!val)
                  return { hex: "#cccccc", name: "Unknown" };
                if (typeof val === "object" && "r" in val) {
                  return { hex: rgbToHex(val), name: "Direct" };
                }
                if (typeof val === "object" && "type" in val && val.type === "VARIABLE_ALIAS") {
                  referencedVarIds.add(val.id);
                  const target = allVarsMap[val.id];
                  if (target) {
                    sourceCollectionIds.add(target.variableCollectionId);
                    if (!tokenToSourcePath[variable.name]) {
                      tokenToSourcePath[variable.name] = { light: "", dark: "" };
                    }
                    tokenToSourcePath[variable.name][mode] = target.name;
                    const targetModeId = Object.keys(target.valuesByMode)[0];
                    const targetVal = target.valuesByMode[targetModeId];
                    if (typeof targetVal === "object" && "r" in targetVal) {
                      return { hex: rgbToHex(targetVal), name: target.name, id: target.id };
                    }
                  }
                }
                return { hex: "#cccccc", name: "Unknown" };
              };
              tokens[variable.name] = {
                light: resolveToHex(lightVal, "light"),
                dark: resolveToHex(darkVal, "dark")
              };
            }
            const availablePalettes = [];
            const paletteNames = /* @__PURE__ */ new Set();
            sourceCollectionIds.forEach((srcCollId) => {
              const srcVars = allVariables.filter((v) => v.variableCollectionId === srcCollId && v.resolvedType === "COLOR");
              srcVars.forEach((v) => {
                if (v.name.includes("/")) {
                  const parts = v.name.split("/");
                  if (parts.length >= 2) {
                    const palettePath = parts.slice(0, -1).join("/");
                    if (!paletteNames.has(palettePath)) {
                      paletteNames.add(palettePath);
                      availablePalettes.push({ name: palettePath, collectionId: srcCollId });
                    }
                  }
                }
              });
            });
            const paletteData = {
              accent: {},
              neutral: {},
              success: {},
              warning: {},
              error: {}
            };
            const extractPaletteColors2 = (paletteName) => {
              const colors = {};
              allVariables.forEach((v) => {
                if (v.name.startsWith(paletteName + "/") || v.name.startsWith(paletteName + "-")) {
                  const match = v.name.match(/[\/\-\s_]([0-9]+)$/);
                  if (match) {
                    const scale = match[1];
                    const modeId = Object.keys(v.valuesByMode)[0];
                    const value = v.valuesByMode[modeId];
                    if (typeof value === "object" && "r" in value) {
                      colors[scale] = rgbToHex(value).toUpperCase();
                    }
                  }
                }
              });
              return colors;
            };
            const detectedConfig = {
              accent: "",
              neutral: "",
              status: {
                success: "",
                warning: "",
                error: ""
              }
            };
            const paletteUsageCount = {};
            availablePalettes.forEach((p) => {
              paletteUsageCount[p.name] = { accent: 0, neutral: 0, success: 0, warning: 0, error: 0 };
            });
            Object.entries(tokenToSourcePath).forEach(([tokenName, sources]) => {
              const checkPath = (path) => {
                if (!path)
                  return;
                availablePalettes.forEach((p) => {
                  if (path.startsWith(p.name + "/") || path.startsWith(p.name + "-")) {
                    if (tokenName.startsWith("Status/success")) {
                      paletteUsageCount[p.name].success += 10;
                    } else if (tokenName.startsWith("Status/warning")) {
                      paletteUsageCount[p.name].warning += 10;
                    } else if (tokenName.startsWith("Status/error") || tokenName.startsWith("Action/destructive")) {
                      paletteUsageCount[p.name].error += 10;
                    } else if (tokenName.startsWith("Action/primary") || tokenName.startsWith("Text/brand") || tokenName.startsWith("Border/focus") || tokenName.startsWith("Text/link") || tokenName.startsWith("Background/brand") || tokenName.startsWith("Background/accent")) {
                      paletteUsageCount[p.name].accent += 5;
                    } else if (tokenName.startsWith("Background/primary") || tokenName.startsWith("Background/secondary") || tokenName.startsWith("Text/primary") || tokenName.startsWith("Text/secondary") || tokenName.startsWith("Surface/") || tokenName.startsWith("Border/default")) {
                      paletteUsageCount[p.name].neutral += 5;
                    } else if (tokenName.startsWith("Action/secondary")) {
                      paletteUsageCount[p.name].neutral += 3;
                    }
                  }
                });
              };
              checkPath(sources.light);
              checkPath(sources.dark);
            });
            availablePalettes.forEach((p) => {
              const lowerName = p.name.toLowerCase();
              if (lowerName.includes("gray") || lowerName.includes("grey") || lowerName.includes("slate") || lowerName.includes("zinc") || lowerName.includes("neutral") || lowerName.includes("stone") || lowerName.includes("cement") || lowerName.includes("silver")) {
                paletteUsageCount[p.name].neutral += 20;
              }
              if (lowerName.includes("brand") || lowerName.includes("primary") || lowerName.includes("accent") || lowerName.includes("blue") || lowerName.includes("indigo") || lowerName.includes("purple") || lowerName.includes("violet") || lowerName.includes("teal") || lowerName.includes("cyan")) {
                paletteUsageCount[p.name].accent += 15;
              }
              if (lowerName.includes("success") || lowerName.includes("green") || lowerName.includes("emerald")) {
                paletteUsageCount[p.name].success += 20;
              }
              if (lowerName.includes("warning") || lowerName.includes("yellow") || lowerName.includes("amber") || lowerName.includes("orange")) {
                paletteUsageCount[p.name].warning += 20;
              }
              if (lowerName.includes("error") || lowerName.includes("red") || lowerName.includes("danger") || lowerName.includes("rose")) {
                paletteUsageCount[p.name].error += 20;
              }
            });
            let maxAccent = 0, maxNeutral = 0, maxSuccess = 0, maxWarning = 0, maxError = 0;
            const usedPalettes = /* @__PURE__ */ new Set();
            Object.entries(paletteUsageCount).forEach(([paletteName, counts]) => {
              if (counts.success > maxSuccess) {
                maxSuccess = counts.success;
                detectedConfig.status.success = paletteName;
              }
              if (counts.warning > maxWarning) {
                maxWarning = counts.warning;
                detectedConfig.status.warning = paletteName;
              }
              if (counts.error > maxError) {
                maxError = counts.error;
                detectedConfig.status.error = paletteName;
              }
            });
            if (detectedConfig.status.success)
              usedPalettes.add(detectedConfig.status.success);
            if (detectedConfig.status.warning)
              usedPalettes.add(detectedConfig.status.warning);
            if (detectedConfig.status.error)
              usedPalettes.add(detectedConfig.status.error);
            Object.entries(paletteUsageCount).forEach(([paletteName, counts]) => {
              if (!usedPalettes.has(paletteName) && counts.neutral > maxNeutral) {
                maxNeutral = counts.neutral;
                detectedConfig.neutral = paletteName;
              }
            });
            if (detectedConfig.neutral)
              usedPalettes.add(detectedConfig.neutral);
            Object.entries(paletteUsageCount).forEach(([paletteName, counts]) => {
              if (!usedPalettes.has(paletteName) && counts.accent > maxAccent) {
                maxAccent = counts.accent;
                detectedConfig.accent = paletteName;
              }
            });
            if (!detectedConfig.accent) {
              let maxTotal = 0;
              Object.entries(paletteUsageCount).forEach(([paletteName, counts]) => {
                if (!usedPalettes.has(paletteName)) {
                  const total = counts.accent + counts.neutral;
                  if (total > maxTotal) {
                    maxTotal = total;
                    detectedConfig.accent = paletteName;
                  }
                }
              });
            }
            console.log("\u{1F50D} Palette usage counts:", paletteUsageCount);
            if (detectedConfig.accent)
              paletteData.accent = extractPaletteColors2(detectedConfig.accent);
            if (detectedConfig.neutral)
              paletteData.neutral = extractPaletteColors2(detectedConfig.neutral);
            if (detectedConfig.status.success)
              paletteData.success = extractPaletteColors2(detectedConfig.status.success);
            if (detectedConfig.status.warning)
              paletteData.warning = extractPaletteColors2(detectedConfig.status.warning);
            if (detectedConfig.status.error)
              paletteData.error = extractPaletteColors2(detectedConfig.status.error);
            const getPreviewData = (mode) => {
              const get = (name) => {
                const t = tokens[name];
                if (!t)
                  return mode === "light" ? "#ffffff" : "#1e1e1e";
                return mode === "light" ? t.light.hex : t.dark.hex;
              };
              return {
                bg: {
                  primary: get("Background/primary"),
                  secondary: get("Background/secondary"),
                  tertiary: get("Background/tertiary")
                },
                text: {
                  primary: get("Text/primary"),
                  secondary: get("Text/secondary"),
                  brand: get("Text/brand")
                },
                surface: {
                  card: get("Surface/card"),
                  modal: get("Surface/modal"),
                  overlay: get("Surface/overlay")
                },
                border: {
                  default: get("Border/default"),
                  focus: get("Border/focus"),
                  error: get("Border/error")
                },
                action: {
                  primary: get("Action/primary"),
                  primaryHover: get("Action/primaryHover"),
                  secondary: get("Action/secondary"),
                  destructive: get("Action/destructive")
                },
                status: {
                  success: get("Status/success"),
                  successBg: get("Status/successBg"),
                  warning: get("Status/warning"),
                  warningBg: get("Status/warningBg"),
                  error: get("Status/error"),
                  errorBg: get("Status/errorBg")
                }
              };
            };
            console.log("\u{1F4CA} Detected config:", detectedConfig);
            console.log("\u{1F4E6} Available palettes:", availablePalettes.length);
            console.log("\u{1F3A8} Palette data:", Object.keys(paletteData).map(
              (k) => `${k}(${Object.keys(paletteData[k]).length})`
            ).join(", "));
            figma.ui.postMessage({
              type: "theme-loaded-for-edit",
              payload: {
                themeName: collection.name,
                tokens,
                collectionId,
                paletteData,
                availablePalettes,
                detectedConfig,
                preview: {
                  light: getPreviewData("light"),
                  dark: getPreviewData("dark")
                }
              }
            });
          } catch (err) {
            console.error(err);
            figma.notify("Error loading theme: " + err.message);
          }
        });
      }
      function handleSelectionChange() {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
          figma.ui.postMessage({ type: "selection-color", payload: null });
          return;
        }
        const node = selection[0];
        if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
          const fill = node.fills[0];
          if (fill.type === "SOLID") {
            const { r, g, b } = fill.color;
            const hex = rgbToHex(r, g, b).toUpperCase();
            figma.ui.postMessage({ type: "selection-color", payload: { hex, r, g, b } });
            return;
          }
        }
        figma.ui.postMessage({ type: "selection-color", payload: null });
      }
      loadCollections();
      figma.ui.onmessage = (msg) => __async(exports, null, function* () {
        try {
          switch (msg.type) {
            case "load-collections":
              yield loadCollections();
              break;
            case "get-groups":
              yield getGroups(msg.collectionId);
              break;
            case "get-groups-for-tab1":
              yield getGroupsCustom(msg.collectionId, "load-groups-tab1");
              break;
            case "get-groups-for-tab2":
              yield getGroups(msg.collectionId, "tab2");
              break;
            case "get-groups-for-measures":
              yield getGroups(msg.collectionId, "measures");
              break;
            case "get-groups-for-typo":
              yield getGroupsCustom(msg.collectionId, "load-groups-typo");
              break;
            case "get-groups-for-typo-source":
              yield getGroupsCustom(msg.collectionId, "load-groups-typo-source");
              break;
            case "get-groups-for-alias":
              yield getGroupsCustom(msg.collectionId, "load-groups-alias");
              break;
            case "get-groups-for-theme":
              yield getGroupsCustom(msg.collectionId, "load-groups-theme");
              break;
            case "get-existing-palettes": {
              const collectionId = msg.collectionId;
              const groupName = msg.groupName;
              try {
                const collection = yield figma.variables.getVariableCollectionByIdAsync(collectionId);
                if (!collection) {
                  figma.ui.postMessage({ type: "existing-palettes-loaded", payload: {} });
                  return;
                }
                const variables = [];
                for (const id of collection.variableIds) {
                  const variable = yield figma.variables.getVariableByIdAsync(id);
                  if (variable && variable.resolvedType === "COLOR") {
                    variables.push(variable);
                  }
                }
                const filtered = groupName && groupName !== "" ? variables.filter((v) => v.name.startsWith(groupName + "/")) : variables;
                const palettes = {};
                for (const v of filtered) {
                  const parts = v.name.split("/");
                  const paletteName = parts.length >= 2 ? parts.slice(0, -1).join("/") : parts[0];
                  if (!palettes[paletteName]) {
                    palettes[paletteName] = [];
                  }
                  const modeId = Object.keys(v.valuesByMode)[0];
                  const value = v.valuesByMode[modeId];
                  let hexColor = "#000000";
                  if (value && typeof value === "object" && "r" in value) {
                    const r = Math.round(value.r * 255);
                    const g = Math.round(value.g * 255);
                    const b = Math.round(value.b * 255);
                    hexColor = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
                  }
                  palettes[paletteName].push({
                    name: v.name,
                    step: parts[parts.length - 1],
                    hex: hexColor
                  });
                }
                for (const paletteName in palettes) {
                  palettes[paletteName].sort((a, b) => {
                    const aNum = parseInt(a.step.split("-")[1] || "0");
                    const bNum = parseInt(b.step.split("-")[1] || "0");
                    return aNum - bNum;
                  });
                }
                figma.ui.postMessage({ type: "existing-palettes-loaded", payload: palettes });
              } catch (error) {
                console.error("Error loading existing palettes:", error);
                figma.ui.postMessage({ type: "existing-palettes-loaded", payload: {} });
              }
              break;
            }
            case "preview-scale": {
              const color = parseColor(msg.color);
              if (color) {
                const scale = calculateScale(color);
                const payload = {};
                for (const [k, v] of Object.entries(scale)) {
                  payload[parseInt(k)] = {
                    hex: rgbToHex(v.r, v.g, v.b).toUpperCase(),
                    r: v.r,
                    g: v.g,
                    b: v.b
                  };
                }
                figma.ui.postMessage({ type: "preview-scale-result", payload });
              }
              break;
            }
            case "preview-scale-batch": {
              const colors = msg.colors;
              const results = [];
              for (const item of colors) {
                const color = parseColor(item.hex);
                if (color) {
                  const scale = calculateScale(color);
                  const steps = {};
                  for (const [k, v] of Object.entries(scale)) {
                    steps[parseInt(k)] = {
                      hex: rgbToHex(v.r, v.g, v.b).toUpperCase(),
                      r: v.r,
                      g: v.g,
                      b: v.b
                    };
                  }
                  results.push({ name: item.name, steps });
                }
              }
              figma.ui.postMessage({ type: "preview-scale-batch-result", payload: results });
              break;
            }
            case "create-variables": {
              const color = parseColor(msg.baseColorHex);
              if (color) {
                const scale = calculateScale(color);
                yield createVariables(scale, msg.config);
              }
              break;
            }
            case "create-variables-batch": {
              const colors = msg.colors;
              const config = msg.config;
              try {
                figma.ui.postMessage({ type: "progress-start", payload: "Creating Color Variables..." });
                let targetCollectionId = config.collectionId;
                if (config.collectionName && !targetCollectionId) {
                  const newCollection = figma.variables.createVariableCollection(config.collectionName);
                  targetCollectionId = newCollection.id;
                  figma.notify(`Collection "${config.collectionName}" created! \u2705`);
                  yield loadCollections();
                }
                if (!targetCollectionId)
                  throw new Error("No collection specified");
                let createdCount = 0;
                for (const item of colors) {
                  if (!(item == null ? void 0 : item.hex))
                    continue;
                  const color = parseColor(item.hex);
                  if (color) {
                    figma.ui.postMessage({
                      type: "progress-update",
                      payload: {
                        current: createdCount + 1,
                        total: colors.length,
                        message: `Creating palette for ${item.name} (${createdCount + 1}/${colors.length})...`
                      }
                    });
                    const scale = calculateScale(color);
                    yield createVariables(scale, {
                      colorName: item.name,
                      collectionId: targetCollectionId,
                      groupName: config.groupName
                    });
                    createdCount++;
                    yield new Promise((resolve) => setTimeout(resolve, 100));
                  }
                }
                figma.ui.postMessage({ type: "progress-end" });
                figma.notify(`Created ${createdCount} Color Palettes successfully!`);
                figma.ui.postMessage({ type: "variables-created-success" });
              } catch (err) {
                console.error(err);
                figma.ui.postMessage({ type: "progress-end" });
                figma.notify("Error creating batch variables: " + err.message);
              }
              break;
            }
            case "get-selection-color":
              handleSelectionChange();
              break;
            case "create-measure-variables":
              yield createMeasureVariables(msg.values, msg.config);
              break;
            case "get-fonts":
              yield getUniqueFonts();
              break;
            case "create-typography":
              yield createTypographyVariables(msg);
              break;
            case "create-aliases":
              yield createSemanticTokens(msg.config);
              break;
            case "generate-atoms":
              yield generateAtomicComponents(msg.config);
              break;
            case "get-groups-for-devtools": {
              const collectionId = msg.collectionId;
              const vars = yield figma.variables.getLocalVariablesAsync();
              const groups = /* @__PURE__ */ new Set();
              vars.filter((v) => v.variableCollectionId === collectionId).forEach((v) => {
                const parts = v.name.split("/");
                if (parts.length > 1) {
                  groups.add(parts[0]);
                }
              });
              figma.ui.postMessage({ type: "load-groups-devtools", payload: Array.from(groups).sort() });
              break;
            }
            case "export-variables":
              yield exportVariables(
                msg.collectionId,
                msg.groupName,
                msg.options
              );
              break;
            case "load-palettes":
              yield loadPalettes(msg.collectionId, msg.groupName);
              break;
            case "load-existing-theme":
              yield loadThemeFromCollection(msg.collectionId);
              break;
            case "generate-theme":
            case "regenerate-theme":
              yield generateTheme(
                msg.accentPalette,
                msg.neutralPalette,
                msg.statusPalettes,
                msg.themeName,
                msg.type === "regenerate-theme" || msg.isRegenerate === true,
                msg.tokenOverrides
              );
              break;
            case "create-theme":
              yield createThemeCollection(msg.themeData);
              break;
            case "import-icons":
              yield importIconsFromSvg(
                msg.icons,
                msg.options
              );
              break;
            case "scan-existing-icons":
              yield scanExistingIcons(msg.prefix);
              break;
            case "delete-icons":
              yield deleteIcons(msg.iconIds);
              break;
            case "add-icons-to-library":
              yield addIconsToLibrary(
                msg.icons,
                msg.options,
                msg.libraryFrameId
              );
              break;
            case "resize-window":
              figma.ui.resize(msg.width, msg.height);
              break;
            case "convert-json": {
              const collectionId = msg.collectionId;
              const groupName = msg.groupName;
              console.log("\u{1F4DA} Converting JSON for collection:", collectionId, "group:", groupName);
              try {
                const collection = yield figma.variables.getVariableCollectionByIdAsync(collectionId);
                if (!collection) {
                  console.error("Collection not found:", collectionId);
                  figma.notify("Collection not found");
                  figma.ui.postMessage({ type: "conversion-result", payload: [] });
                  return;
                }
                console.log("\u{1F4DA} Collection found:", collection.name, "with", collection.variableIds.length, "variables");
                const variables = [];
                for (const id of collection.variableIds) {
                  const variable = yield figma.variables.getVariableByIdAsync(id);
                  if (variable) {
                    variables.push(variable);
                  }
                }
                console.log("\u{1F4DA} Loaded", variables.length, "variables");
                const filtered = groupName && groupName !== "" ? variables.filter((v) => v.name.startsWith(groupName + "/")) : variables;
                console.log("\u{1F4DA} Filtered to", filtered.length, "variables");
                const palettes = {};
                const otherVars = [];
                for (const v of filtered) {
                  if (v.resolvedType === "COLOR") {
                    const parts = v.name.split("/");
                    const paletteName = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
                    if (!palettes[paletteName]) {
                      palettes[paletteName] = [];
                    }
                    const modeId = Object.keys(v.valuesByMode)[0];
                    const value = v.valuesByMode[modeId];
                    let hexColor = "#000000";
                    if (value && typeof value === "object" && "r" in value) {
                      const r = Math.round(value.r * 255);
                      const g = Math.round(value.g * 255);
                      const b = Math.round(value.b * 255);
                      hexColor = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
                    }
                    palettes[paletteName].push({
                      name: v.name,
                      step: parts[parts.length - 1],
                      // e.g., "Indigo-500"
                      hex: hexColor,
                      type: "COLOR"
                    });
                  } else {
                    otherVars.push({
                      name: v.name,
                      type: v.resolvedType,
                      id: v.id
                    });
                  }
                }
                for (const paletteName in palettes) {
                  palettes[paletteName].sort((a, b) => {
                    const aNum = parseInt(a.step.split("-")[1] || "0");
                    const bNum = parseInt(b.step.split("-")[1] || "0");
                    return aNum - bNum;
                  });
                }
                figma.ui.postMessage({
                  type: "conversion-result",
                  payload: {
                    palettes,
                    other: otherVars
                  }
                });
                console.log("\u{1F4DA} Sent", Object.keys(palettes).length, "palettes and", otherVars.length, "other variables to UI");
              } catch (error) {
                console.error("Error converting JSON:", error);
                figma.notify("Error loading variables: " + error.message);
                figma.ui.postMessage({ type: "conversion-result", payload: [] });
              }
              break;
            }
            case "load-text-styles": {
              try {
                const textStyles = yield figma.getLocalTextStylesAsync();
                const stylesList = textStyles.map((style) => ({
                  id: style.id,
                  name: style.name
                }));
                figma.ui.postMessage({ type: "load-text-styles", payload: stylesList });
                console.log("\u{1F4DA} Loaded", stylesList.length, "text styles");
              } catch (error) {
                console.error("Error loading text styles:", error);
              }
              break;
            }
            case "generate-canvas": {
              const collectionId = msg.collectionId;
              const groupFilter = msg.groupName;
              try {
                figma.ui.postMessage({ type: "progress-start", payload: "Initializing..." });
                yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                yield figma.loadFontAsync({ family: "Inter", style: "Bold" });
                yield figma.loadFontAsync({ family: "Inter", style: "Medium" });
                const collection = yield figma.variables.getVariableCollectionByIdAsync(collectionId);
                if (!collection)
                  throw new Error("Collection not found");
                figma.ui.postMessage({ type: "progress-update", payload: "Fetching variables..." });
                const allVariables = yield figma.variables.getLocalVariablesAsync();
                let collectionVariables = allVariables.filter(
                  (v) => v.variableCollectionId === collectionId && v.resolvedType === "COLOR"
                );
                if (groupFilter) {
                  collectionVariables = collectionVariables.filter((v) => v.name.startsWith(groupFilter + "/"));
                }
                figma.ui.postMessage({ type: "progress-update", payload: "Preparing component..." });
                const component = yield getOrCreateColorCardComponent();
                const modeId = collection.defaultModeId;
                const groups = {};
                for (const variable of collectionVariables) {
                  const parts = variable.name.split("/");
                  const grpName = parts.length > 1 ? parts.slice(0, -1).join("/") : "Uncategorized";
                  if (!groups[grpName])
                    groups[grpName] = [];
                  groups[grpName].push(variable);
                }
                const mainContainer = figma.createFrame();
                mainContainer.name = collection.name;
                mainContainer.layoutMode = "VERTICAL";
                mainContainer.itemSpacing = 40;
                mainContainer.paddingLeft = 40;
                mainContainer.paddingRight = 40;
                mainContainer.paddingTop = 80;
                mainContainer.paddingBottom = 80;
                mainContainer.fills = [{ type: "SOLID", color: { r: 0.12, g: 0.12, b: 0.12 } }];
                mainContainer.cornerRadius = 32;
                mainContainer.primaryAxisSizingMode = "AUTO";
                mainContainer.counterAxisSizingMode = "AUTO";
                const title = figma.createText();
                title.characters = collection.name;
                title.fontSize = 48;
                title.fontName = { family: "Inter", style: "Bold" };
                title.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                mainContainer.appendChild(title);
                const getHue = (r, g, b) => {
                  const max = Math.max(r, g, b), min = Math.min(r, g, b);
                  let h = 0;
                  if (max === min)
                    return 0;
                  const d = max - min;
                  switch (max) {
                    case r:
                      h = (g - b) / d + (g < b ? 6 : 0);
                      break;
                    case g:
                      h = (b - r) / d + 2;
                      break;
                    case b:
                      h = (r - g) / d + 4;
                      break;
                  }
                  return h * 60;
                };
                const groupsWithHue = Object.keys(groups).map((grpName) => {
                  const vars = groups[grpName];
                  let maxSat = -1;
                  let bestHue = 0;
                  for (const v of vars) {
                    const val = v.valuesByMode[modeId];
                    if (val && typeof val === "object" && "r" in val) {
                      const { r, g, b } = val;
                      const hue = getHue(r, g, b);
                      const max = Math.max(r, g, b), min = Math.min(r, g, b);
                      const sat = max === 0 ? 0 : (max - min) / max;
                      if (sat > maxSat) {
                        maxSat = sat;
                        bestHue = hue;
                      }
                    }
                  }
                  const lowerName = grpName.toLowerCase();
                  const neutralKeywords = ["gray", "grey", "slate", "zinc", "stone", "neutral", "cement", "silver", "ash", "sand"];
                  const isNeutral = neutralKeywords.some((kw) => lowerName.includes(kw));
                  if (isNeutral || maxSat < 0.1)
                    bestHue = 1e3;
                  return { name: grpName, hue: bestHue };
                });
                groupsWithHue.sort((a, b) => a.hue - b.hue);
                const sortedGroupNames = groupsWithHue.map((g) => g.name);
                let totalProcessed = 0;
                for (const grpName of sortedGroupNames) {
                  figma.ui.postMessage({ type: "progress-update", payload: `Processing group: ${grpName}...` });
                  const variablesInGroup = groups[grpName];
                  const variablesWithLum = variablesInGroup.map((v) => {
                    const value = v.valuesByMode[modeId];
                    let lum = 0;
                    if (value && typeof value === "object" && "r" in value) {
                      const { r, g, b } = value;
                      lum = getLuminance(r, g, b);
                    }
                    return { variable: v, lum };
                  });
                  variablesWithLum.sort((a, b) => b.lum - a.lum);
                  const groupFrame = figma.createFrame();
                  groupFrame.name = grpName;
                  groupFrame.layoutMode = "VERTICAL";
                  groupFrame.itemSpacing = 24;
                  groupFrame.fills = [];
                  groupFrame.primaryAxisSizingMode = "AUTO";
                  groupFrame.counterAxisSizingMode = "AUTO";
                  mainContainer.appendChild(groupFrame);
                  const groupTitle = figma.createText();
                  groupTitle.characters = grpName;
                  groupTitle.fontSize = 24;
                  groupTitle.fontName = { family: "Inter", style: "Bold" };
                  groupTitle.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                  groupFrame.appendChild(groupTitle);
                  const rowFrame = figma.createFrame();
                  rowFrame.name = "Colors";
                  rowFrame.layoutMode = "HORIZONTAL";
                  rowFrame.itemSpacing = 16;
                  rowFrame.fills = [];
                  rowFrame.primaryAxisSizingMode = "AUTO";
                  rowFrame.counterAxisSizingMode = "AUTO";
                  groupFrame.appendChild(rowFrame);
                  for (const item of variablesWithLum) {
                    const variable = item.variable;
                    const value = variable.valuesByMode[modeId];
                    if (value && typeof value === "object" && "r" in value) {
                      const { r, g, b, a } = value;
                      const hex = rgbToHex(r, g, b);
                      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${(a !== void 0 ? a : 1).toFixed(2)})`;
                      const oklch = rgbToOklchString(r, g, b);
                      const p3 = rgbToP3(r, g, b);
                      const parts = variable.name.split("/");
                      const leaf = parts.pop() || "";
                      let varName = slugify(leaf);
                      if (/^\d/.test(varName)) {
                        const group = parts.pop();
                        varName = slugify(`${group}-${leaf}`);
                      }
                      const cssVar = `var(--${varName})`;
                      const luminance = item.lum;
                      const contrastWhite = getContrastRatio(luminance, 1);
                      const contrastBlack = getContrastRatio(luminance, 0);
                      const ratingsWhite = getWCAGRating(contrastWhite);
                      const ratingsBlack = getWCAGRating(contrastBlack);
                      const textColor = contrastWhite > contrastBlack ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 };
                      const instance = component.createInstance();
                      rowFrame.appendChild(instance);
                      instance.fills = [{ type: "SOLID", color: { r, g, b }, opacity: a }];
                      const setText = (name, text) => __async(exports, null, function* () {
                        const node = instance.children.find((n) => n.name === name);
                        if (node && node.type === "TEXT") {
                          try {
                            yield figma.loadFontAsync(node.fontName);
                            node.characters = text;
                            node.fills = [{ type: "SOLID", color: textColor }];
                          } catch (err) {
                            console.error(`Error setting text for ${name}:`, err);
                          }
                        }
                      });
                      yield setText("Name", variable.name.split("/").pop() || "");
                      yield setText("CSS Var", cssVar);
                      yield setText("Hex", hex.toUpperCase());
                      yield setText("RGBA", rgba);
                      yield setText("OKLCH", oklch);
                      yield setText("P3", p3);
                      yield setText("Lum", `L: ${luminance.toFixed(3)}`);
                      const wRating = ratingsWhite.includes("Fail") ? "Fail" : ratingsWhite[0];
                      const bRating = ratingsBlack.includes("Fail") ? "Fail" : ratingsBlack[0];
                      yield setText("WCAG White", `White: ${wRating} (${contrastWhite.toFixed(2)})`);
                      yield setText("WCAG Black", `Black: ${bRating} (${contrastBlack.toFixed(2)})`);
                    }
                    totalProcessed++;
                  }
                }
                if (totalProcessed === 0) {
                  figma.notify("\u26A0\uFE0F No colors found to document in this collection.");
                } else {
                  figma.viewport.scrollAndZoomIntoView([mainContainer]);
                  figma.notify(`Generated ${totalProcessed} advanced color cards!`);
                }
                figma.ui.postMessage({ type: "progress-end", payload: "Done" });
              } catch (error) {
                console.error("Error generating canvas:", error);
                figma.ui.postMessage({ type: "progress-end", payload: "Error" });
                figma.notify("Error: " + error.message);
              }
              break;
            }
            default:
              console.warn("Unknown message type:", msg.type);
          }
        } catch (error) {
          console.error("Error handling message:", error);
          figma.notify("Error: " + error.message);
        }
      });
      figma.on("selectionchange", handleSelectionChange);
    }
  });
  require_main();
})();
