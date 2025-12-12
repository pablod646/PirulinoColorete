"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
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
            for (const s of spacing) {
              const safeName = s.toString().replace(/\./g, "_").replace("%", "");
              const path = buildPath("Letter Spacing", safeName);
              const variable = yield findOrCreate(path, "FLOAT");
              variable.setValueForMode(modeId, s);
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
                const found = allVars.find((v) => v.variableCollectionId === sourceCollectionId && v.name === path);
                if (found)
                  return found;
              }
              return void 0;
            };
            const findOrCreateVar = (path) => __async(this, null, function* () {
              let v = allVars.find((varObj) => varObj.variableCollectionId === targetCollection.id && varObj.name === path);
              if (!v)
                v = figma.variables.createVariable(path, targetCollection, "FLOAT");
              return v;
            });
            const textMap = [
              // Micro text
              { name: "Typography/Label", desktop: "xs", tablet: "xs", mobile: "xs" },
              { name: "Typography/Overline", desktop: "2xs", tablet: "2xs", mobile: "2xs" },
              { name: "Typography/Caption", desktop: "xs", tablet: "xs", mobile: "xs" },
              // Body text
              { name: "Typography/Body/s", desktop: "sm", tablet: "sm", mobile: "sm" },
              { name: "Typography/Body/m", desktop: "base", tablet: "base", mobile: "base" },
              { name: "Typography/Body/l", desktop: "lg", tablet: "lg", mobile: "lg" },
              // Code text (for mono font contexts)
              { name: "Typography/Code/inline", desktop: "sm", tablet: "sm", mobile: "xs" },
              { name: "Typography/Code/block", desktop: "sm", tablet: "sm", mobile: "xs" },
              // Quote
              { name: "Typography/Quote", desktop: "lg", tablet: "base", mobile: "base" },
              // Headings
              { name: "Typography/Heading/h6", desktop: "lg", tablet: "base", mobile: "base" },
              { name: "Typography/Heading/h5", desktop: "xl", tablet: "lg", mobile: "base" },
              { name: "Typography/Heading/h4", desktop: "2xl", tablet: "xl", mobile: "lg" },
              { name: "Typography/Heading/h3", desktop: "3xl", tablet: "2xl", mobile: "xl" },
              { name: "Typography/Heading/h2", desktop: "4xl", tablet: "3xl", mobile: "2xl" },
              { name: "Typography/Heading/h1", desktop: "5xl", tablet: "4xl", mobile: "3xl" },
              // Display (hero text)
              { name: "Typography/Display/h2", desktop: "6xl", tablet: "5xl", mobile: "4xl" },
              { name: "Typography/Display/h1", desktop: "7xl", tablet: "6xl", mobile: "5xl" }
            ];
            const spaceMap = [
              // Gaps
              { name: "Spacing/Gap/3xs", desktop: "2px", tablet: "2px", mobile: "2px" },
              { name: "Spacing/Gap/2xs", desktop: "4px", tablet: "2px", mobile: "2px" },
              { name: "Spacing/Gap/xs", desktop: "8px", tablet: "4px", mobile: "4px" },
              { name: "Spacing/Gap/s", desktop: "16px", tablet: "12px", mobile: "8px" },
              { name: "Spacing/Gap/m", desktop: "24px", tablet: "20px", mobile: "16px" },
              { name: "Spacing/Gap/l", desktop: "32px", tablet: "24px", mobile: "20px" },
              { name: "Spacing/Gap/xl", desktop: "48px", tablet: "32px", mobile: "24px" },
              { name: "Spacing/Gap/2xl", desktop: "64px", tablet: "48px", mobile: "32px" },
              // Padding
              { name: "Spacing/Padding/xs", desktop: "8px", tablet: "4px", mobile: "4px" },
              { name: "Spacing/Padding/sm", desktop: "16px", tablet: "12px", mobile: "8px" },
              { name: "Spacing/Padding/md", desktop: "24px", tablet: "16px", mobile: "12px" },
              { name: "Spacing/Padding/lg", desktop: "32px", tablet: "24px", mobile: "16px" },
              { name: "Spacing/Padding/xl", desktop: "48px", tablet: "32px", mobile: "24px" },
              // Radius
              { name: "Spacing/Radius/xs", desktop: "2px", tablet: "2px", mobile: "2px" },
              { name: "Spacing/Radius/s", desktop: "4px", tablet: "4px", mobile: "2px" },
              { name: "Spacing/Radius/m", desktop: "8px", tablet: "8px", mobile: "4px" },
              { name: "Spacing/Radius/l", desktop: "12px", tablet: "12px", mobile: "8px" },
              { name: "Spacing/Radius/xl", desktop: "16px", tablet: "16px", mobile: "12px" },
              // Border Width
              { name: "Spacing/Border/thin", desktop: "1px", tablet: "1px", mobile: "1px" },
              { name: "Spacing/Border/medium", desktop: "2px", tablet: "2px", mobile: "2px" },
              { name: "Spacing/Border/thick", desktop: "4px", tablet: "4px", mobile: "4px" },
              // Section Spacing (for larger layout gaps)
              { name: "Spacing/Section/sm", desktop: "48px", tablet: "32px", mobile: "24px" },
              { name: "Spacing/Section/md", desktop: "64px", tablet: "48px", mobile: "32px" },
              { name: "Spacing/Section/lg", desktop: "96px", tablet: "64px", mobile: "48px" }
            ];
            const lineHeightMap = [
              { name: "Typography/Leading/none", value: 1 },
              { name: "Typography/Leading/tight", value: 1.25 },
              { name: "Typography/Leading/snug", value: 1.375 },
              { name: "Typography/Leading/normal", value: 1.5 },
              { name: "Typography/Leading/relaxed", value: 1.625 },
              { name: "Typography/Leading/loose", value: 2 }
            ];
            const fontWeightMap = [
              { name: "Typography/Weight/normal", source: "Regular" },
              { name: "Typography/Weight/medium", source: "Medium" },
              { name: "Typography/Weight/semibold", source: "SemiBold" },
              { name: "Typography/Weight/bold", source: "Bold" }
            ];
            for (const item of textMap) {
              const v = yield findOrCreateVar(item.name);
              const setMode = (modeId, valName) => {
                const sourceVar = findSource(typoGroup, valName);
                if (sourceVar) {
                  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                }
              };
              setMode(desktopId, item.desktop);
              setMode(tabletId, item.tablet);
              setMode(mobileId, item.mobile);
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
            for (const item of lineHeightMap) {
              let v = allVars.find((varObj) => varObj.variableCollectionId === targetCollection.id && varObj.name === item.name);
              if (!v)
                v = figma.variables.createVariable(item.name, targetCollection, "FLOAT");
              v.setValueForMode(desktopId, item.value);
              v.setValueForMode(tabletId, item.value);
              v.setValueForMode(mobileId, item.value);
            }
            for (const item of fontWeightMap) {
              const sourceVar = findSource(typoGroup, item.source);
              if (sourceVar) {
                const v = yield findOrCreateVar(item.name);
                v.setValueForMode(desktopId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                v.setValueForMode(tabletId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                v.setValueForMode(mobileId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
              }
            }
            const fontFamilyMap = [
              { name: "Typography/Font/heading", source: "Heading" },
              { name: "Typography/Font/body", source: "Body" },
              { name: "Typography/Font/code", source: "Code" }
            ];
            for (const item of fontFamilyMap) {
              const fontPath = `${typoGroup}/Font Family/${item.source}`;
              const sourceVar = allVars.find((v) => v.variableCollectionId === sourceCollectionId && v.name === fontPath);
              if (sourceVar) {
                let v = allVars.find((varObj) => varObj.variableCollectionId === targetCollection.id && varObj.name === item.name);
                if (!v)
                  v = figma.variables.createVariable(item.name, targetCollection, "STRING");
                v.setValueForMode(desktopId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                v.setValueForMode(tabletId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
                v.setValueForMode(mobileId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
              }
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
                    yield new Promise((resolve) => setTimeout(resolve, 50));
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
