/**
 * PirulinoColorete - Design Architect
 * Complete TypeScript Backend
 * 
 * This file contains all the plugin logic for the Figma plugin.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ColorRGB {
    r: number;
    g: number;
    b: number;
}

interface OKLCH {
    l: number;
    c: number;
    h: number;
}

interface ColorScale {
    [step: number]: ColorRGB;
}

interface ColorVariableConfig {
    colorName: string;
    collectionId: string;
    collectionName?: string;
    groupName?: string;
}

interface MeasureVariableConfig {
    collectionId: string;
    groupName?: string;
}

interface TypographyData {
    families: Record<string, string>;
    weights: number[];
    spacing: number[];
    sizes: number[];
    config: {
        collectionId: string;
        groupName?: string;
    };
}

interface AliasConfig {
    sourceCollectionId: string;
    measureGroup: string;
    typoGroup: string;
    targetName: string;
}

interface ThemeToken {
    light: { id?: string; name: string; hex: string; isSynthetic?: boolean };
    dark: { id?: string; name: string; hex: string; isSynthetic?: boolean };
    source?: string;
}

interface TokenOverride {
    light?: string;
    dark?: string;
}

interface ThemeData {
    themeName: string;
    tokens: Record<string, ThemeToken>;
    validation?: { passed: number; warnings: string[] };
    accentPalette?: string;
    neutralPalette?: string;
    paletteData?: Record<string, Record<string, string>>;
    preview?: {
        light: PreviewData;
        dark: PreviewData;
    };
}

interface PreviewData {
    bg: Record<string, string>;
    text: Record<string, string>;
    surface: Record<string, string>;
    border: Record<string, string>;
    action: Record<string, string>;
    status: Record<string, string>;
}

interface PluginMessage {
    type: string;
    [key: string]: unknown;
}

interface ExportOptions {
    format: 'json' | 'css' | 'scss' | 'tailwind' | 'typescript';
    naming: 'kebab' | 'camel' | 'snake' | 'original';
    colorFormat: 'hex' | 'rgba' | 'hsl' | 'oklch' | 'p3';
    includeModes: boolean;
    resolveRefs: boolean;
    includeMetadata: boolean;
}

// ============================================
// PLUGIN INITIALIZATION
// ============================================

console.clear();

figma.showUI(__html__, {
    width: 1200,
    height: 800,
    themeColors: true,
    title: 'PirulinoColorete - Design Architect'
});

// ============================================
// COLOR UTILITIES
// ============================================

function parseColor(input: string): ColorRGB | null {
    const str = input.trim().toLowerCase();

    if (str.startsWith('#')) {
        return parseHex(str);
    }

    const match = str.match(/^([a-z]+)\((.+)\)$/);
    if (match) {
        const type = match[1];
        const params = match[2].split(/[,\s/]+/).filter(x => x.length > 0);

        if ((type === 'rgb' || type === 'rgba') && params.length >= 3) {
            return parseRgbParams(params);
        }

        if (type === 'oklch' && params.length >= 3) {
            return parseOklchParams(params);
        }
    }

    return null;
}

function parseHex(hex: string): ColorRGB | null {
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

function parseRgbParams(params: string[]): ColorRGB {
    const getValue = (raw: string): number => {
        const val = parseFloat(raw);
        if (raw.includes('%')) return (val / 100) * 255;
        return val;
    };

    return {
        r: getValue(params[0]) / 255,
        g: getValue(params[1]) / 255,
        b: getValue(params[2]) / 255
    };
}

function parseOklchParams(params: string[]): ColorRGB {
    let L = parseFloat(params[0]);
    if (params[0].includes('%') && L > 1) L = L / 100;
    const C = parseFloat(params[1]);
    const H = parseFloat(params[2]);
    return oklchToRgb(L, C, H);
}

function oklchToRgb(l: number, c: number, h: number): ColorRGB {
    const hRad = h * (Math.PI / 180);
    const L = l;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLinear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const srgbTransfer = (val: number): number => {
        if (val <= 0.0031308) return 12.92 * val;
        return 1.055 * Math.pow(val, 1.0 / 2.4) - 0.055;
    };

    return {
        r: Math.max(0, Math.min(1, srgbTransfer(rLinear))),
        g: Math.max(0, Math.min(1, srgbTransfer(gLinear))),
        b: Math.max(0, Math.min(1, srgbTransfer(bLinear)))
    };
}

function rgbToOklch(r: number, g: number, b: number): OKLCH {
    const srgbInverseTransfer = (val: number): number => {
        if (val <= 0.04045) return val / 12.92;
        return Math.pow((val + 0.055) / 1.055, 2.4);
    };

    const rLin = srgbInverseTransfer(r);
    const gLin = srgbInverseTransfer(g);
    const bLin = srgbInverseTransfer(b);

    const l = Math.cbrt(0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin);
    const m = Math.cbrt(0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin);
    const s = Math.cbrt(0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin);

    const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

    const C = Math.sqrt(a * a + bVal * bVal);
    let H = Math.atan2(bVal, a) * (180 / Math.PI);
    if (H < 0) H += 360;

    return { l: L, c: C, h: H };
}

function rgbToHex(r: number | ColorRGB, g?: number, b?: number): string {
    let rVal: number, gVal: number, bVal: number;

    if (typeof r === 'object') {
        rVal = r.r;
        gVal = r.g;
        bVal = r.b;
    } else {
        rVal = r;
        gVal = g!;
        bVal = b!;
    }

    const toHex = (val: number): string => {
        const hex = Math.round(Math.max(0, Math.min(1, val)) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(rVal)}${toHex(gVal)}${toHex(bVal)}`;
}

function rgbToOklchString(r: number, g: number, b: number): string {
    const { l, c, h } = rgbToOklch(r, g, b);
    return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
}

// ============================================
// COLOR SCALE GENERATION
// ============================================

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function calculateScale(baseColor: ColorRGB): ColorScale {
    const base = rgbToOklch(baseColor.r, baseColor.g, baseColor.b);

    const targetL: Record<number, number> = {
        50: 0.975,
        500: base.l,
        950: 0.28
    };

    const chromaFactors: Record<number, number> = {
        50: 0.08, 100: 0.20, 200: 0.45, 300: 0.75, 400: 0.92,
        500: 1.0, 600: 0.92, 700: 0.80, 800: 0.65, 900: 0.50, 950: 0.40
    };

    const getLightness = (step: number): number => {
        if (step === 500) return base.l;
        if (step < 500) {
            const t = (step - 50) / 450;
            return targetL[50] * (1 - t) + base.l * t;
        } else {
            const t = (step - 500) / 450;
            return base.l * (1 - t) + targetL[950] * t;
        }
    };

    const scale: ColorScale = {};
    for (const step of SCALE_STEPS) {
        const l = getLightness(step);
        const c = base.c * chromaFactors[step];
        scale[step] = oklchToRgb(l, c, base.h);
    }

    return scale;
}

// ============================================
// ACCESSIBILITY UTILITIES
// ============================================

function getLuminance(r: number, g: number, b: number): number {
    const toLinear = (v: number): number => {
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(lum1: number, lum2: number): number {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

function getWCAGRating(ratio: number): string[] {
    if (ratio >= 7) return ['AAA', 'AA'];
    if (ratio >= 4.5) return ['AA'];
    if (ratio >= 3) return ['AA Large'];
    return ['Fail'];
}

function slugify(text: string): string {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function rgbToP3(r: number, g: number, b: number): string {
    const linearize = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const lr = linearize(r);
    const lg = linearize(g);
    const lb = linearize(b);

    const X = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
    const Y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
    const Z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;

    const p3r_lin = 2.4934969 * X - 0.9313836 * Y - 0.4027107 * Z;
    const p3g_lin = -0.8294889 * X + 1.7626640 * Y + 0.0236246 * Z;
    const p3b_lin = 0.0358458 * X - 0.0761723 * Y + 0.9568845 * Z;

    const gamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055);

    const p3r = Math.max(0, Math.min(1, gamma(p3r_lin)));
    const p3g = Math.max(0, Math.min(1, gamma(p3g_lin)));
    const p3b = Math.max(0, Math.min(1, gamma(p3b_lin)));

    return `color(display-p3 ${p3r.toFixed(3)} ${p3g.toFixed(3)} ${p3b.toFixed(3)})`;
}

// ============================================
// COLOR CARD COMPONENT
// ============================================

async function getOrCreateColorCardComponent(): Promise<ComponentNode> {
    const componentName = "Color Card v7";
    const existing = figma.currentPage.findOne(n => n.type === "COMPONENT" && n.name === componentName) as ComponentNode | null;

    if (existing) {
        const hasP3 = existing.children.find(n => n.name === "P3");
        if (hasP3) return existing;
        existing.remove();
    }

    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

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
    component.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.5, b: 0.9 } }];
    component.cornerRadius = 16;

    const createText = (name: string, fontSize: number, fontStyle: string): TextNode => {
        const t = figma.createText();
        t.name = name;
        t.fontName = { family: "Inter", style: fontStyle };
        t.fontSize = fontSize;
        t.characters = name;
        t.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
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
}

// ============================================
// COLLECTION MANAGEMENT
// ============================================

async function loadCollections(): Promise<void> {
    try {
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        const payload = collections.map(c => ({ id: c.id, name: c.name }));
        figma.ui.postMessage({ type: 'load-collections', payload });
    } catch (error) {
        console.error('Error loading collections:', error);
    }
}

async function getGroups(collectionId: string, mode: string = 'tab1'): Promise<void> {
    try {
        const allVariables = await figma.variables.getLocalVariablesAsync();
        const collectionVariables = allVariables.filter(v => v.variableCollectionId === collectionId);

        const groupSet = new Set<string>();
        collectionVariables.forEach(v => {
            const parts = v.name.split('/');
            if (parts.length > 1) {
                groupSet.add(parts[0]);
            }
        });

        const payload = Array.from(groupSet).sort();

        const typeMap: Record<string, string> = {
            'tab2': 'load-groups-tab2',
            'measures': 'load-groups-measures',
            'tab1': 'load-groups'
        };

        figma.ui.postMessage({ type: typeMap[mode] || 'load-groups', payload });
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function getGroupsCustom(collectionId: string, returnEventType: string): Promise<void> {
    try {
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;

        const vars = await figma.variables.getLocalVariablesAsync();
        const groupNames = new Set<string>();

        vars.filter(v => v.variableCollectionId === collectionId).forEach(v => {
            if (v.name.includes('/')) {
                groupNames.add(v.name.split('/')[0]);
            }
        });

        figma.ui.postMessage({ type: returnEventType, payload: Array.from(groupNames).sort() });
    } catch (err) {
        console.error(err);
    }
}

async function getUniqueFonts(): Promise<void> {
    try {
        const fonts = await figma.listAvailableFontsAsync();
        const families = new Set(fonts.map(f => f.fontName.family));
        figma.ui.postMessage({ type: 'load-fonts', payload: Array.from(families).sort() });
    } catch (err) {
        console.error('Error loading fonts:', err);
        figma.notify('Error loading fonts: ' + (err as Error).message);
    }
}

// ============================================
// VARIABLE CREATION
// ============================================

async function createVariables(scale: ColorScale, config: ColorVariableConfig): Promise<void> {
    try {
        const { colorName, collectionId, groupName } = config;
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) throw new Error('Collection not found');

        const modeId = collection.defaultModeId;
        figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Variables...' });

        const allVars = await figma.variables.getLocalVariablesAsync();

        for (const [step, color] of Object.entries(scale)) {
            const fullPath = groupName
                ? `${groupName}/${colorName}/${colorName}-${step}`
                : `${colorName}/${colorName}-${step}`;

            let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === fullPath);
            if (!variable) {
                variable = figma.variables.createVariable(fullPath, collection, 'COLOR');
            }
            variable.setValueForMode(modeId, color);
        }

        figma.ui.postMessage({ type: 'variables-created-success' });
        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify(`Created variables for ${colorName} successfully!`);
    } catch (err) {
        console.error(err);
        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify('Error creating variables: ' + (err as Error).message);
    }
}

async function createMeasureVariables(values: number[], config: MeasureVariableConfig): Promise<void> {
    try {
        const { collectionId, groupName } = config;
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) throw new Error('Collection not found');

        const modeId = collection.defaultModeId;
        figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Measures...' });

        const allVars = await figma.variables.getLocalVariablesAsync();

        for (const value of values) {
            const safeValueStr = value.toString().replace('.', '_');
            const name = `${safeValueStr}px`;
            const safeGroupName = groupName ? groupName.replace(/\./g, '_') : '';
            const fullPath = safeGroupName ? `${safeGroupName}/${name}` : name;

            let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === fullPath);
            if (!variable) {
                variable = figma.variables.createVariable(fullPath, collection, 'FLOAT');
            }
            variable.setValueForMode(modeId, value);
        }

        figma.ui.postMessage({ type: 'measures-created-success' });
        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify(`Created ${values.length} measure variables!`);
    } catch (err) {
        console.error(err);
        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify('Error creating measures: ' + (err as Error).message);
    }
}

// ============================================
// EXPORT VARIABLES FUNCTION
// ============================================

async function exportVariables(
    collectionId: string | null,
    groupName: string | null,
    options: ExportOptions
): Promise<void> {
    try {
        figma.ui.postMessage({ type: 'progress-start', payload: 'Exporting variables...' });

        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        const allVariables = await figma.variables.getLocalVariablesAsync();

        // Filter by collection if specified
        let targetCollections = collections;
        if (collectionId) {
            targetCollections = collections.filter(c => c.id === collectionId);
        }

        // Gather all variables with their collection and mode info
        interface ExportVar {
            name: string;
            type: string;
            collection: string;
            values: Record<string, unknown>;
            isAlias: boolean;
            aliasPath?: string;
            description?: string;
        }

        const exportVars: ExportVar[] = [];

        for (const collection of targetCollections) {
            const collectionVars = allVariables.filter(v => v.variableCollectionId === collection.id);

            // Filter by group if specified
            const filtered = groupName
                ? collectionVars.filter(v => v.name.startsWith(groupName + '/') || v.name === groupName)
                : collectionVars;

            for (const variable of filtered) {
                const values: Record<string, unknown> = {};
                let isAlias = false;
                let aliasPath: string | undefined;

                for (const mode of collection.modes) {
                    const rawValue = variable.valuesByMode[mode.modeId];

                    // Check if it's an alias
                    if (rawValue && typeof rawValue === 'object' && 'type' in rawValue && rawValue.type === 'VARIABLE_ALIAS') {
                        isAlias = true;
                        if (options.resolveRefs) {
                            // Resolve the alias to its actual value
                            const aliasVar = allVariables.find(v => v.id === (rawValue as { id: string }).id);
                            if (aliasVar) {
                                aliasPath = aliasVar.name;
                                const aliasValue = aliasVar.valuesByMode[Object.keys(aliasVar.valuesByMode)[0]];
                                values[mode.name] = formatValue(aliasValue, variable.resolvedType, options.colorFormat);
                            }
                        } else {
                            // Keep as reference
                            const aliasVar = allVariables.find(v => v.id === (rawValue as { id: string }).id);
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
                        description: variable.description || undefined
                    });
                } else {
                    // Only include default mode value
                    const defaultMode = collection.modes[0]?.name;
                    if (defaultMode && values[defaultMode] !== undefined) {
                        exportVars.push({
                            name: variable.name,
                            type: variable.resolvedType,
                            collection: collection.name,
                            values: { default: values[defaultMode] },
                            isAlias,
                            aliasPath,
                            description: variable.description || undefined
                        });
                    }
                }
            }
        }

        // Format output based on selected format
        let output: string;

        switch (options.format) {
            case 'json':
                output = formatAsJSON(exportVars, options);
                break;
            case 'css':
                output = formatAsCSS(exportVars, options);
                break;
            case 'scss':
                output = formatAsSCSS(exportVars, options);
                break;
            case 'tailwind':
                output = formatAsTailwind(exportVars, options);
                break;
            case 'typescript':
                output = formatAsTypeScript(exportVars, options);
                break;
            default:
                output = formatAsJSON(exportVars, options);
        }

        figma.ui.postMessage({
            type: 'export-variables-result',
            payload: {
                output,
                count: exportVars.length,
                format: options.format
            }
        });

        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify(`Exported ${exportVars.length} variables!`);

    } catch (err) {
        console.error('Export error:', err);
        figma.ui.postMessage({ type: 'progress-end' });
        figma.ui.postMessage({
            type: 'export-variables-result',
            payload: { output: `// Error: ${(err as Error).message}`, count: 0, format: options.format }
        });
        figma.notify('Error exporting: ' + (err as Error).message);
    }
}

function formatValue(value: unknown, type: string, colorFormat: string = 'hex'): unknown {
    if (value === null || value === undefined) return null;

    if (type === 'COLOR' && typeof value === 'object' && 'r' in value) {
        const c = value as { r: number; g: number; b: number; a?: number };
        const alpha = c.a !== undefined ? c.a : 1;

        switch (colorFormat) {
            case 'hex':
                return rgbToHex(c.r, c.g, c.b);

            case 'rgba':
                return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha.toFixed(2)})`;

            case 'hsl': {
                // Convert RGB to HSL
                const max = Math.max(c.r, c.g, c.b);
                const min = Math.min(c.r, c.g, c.b);
                const l = (max + min) / 2;
                let h = 0, s = 0;

                if (max !== min) {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case c.r: h = ((c.g - c.b) / d + (c.g < c.b ? 6 : 0)) / 6; break;
                        case c.g: h = ((c.b - c.r) / d + 2) / 6; break;
                        case c.b: h = ((c.r - c.g) / d + 4) / 6; break;
                    }
                }

                if (alpha < 1) {
                    return `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${alpha.toFixed(2)})`;
                }
                return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
            }

            case 'oklch':
                return rgbToOklchString(c.r, c.g, c.b);

            case 'p3':
                return rgbToP3(c.r, c.g, c.b);

            default:
                return rgbToHex(c.r, c.g, c.b);
        }
    }

    return value;
}

function transformName(name: string, convention: string): string {
    // Build name from all path parts: group-subgroup-name
    // e.g., "Typography/Font Family/Heading" -> "typography-font-family-heading"
    // e.g., "Colors/Teal/Teal-500" -> "color-teal-500" (dedupe when leaf starts with parent)
    const parts = name.split('/');

    // Process parts: remove trailing 's' from first part, deduplicate adjacent similar names
    const processedParts: string[] = [];

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];

        // Remove trailing 's' from first part (category): "Colors" -> "Color"
        if (i === 0 && part.endsWith('s') && part.length > 1) {
            part = part.slice(0, -1);
        }

        // Skip if this part is redundantly included in the next part
        // e.g., skip "Teal" if next part is "Teal-500"
        if (i < parts.length - 1) {
            const nextPart = parts[i + 1].toLowerCase();
            const currentLower = part.toLowerCase();
            if (nextPart.startsWith(currentLower + '-') || nextPart.startsWith(currentLower + '_')) {
                continue; // Skip this part, it's redundant
            }
        }

        processedParts.push(part);
    }

    const combinedName = processedParts.join('-');

    switch (convention) {
        case 'kebab':
            return combinedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        case 'camel':
            return combinedName
                .split(/[^a-zA-Z0-9]+/)
                .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
        case 'snake':
            return combinedName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        default:
            return combinedName;
    }
}

function formatAsJSON(vars: Array<{ name: string; type: string; collection: string; values: Record<string, unknown>; description?: string }>, options: ExportOptions): string {
    const result: Record<string, unknown> = {};

    for (const v of vars) {
        const key = transformName(v.name, options.naming);
        const entry: Record<string, unknown> = {};

        // If single mode or not including modes, flatten
        const modeKeys = Object.keys(v.values);
        if (modeKeys.length === 1) {
            entry.value = v.values[modeKeys[0]];
        } else {
            entry.values = v.values;
        }

        if (options.includeMetadata) {
            entry.type = v.type.toLowerCase();
            if (v.description) entry.description = v.description;
        }

        result[key] = Object.keys(entry).length === 1 && 'value' in entry ? entry.value : entry;
    }

    return JSON.stringify(result, null, 2);
}

function formatAsCSS(vars: Array<{ name: string; values: Record<string, unknown> }>, options: ExportOptions): string {
    const lines: string[] = [];
    const byMode: Record<string, string[]> = {};

    for (const v of vars) {
        const varName = `--${transformName(v.name, options.naming)}`;

        for (const [mode, value] of Object.entries(v.values)) {
            if (!byMode[mode]) byMode[mode] = [];
            byMode[mode].push(`  ${varName}: ${value};`);
        }
    }

    // Output by mode
    for (const [mode, cssVars] of Object.entries(byMode)) {
        if (mode === 'default' || mode === 'Desktop' || Object.keys(byMode).length === 1) {
            lines.push(':root {');
            lines.push(...cssVars);
            lines.push('}');
        } else {
            const selector = mode.toLowerCase() === 'dark' ? '[data-theme="dark"]' : `[data-mode="${mode.toLowerCase()}"]`;
            lines.push('');
            lines.push(`${selector} {`);
            lines.push(...cssVars);
            lines.push('}');
        }
    }

    return lines.join('\n');
}

function formatAsSCSS(vars: Array<{ name: string; values: Record<string, unknown> }>, options: ExportOptions): string {
    const lines: string[] = ['// Design Tokens - Generated by PirulinoColorete', ''];

    for (const v of vars) {
        const varName = `$${transformName(v.name, options.naming)}`;
        const modeKeys = Object.keys(v.values);

        if (modeKeys.length === 1) {
            lines.push(`${varName}: ${v.values[modeKeys[0]]};`);
        } else {
            // Create a map for multi-mode variables
            lines.push(`${varName}: (`);
            for (const [mode, value] of Object.entries(v.values)) {
                lines.push(`  ${mode.toLowerCase()}: ${value},`);
            }
            lines.push(');');
        }
    }

    return lines.join('\n');
}

function formatAsTailwind(vars: Array<{ name: string; type: string; values: Record<string, unknown> }>, options: ExportOptions): string {
    const colors: Record<string, unknown> = {};
    const spacing: Record<string, unknown> = {};
    const fontSize: Record<string, unknown> = {};
    const borderRadius: Record<string, unknown> = {};
    const borderWidth: Record<string, unknown> = {};
    const other: Record<string, unknown> = {};

    for (const v of vars) {
        const key = transformName(v.name, options.naming);
        const value = Object.values(v.values)[0]; // Use first mode value
        const nameLower = v.name.toLowerCase();

        if (v.type === 'COLOR') {
            colors[key] = value;
        } else if (nameLower.includes('spacing') || nameLower.includes('gap') || nameLower.includes('padding')) {
            spacing[key] = typeof value === 'number' ? `${value}px` : value;
        } else if (nameLower.includes('font-size') || nameLower.includes('size')) {
            fontSize[key] = typeof value === 'number' ? `${value}px` : value;
        } else if (nameLower.includes('radius')) {
            borderRadius[key] = typeof value === 'number' ? `${value}px` : value;
        } else if (nameLower.includes('border') && nameLower.includes('width')) {
            borderWidth[key] = typeof value === 'number' ? `${value}px` : value;
        } else {
            other[key] = value;
        }
    }

    const config: Record<string, unknown> = {
        theme: {
            extend: {}
        }
    };

    const extend = config.theme as { extend: Record<string, unknown> };
    if (Object.keys(colors).length) extend.extend.colors = colors;
    if (Object.keys(spacing).length) extend.extend.spacing = spacing;
    if (Object.keys(fontSize).length) extend.extend.fontSize = fontSize;
    if (Object.keys(borderRadius).length) extend.extend.borderRadius = borderRadius;
    if (Object.keys(borderWidth).length) extend.extend.borderWidth = borderWidth;

    return `// tailwind.config.js\nmodule.exports = ${JSON.stringify(config, null, 2)}`;
}

function formatAsTypeScript(vars: Array<{ name: string; type: string; values: Record<string, unknown>; description?: string }>, options: ExportOptions): string {
    const lines: string[] = ['// Design Tokens - Generated by PirulinoColorete', ''];

    lines.push('export const tokens = {');

    for (const v of vars) {
        const key = transformName(v.name, options.naming);
        const modeKeys = Object.keys(v.values);
        const value = modeKeys.length === 1 ? v.values[modeKeys[0]] : v.values;

        if (v.description && options.includeMetadata) {
            lines.push(`  /** ${v.description} */`);
        }

        const valueStr = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
        lines.push(`  ${key}: ${valueStr},`);
    }

    lines.push('} as const;');
    lines.push('');
    lines.push('export type TokenKey = keyof typeof tokens;');

    return lines.join('\n');
}

async function createTypographyVariables(data: TypographyData): Promise<void> {
    try {
        const { families, weights, spacing, sizes, config } = data;
        const { collectionId, groupName } = config;

        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) throw new Error('Collection not found');

        const modeId = collection.defaultModeId;
        figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Typography...' });

        const weightNames: Record<number, string> = {
            100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular',
            500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold',
            900: 'Black', 950: 'ExtraBlack'
        };

        const sizeNames: Record<number, string> = {
            8: '3xs', 10: '2xs', 12: 'xs', 14: 'sm', 16: 'base',
            18: 'lg', 20: 'xl', 24: '2xl', 30: '3xl', 36: '4xl',
            48: '5xl', 60: '6xl', 72: '7xl'
        };

        const buildPath = (...parts: (string | undefined)[]): string => {
            const safeGroup = groupName ? groupName.replace(/\./g, '_') : '';
            return [safeGroup, ...parts].filter(Boolean).join('/');
        };

        const allVars = await figma.variables.getLocalVariablesAsync();

        const findOrCreate = async (path: string, type: VariableResolvedDataType): Promise<Variable> => {
            let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === path);
            if (!variable) {
                variable = figma.variables.createVariable(path, collection, type);
            }
            return variable;
        };

        // Font Families
        for (const [key, familyName] of Object.entries(families)) {
            if (!familyName) continue;
            const nameKey = key.charAt(0).toUpperCase() + key.slice(1);
            const path = buildPath('Font Family', nameKey);
            const variable = await findOrCreate(path, 'STRING');
            variable.setValueForMode(modeId, familyName);
        }

        // Font Weights
        for (const w of weights) {
            const humanName = weightNames[w] || String(w);
            const path = buildPath('Font Weight', humanName);
            const variable = await findOrCreate(path, 'FLOAT');
            variable.setValueForMode(modeId, w);
        }

        // Letter Spacing - Use semantic names
        // 0 = normal, negative = tighter, positive = wider
        const letterSpacingNames: Record<number, string> = {
            [-6]: 'ultra-tight',
            [-5]: 'extra-tight',
            [-4]: 'very-tight',
            [-3]: 'tight',
            [-2]: 'semi-tight',
            [-1]: 'slightly-tight',
            [0]: 'normal',
            [1]: 'slightly-wide',
            [2]: 'semi-wide',
            [3]: 'wide',
            [4]: 'very-wide',
            [5]: 'extra-wide',
            [6]: 'ultra-wide',
        };

        for (const s of spacing) {
            // Use semantic name if available, else fallback to descriptive pattern
            let humanName = letterSpacingNames[s];
            if (!humanName) {
                if (s < 0) {
                    humanName = `tight-${Math.abs(s)}`;
                } else if (s > 0) {
                    humanName = `wide-${s}`;
                } else {
                    humanName = 'normal';
                }
            }
            const path = buildPath('Letter Spacing', humanName);
            const variable = await findOrCreate(path, 'FLOAT');
            // Convert percentage to decimal (e.g., 5 -> 0.05), 0 stays 0
            const actualValue = s === 0 ? 0 : s / 100;
            variable.setValueForMode(modeId, actualValue);
        }

        // Font Sizes
        if (sizes && sizes.length > 0) {
            for (const s of sizes) {
                const humanName = sizeNames[s] || String(s);
                const path = buildPath('Font Size', humanName);
                const variable = await findOrCreate(path, 'FLOAT');
                variable.setValueForMode(modeId, s);
            }
        }

        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify('Typography variables created!');
    } catch (err) {
        console.error(err);
        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify('Error: ' + (err as Error).message);
    }
}

// ============================================
// SEMANTIC TOKENS / ALIASES
// ============================================

async function createSemanticTokens(config: AliasConfig): Promise<void> {
    try {
        const { sourceCollectionId, measureGroup, typoGroup, targetName } = config;
        figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Responsive Tokens...' });

        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        let targetCollection = collections.find(c => c.name === targetName);

        if (!targetCollection) {
            targetCollection = figma.variables.createVariableCollection(targetName);
        }

        // Setup Modes
        if (targetCollection.modes.length > 0) {
            targetCollection.renameMode(targetCollection.modes[0].modeId, 'Desktop');
        }

        const ensureMode = (name: string): string => {
            const existing = targetCollection!.modes.find(m => m.name === name);
            if (existing) return existing.modeId;
            return targetCollection!.addMode(name);
        };

        const desktopMode = targetCollection.modes.find(m => m.name === 'Desktop');
        if (!desktopMode) throw new Error('Desktop mode not found');

        const desktopId = desktopMode.modeId;
        const tabletId = ensureMode('Tablet');
        const mobileId = ensureMode('Mobile');

        const allVars = await figma.variables.getLocalVariablesAsync();

        const findSource = (group: string, leafName: string): Variable | undefined => {
            // First, try exact paths
            const paths = [
                `${group}/${leafName}`,
                `${group}/Font Size/${leafName}`,
                `${group}/Font Weight/${leafName}`,
            ];
            for (const path of paths) {
                const found = allVars.find(v => v.variableCollectionId === sourceCollectionId && v.name === path);
                if (found) return found;
            }

            // Second, try case-insensitive partial match
            const leafLower = leafName.toLowerCase();
            const found = allVars.find(v =>
                v.variableCollectionId === sourceCollectionId &&
                v.name.toLowerCase().includes(group.toLowerCase()) &&
                v.name.toLowerCase().endsWith('/' + leafLower)
            );
            if (found) return found;

            // Third, try to find any FLOAT variable that ends with the leaf name
            const foundFloat = allVars.find(v =>
                v.variableCollectionId === sourceCollectionId &&
                v.resolvedType === 'FLOAT' &&
                v.name.toLowerCase().endsWith('/' + leafLower)
            );
            if (foundFloat) return foundFloat;
            return undefined;
        };

        const findOrCreateVar = async (path: string): Promise<Variable> => {
            let v = allVars.find(varObj => varObj.variableCollectionId === targetCollection!.id && varObj.name === path);
            if (!v) {
                try {
                    v = figma.variables.createVariable(path, targetCollection!, 'FLOAT');
                    allVars.push(v); // Update cache immediately
                } catch (e: any) {
                    // Start of fallback logic
                    if (e.message && e.message.includes('duplicate variable name')) {
                        // Refresh cache and try again
                        const freshVars = await figma.variables.getLocalVariablesAsync();
                        v = freshVars.find(varObj => varObj.variableCollectionId === targetCollection!.id && varObj.name === path);
                        if (!v) throw new Error(`Could not find or create variable ${path} (Duplicate Error)`);
                    } else {
                        throw e;
                    }
                }
            }
            return v;
        };

        // --- REFACTORED SECTIONS ---

        // 1. Text Size Aliases (REMOVED)
        // User requested to remove this section.
        // const textSizeTShirtMap = ['3xs', '2xs', 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];


        // 2. Letter Spacing Aliases (Letter-Spacing)
        // 5-step scale: tighter, tight, normal, wide, wider
        // Now using SEMANTIC names that match the primitives
        const letterSpacingMap = [
            { name: 'Typography/Letter-Spacing/tighter', desktop: 'very-tight', tablet: 'tight', mobile: 'semi-tight' },
            { name: 'Typography/Letter-Spacing/tight', desktop: 'semi-tight', tablet: 'slightly-tight', mobile: 'slightly-tight' },
            { name: 'Typography/Letter-Spacing/normal', desktop: 'normal', tablet: 'normal', mobile: 'normal' },
            { name: 'Typography/Letter-Spacing/wide', desktop: 'very-wide', tablet: 'semi-wide', mobile: 'slightly-wide' },
            { name: 'Typography/Letter-Spacing/wider', desktop: 'extra-wide', tablet: 'very-wide', mobile: 'wide' }
        ];

        for (const item of letterSpacingMap) {
            const v = await findOrCreateVar(item.name);

            const setModeVal = (modeId: string, val: string) => {
                // Look for primitive "Letter Spacing/val" (semantic name)
                const sourceVar = findSource(typoGroup, val);
                if (sourceVar) {
                    v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                }
            };

            setModeVal(desktopId, item.desktop);
            setModeVal(tabletId, item.tablet);
            setModeVal(mobileId, item.mobile);
        }

        // 3. Radius Aliases (Using Measures)
        // Mapping semantic radius names to measure primitives
        const radiusMap = [
            { name: 'Radius/none', val: '0px' },
            { name: 'Radius/2xs', val: '2px' },
            { name: 'Radius/xs', val: '4px' },
            { name: 'Radius/sm', val: '6px' },
            { name: 'Radius/md', val: '8px' },
            { name: 'Radius/lg', val: '12px' },
            { name: 'Radius/xl', val: '16px' },
            { name: 'Radius/2xl', val: '24px' },
            { name: 'Radius/3xl', val: '32px' },
            { name: 'Radius/full', val: '999px' } // Assuming this might exist or fallback
        ];

        for (const item of radiusMap) {
            const v = await findOrCreateVar(item.name);
            // Look for measure primitive
            let sourceVar = findSource(measureGroup, item.val);
            // Special handling for "full" if 999px doesn't exist, maybe try 100px or largest
            if (!sourceVar && item.name.includes('full')) {
                sourceVar = findSource(measureGroup, '100px');
            }

            if (sourceVar) {
                v.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                v.setValueForMode(tabletId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                v.setValueForMode(mobileId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
            }
        }

        // 4. Border Width (Stroke) Aliases - RESPONSIVE
        // Reduced border widths on smaller screens for better visual balance
        const borderMap = [
            { name: 'Border Width/none', desktop: '0px', tablet: '0px', mobile: '0px' },
            { name: 'Border Width/hairline', desktop: '0_5px', tablet: '0_5px', mobile: '0_5px' },
            { name: 'Border Width/thin', desktop: '1px', tablet: '1px', mobile: '1px' },
            { name: 'Border Width/medium', desktop: '2px', tablet: '2px', mobile: '1px' },
            { name: 'Border Width/thick', desktop: '4px', tablet: '2px', mobile: '2px' },
            { name: 'Border Width/heavy', desktop: '8px', tablet: '4px', mobile: '2px' },
        ];

        for (const item of borderMap) {
            const v = await findOrCreateVar(item.name);

            const setModeVal = (modeId: string, val: string) => {
                const sourceVar = findSource(measureGroup, val);
                if (sourceVar) {
                    v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                }
            };

            setModeVal(desktopId, item.desktop);
            setModeVal(tabletId, item.tablet);
            setModeVal(mobileId, item.mobile);
        }

        // 5. Semantic Text Aliases (Responsive) - Existing Refined
        // Mapping Semantic Usage -> T-shirt Size value (which allows responsiveness)
        // We look up the PRIMITIVE (Font Size/xl) for each mode.
        const textMap = [
            // Headings
            { name: 'Typography/Heading/h1', desktop: '5xl', tablet: '4xl', mobile: '3xl' },
            { name: 'Typography/Heading/h2', desktop: '4xl', tablet: '3xl', mobile: '2xl' },
            { name: 'Typography/Heading/h3', desktop: '3xl', tablet: '2xl', mobile: 'xl' },
            { name: 'Typography/Heading/h4', desktop: '2xl', tablet: 'xl', mobile: 'lg' },
            { name: 'Typography/Heading/h5', desktop: 'xl', tablet: 'lg', mobile: 'base' },
            { name: 'Typography/Heading/h6', desktop: 'lg', tablet: 'base', mobile: 'sm' },

            // Display
            { name: 'Typography/Display/h1', desktop: '7xl', tablet: '6xl', mobile: '5xl' },
            { name: 'Typography/Display/h2', desktop: '6xl', tablet: '5xl', mobile: '4xl' },

            // Body
            { name: 'Typography/Body/lg', desktop: 'lg', tablet: 'base', mobile: 'base' },
            { name: 'Typography/Body/base', desktop: 'base', tablet: 'sm', mobile: 'sm' }, // Standard body
            { name: 'Typography/Body/sm', desktop: 'sm', tablet: 'xs', mobile: 'xs' },

            // UI / Label
            { name: 'Typography/Label/lg', desktop: 'base', tablet: 'sm', mobile: 'sm' },
            { name: 'Typography/Label/base', desktop: 'sm', tablet: 'xs', mobile: 'xs' },
            { name: 'Typography/Label/sm', desktop: 'xs', tablet: '2xs', mobile: '2xs' },

            // Code
            { name: 'Typography/Code/base', desktop: 'sm', tablet: 'sm', mobile: 'xs' },
        ];

        for (const item of textMap) {
            const v = await findOrCreateVar(item.name);

            const setModeVal = (modeId: string, sizeName: string) => {
                const sourceVar = findSource(typoGroup, sizeName);
                if (sourceVar) {
                    v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                }
            };

            setModeVal(desktopId, item.desktop);
            setModeVal(tabletId, item.tablet);
            setModeVal(mobileId, item.mobile);
        }

        // 6. Spacing Aliases (Responsive Gaps) - Existing Preserved
        const spaceMap = [
            { name: 'Spacing/Gap/3xs', desktop: '2px', tablet: '2px', mobile: '2px' },
        ];



        // NEW: Effects System Maps
        // Opacity (0-1) - Usually hardcoded as it is a multiplier, but could be aliased if primitives exist.
        const opacityMap = [
            { name: 'Effects/Opacity/0', value: 0 },
            { name: 'Effects/Opacity/5', value: 0.05 },
            { name: 'Effects/Opacity/10', value: 0.1 },
            { name: 'Effects/Opacity/25', value: 0.25 },
            { name: 'Effects/Opacity/50', value: 0.5 },
            { name: 'Effects/Opacity/75', value: 0.75 },
            { name: 'Effects/Opacity/90', value: 0.9 },
            { name: 'Effects/Opacity/95', value: 0.95 },
            { name: 'Effects/Opacity/100', value: 1 },
        ];

        // Blur (Pixels) - SHOULD BE ALIASED TO MEASURES
        const blurMap = [
            { name: 'Effects/Blur/none', value: 0 },
            { name: 'Effects/Blur/sm', value: 4 },
            { name: 'Effects/Blur/md', value: 8 },
            { name: 'Effects/Blur/lg', value: 16 },
            { name: 'Effects/Blur/xl', value: 24 },
            { name: 'Effects/Blur/2xl', value: 40 },
        ];

        // Duration (ms) - Usually hardcoded
        const durationMap = [
            { name: 'Effects/Duration/instant', value: 0 },
            { name: 'Effects/Duration/fast', value: 150 },
            { name: 'Effects/Duration/normal', value: 300 },
            { name: 'Effects/Duration/slow', value: 500 },
            { name: 'Effects/Duration/slower', value: 700 },
        ];

        // Process Typography Font Sizes
        for (const item of textMap) {
            const v = await findOrCreateVar(item.name);

            const setMode = (modeId: string, valName: string): void => {
                const sourceVar = findSource(typoGroup, valName);
                if (sourceVar) {
                    v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                    console.log(`✅ Linked ${item.name} → ${sourceVar.name}`);
                } else {
                    // Fallback: try to find by partial name match
                    const fallbackVar = allVars.find(fv =>
                        fv.variableCollectionId === sourceCollectionId &&
                        fv.name.toLowerCase().includes(valName.toLowerCase()) &&
                        fv.resolvedType === 'FLOAT'
                    );
                    if (fallbackVar) {
                        v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: fallbackVar.id });
                        console.log(`✅ Fallback linked ${item.name} → ${fallbackVar.name}`);
                    } else {
                        console.warn(`⚠️ No source found for ${item.name} (looking for "${valName}" in ${typoGroup})`);
                    }
                }
            };

            setMode(desktopId, item.desktop);
            setMode(tabletId, item.tablet);
            setMode(mobileId, item.mobile);
        }

        // Process Opacity & Duration (Hardcoded/Generic for now unless primitives exist)
        const processGenericEffects = async (map: { name: string, value: number }[]) => {
            for (const item of map) {
                let v = allVars.find(varObj => varObj.variableCollectionId === targetCollection!.id && varObj.name === item.name);
                if (!v) v = figma.variables.createVariable(item.name, targetCollection!, 'FLOAT');
                v.setValueForMode(desktopId, item.value);
                v.setValueForMode(tabletId, item.value);
                v.setValueForMode(mobileId, item.value);
            }
        };
        await processGenericEffects(opacityMap);
        await processGenericEffects(durationMap);

        // Process Blur (Try to alias to Measures)
        for (const item of blurMap) {
            let v = allVars.find(varObj => varObj.variableCollectionId === targetCollection!.id && varObj.name === item.name);
            if (!v) v = figma.variables.createVariable(item.name, targetCollection!, 'FLOAT');

            const safeName = `${item.value}px`.replace('.', '_');
            const sourceVar = findSource(measureGroup, safeName);

            if (sourceVar) {
                // Alias to measure if found
                v.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                v.setValueForMode(tabletId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                v.setValueForMode(mobileId, { type: 'VARIABLE_ALIAS', id: sourceVar.id }); // Can implement scaling here if needed
            } else {
                // Fallback to raw value
                v.setValueForMode(desktopId, item.value);
                v.setValueForMode(tabletId, item.value);
                v.setValueForMode(mobileId, item.value);
            }
        }

        // Process Spacing
        for (const item of spaceMap) {
            const v = await findOrCreateVar(item.name);

            const setSpaceMode = (modeId: string, val: string): void => {
                const safeName = val.replace('.', '_');
                const sourceVar = findSource(measureGroup, safeName);
                if (sourceVar) {
                    v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                }
            };

            setSpaceMode(desktopId, item.desktop);
            setSpaceMode(tabletId, item.tablet);
            setSpaceMode(mobileId, item.mobile);
        }





        // Process Shadows (Semantic Variables for Y, Blur, Spread)
        // We create responsive variables for each shadow property, aliased to Measures.
        const shadowMap = [
            { name: 'Effects/Shadow/xs', y: 1, blur: 2, spread: 0 },
            { name: 'Effects/Shadow/sm', y: 1, blur: 3, spread: 0 },
            { name: 'Effects/Shadow/md', y: 4, blur: 6, spread: -1 },
            { name: 'Effects/Shadow/lg', y: 10, blur: 15, spread: -3 },
            { name: 'Effects/Shadow/xl', y: 20, blur: 25, spread: -5 },
            { name: 'Effects/Shadow/2xl', y: 25, blur: 50, spread: -12 },
        ];

        for (const shadow of shadowMap) {
            // Helper to create attribute variable
            const createAttrVar = async (attr: string, val: number) => {
                const path = `${shadow.name}/${attr}`;
                let v = await findOrCreateVar(path);

                // Try to alias to Measure
                const safeName = `${Math.abs(val)}px`.replace('.', '_'); // Handle abs for name lookup, value can be negative
                const sourceVar = findSource(measureGroup, safeName);

                if (sourceVar) {
                    v.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                    v.setValueForMode(tabletId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                    v.setValueForMode(mobileId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                } else {
                    // Fallback to raw
                    v.setValueForMode(desktopId, val);
                    v.setValueForMode(tabletId, val);
                    v.setValueForMode(mobileId, val);
                }
            };

            await createAttrVar('Y', shadow.y);
            await createAttrVar('Blur', shadow.blur);
            await createAttrVar('Spread', shadow.spread);
        }

        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify('Semantic tokens created successfully!');
        figma.ui.postMessage({ type: 'aliases-created' });
    } catch (err) {
        console.error(err);
        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify('Error: ' + (err as Error).message);
    }
}

// ============================================
// THEME SYSTEM
// ============================================

async function loadPalettes(collectionId: string, groupName?: string): Promise<void> {
    try {
        const palettes: Array<{ name: string; collectionId: string }> = [];

        if (!collectionId) {
            figma.ui.postMessage({ type: 'load-palettes', payload: [] });
            return;
        }

        const allVariables = await figma.variables.getLocalVariablesAsync();
        const variables = allVariables.filter(v => v.variableCollectionId === collectionId);
        const paletteNames = new Set<string>();
        const safeGroupName = groupName?.trim() || '';

        variables.forEach(v => {
            if (v.resolvedType === 'COLOR' && v.name.includes('/')) {
                const name = v.name;

                if (safeGroupName) {
                    const prefix = safeGroupName + '/';
                    if (name.startsWith(prefix)) {
                        const parts = name.split('/');
                        if (parts.length >= 2) {
                            paletteNames.add(parts.slice(0, -1).join('/'));
                        }
                    }
                } else {
                    const parts = name.split('/');
                    if (parts.length >= 2) {
                        paletteNames.add(parts.slice(0, -1).join('/'));
                    }
                }
            }
        });

        paletteNames.forEach(name => {
            palettes.push({ name, collectionId });
        });

        if (palettes.length === 0) {
            figma.notify(`⚠️ No palettes found in ${groupName ? 'group' : 'collection'}.`);
        }

        figma.ui.postMessage({ type: 'load-palettes', payload: palettes });
    } catch (error) {
        console.error('Error loading palettes:', error);
        figma.notify('❌ Error loading palettes: ' + (error as Error).message);
        figma.ui.postMessage({ type: 'load-palettes', payload: [] });
    }
}

function extractPaletteColors(vars: Variable[], allVarsMap: Record<string, Variable>): Record<string, string> {
    const result: Record<string, string> = {};

    const resolveValue = (val: VariableValue | undefined): string | null => {
        if (!val) return null;
        if (typeof val === 'object' && 'r' in val) {
            return rgbToHex(val as RGB).toUpperCase();
        }
        if (typeof val === 'object' && 'type' in val && val.type === 'VARIABLE_ALIAS' && allVarsMap) {
            const target = allVarsMap[val.id];
            if (target) {
                const targetModeId = Object.keys(target.valuesByMode)[0];
                return resolveValue(target.valuesByMode[targetModeId]);
            }
        }
        return null;
    };

    vars.forEach(v => {
        const safeName = v.name.trim();
        const match = safeName.match(/[\/\-\s_]([0-9]+)$/) || safeName.match(/([0-9]+)$/);

        if (match) {
            const scale = match[1];
            const modeId = Object.keys(v.valuesByMode)[0];
            const value = v.valuesByMode[modeId];
            const hex = resolveValue(value);
            if (hex) result[scale] = hex;
        }
    });

    return result;
}

async function generateTheme(
    accentPalette: string,
    neutralPalette: string,
    statusPalettes: { success?: string; warning?: string; error?: string },
    themeName: string,
    isRegenerate: boolean,
    _tokenOverrides?: Record<string, TokenOverride>
): Promise<void> {
    // TODO: Implement tokenOverrides support
    void _tokenOverrides;
    try {
        const allVariables = await figma.variables.getLocalVariablesAsync();
        const allVarsMap: Record<string, Variable> = {};
        allVariables.forEach(v => allVarsMap[v.id] = v);

        const filterByPalette = (paletteName: string): Variable[] => {
            if (!paletteName) return [];
            return allVariables.filter(v =>
                v.resolvedType === 'COLOR' && (
                    v.name.startsWith(paletteName + '/') ||
                    v.name.startsWith(paletteName + '-') ||
                    v.name.startsWith(paletteName)
                )
            );
        };

        const accentVars = filterByPalette(accentPalette);
        const neutralVars = filterByPalette(neutralPalette);
        const successVars = statusPalettes?.success ? filterByPalette(statusPalettes.success) : [];
        const warningVars = statusPalettes?.warning ? filterByPalette(statusPalettes.warning) : [];
        const errorVars = statusPalettes?.error ? filterByPalette(statusPalettes.error) : [];

        if (accentVars.length === 0 || neutralVars.length === 0) {
            figma.notify('❌ Selected primary palettes not found');
            return;
        }

        const findVar = (vars: Variable[], scale: string): Variable | undefined => {
            const regex = new RegExp(`[\\/\\-\\s_]${scale}$`);
            return vars.find(v => regex.test(v.name));
        };

        const map = { bgLight: '50', bgDark: '950', textLight: '900', textDark: '50', actionLight: '600', actionDark: '500' };
        const tokens: Record<string, ThemeToken> = {};

        const TOKEN_SCHEMA = [
            // Backgrounds
            { name: 'Background/primary', light: map.bgLight, dark: map.bgDark },
            { name: 'Background/secondary', light: '100', dark: '800' },
            { name: 'Background/tertiary', light: '200', dark: '700' },
            { name: 'Background/brand', light: '100', dark: '900', useAccent: true },
            { name: 'Background/inverse', light: '900', dark: '50' },

            // Text
            { name: 'Text/primary', light: map.textLight, dark: map.textDark },
            { name: 'Text/secondary', light: '700', dark: '300' },
            { name: 'Text/tertiary', light: '600', dark: '400' },
            { name: 'Text/brand', light: '700', dark: '300', useAccent: true },
            { name: 'Text/link', light: '600', dark: '400', useAccent: true },
            { name: 'Text/linkHover', light: '700', dark: '300', useAccent: true },
            { name: 'Text/inverse', light: '50', dark: '900' },
            { name: 'Text/disabled', light: '400', dark: '600' },
            { name: 'Text/placeholder', light: '400', dark: '500' },

            // Surface
            { name: 'Surface/primary', light: '50', dark: '900' },
            { name: 'Surface/card', light: '50', dark: '800' },
            { name: 'Surface/modal', light: '50', dark: '800' },
            { name: 'Surface/overlay', light: '900', dark: '950' },
            { name: 'Surface/elevated', light: '50', dark: '700' },
            { name: 'Surface/hover', light: '100', dark: '750' },
            { name: 'Surface/pressed', light: '200', dark: '700' },
            { name: 'Surface/disabled', light: '100', dark: '800' },

            // Border
            { name: 'Border/default', light: '200', dark: '700' },
            { name: 'Border/subtle', light: '100', dark: '800' },
            { name: 'Border/strong', light: '400', dark: '500' },
            { name: 'Border/focus', light: '500', dark: '400', useAccent: true },
            { name: 'Border/disabled', light: '200', dark: '700' },
            { name: 'Border/error', light: '500', dark: '400', useStatus: 'error' },
            { name: 'Border/success', light: '500', dark: '400', useStatus: 'success' },
            { name: 'Border/warning', light: '500', dark: '400', useStatus: 'warning' },

            // Action
            { name: 'Action/primary', light: map.actionLight, dark: map.actionDark, useAccent: true },
            { name: 'Action/primaryHover', light: '700', dark: '300', useAccent: true },
            { name: 'Action/primaryActive', light: '800', dark: '200', useAccent: true },
            { name: 'Action/primaryDisabled', light: '300', dark: '700', useAccent: true },
            { name: 'Action/secondary', light: '100', dark: '800' },
            { name: 'Action/secondaryHover', light: '200', dark: '700' },
            { name: 'Action/ghost', light: '50', dark: '900' },
            { name: 'Action/ghostHover', light: '100', dark: '800' },
            { name: 'Action/destructive', light: '600', dark: '500', useStatus: 'error' },
            { name: 'Action/destructiveHover', light: '700', dark: '400', useStatus: 'error' },

            // Status
            { name: 'Status/success', light: '600', dark: '400', useStatus: 'success' },
            { name: 'Status/successBg', light: '50', dark: '900', useStatus: 'success' },
            { name: 'Status/warning', light: '600', dark: '400', useStatus: 'warning' },
            { name: 'Status/warningBg', light: '50', dark: '900', useStatus: 'warning' },
            { name: 'Status/error', light: '600', dark: '400', useStatus: 'error' },
            { name: 'Status/errorBg', light: '50', dark: '900', useStatus: 'error' },
            { name: 'Status/info', light: '600', dark: '400', useAccent: true },
            { name: 'Status/infoBg', light: '50', dark: '900', useAccent: true },

            // Icons
            { name: 'Icon/primary', light: '700', dark: '300' },
            { name: 'Icon/secondary', light: '500', dark: '400' },
            { name: 'Icon/brand', light: '600', dark: '400', useAccent: true },
            { name: 'Icon/disabled', light: '300', dark: '600' },
            { name: 'Icon/inverse', light: '50', dark: '900' },

            // Interactive (focus states)
            { name: 'Interactive/focus', light: '500', dark: '400', useAccent: true },
            { name: 'Interactive/focusRing', light: '400', dark: '500', useAccent: true },
        ];

        const resolveVar = (entry: { light: string; dark: string; useAccent?: boolean; useStatus?: string }, mode: 'light' | 'dark'): Variable | null => {
            const scale = entry[mode];
            if (!scale) return null;

            let collection = neutralVars;
            if (entry.useAccent) collection = accentVars;
            else if (entry.useStatus === 'success') collection = successVars;
            else if (entry.useStatus === 'warning') collection = warningVars;
            else if (entry.useStatus === 'error') collection = errorVars;

            let v = findVar(collection, scale);

            // Fallbacks
            if (!v && mode === 'light' && (scale === '0' || scale === '50')) {
                v = findVar(collection, '100') || findVar(collection, '200');
            }
            if (!v && mode === 'dark' && (scale === '950' || scale === '900')) {
                v = findVar(collection, '800') || findVar(collection, '700');
            }

            return v || null;
        };

        for (const entry of TOKEN_SCHEMA) {
            const lightVar = resolveVar(entry as any, 'light');
            const darkVar = resolveVar(entry as any, 'dark');

            if (lightVar && darkVar) {
                const lightColor = lightVar.valuesByMode[Object.keys(lightVar.valuesByMode)[0]] as RGB;
                const darkColor = darkVar.valuesByMode[Object.keys(darkVar.valuesByMode)[0]] as RGB;

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

        const getPreviewData = (mode: 'light' | 'dark'): PreviewData => {
            const get = (name: string): string => {
                const t = tokens[name];
                if (!t) return mode === 'light' ? '#ffffff' : '#1e1e1e';
                return mode === 'light' ? t.light.hex : t.dark.hex;
            };

            return {
                bg: {
                    primary: get('Background/primary'),
                    secondary: get('Background/secondary'),
                    tertiary: get('Background/tertiary'),
                },
                text: {
                    primary: get('Text/primary'),
                    secondary: get('Text/secondary'),
                    brand: get('Text/brand'),
                },
                surface: {
                    card: get('Surface/card'),
                    modal: get('Surface/modal'),
                    overlay: get('Surface/overlay'),
                },
                border: {
                    default: get('Border/default'),
                    focus: get('Border/focus'),
                    error: get('Border/error'),
                },
                action: {
                    primary: get('Action/primary'),
                    primaryHover: get('Action/primaryHover'),
                    secondary: get('Action/secondary'),
                    destructive: get('Action/destructive'),
                },
                status: {
                    success: get('Status/success'),
                    successBg: get('Status/successBg'),
                    warning: get('Status/warning'),
                    warningBg: get('Status/warningBg'),
                    error: get('Status/error'),
                    errorBg: get('Status/errorBg'),
                }
            };
        };

        const messageType = isRegenerate ? 'theme-regenerated' : 'theme-generated';
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
                    light: getPreviewData('light'),
                    dark: getPreviewData('dark')
                }
            }
        });
    } catch (error) {
        console.error('Generate Theme Error:', error);
        figma.notify('❌ Error generating theme: ' + (error as Error).message);
    }
}

async function createThemeCollection(themeData: ThemeData): Promise<void> {
    try {
        figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Theme Collection...' });

        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        let collection = collections.find(c => c.name === themeData.themeName);

        if (!collection) {
            collection = figma.variables.createVariableCollection(themeData.themeName);
        }

        // Setup modes
        if (collection.modes.length > 0) {
            collection.renameMode(collection.modes[0].modeId, 'Light');
        }

        const ensureMode = (name: string): string => {
            const existing = collection!.modes.find(m => m.name === name);
            if (existing) return existing.modeId;
            return collection!.addMode(name);
        };

        const lightMode = collection.modes.find(m => m.name === 'Light');
        if (!lightMode) throw new Error('Light mode not found');

        const lightId = lightMode.modeId;
        const darkId = ensureMode('Dark');

        const allVars = await figma.variables.getLocalVariablesAsync();

        for (const [tokenName, token] of Object.entries(themeData.tokens)) {
            let variable = allVars.find(v => v.variableCollectionId === collection!.id && v.name === tokenName);

            if (!variable) {
                variable = figma.variables.createVariable(tokenName, collection, 'COLOR');
            }

            // Set aliases or direct colors
            if (token.light.id && !token.light.isSynthetic) {
                variable.setValueForMode(lightId, { type: 'VARIABLE_ALIAS', id: token.light.id });
            } else {
                const hex = token.light.hex;
                const parsed = parseHex(hex);
                if (parsed) variable.setValueForMode(lightId, parsed);
            }

            if (token.dark.id && !token.dark.isSynthetic) {
                variable.setValueForMode(darkId, { type: 'VARIABLE_ALIAS', id: token.dark.id });
            } else {
                const hex = token.dark.hex;
                const parsed = parseHex(hex);
                if (parsed) variable.setValueForMode(darkId, parsed);
            }
        }

        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify(`Theme "${themeData.themeName}" created successfully! ✅`);
        await loadCollections();
    } catch (err) {
        console.error(err);
        figma.ui.postMessage({ type: 'progress-end' });
        figma.notify('Error creating theme: ' + (err as Error).message);
    }
}

async function loadThemeFromCollection(collectionId: string): Promise<void> {
    try {
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) throw new Error('Collection not found');

        const allVariables = await figma.variables.getLocalVariablesAsync();
        const themeVars = allVariables.filter(v => v.variableCollectionId === collectionId && v.resolvedType === 'COLOR');

        const tokens: Record<string, ThemeToken> = {};
        const allVarsMap: Record<string, Variable> = {};
        allVariables.forEach(v => allVarsMap[v.id] = v);

        const lightMode = collection.modes.find(m => m.name.toLowerCase().includes('light'));
        const darkMode = collection.modes.find(m => m.name.toLowerCase().includes('dark'));

        if (!lightMode || !darkMode) {
            figma.notify('⚠️ Theme must have Light and Dark modes');
            return;
        }

        // Track referenced variables and their source collections
        const referencedVarIds = new Set<string>();
        const sourceCollectionIds = new Set<string>();

        // Mapping from token name to source variable path (for detecting roles)
        const tokenToSourcePath: Record<string, { light: string; dark: string }> = {};

        for (const variable of themeVars) {
            const lightVal = variable.valuesByMode[lightMode.modeId];
            const darkVal = variable.valuesByMode[darkMode.modeId];

            const resolveToHex = (val: VariableValue | undefined, mode: 'light' | 'dark'): { hex: string; name: string; id?: string } => {
                if (!val) return { hex: '#cccccc', name: 'Unknown' };

                if (typeof val === 'object' && 'r' in val) {
                    return { hex: rgbToHex(val as ColorRGB), name: 'Direct' };
                }

                if (typeof val === 'object' && 'type' in val && val.type === 'VARIABLE_ALIAS') {
                    referencedVarIds.add(val.id);
                    const target = allVarsMap[val.id];
                    if (target) {
                        sourceCollectionIds.add(target.variableCollectionId);

                        // Track for role detection
                        if (!tokenToSourcePath[variable.name]) {
                            tokenToSourcePath[variable.name] = { light: '', dark: '' };
                        }
                        tokenToSourcePath[variable.name][mode] = target.name;

                        const targetModeId = Object.keys(target.valuesByMode)[0];
                        const targetVal = target.valuesByMode[targetModeId];
                        if (typeof targetVal === 'object' && 'r' in targetVal) {
                            return { hex: rgbToHex(targetVal as ColorRGB), name: target.name, id: target.id };
                        }
                    }
                }

                return { hex: '#cccccc', name: 'Unknown' };
            };

            tokens[variable.name] = {
                light: resolveToHex(lightVal, 'light'),
                dark: resolveToHex(darkVal, 'dark')
            };
        }

        // Load ALL palettes from source collections
        const availablePalettes: Array<{ name: string; collectionId: string }> = [];
        const paletteNames = new Set<string>();

        sourceCollectionIds.forEach(srcCollId => {
            const srcVars = allVariables.filter(v => v.variableCollectionId === srcCollId && v.resolvedType === 'COLOR');
            srcVars.forEach(v => {
                if (v.name.includes('/')) {
                    const parts = v.name.split('/');
                    if (parts.length >= 2) {
                        const palettePath = parts.slice(0, -1).join('/');
                        if (!paletteNames.has(palettePath)) {
                            paletteNames.add(palettePath);
                            availablePalettes.push({ name: palettePath, collectionId: srcCollId });
                        }
                    }
                }
            });
        });

        // Build paletteData for ALL available palettes
        const paletteData: Record<string, Record<string, string>> = {
            accent: {},
            neutral: {},
            success: {},
            warning: {},
            error: {}
        };

        // Helper to extract palette colors
        const extractPaletteColors = (paletteName: string): Record<string, string> => {
            const colors: Record<string, string> = {};
            allVariables.forEach(v => {
                if (v.name.startsWith(paletteName + '/') || v.name.startsWith(paletteName + '-')) {
                    const match = v.name.match(/[\/\-\s_]([0-9]+)$/);
                    if (match) {
                        const scale = match[1];
                        const modeId = Object.keys(v.valuesByMode)[0];
                        const value = v.valuesByMode[modeId];
                        if (typeof value === 'object' && 'r' in value) {
                            colors[scale] = rgbToHex(value as ColorRGB).toUpperCase();
                        }
                    }
                }
            });
            return colors;
        };

        // Detect roles based on token references
        const detectedConfig = {
            accent: '',
            neutral: '',
            status: {
                success: '',
                warning: '',
                error: ''
            }
        };

        // Analyze tokens to detect which palette is used for each role
        const paletteUsageCount: Record<string, { accent: number; neutral: number; success: number; warning: number; error: number }> = {};

        availablePalettes.forEach(p => {
            paletteUsageCount[p.name] = { accent: 0, neutral: 0, success: 0, warning: 0, error: 0 };
        });

        Object.entries(tokenToSourcePath).forEach(([tokenName, sources]) => {
            const checkPath = (path: string) => {
                if (!path) return;
                availablePalettes.forEach(p => {
                    if (path.startsWith(p.name + '/') || path.startsWith(p.name + '-')) {
                        // Determine role based on token name
                        if (tokenName.startsWith('Status/success')) {
                            paletteUsageCount[p.name].success += 10; // High weight for status
                        } else if (tokenName.startsWith('Status/warning')) {
                            paletteUsageCount[p.name].warning += 10;
                        } else if (tokenName.startsWith('Status/error') || tokenName.startsWith('Action/destructive')) {
                            paletteUsageCount[p.name].error += 10;
                        } else if (tokenName.startsWith('Action/primary') || tokenName.startsWith('Text/brand') ||
                            tokenName.startsWith('Border/focus') || tokenName.startsWith('Text/link') ||
                            tokenName.startsWith('Background/brand') || tokenName.startsWith('Background/accent')) {
                            paletteUsageCount[p.name].accent += 5; // Medium weight for accent indicators
                        } else if (tokenName.startsWith('Background/primary') || tokenName.startsWith('Background/secondary') ||
                            tokenName.startsWith('Text/primary') || tokenName.startsWith('Text/secondary') ||
                            tokenName.startsWith('Surface/') || tokenName.startsWith('Border/default')) {
                            paletteUsageCount[p.name].neutral += 5;
                        } else if (tokenName.startsWith('Action/secondary')) {
                            paletteUsageCount[p.name].neutral += 3; // Secondary actions often neutral
                        }
                    }
                });
            };
            checkPath(sources.light);
            checkPath(sources.dark);
        });

        // Also use palette name hints to boost scores
        availablePalettes.forEach(p => {
            const lowerName = p.name.toLowerCase();

            // Neutral indicators
            if (lowerName.includes('gray') || lowerName.includes('grey') || lowerName.includes('slate') ||
                lowerName.includes('zinc') || lowerName.includes('neutral') || lowerName.includes('stone') ||
                lowerName.includes('cement') || lowerName.includes('silver')) {
                paletteUsageCount[p.name].neutral += 20; // Strong hint from name
            }

            // Accent/Brand indicators
            if (lowerName.includes('brand') || lowerName.includes('primary') || lowerName.includes('accent') ||
                lowerName.includes('blue') || lowerName.includes('indigo') || lowerName.includes('purple') ||
                lowerName.includes('violet') || lowerName.includes('teal') || lowerName.includes('cyan')) {
                paletteUsageCount[p.name].accent += 15;
            }

            // Status indicators
            if (lowerName.includes('success') || lowerName.includes('green') || lowerName.includes('emerald')) {
                paletteUsageCount[p.name].success += 20;
            }
            if (lowerName.includes('warning') || lowerName.includes('yellow') || lowerName.includes('amber') || lowerName.includes('orange')) {
                paletteUsageCount[p.name].warning += 20;
            }
            if (lowerName.includes('error') || lowerName.includes('red') || lowerName.includes('danger') || lowerName.includes('rose')) {
                paletteUsageCount[p.name].error += 20;
            }
        });

        // Find best match for each role
        let maxAccent = 0, maxNeutral = 0, maxSuccess = 0, maxWarning = 0, maxError = 0;
        const usedPalettes = new Set<string>();

        // First pass: detect status palettes (most specific)
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

        // Mark status palettes as used
        if (detectedConfig.status.success) usedPalettes.add(detectedConfig.status.success);
        if (detectedConfig.status.warning) usedPalettes.add(detectedConfig.status.warning);
        if (detectedConfig.status.error) usedPalettes.add(detectedConfig.status.error);

        // Second pass: detect neutral (exclude status palettes)
        Object.entries(paletteUsageCount).forEach(([paletteName, counts]) => {
            if (!usedPalettes.has(paletteName) && counts.neutral > maxNeutral) {
                maxNeutral = counts.neutral;
                detectedConfig.neutral = paletteName;
            }
        });
        if (detectedConfig.neutral) usedPalettes.add(detectedConfig.neutral);

        // Third pass: detect accent (exclude status and neutral palettes)
        Object.entries(paletteUsageCount).forEach(([paletteName, counts]) => {
            if (!usedPalettes.has(paletteName) && counts.accent > maxAccent) {
                maxAccent = counts.accent;
                detectedConfig.accent = paletteName;
            }
        });

        // If accent wasn't detected but we have palettes left, pick the one with most usage
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

        console.log('🔍 Palette usage counts:', paletteUsageCount);

        // Extract palette colors for detected roles
        if (detectedConfig.accent) paletteData.accent = extractPaletteColors(detectedConfig.accent);
        if (detectedConfig.neutral) paletteData.neutral = extractPaletteColors(detectedConfig.neutral);
        if (detectedConfig.status.success) paletteData.success = extractPaletteColors(detectedConfig.status.success);
        if (detectedConfig.status.warning) paletteData.warning = extractPaletteColors(detectedConfig.status.warning);
        if (detectedConfig.status.error) paletteData.error = extractPaletteColors(detectedConfig.status.error);

        // Generate preview data
        const getPreviewData = (mode: 'light' | 'dark'): PreviewData => {
            const get = (name: string): string => {
                const t = tokens[name];
                if (!t) return mode === 'light' ? '#ffffff' : '#1e1e1e';
                return mode === 'light' ? t.light.hex : t.dark.hex;
            };

            return {
                bg: {
                    primary: get('Background/primary'),
                    secondary: get('Background/secondary'),
                    tertiary: get('Background/tertiary'),
                },
                text: {
                    primary: get('Text/primary'),
                    secondary: get('Text/secondary'),
                    brand: get('Text/brand'),
                },
                surface: {
                    card: get('Surface/card'),
                    modal: get('Surface/modal'),
                    overlay: get('Surface/overlay'),
                },
                border: {
                    default: get('Border/default'),
                    focus: get('Border/focus'),
                    error: get('Border/error'),
                },
                action: {
                    primary: get('Action/primary'),
                    primaryHover: get('Action/primaryHover'),
                    secondary: get('Action/secondary'),
                    destructive: get('Action/destructive'),
                },
                status: {
                    success: get('Status/success'),
                    successBg: get('Status/successBg'),
                    warning: get('Status/warning'),
                    warningBg: get('Status/warningBg'),
                    error: get('Status/error'),
                    errorBg: get('Status/errorBg'),
                }
            };
        };

        console.log('📊 Detected config:', detectedConfig);
        console.log('📦 Available palettes:', availablePalettes.length);
        console.log('🎨 Palette data:', Object.keys(paletteData).map(k =>
            `${k}(${Object.keys(paletteData[k]).length})`
        ).join(', '));

        figma.ui.postMessage({
            type: 'theme-loaded-for-edit',
            payload: {
                themeName: collection.name,
                tokens,
                collectionId,
                paletteData,
                availablePalettes,
                detectedConfig,
                preview: {
                    light: getPreviewData('light'),
                    dark: getPreviewData('dark')
                }
            }
        });
    } catch (err) {
        console.error(err);
        figma.notify('Error loading theme: ' + (err as Error).message);
    }
}

// ============================================
// SELECTION HANDLING
// ============================================

function handleSelectionChange(): void {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
        figma.ui.postMessage({ type: 'selection-color', payload: null });
        return;
    }

    const node = selection[0];

    if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === 'SOLID') {
            const { r, g, b } = fill.color;
            const hex = rgbToHex(r, g, b).toUpperCase();
            figma.ui.postMessage({ type: 'selection-color', payload: { hex, r, g, b } });
            return;
        }
    }

    figma.ui.postMessage({ type: 'selection-color', payload: null });
}

// ============================================
// MESSAGE ROUTER
// ============================================

loadCollections();

figma.ui.onmessage = async (msg: PluginMessage) => {
    try {
        switch (msg.type) {
            case 'load-collections':
                await loadCollections();
                break;

            case 'get-groups':
                await getGroups(msg.collectionId as string);
                break;

            case 'get-groups-for-tab1':
                await getGroupsCustom(msg.collectionId as string, 'load-groups-tab1');
                break;

            case 'get-groups-for-tab2':
                await getGroups(msg.collectionId as string, 'tab2');
                break;

            case 'get-groups-for-measures':
                await getGroups(msg.collectionId as string, 'measures');
                break;

            case 'get-groups-for-typo':
                await getGroupsCustom(msg.collectionId as string, 'load-groups-typo');
                break;

            case 'get-groups-for-typo-source':
                await getGroupsCustom(msg.collectionId as string, 'load-groups-typo-source');
                break;

            case 'get-groups-for-alias':
                await getGroupsCustom(msg.collectionId as string, 'load-groups-alias');
                break;

            case 'get-groups-for-theme':
                await getGroupsCustom(msg.collectionId as string, 'load-groups-theme');
                break;

            case 'get-existing-palettes': {
                const collectionId = msg.collectionId as string;
                const groupName = msg.groupName as string;

                try {
                    const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
                    if (!collection) {
                        figma.ui.postMessage({ type: 'existing-palettes-loaded', payload: {} });
                        return;
                    }

                    const variables: Variable[] = [];
                    for (const id of collection.variableIds) {
                        const variable = await figma.variables.getVariableByIdAsync(id);
                        if (variable && variable.resolvedType === 'COLOR') {
                            variables.push(variable);
                        }
                    }

                    // Filter by group if specified
                    const filtered = groupName && groupName !== ''
                        ? variables.filter(v => v.name.startsWith(groupName + '/'))
                        : variables;

                    // Group color variables by palette
                    const palettes: Record<string, Array<{ name: string; step: string; hex: string }>> = {};

                    for (const v of filtered) {
                        const parts = v.name.split('/');
                        // Palette name is all parts except the last one (which is the step)
                        const paletteName = parts.length >= 2 ? parts.slice(0, -1).join('/') : parts[0];

                        if (!palettes[paletteName]) {
                            palettes[paletteName] = [];
                        }

                        // Get color value from default mode
                        const modeId = Object.keys(v.valuesByMode)[0];
                        const value = v.valuesByMode[modeId];

                        let hexColor = '#000000';
                        if (value && typeof value === 'object' && 'r' in value) {
                            const r = Math.round((value as RGBA).r * 255);
                            const g = Math.round((value as RGBA).g * 255);
                            const b = Math.round((value as RGBA).b * 255);
                            hexColor = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
                        }

                        palettes[paletteName].push({
                            name: v.name,
                            step: parts[parts.length - 1],
                            hex: hexColor
                        });
                    }

                    // Sort each palette by step number
                    for (const paletteName in palettes) {
                        palettes[paletteName].sort((a, b) => {
                            const aNum = parseInt(a.step.split('-')[1] || '0');
                            const bNum = parseInt(b.step.split('-')[1] || '0');
                            return aNum - bNum;
                        });
                    }

                    figma.ui.postMessage({ type: 'existing-palettes-loaded', payload: palettes });
                } catch (error) {
                    console.error('Error loading existing palettes:', error);
                    figma.ui.postMessage({ type: 'existing-palettes-loaded', payload: {} });
                }
                break;
            }

            case 'preview-scale': {
                const color = parseColor(msg.color as string);
                if (color) {
                    const scale = calculateScale(color);
                    const payload: Record<number, { hex: string; r: number; g: number; b: number }> = {};
                    for (const [k, v] of Object.entries(scale)) {
                        payload[parseInt(k)] = {
                            hex: rgbToHex(v.r, v.g, v.b).toUpperCase(),
                            r: v.r, g: v.g, b: v.b
                        };
                    }
                    figma.ui.postMessage({ type: 'preview-scale-result', payload });
                }
                break;
            }

            case 'preview-scale-batch': {
                const colors = msg.colors as Array<{ name: string; hex: string }>;
                const results: Array<{ name: string; steps: Record<number, { hex: string; r: number; g: number; b: number }> }> = [];

                for (const item of colors) {
                    const color = parseColor(item.hex);
                    if (color) {
                        const scale = calculateScale(color);
                        const steps: Record<number, { hex: string; r: number; g: number; b: number }> = {};
                        for (const [k, v] of Object.entries(scale)) {
                            steps[parseInt(k)] = {
                                hex: rgbToHex(v.r, v.g, v.b).toUpperCase(),
                                r: v.r, g: v.g, b: v.b
                            };
                        }
                        results.push({ name: item.name, steps });
                    }
                }
                figma.ui.postMessage({ type: 'preview-scale-batch-result', payload: results });
                break;
            }

            case 'create-variables': {
                const color = parseColor(msg.baseColorHex as string);
                if (color) {
                    const scale = calculateScale(color);
                    await createVariables(scale, msg.config as ColorVariableConfig);
                }
                break;
            }

            case 'create-variables-batch': {
                const colors = msg.colors as Array<{ name: string; hex: string }>;
                const config = msg.config as Partial<ColorVariableConfig> & { collectionName?: string };

                try {
                    figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Color Variables...' });

                    let targetCollectionId = config.collectionId;
                    if (config.collectionName && !targetCollectionId) {
                        const newCollection = figma.variables.createVariableCollection(config.collectionName);
                        targetCollectionId = newCollection.id;
                        figma.notify(`Collection "${config.collectionName}" created! ✅`);
                        await loadCollections();
                    }

                    if (!targetCollectionId) throw new Error('No collection specified');

                    let createdCount = 0;
                    for (const item of colors) {
                        if (!item?.hex) continue;
                        const color = parseColor(item.hex);
                        if (color) {
                            // Send progress update
                            figma.ui.postMessage({
                                type: 'progress-update',
                                payload: {
                                    current: createdCount + 1,
                                    total: colors.length,
                                    message: `Creating palette for ${item.name} (${createdCount + 1}/${colors.length})...`
                                }
                            });

                            const scale = calculateScale(color);
                            await createVariables(scale, {
                                colorName: item.name,
                                collectionId: targetCollectionId,
                                groupName: config.groupName
                            });
                            createdCount++;

                            // Slight delay to allow UI to update (optional but good for UX)
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }

                    figma.ui.postMessage({ type: 'progress-end' });
                    figma.notify(`Created ${createdCount} Color Palettes successfully!`);
                    figma.ui.postMessage({ type: 'variables-created-success' });
                } catch (err) {
                    console.error(err);
                    figma.ui.postMessage({ type: 'progress-end' });
                    figma.notify('Error creating batch variables: ' + (err as Error).message);
                }
                break;
            }

            case 'get-selection-color':
                handleSelectionChange();
                break;

            case 'create-measure-variables':
                await createMeasureVariables(msg.values as number[], msg.config as MeasureVariableConfig);
                break;

            case 'get-fonts':
                await getUniqueFonts();
                break;

            case 'create-typography':
                await createTypographyVariables(msg as unknown as TypographyData);
                break;

            case 'create-aliases':
                await createSemanticTokens(msg.config as AliasConfig);
                break;

            case 'get-groups-for-devtools': {
                const collectionId = msg.collectionId as string;
                const vars = await figma.variables.getLocalVariablesAsync();
                const groups = new Set<string>();
                vars.filter(v => v.variableCollectionId === collectionId).forEach(v => {
                    const parts = v.name.split('/');
                    if (parts.length > 1) {
                        groups.add(parts[0]);
                    }
                });
                figma.ui.postMessage({ type: 'load-groups-devtools', payload: Array.from(groups).sort() });
                break;
            }

            case 'export-variables':
                await exportVariables(
                    msg.collectionId as string | null,
                    msg.groupName as string | null,
                    msg.options as ExportOptions
                );
                break;



            case 'load-palettes':
                await loadPalettes(msg.collectionId as string, msg.groupName as string | undefined);
                break;

            case 'load-existing-theme':
                await loadThemeFromCollection(msg.collectionId as string);
                break;

            case 'generate-theme':
            case 'regenerate-theme':
                await generateTheme(
                    msg.accentPalette as string,
                    msg.neutralPalette as string,
                    msg.statusPalettes as { success?: string; warning?: string; error?: string },
                    msg.themeName as string,
                    msg.type === 'regenerate-theme' || msg.isRegenerate === true,
                    msg.tokenOverrides as Record<string, TokenOverride> | undefined
                );
                break;

            case 'create-theme':
                await createThemeCollection(msg.themeData as ThemeData);
                break;

            case 'resize-window':
                figma.ui.resize(msg.width as number, msg.height as number);
                break;

            case 'convert-json': {
                const collectionId = msg.collectionId as string;
                const groupName = msg.groupName as string;

                console.log('📚 Converting JSON for collection:', collectionId, 'group:', groupName);

                try {
                    const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
                    if (!collection) {
                        console.error('Collection not found:', collectionId);
                        figma.notify('Collection not found');
                        figma.ui.postMessage({ type: 'conversion-result', payload: [] });
                        return;
                    }

                    console.log('📚 Collection found:', collection.name, 'with', collection.variableIds.length, 'variables');

                    const variables: Variable[] = [];
                    for (const id of collection.variableIds) {
                        const variable = await figma.variables.getVariableByIdAsync(id);
                        if (variable) {
                            variables.push(variable);
                        }
                    }

                    console.log('📚 Loaded', variables.length, 'variables');

                    // Filter by group if specified
                    const filtered = groupName && groupName !== ''
                        ? variables.filter(v => v.name.startsWith(groupName + '/'))
                        : variables;

                    console.log('📚 Filtered to', filtered.length, 'variables');

                    // Group color variables by palette
                    const palettes: Record<string, any[]> = {};
                    const otherVars: any[] = [];

                    for (const v of filtered) {
                        if (v.resolvedType === 'COLOR') {
                            // Extract palette name (e.g., "Colors/Indigo" from "Colors/Indigo/Indigo-500")
                            const parts = v.name.split('/');
                            const paletteName = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];

                            if (!palettes[paletteName]) {
                                palettes[paletteName] = [];
                            }

                            // Get color value from default mode
                            const modeId = Object.keys(v.valuesByMode)[0];
                            const value = v.valuesByMode[modeId];

                            let hexColor = '#000000';
                            if (value && typeof value === 'object' && 'r' in value) {
                                const r = Math.round(value.r * 255);
                                const g = Math.round(value.g * 255);
                                const b = Math.round(value.b * 255);
                                hexColor = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
                            }

                            palettes[paletteName].push({
                                name: v.name,
                                step: parts[parts.length - 1], // e.g., "Indigo-500"
                                hex: hexColor,
                                type: 'COLOR'
                            });
                        } else {
                            otherVars.push({
                                name: v.name,
                                type: v.resolvedType,
                                id: v.id
                            });
                        }
                    }

                    // Sort each palette by step number
                    for (const paletteName in palettes) {
                        palettes[paletteName].sort((a, b) => {
                            const aNum = parseInt(a.step.split('-')[1] || '0');
                            const bNum = parseInt(b.step.split('-')[1] || '0');
                            return aNum - bNum;
                        });
                    }

                    figma.ui.postMessage({
                        type: 'conversion-result',
                        payload: {
                            palettes,
                            other: otherVars
                        }
                    });
                    console.log('📚 Sent', Object.keys(palettes).length, 'palettes and', otherVars.length, 'other variables to UI');
                } catch (error) {
                    console.error('Error converting JSON:', error);
                    figma.notify('Error loading variables: ' + (error as Error).message);
                    figma.ui.postMessage({ type: 'conversion-result', payload: [] });
                }
                break;
            }

            case 'load-text-styles': {
                try {
                    const textStyles = await figma.getLocalTextStylesAsync();
                    const stylesList = textStyles.map(style => ({
                        id: style.id,
                        name: style.name
                    }));
                    figma.ui.postMessage({ type: 'load-text-styles', payload: stylesList });
                    console.log('📚 Loaded', stylesList.length, 'text styles');
                } catch (error) {
                    console.error('Error loading text styles:', error);
                }
                break;
            }

            case 'generate-canvas': {
                const collectionId = msg.collectionId as string;
                const groupFilter = msg.groupName as string;

                try {
                    figma.ui.postMessage({ type: 'progress-start', payload: 'Initializing...' });

                    // Load fonts
                    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
                    await figma.loadFontAsync({ family: "Inter", style: "Medium" });

                    const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
                    if (!collection) throw new Error("Collection not found");

                    figma.ui.postMessage({ type: 'progress-update', payload: 'Fetching variables...' });
                    const allVariables = await figma.variables.getLocalVariablesAsync();
                    let collectionVariables = allVariables.filter(v =>
                        v.variableCollectionId === collectionId && v.resolvedType === 'COLOR'
                    );

                    // Filter by group if provided
                    if (groupFilter) {
                        collectionVariables = collectionVariables.filter(v => v.name.startsWith(groupFilter + '/'));
                    }

                    figma.ui.postMessage({ type: 'progress-update', payload: 'Preparing component...' });
                    const component = await getOrCreateColorCardComponent();
                    const modeId = collection.defaultModeId;

                    // Group variables by folder
                    const groups: Record<string, Variable[]> = {};
                    for (const variable of collectionVariables) {
                        const parts = variable.name.split('/');
                        const grpName = parts.length > 1 ? parts.slice(0, -1).join('/') : 'Uncategorized';
                        if (!groups[grpName]) groups[grpName] = [];
                        groups[grpName].push(variable);
                    }

                    // Create Main Container
                    const mainContainer = figma.createFrame();
                    mainContainer.name = collection.name;
                    mainContainer.layoutMode = "VERTICAL";
                    mainContainer.itemSpacing = 40;
                    mainContainer.paddingLeft = 40;
                    mainContainer.paddingRight = 40;
                    mainContainer.paddingTop = 80;
                    mainContainer.paddingBottom = 80;
                    mainContainer.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.12, b: 0.12 } }];
                    mainContainer.cornerRadius = 32;
                    mainContainer.primaryAxisSizingMode = "AUTO";
                    mainContainer.counterAxisSizingMode = "AUTO";

                    // Add Collection Title
                    const title = figma.createText();
                    title.characters = collection.name;
                    title.fontSize = 48;
                    title.fontName = { family: "Inter", style: "Bold" };
                    title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                    mainContainer.appendChild(title);

                    // Sort groups by Hue
                    const getHue = (r: number, g: number, b: number): number => {
                        const max = Math.max(r, g, b), min = Math.min(r, g, b);
                        let h = 0;
                        if (max === min) return 0;
                        const d = max - min;
                        switch (max) {
                            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                            case g: h = (b - r) / d + 2; break;
                            case b: h = (r - g) / d + 4; break;
                        }
                        return h * 60;
                    };

                    const groupsWithHue = Object.keys(groups).map(grpName => {
                        const vars = groups[grpName];
                        let maxSat = -1;
                        let bestHue = 0;

                        for (const v of vars) {
                            const val = v.valuesByMode[modeId];
                            if (val && typeof val === 'object' && 'r' in val) {
                                const { r, g, b } = val as RGBA;
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
                        const neutralKeywords = ['gray', 'grey', 'slate', 'zinc', 'stone', 'neutral', 'cement', 'silver', 'ash', 'sand'];
                        const isNeutral = neutralKeywords.some(kw => lowerName.includes(kw));

                        if (isNeutral || maxSat < 0.10) bestHue = 1000;

                        return { name: grpName, hue: bestHue };
                    });

                    groupsWithHue.sort((a, b) => a.hue - b.hue);
                    const sortedGroupNames = groupsWithHue.map(g => g.name);
                    let totalProcessed = 0;

                    for (const grpName of sortedGroupNames) {
                        figma.ui.postMessage({ type: 'progress-update', payload: `Processing group: ${grpName}...` });

                        const variablesInGroup = groups[grpName];

                        // Sort by luminance
                        const variablesWithLum = variablesInGroup.map(v => {
                            const value = v.valuesByMode[modeId];
                            let lum = 0;
                            if (value && typeof value === 'object' && 'r' in value) {
                                const { r, g, b } = value as RGBA;
                                lum = getLuminance(r, g, b);
                            }
                            return { variable: v, lum };
                        });
                        variablesWithLum.sort((a, b) => b.lum - a.lum);

                        // Group Container
                        const groupFrame = figma.createFrame();
                        groupFrame.name = grpName;
                        groupFrame.layoutMode = "VERTICAL";
                        groupFrame.itemSpacing = 24;
                        groupFrame.fills = [];
                        groupFrame.primaryAxisSizingMode = "AUTO";
                        groupFrame.counterAxisSizingMode = "AUTO";
                        mainContainer.appendChild(groupFrame);

                        // Group Title
                        const groupTitle = figma.createText();
                        groupTitle.characters = grpName;
                        groupTitle.fontSize = 24;
                        groupTitle.fontName = { family: "Inter", style: "Bold" };
                        groupTitle.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                        groupFrame.appendChild(groupTitle);

                        // Row Container
                        const rowFrame = figma.createFrame();
                        rowFrame.name = "Colors";
                        rowFrame.layoutMode = "HORIZONTAL";
                        rowFrame.itemSpacing = 16;
                        rowFrame.fills = [];
                        rowFrame.primaryAxisSizingMode = "AUTO";
                        rowFrame.counterAxisSizingMode = "AUTO";
                        groupFrame.appendChild(rowFrame);

                        // Generate Cards
                        for (const item of variablesWithLum) {
                            const variable = item.variable;
                            const value = variable.valuesByMode[modeId];

                            if (value && typeof value === 'object' && 'r' in value) {
                                const { r, g, b, a } = value as RGBA;

                                // Calculations
                                const hex = rgbToHex(r, g, b);
                                const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${(a !== undefined ? a : 1).toFixed(2)})`;
                                const oklch = rgbToOklchString(r, g, b);
                                const p3 = rgbToP3(r, g, b);

                                // CSS Var name
                                const parts = variable.name.split('/');
                                const leaf = parts.pop() || '';
                                let varName = slugify(leaf);
                                if (/^\d/.test(varName)) {
                                    const group = parts.pop();
                                    varName = slugify(`${group}-${leaf}`);
                                }
                                const cssVar = `var(--${varName})`;

                                // Accessibility
                                const luminance = item.lum;
                                const contrastWhite = getContrastRatio(luminance, 1.0);
                                const contrastBlack = getContrastRatio(luminance, 0.0);
                                const ratingsWhite = getWCAGRating(contrastWhite);
                                const ratingsBlack = getWCAGRating(contrastBlack);

                                // Text Color
                                const textColor = contrastWhite > contrastBlack
                                    ? { r: 1, g: 1, b: 1 }
                                    : { r: 0, g: 0, b: 0 };

                                // Create Instance
                                const instance = component.createInstance();
                                rowFrame.appendChild(instance);

                                // Set Fill
                                instance.fills = [{ type: 'SOLID', color: { r, g, b }, opacity: a }];

                                // Populate Data
                                const setText = async (name: string, text: string) => {
                                    const node = instance.children.find(n => n.name === name);
                                    if (node && node.type === "TEXT") {
                                        try {
                                            await figma.loadFontAsync(node.fontName as FontName);
                                            node.characters = text;
                                            node.fills = [{ type: 'SOLID', color: textColor }];
                                        } catch (err) {
                                            console.error(`Error setting text for ${name}:`, err);
                                        }
                                    }
                                };

                                await setText("Name", variable.name.split('/').pop() || '');
                                await setText("CSS Var", cssVar);
                                await setText("Hex", hex.toUpperCase());
                                await setText("RGBA", rgba);
                                await setText("OKLCH", oklch);
                                await setText("P3", p3);
                                await setText("Lum", `L: ${luminance.toFixed(3)}`);

                                const wRating = ratingsWhite.includes("Fail") ? "Fail" : ratingsWhite[0];
                                const bRating = ratingsBlack.includes("Fail") ? "Fail" : ratingsBlack[0];

                                await setText("WCAG White", `White: ${wRating} (${contrastWhite.toFixed(2)})`);
                                await setText("WCAG Black", `Black: ${bRating} (${contrastBlack.toFixed(2)})`);
                            }
                            totalProcessed++;
                        }
                    }

                    if (totalProcessed === 0) {
                        figma.notify("⚠️ No colors found to document in this collection.");
                    } else {
                        figma.viewport.scrollAndZoomIntoView([mainContainer]);
                        figma.notify(`Generated ${totalProcessed} advanced color cards!`);
                    }

                    figma.ui.postMessage({ type: 'progress-end', payload: 'Done' });

                } catch (error) {
                    console.error('Error generating canvas:', error);
                    figma.ui.postMessage({ type: 'progress-end', payload: 'Error' });
                    figma.notify('Error: ' + (error as Error).message);
                }
                break;
            }


            default:
                console.warn('Unknown message type:', msg.type);
        }
    } catch (error) {
        console.error('Error handling message:', error);
        figma.notify('Error: ' + (error as Error).message);
    }
};

figma.on('selectionchange', handleSelectionChange);
