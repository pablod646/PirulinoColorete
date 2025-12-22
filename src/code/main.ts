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

interface AtomsConfig {
    themeCollectionId: string;
    aliasesCollectionId: string;
    prefix: string;
    output: 'page' | 'frame' | 'selection';
    asComponents: boolean;
    components: {
        buttons: { variants: string[]; sizes: string[] } | null;
        inputs: { variants: string[]; states: string[] } | null;
        badges: { variants: string[]; sizes: string[] } | null;
        navMenu: { states: string[] } | null;
    };
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

    // Helper to convert {Path/To/Variable} to var(--path-to-variable)
    const formatCSSValue = (value: unknown): string => {
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            // It's an alias reference - convert to var()
            const aliasPath = value.slice(1, -1); // Remove { }
            const cssVarName = transformName(aliasPath, options.naming);
            return `var(--${cssVarName})`;
        }
        return String(value);
    };

    // Normalize mode name (Mode 1 -> desktop, etc.)
    const normalizeModeName = (mode: string): string => {
        const lower = mode.toLowerCase();
        if (lower === 'mode 1' || lower === 'default' || lower === 'desktop') return 'desktop';
        if (lower === 'mode 2') return 'tablet';
        if (lower === 'mode 3') return 'mobile';
        return lower;
    };

    for (const v of vars) {
        const varName = `--${transformName(v.name, options.naming)}`;

        for (const [mode, value] of Object.entries(v.values)) {
            const normalizedMode = normalizeModeName(mode);
            if (!byMode[normalizedMode]) byMode[normalizedMode] = [];
            byMode[normalizedMode].push(`  ${varName}: ${formatCSSValue(value)};`);
        }
    }

    // Determine mode order: first mode goes to :root, rest are selectors
    const modeOrder = Object.keys(byMode);

    // Prioritize: desktop/root first, then tablet, mobile, light, dark, others
    const priority = ['desktop', 'default', 'tablet', 'mobile', 'light', 'dark'];
    modeOrder.sort((a, b) => {
        const aIdx = priority.indexOf(a);
        const bIdx = priority.indexOf(b);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
    });

    // Output by mode - first mode is always :root
    let isFirst = true;
    for (const mode of modeOrder) {
        const cssVars = byMode[mode];

        if (isFirst) {
            // First mode goes to :root
            lines.push(':root {');
            lines.push(...cssVars);
            lines.push('}');
            isFirst = false;
        } else {
            // Other modes get selectors
            let selector: string;
            if (mode === 'dark') {
                selector = '[data-theme="dark"]';
            } else if (mode === 'light') {
                selector = '[data-theme="light"]';
            } else {
                selector = `[data-mode="${mode}"]`;
            }
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

    // Helper to convert {Path/To/Variable} to $path-to-variable
    const formatSCSSValue = (value: unknown): string => {
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            // It's an alias reference - convert to SCSS variable
            const aliasPath = value.slice(1, -1); // Remove { }
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
            // Create a map for multi-mode variables
            lines.push(`${varName}: (`);
            for (const [mode, value] of Object.entries(v.values)) {
                lines.push(`  ${mode.toLowerCase()}: ${formatSCSSValue(value)},`);
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

    // Helper to convert {Path/To/Variable} to token name reference
    const formatTailwindValue = (value: unknown): unknown => {
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            // It's an alias reference - convert to token name
            const aliasPath = value.slice(1, -1); // Remove { }
            const tokenName = transformName(aliasPath, options.naming);
            return tokenName; // Just the token name, e.g., "color-slate-50"
        }
        return value;
    };

    // Normalize mode name
    const normalizeModeName = (mode: string): string => {
        const lower = mode.toLowerCase();
        if (lower === 'mode 1' || lower === 'default') return 'DEFAULT';
        if (lower === 'mode 2') return 'tablet';
        if (lower === 'mode 3') return 'mobile';
        return lower;
    };

    const config: Record<string, unknown> = {
        theme: {
            extend: {}
        }
    };

    // Group by first path segment for organization
    const categories: Record<string, Record<string, unknown>> = {
        colors: colors,
        spacing: spacing,
        fontSize: fontSize,
        borderRadius: borderRadius,
        borderWidth: borderWidth,
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

    // Re-categorize variables more intelligently
    for (const v of vars) {
        const key = transformName(v.name, options.naming);
        const modeKeys = Object.keys(v.values);
        const nameLower = v.name.toLowerCase();

        let finalValue: unknown;

        // If multiple modes and includeModes is on, create nested object
        if (modeKeys.length > 1 && options.includeModes) {
            const modeValues: Record<string, unknown> = {};
            for (const [mode, val] of Object.entries(v.values)) {
                const normalizedMode = normalizeModeName(mode);
                const formatted = formatTailwindValue(val);
                modeValues[normalizedMode] = typeof formatted === 'number' ? `${formatted}px` : formatted;
            }
            finalValue = modeValues;
        } else {
            const rawValue = Object.values(v.values)[0];
            finalValue = formatTailwindValue(rawValue);
        }

        // Categorize based on name patterns
        if (v.type === 'COLOR') {
            categories.colors[key] = finalValue;
        } else if (nameLower.includes('font-family') || nameLower.includes('fontfamily')) {
            categories.fontFamily[key] = finalValue;
        } else if (nameLower.includes('font-weight') || nameLower.includes('fontweight')) {
            categories.fontWeight[key] = finalValue;
        } else if (nameLower.includes('letter-spacing') || nameLower.includes('letterspacing')) {
            categories.letterSpacing[key] = finalValue;
        } else if (nameLower.includes('line-height') || nameLower.includes('lineheight')) {
            categories.lineHeight[key] = finalValue;
        } else if (nameLower.includes('opacity')) {
            categories.opacity[key] = finalValue;
        } else if (nameLower.includes('blur')) {
            categories.blur[key] = finalValue;
        } else if (nameLower.includes('shadow')) {
            categories.boxShadow[key] = finalValue;
        } else if (nameLower.includes('duration')) {
            categories.transitionDuration[key] = finalValue;
        } else if (nameLower.includes('spacing') || nameLower.includes('gap') || nameLower.includes('padding') || nameLower.includes('margin')) {
            categories.spacing[key] = typeof finalValue === 'number' ? `${finalValue}px` : finalValue;
        } else if (nameLower.includes('font-size') || (nameLower.includes('size') && !nameLower.includes('border'))) {
            categories.fontSize[key] = typeof finalValue === 'number' ? `${finalValue}px` : finalValue;
        } else if (nameLower.includes('radius')) {
            categories.borderRadius[key] = typeof finalValue === 'number' ? `${finalValue}px` : finalValue;
        } else if (nameLower.includes('border') && nameLower.includes('width')) {
            categories.borderWidth[key] = typeof finalValue === 'number' ? `${finalValue}px` : finalValue;
        } else {
            // Everything else goes to extend
            categories.extend[key] = finalValue;
        }
    }

    const extend = config.theme as { extend: Record<string, unknown> };

    // Add all non-empty categories to the config
    if (Object.keys(categories.colors).length) extend.extend.colors = categories.colors;
    if (Object.keys(categories.spacing).length) extend.extend.spacing = categories.spacing;
    if (Object.keys(categories.fontSize).length) extend.extend.fontSize = categories.fontSize;
    if (Object.keys(categories.fontFamily).length) extend.extend.fontFamily = categories.fontFamily;
    if (Object.keys(categories.fontWeight).length) extend.extend.fontWeight = categories.fontWeight;
    if (Object.keys(categories.letterSpacing).length) extend.extend.letterSpacing = categories.letterSpacing;
    if (Object.keys(categories.lineHeight).length) extend.extend.lineHeight = categories.lineHeight;
    if (Object.keys(categories.borderRadius).length) extend.extend.borderRadius = categories.borderRadius;
    if (Object.keys(categories.borderWidth).length) extend.extend.borderWidth = categories.borderWidth;
    if (Object.keys(categories.opacity).length) extend.extend.opacity = categories.opacity;
    if (Object.keys(categories.blur).length) extend.extend.blur = categories.blur;
    if (Object.keys(categories.boxShadow).length) extend.extend.boxShadow = categories.boxShadow;
    if (Object.keys(categories.transitionDuration).length) extend.extend.transitionDuration = categories.transitionDuration;
    if (Object.keys(categories.extend).length) extend.extend.other = categories.extend;

    return `// tailwind.config.js\nmodule.exports = ${JSON.stringify(config, null, 2)}`;
}

function formatAsTypeScript(vars: Array<{ name: string; type: string; values: Record<string, unknown>; description?: string }>, options: ExportOptions): string {
    const lines: string[] = ['// Design Tokens - Generated by PirulinoColorete', ''];

    // Helper to convert {Path/To/Variable} to token name reference
    const formatTSValue = (value: unknown): unknown => {
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            // It's an alias reference - convert to token name
            const aliasPath = value.slice(1, -1); // Remove { }
            const tokenName = transformName(aliasPath, options.naming);
            return tokenName; // Just the token name, e.g., "color-slate-50"
        }
        return value;
    };

    lines.push('export const tokens = {');

    for (const v of vars) {
        const key = transformName(v.name, options.naming);
        const modeKeys = Object.keys(v.values);

        // Format values
        const formattedValues: Record<string, unknown> = {};
        for (const [mode, val] of Object.entries(v.values)) {
            formattedValues[mode] = formatTSValue(val);
        }

        const value = modeKeys.length === 1 ? formattedValues[modeKeys[0]] : formattedValues;

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

// ============================================
// ICON IMPORT (Iconify)
// ============================================

interface IconImportOptions {
    size: number;
    prefix: string;
    asComponents: boolean;
    addColorProperty: boolean;
}

async function importIconsFromSvg(
    icons: Array<{ name: string; svg: string }>,
    options: IconImportOptions
): Promise<void> {
    try {
        figma.ui.postMessage({ type: 'icons-import-progress', percent: 60, message: 'Creating icons...' });

        // Create a frame to hold all icons
        const iconsFrame = figma.createFrame();
        iconsFrame.name = `${options.prefix}Library`;
        iconsFrame.layoutMode = 'HORIZONTAL';
        iconsFrame.layoutWrap = 'WRAP';
        iconsFrame.primaryAxisSizingMode = 'FIXED';
        iconsFrame.counterAxisSizingMode = 'AUTO';
        iconsFrame.resize(800, iconsFrame.height);
        iconsFrame.itemSpacing = 16;
        iconsFrame.counterAxisSpacing = 16;
        iconsFrame.paddingTop = 24;
        iconsFrame.paddingBottom = 24;
        iconsFrame.paddingLeft = 24;
        iconsFrame.paddingRight = 24;
        iconsFrame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];

        const created: ComponentNode[] = [];
        let processed = 0;

        for (const icon of icons) {
            try {
                // Parse icon name (format: prefix:name)
                const nameParts = icon.name.split(':');
                const iconName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
                const cleanName = iconName.replace(/-/g, '_');

                // Create node from SVG
                const svgNode = figma.createNodeFromSvg(icon.svg);

                // Resize to target size
                const scale = options.size / Math.max(svgNode.width, svgNode.height);
                svgNode.resize(svgNode.width * scale, svgNode.height * scale);

                if (options.asComponents) {
                    // Create a component wrapper (NO auto-layout so constraints work)
                    const component = figma.createComponent();
                    component.name = `${options.prefix}${cleanName}`;
                    component.resize(options.size, options.size);
                    component.fills = [];

                    // Flatten the SVG to a single vector and add to component
                    const flattenedIcon = figma.flatten([svgNode]);
                    flattenedIcon.name = 'Icon';
                    component.appendChild(flattenedIcon);

                    // Center the icon
                    flattenedIcon.x = (component.width - flattenedIcon.width) / 2;
                    flattenedIcon.y = (component.height - flattenedIcon.height) / 2;

                    // Set constraints to SCALE so icon content resizes with container
                    flattenedIcon.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };

                    // Add color property if requested
                    if (options.addColorProperty) {
                        // Note: Color property would be a VARIANT type in a real component set
                        // For single icons, we just set a default dark color that users can override
                        const strokes = flattenedIcon.strokes;
                        const fills = flattenedIcon.fills;

                        if (Array.isArray(strokes) && strokes.length > 0) {
                            flattenedIcon.strokes = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
                        }
                        if (Array.isArray(fills) && fills.length > 0) {
                            flattenedIcon.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
                        }
                    }

                    iconsFrame.appendChild(component);
                    created.push(component);
                } else {
                    // Just add the flattened SVG as a frame
                    const flattenedIcon = figma.flatten([svgNode]);
                    flattenedIcon.name = `${options.prefix}${cleanName}`;
                    iconsFrame.appendChild(flattenedIcon);
                }

                processed++;
                const percent = 60 + Math.round((processed / icons.length) * 35);
                figma.ui.postMessage({
                    type: 'icons-import-progress',
                    percent,
                    message: `Creating ${processed}/${icons.length}...`
                });

            } catch (iconError) {
                console.error(`Error creating icon ${icon.name}:`, iconError);
            }
        }

        // Position the frame
        iconsFrame.x = figma.viewport.center.x - iconsFrame.width / 2;
        iconsFrame.y = figma.viewport.center.y - iconsFrame.height / 2;

        figma.currentPage.appendChild(iconsFrame);
        figma.currentPage.selection = [iconsFrame];
        figma.viewport.scrollAndZoomIntoView([iconsFrame]);

        figma.ui.postMessage({ type: 'icons-import-progress', percent: 100, message: 'Complete!' });
        figma.ui.postMessage({ type: 'icons-import-complete', count: processed });
        figma.notify(`Imported ${processed} icons! ✅`);

    } catch (error) {
        console.error('Icon import error:', error);
        figma.notify('Error importing icons: ' + (error as Error).message);
    }
}

// Scan for existing icon components in the document
async function scanExistingIcons(prefix: string): Promise<void> {
    try {
        const icons: Array<{ id: string; name: string; displayName: string }> = [];

        // Find all components that match the icon prefix
        const allNodes = figma.currentPage.findAll(node => {
            return node.type === 'COMPONENT' && node.name.startsWith(prefix);
        });

        for (const node of allNodes) {
            const displayName = node.name.replace(prefix, '');
            icons.push({
                id: node.id,
                name: node.name,
                displayName: displayName
            });
        }

        // Also check for icon library frame
        const libraryFrame = figma.currentPage.findOne(node => {
            return node.type === 'FRAME' && node.name === `${prefix}Library`;
        });

        figma.ui.postMessage({
            type: 'existing-icons-loaded',
            icons: icons,
            libraryFrameId: libraryFrame?.id || null,
            prefix: prefix
        });

    } catch (error) {
        console.error('Error scanning icons:', error);
        figma.ui.postMessage({ type: 'existing-icons-loaded', icons: [], libraryFrameId: null });
    }
}

// Delete specific icon components
async function deleteIcons(iconIds: string[]): Promise<void> {
    try {
        let deleted = 0;
        for (const id of iconIds) {
            const node = await figma.getNodeByIdAsync(id);
            if (node) {
                node.remove();
                deleted++;
            }
        }
        figma.notify(`Deleted ${deleted} icon(s)`);
        figma.ui.postMessage({ type: 'icons-deleted', count: deleted });
    } catch (error) {
        console.error('Error deleting icons:', error);
        figma.notify('Error deleting icons');
    }
}

// Add icons to existing library frame
async function addIconsToLibrary(
    icons: Array<{ name: string; svg: string }>,
    options: IconImportOptions,
    libraryFrameId: string | null
): Promise<void> {
    try {
        let iconsFrame: FrameNode;

        // Find or create library frame
        if (libraryFrameId) {
            const existingFrame = await figma.getNodeByIdAsync(libraryFrameId);
            if (existingFrame && existingFrame.type === 'FRAME') {
                iconsFrame = existingFrame;
            } else {
                // Frame not found, create new
                iconsFrame = createIconLibraryFrame(options.prefix);
            }
        } else {
            // Look for existing library frame by name
            const existing = figma.currentPage.findOne(node => {
                return node.type === 'FRAME' && node.name === `${options.prefix}Library`;
            });
            if (existing && existing.type === 'FRAME') {
                iconsFrame = existing;
            } else {
                iconsFrame = createIconLibraryFrame(options.prefix);
            }
        }

        figma.ui.postMessage({ type: 'icons-import-progress', percent: 60, message: 'Adding to library...' });

        let processed = 0;

        for (const icon of icons) {
            try {
                const nameParts = icon.name.split(':');
                const iconName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
                const cleanName = iconName.replace(/-/g, '_');
                const fullName = `${options.prefix}${cleanName}`;

                // Check if icon already exists
                const existing = iconsFrame.findOne(node => node.name === fullName);
                if (existing) {
                    processed++;
                    continue; // Skip duplicates
                }

                const svgNode = figma.createNodeFromSvg(icon.svg);
                const scale = options.size / Math.max(svgNode.width, svgNode.height);
                svgNode.resize(svgNode.width * scale, svgNode.height * scale);

                if (options.asComponents) {
                    // Create component without auto-layout so constraints work
                    const component = figma.createComponent();
                    component.name = fullName;
                    component.resize(options.size, options.size);
                    component.fills = [];

                    const flattenedIcon = figma.flatten([svgNode]);
                    flattenedIcon.name = 'Icon';
                    component.appendChild(flattenedIcon);
                    flattenedIcon.x = (component.width - flattenedIcon.width) / 2;
                    flattenedIcon.y = (component.height - flattenedIcon.height) / 2;

                    // Set constraints to SCALE so icon content resizes with container
                    flattenedIcon.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };

                    if (options.addColorProperty) {
                        const strokes = flattenedIcon.strokes;
                        const fills = flattenedIcon.fills;
                        if (Array.isArray(strokes) && strokes.length > 0) {
                            flattenedIcon.strokes = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
                        }
                        if (Array.isArray(fills) && fills.length > 0) {
                            flattenedIcon.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
                        }
                    }

                    iconsFrame.appendChild(component);
                } else {
                    const flattenedIcon = figma.flatten([svgNode]);
                    flattenedIcon.name = fullName;
                    iconsFrame.appendChild(flattenedIcon);
                }

                processed++;
                const percent = 60 + Math.round((processed / icons.length) * 35);
                figma.ui.postMessage({
                    type: 'icons-import-progress',
                    percent,
                    message: `Adding ${processed}/${icons.length}...`
                });

            } catch (iconError) {
                console.error(`Error adding icon ${icon.name}:`, iconError);
            }
        }

        figma.currentPage.selection = [iconsFrame];
        figma.viewport.scrollAndZoomIntoView([iconsFrame]);

        figma.ui.postMessage({ type: 'icons-import-progress', percent: 100, message: 'Complete!' });
        figma.ui.postMessage({ type: 'icons-import-complete', count: processed });
        figma.notify(`Added ${processed} icon(s) to library! ✅`);

    } catch (error) {
        console.error('Error adding icons:', error);
        figma.notify('Error adding icons: ' + (error as Error).message);
    }
}

function createIconLibraryFrame(prefix: string): FrameNode {
    const frame = figma.createFrame();
    frame.name = `${prefix}Library`;
    frame.layoutMode = 'HORIZONTAL';
    frame.layoutWrap = 'WRAP';
    frame.primaryAxisSizingMode = 'FIXED';
    frame.counterAxisSizingMode = 'AUTO';
    frame.resize(800, frame.height);
    frame.itemSpacing = 16;
    frame.counterAxisSpacing = 16;
    frame.paddingTop = 24;
    frame.paddingBottom = 24;
    frame.paddingLeft = 24;
    frame.paddingRight = 24;
    frame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
    frame.x = figma.viewport.center.x - frame.width / 2;
    frame.y = figma.viewport.center.y - frame.height / 2;
    figma.currentPage.appendChild(frame);
    return frame;
}

// ============================================
// ATOMIC COMPONENTS GENERATION
// ============================================

// Helper: Create or get the Atoms variable collection with responsive modes
async function createAtomsCollection(
    findVar: (terms: string[], type?: VariableResolvedDataType) => Variable | undefined
): Promise<{ collection: VariableCollection; modeIds: { desktop: string; tablet: string; mobile: string }; atomVars: Record<string, Variable> }> {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();

    // Check if Atoms collection already exists
    let atomsCollection = collections.find(c => c.name === 'Atoms');

    if (!atomsCollection) {
        atomsCollection = figma.variables.createVariableCollection('Atoms');
    }

    // Ensure we have 3 modes: Desktop, Tablet, Mobile
    const existingModes = atomsCollection.modes;
    let desktopModeId = existingModes.find(m => m.name === 'Desktop')?.modeId;
    let tabletModeId = existingModes.find(m => m.name === 'Tablet')?.modeId;
    let mobileModeId = existingModes.find(m => m.name === 'Mobile')?.modeId;

    // Rename default mode to Desktop if it's the only one
    if (existingModes.length === 1 && !desktopModeId) {
        atomsCollection.renameMode(existingModes[0].modeId, 'Desktop');
        desktopModeId = existingModes[0].modeId;
    }

    // Add missing modes
    if (!tabletModeId) {
        tabletModeId = atomsCollection.addMode('Tablet');
    }
    if (!mobileModeId) {
        mobileModeId = atomsCollection.addMode('Mobile');
    }

    const modeIds = {
        desktop: desktopModeId!,
        tablet: tabletModeId!,
        mobile: mobileModeId!
    };

    // Define atom variables - ONLY create what doesn't exist in Aliases
    // Most values come directly from Aliases (padding, gap, radius, font-size, etc.)
    // We only need to create Atoms variables for special cases like line-height = icon-size
    // Format: { name, type, desktop: aliasTerms, tablet: aliasTerms, mobile: aliasTerms }
    const atomVariableDefinitions = [
        // Button - only line-height needs a dedicated variable (must equal icon-size for consistent height)
        { name: 'Button/line-height', type: 'FLOAT', desktop: ['Icon-Size/lg'], tablet: ['Icon-Size/md'], mobile: ['Icon-Size/sm'] },

        // Input - only line-height needs a dedicated variable (must equal icon-size for consistent height)
        { name: 'Input/line-height', type: 'FLOAT', desktop: ['Icon-Size/lg'], tablet: ['Icon-Size/md'], mobile: ['Icon-Size/sm'] },

        // Badge - only line-height needs a dedicated variable (must equal icon-size for consistent height)
        { name: 'Badge/line-height', type: 'FLOAT', desktop: ['Icon-Size/md'], tablet: ['Icon-Size/sm'], mobile: ['Icon-Size/sm'] },

        // NavMenuItem - only line-height needs a dedicated variable
        { name: 'NavMenuItem/line-height', type: 'FLOAT', desktop: ['Icon-Size/md'], tablet: ['Icon-Size/sm'], mobile: ['Icon-Size/sm'] },
    ];

    const atomVars: Record<string, Variable> = {};
    const allVariables = await figma.variables.getLocalVariablesAsync();

    for (const def of atomVariableDefinitions) {
        // Check if variable already exists in collection
        let atomVar = allVariables.find(v =>
            v.variableCollectionId === atomsCollection!.id &&
            v.name === def.name
        );

        if (!atomVar) {
            atomVar = figma.variables.createVariable(def.name, atomsCollection!, def.type as VariableResolvedDataType);
        }

        // Set alias references for each mode
        const desktopAlias = findVar(def.desktop, def.type as VariableResolvedDataType);
        const tabletAlias = findVar(def.tablet, def.type as VariableResolvedDataType);
        const mobileAlias = findVar(def.mobile, def.type as VariableResolvedDataType);

        // Fallback values for FLOAT types
        const floatFallbacksDesktop: Record<string, number> = {
            'Button/padding-y': 12, 'Button/padding-x': 24, 'Button/font-size': 16, 'Button/icon-size': 24, 'Button/line-height': 24, 'Button/gap': 12, 'Button/radius': 8, 'Button/font-weight': 500,
            'Input/padding-y': 12, 'Input/padding-x': 12, 'Input/font-size': 16, 'Input/icon-size': 20, 'Input/line-height': 20, 'Input/gap': 8, 'Input/radius': 8, 'Input/font-weight': 400,
            'Badge/padding-y': 4, 'Badge/padding-x': 12, 'Badge/font-size': 14, 'Badge/icon-size': 16, 'Badge/line-height': 16, 'Badge/gap': 4, 'Badge/radius': 999, 'Badge/font-weight': 500,
        };
        const floatFallbacksTablet: Record<string, number> = {
            'Button/padding-y': 10, 'Button/padding-x': 20, 'Button/font-size': 14, 'Button/icon-size': 20, 'Button/line-height': 20, 'Button/gap': 8, 'Button/radius': 6, 'Button/font-weight': 500,
            'Input/padding-y': 10, 'Input/padding-x': 10, 'Input/font-size': 14, 'Input/icon-size': 18, 'Input/line-height': 18, 'Input/gap': 6, 'Input/radius': 6, 'Input/font-weight': 400,
            'Badge/padding-y': 3, 'Badge/padding-x': 10, 'Badge/font-size': 12, 'Badge/icon-size': 14, 'Badge/line-height': 14, 'Badge/gap': 3, 'Badge/radius': 999, 'Badge/font-weight': 500,
        };
        const floatFallbacksMobile: Record<string, number> = {
            'Button/padding-y': 8, 'Button/padding-x': 16, 'Button/font-size': 12, 'Button/icon-size': 16, 'Button/line-height': 16, 'Button/gap': 6, 'Button/radius': 4, 'Button/font-weight': 500,
            'Input/padding-y': 8, 'Input/padding-x': 8, 'Input/font-size': 12, 'Input/icon-size': 16, 'Input/line-height': 16, 'Input/gap': 4, 'Input/radius': 4, 'Input/font-weight': 400,
            'Badge/padding-y': 2, 'Badge/padding-x': 8, 'Badge/font-size': 10, 'Badge/icon-size': 12, 'Badge/line-height': 12, 'Badge/gap': 2, 'Badge/radius': 999, 'Badge/font-weight': 500,
        };

        // Fallback values for STRING types 
        const stringFallbacks: Record<string, string> = {
            'Button/font-family': 'Inter',
            'Input/font-family': 'Inter',
            'Badge/font-family': 'Inter',
        };

        // Set values based on type
        if (def.type === 'STRING') {
            // STRING type variables (font-family)
            if (desktopAlias) {
                atomVar.setValueForMode(modeIds.desktop, { type: 'VARIABLE_ALIAS', id: desktopAlias.id });
            } else {
                atomVar.setValueForMode(modeIds.desktop, stringFallbacks[def.name] || 'Inter');
            }
            if (tabletAlias) {
                atomVar.setValueForMode(modeIds.tablet, { type: 'VARIABLE_ALIAS', id: tabletAlias.id });
            } else {
                atomVar.setValueForMode(modeIds.tablet, stringFallbacks[def.name] || 'Inter');
            }
            if (mobileAlias) {
                atomVar.setValueForMode(modeIds.mobile, { type: 'VARIABLE_ALIAS', id: mobileAlias.id });
            } else {
                atomVar.setValueForMode(modeIds.mobile, stringFallbacks[def.name] || 'Inter');
            }
        } else {
            // FLOAT type variables
            if (desktopAlias) {
                atomVar.setValueForMode(modeIds.desktop, { type: 'VARIABLE_ALIAS', id: desktopAlias.id });
            } else {
                atomVar.setValueForMode(modeIds.desktop, floatFallbacksDesktop[def.name] || 16);
            }

            if (tabletAlias) {
                atomVar.setValueForMode(modeIds.tablet, { type: 'VARIABLE_ALIAS', id: tabletAlias.id });
            } else {
                atomVar.setValueForMode(modeIds.tablet, floatFallbacksTablet[def.name] || 14);
            }

            if (mobileAlias) {
                atomVar.setValueForMode(modeIds.mobile, { type: 'VARIABLE_ALIAS', id: mobileAlias.id });
            } else {
                atomVar.setValueForMode(modeIds.mobile, floatFallbacksMobile[def.name] || 12);
            }
        }

        atomVars[def.name] = atomVar;
    }

    return { collection: atomsCollection, modeIds, atomVars };
}


async function generateAtomicComponents(config: AtomsConfig): Promise<void> {
    try {
        figma.ui.postMessage({ type: 'progress-start', payload: 'Generating atomic components...' });

        const allVariables = await figma.variables.getLocalVariablesAsync();
        const collections = await figma.variables.getLocalVariableCollectionsAsync();

        // Find theme collection
        const themeCollection = collections.find(c => c.id === config.themeCollectionId);
        if (!themeCollection) {
            throw new Error('Theme collection not found');
        }

        // Get theme variables
        const themeVars = allVariables.filter(v => v.variableCollectionId === config.themeCollectionId);
        const aliasesVars = config.aliasesCollectionId
            ? allVariables.filter(v => v.variableCollectionId === config.aliasesCollectionId)
            : [];

        // Helper to find a variable by partial name
        const findVar = (searchTerms: string[], type?: VariableResolvedDataType): Variable | undefined => {
            const vars = [...themeVars, ...aliasesVars];
            for (const term of searchTerms) {
                const found = vars.find(v => {
                    const match = v.name.toLowerCase().includes(term.toLowerCase());
                    if (type) return match && v.resolvedType === type;
                    return match;
                });
                if (found) return found;
            }
            return undefined;
        };

        // Step 1: Create the Atoms collection with responsive variables
        figma.ui.postMessage({ type: 'atoms-generation-progress', payload: { percent: 5, message: 'Creating Atoms variables...' } });
        await new Promise(resolve => setTimeout(resolve, 50));
        const { atomVars } = await createAtomsCollection(findVar);

        // Create output container
        let container: FrameNode | PageNode;

        if (config.output === 'page') {
            container = figma.createPage();
            container.name = `${config.prefix}Components`;
            await figma.setCurrentPageAsync(container as PageNode);
        } else {
            container = figma.createFrame();
            container.name = `${config.prefix}Components`;
            container.layoutMode = 'VERTICAL';
            container.primaryAxisSizingMode = 'AUTO';
            container.counterAxisSizingMode = 'AUTO';
            container.itemSpacing = 48;
            container.paddingTop = 48;
            container.paddingBottom = 48;
            container.paddingLeft = 48;
            container.paddingRight = 48;
            container.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
        }

        let componentCount = 0;

        // ============================================
        // BUTTONS (no more size variants - using Atoms variables)
        // ============================================
        if (config.components.buttons) {
            const { variants } = config.components.buttons;

            figma.ui.postMessage({ type: 'atoms-generation-progress', payload: { percent: 10, message: 'Creating buttons...' } });
            await new Promise(resolve => setTimeout(resolve, 50));

            // Collect all button components for combining into variants
            const buttonComponents: ComponentNode[] = [];
            const states = ['Default', 'Hover', 'Active', 'Disabled'];

            for (const variant of variants) {
                for (const state of states) {
                    // Force component creation for variants
                    const originalAsComponents = config.asComponents;
                    config.asComponents = true;

                    const btn = await createButton(variant, state.toLowerCase(), config, findVar, atomVars) as ComponentNode;

                    // Name with property=value format for variants
                    const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
                    btn.name = `Variant=${variantCapitalized}, State=${state}`;

                    buttonComponents.push(btn);
                    componentCount++;

                    config.asComponents = originalAsComponents;
                }
            }

            // Combine all button components into a ComponentSet
            if (buttonComponents.length > 0) {
                const buttonComponentSet = figma.combineAsVariants(buttonComponents, container);
                buttonComponentSet.name = `${config.prefix}Button`;

                // Style the component set frame
                buttonComponentSet.layoutMode = 'HORIZONTAL';
                buttonComponentSet.layoutWrap = 'WRAP';
                buttonComponentSet.primaryAxisSizingMode = 'AUTO';
                buttonComponentSet.counterAxisSizingMode = 'AUTO';
                buttonComponentSet.itemSpacing = 16;
                buttonComponentSet.counterAxisSpacing = 16;
                buttonComponentSet.paddingTop = 24;
                buttonComponentSet.paddingBottom = 24;
                buttonComponentSet.paddingLeft = 24;
                buttonComponentSet.paddingRight = 24;
            }
        }

        // ============================================
        // INPUTS (no more size variants - using Atoms variables)
        // ============================================
        if (config.components.inputs) {
            const { variants, states } = config.components.inputs;

            figma.ui.postMessage({ type: 'atoms-generation-progress', payload: { percent: 40, message: 'Creating inputs...' } });
            await new Promise(resolve => setTimeout(resolve, 50));

            // Collect all input components for combining into variants
            const inputComponents: ComponentNode[] = [];

            for (const variant of variants) {
                for (const state of states) {
                    // Force component creation for variants
                    const originalAsComponents = config.asComponents;
                    config.asComponents = true;

                    const input = await createInput(variant, state, config, findVar, atomVars) as ComponentNode;

                    // Name with property=value format for variants
                    const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
                    const stateCapitalized = state.charAt(0).toUpperCase() + state.slice(1);
                    input.name = `Type=${variantCapitalized}, State=${stateCapitalized}`;

                    inputComponents.push(input);
                    componentCount++;

                    config.asComponents = originalAsComponents;
                }
            }

            // Combine all input components into a ComponentSet
            if (inputComponents.length > 0) {
                const inputComponentSet = figma.combineAsVariants(inputComponents, container);
                inputComponentSet.name = `${config.prefix}Input`;

                // Style the component set frame
                inputComponentSet.layoutMode = 'HORIZONTAL';
                inputComponentSet.layoutWrap = 'WRAP';
                inputComponentSet.primaryAxisSizingMode = 'AUTO';
                inputComponentSet.counterAxisSizingMode = 'AUTO';
                inputComponentSet.itemSpacing = 16;
                inputComponentSet.counterAxisSpacing = 16;
                inputComponentSet.paddingTop = 24;
                inputComponentSet.paddingBottom = 24;
                inputComponentSet.paddingLeft = 24;
                inputComponentSet.paddingRight = 24;
            }
        }

        // ============================================
        // BADGES (no more size variants - using Atoms variables)
        // ============================================
        if (config.components.badges) {
            const { variants } = config.components.badges;

            figma.ui.postMessage({ type: 'atoms-generation-progress', payload: { percent: 70, message: 'Creating badges...' } });
            await new Promise(resolve => setTimeout(resolve, 50));

            // Collect all badge components for combining into variants
            const badgeComponents: ComponentNode[] = [];

            for (const variant of variants) {
                // Force component creation for variants
                const originalAsComponents = config.asComponents;
                config.asComponents = true;

                const badge = await createBadge(variant, config, findVar, atomVars) as ComponentNode;

                // Name with property=value format for variants
                const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
                badge.name = `Variant=${variantCapitalized}`;

                badgeComponents.push(badge);
                componentCount++;

                config.asComponents = originalAsComponents;
            }

            // Combine all badge components into a ComponentSet
            if (badgeComponents.length > 0) {
                const badgeComponentSet = figma.combineAsVariants(badgeComponents, container);
                badgeComponentSet.name = `${config.prefix}Badge`;

                // Style the component set frame
                badgeComponentSet.layoutMode = 'HORIZONTAL';
                badgeComponentSet.layoutWrap = 'WRAP';
                badgeComponentSet.primaryAxisSizingMode = 'AUTO';
                badgeComponentSet.counterAxisSizingMode = 'AUTO';
                badgeComponentSet.itemSpacing = 16;
                badgeComponentSet.counterAxisSpacing = 16;
                badgeComponentSet.paddingTop = 24;
                badgeComponentSet.paddingBottom = 24;
                badgeComponentSet.paddingLeft = 24;
                badgeComponentSet.paddingRight = 24;
            }
        }

        // ============================================
        // NAV MENU ITEMS
        // ============================================
        if (config.components.navMenu) {
            figma.ui.postMessage({ type: 'atoms-generation-progress', payload: { percent: 80, message: 'Creating nav menu items...' } });
            await new Promise(resolve => setTimeout(resolve, 50));

            const { states: menuStates } = config.components.navMenu;
            const menuItemComponents: ComponentNode[] = [];

            for (const state of menuStates) {
                const originalAsComponents = config.asComponents;
                config.asComponents = true;

                const menuItem = await createMenuItem(state, config, findVar, atomVars) as ComponentNode;

                // Name with property=value format for variants
                const stateCapitalized = state.charAt(0).toUpperCase() + state.slice(1);
                menuItem.name = `State=${stateCapitalized}`;

                menuItemComponents.push(menuItem);
                componentCount++;

                config.asComponents = originalAsComponents;
            }

            // Combine all menu item components into a ComponentSet
            if (menuItemComponents.length > 0) {
                const menuItemComponentSet = figma.combineAsVariants(menuItemComponents, container);
                menuItemComponentSet.name = `${config.prefix}NavMenuItem`;

                // Style the component set frame
                menuItemComponentSet.layoutMode = 'HORIZONTAL';
                menuItemComponentSet.layoutWrap = 'WRAP';
                menuItemComponentSet.primaryAxisSizingMode = 'AUTO';
                menuItemComponentSet.counterAxisSizingMode = 'AUTO';
                menuItemComponentSet.itemSpacing = 16;
                menuItemComponentSet.counterAxisSpacing = 16;
                menuItemComponentSet.paddingTop = 24;
                menuItemComponentSet.paddingBottom = 24;
                menuItemComponentSet.paddingLeft = 24;
                menuItemComponentSet.paddingRight = 24;
            }
        }

        // Final progress update
        figma.ui.postMessage({ type: 'atoms-generation-progress', payload: { percent: 95, message: 'Finalizing component sets...' } });

        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 50));

        figma.ui.postMessage({ type: 'atoms-generation-progress', payload: { percent: 100, message: 'Complete!' } });
        figma.ui.postMessage({ type: 'progress-end' });
        figma.ui.postMessage({ type: 'atoms-generation-complete', payload: { count: componentCount } });
        figma.notify(`Generated ${componentCount} atomic components!`);

    } catch (err) {
        console.error('Error generating components:', err);
        figma.ui.postMessage({ type: 'progress-end' });
        figma.ui.postMessage({ type: 'atoms-generation-error', payload: (err as Error).message });
        figma.notify('Error: ' + (err as Error).message);
    }
}

// Helper: Find an existing icon component in the project
async function findIconComponent(preferredNames: string[] = ['add_rounded', 'add', 'plus']): Promise<ComponentNode | null> {
    // First, search on the current page (doesn't require loadAllPagesAsync)
    let allNodes = figma.currentPage.findAll(node =>
        node.type === 'COMPONENT' &&
        (node.name.toLowerCase().includes('icon') ||
            node.name.toLowerCase().includes('add') ||
            node.name.toLowerCase().includes('plus'))
    ) as ComponentNode[];

    // Try to find by preferred names on current page
    for (const name of preferredNames) {
        const found = allNodes.find(c =>
            c.name.toLowerCase().includes(name.toLowerCase()) ||
            c.name.toLowerCase().replace(/[_-]/g, '').includes(name.toLowerCase().replace(/[_-]/g, ''))
        );
        if (found) return found;
    }

    // If found any icon on current page, use it
    if (allNodes.length > 0) return allNodes[0];

    // If not found on current page, try loading all pages
    try {
        await figma.loadAllPagesAsync();

        allNodes = figma.root.findAll(node =>
            node.type === 'COMPONENT' &&
            (node.name.toLowerCase().includes('icon') ||
                node.name.toLowerCase().includes('add') ||
                node.name.toLowerCase().includes('plus'))
        ) as ComponentNode[];

        // Try preferred names again
        for (const name of preferredNames) {
            const found = allNodes.find(c =>
                c.name.toLowerCase().includes(name.toLowerCase()) ||
                c.name.toLowerCase().replace(/[_-]/g, '').includes(name.toLowerCase().replace(/[_-]/g, ''))
            );
            if (found) return found;
        }

        if (allNodes.length > 0) return allNodes[0];
    } catch (e) {
        // Pages not loaded, using current page only
    }

    return null;
}


// Helper: Apply color variable to icon content (recursively)
function applyColorToIconSubtree(node: SceneNode, colorVar: Variable) {
    const colorPaint = figma.variables.setBoundVariableForPaint(
        { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
        'color',
        colorVar
    );

    // Check if node has fills
    if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
        // Only apply if it's not a frame/component/instance, or if it is but we want to force it
        // Usually icons are made of Vector, BooleanOperation, etc.
        if (node.type !== 'FRAME' && node.type !== 'INSTANCE' && node.type !== 'COMPONENT') {
            node.fills = [colorPaint];
        }
    }

    // Check if node has strokes
    if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
        if (node.type !== 'FRAME' && node.type !== 'INSTANCE' && node.type !== 'COMPONENT') {
            node.strokes = [colorPaint];
        }
    }

    // Recursively apply to children
    if ('children' in node) {
        for (const child of (node as any).children) {
            applyColorToIconSubtree(child, colorVar);
        }
    }
}

// Helper: Create Icon Instance with Variable for size (for Atoms-based responsive icons)
async function createIconInstanceWithVar(
    name: string,
    sizeVar: Variable | undefined,
    colorVar?: Variable,
    preferredNames?: string[]
): Promise<InstanceNode | FrameNode> {
    // Try to find an existing icon component
    const iconComponent = await findIconComponent(preferredNames);

    if (iconComponent) {
        // Create instance of the icon component
        const instance = iconComponent.createInstance();
        instance.name = name;
        instance.fills = []; // Ensure container is transparent

        // Bind size to the provided variable
        if (sizeVar) {
            instance.setBoundVariable('width', sizeVar);
            instance.setBoundVariable('height', sizeVar);
        } else {
            instance.resize(20, 20);
        }

        // Apply color variable to icon content
        if (colorVar) {
            applyColorToIconSubtree(instance, colorVar);
        }

        return instance;
    }

    // Fallback: Create a simple frame with a placeholder if no icon component found
    const iconFrame = figma.createFrame();
    iconFrame.name = name;
    iconFrame.layoutMode = 'HORIZONTAL';
    iconFrame.primaryAxisSizingMode = 'FIXED';
    iconFrame.counterAxisSizingMode = 'FIXED';
    iconFrame.primaryAxisAlignItems = 'CENTER';
    iconFrame.counterAxisAlignItems = 'CENTER';
    iconFrame.fills = []; // Transparent background

    // Bind size to variable or use fallback
    if (sizeVar) {
        iconFrame.setBoundVariable('width', sizeVar);
        iconFrame.setBoundVariable('height', sizeVar);
    } else {
        iconFrame.resize(20, 20);
    }

    // Create a simple placeholder shape inside the fallback frame
    const rect = figma.createRectangle();
    rect.name = 'Placeholder';
    rect.resize(12, 12);

    // Apply color or fallback to the rectangle content
    if (colorVar) {
        rect.fills = [figma.variables.setBoundVariableForPaint(
            { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
            'color',
            colorVar
        )];
    } else {
        rect.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 0.3 }];
    }

    iconFrame.appendChild(rect);
    iconFrame.cornerRadius = 4;

    return iconFrame;
}

// Helper: Create Icon Instance for component icons
// Creates an instance of an existing icon component with proper sizing and color
async function createIconInstance(
    name: string,
    size: string,
    findVar: (terms: string[], type?: VariableResolvedDataType) => Variable | undefined,
    colorVar?: Variable,
    preferredNames?: string[]
): Promise<InstanceNode | FrameNode> {
    // Try to find an existing icon component
    const iconComponent = await findIconComponent(preferredNames);

    if (iconComponent) {
        // Create instance of the icon component
        const instance = iconComponent.createInstance();
        instance.name = name;
        instance.fills = []; // Ensure container is transparent

        // Size mapping for icons based on component size
        const iconSizeMap: Record<string, string[]> = {
            sm: ['Icon-Size/sm'],
            md: ['Icon-Size/md'],
            lg: ['Icon-Size/lg']
        };

        // Fallback sizes if variable not found
        const iconSizeFallback: Record<string, number> = { sm: 16, md: 20, lg: 24 };

        // Try to bind width and height to Icon-Size variable
        const iconSizeVar = findVar(iconSizeMap[size] || iconSizeMap['md'], 'FLOAT');
        if (iconSizeVar) {
            instance.setBoundVariable('width', iconSizeVar);
            instance.setBoundVariable('height', iconSizeVar);
        } else {
            const fallbackSize = iconSizeFallback[size] || 20;
            instance.resize(fallbackSize, fallbackSize);
        }

        // Apply color variable to icon content
        if (colorVar) {
            applyColorToIconSubtree(instance, colorVar);
        }

        return instance;
    }

    // Fallback: Create a simple frame with a placeholder if no icon component found
    const iconFrame = figma.createFrame();
    iconFrame.name = name;
    iconFrame.layoutMode = 'HORIZONTAL';
    iconFrame.primaryAxisSizingMode = 'FIXED';
    iconFrame.counterAxisSizingMode = 'FIXED';
    iconFrame.primaryAxisAlignItems = 'CENTER';
    iconFrame.counterAxisAlignItems = 'CENTER';
    iconFrame.fills = []; // Transparent background

    // Apply size from variable or fallback
    const iconSizeMap: Record<string, string[]> = {
        sm: ['Icon-Size/sm'],
        md: ['Icon-Size/md'],
        lg: ['Icon-Size/lg']
    };
    const iconSizeVar = findVar(iconSizeMap[size] || iconSizeMap['md'], 'FLOAT');
    const iconSizeFallback: Record<string, number> = { sm: 16, md: 20, lg: 24 };

    if (iconSizeVar) {
        iconFrame.setBoundVariable('width', iconSizeVar);
        iconFrame.setBoundVariable('height', iconSizeVar);
    } else {
        const fallbackSize = iconSizeFallback[size] || 20;
        iconFrame.resize(fallbackSize, fallbackSize);
    }

    // Create a simple placeholder shape inside the fallback frame
    const rect = figma.createRectangle();
    rect.name = 'Placeholder';
    rect.resize(iconFrame.width * 0.6, iconFrame.height * 0.6);

    // Apply color or fallback to the rectangle content
    if (colorVar) {
        rect.fills = [figma.variables.setBoundVariableForPaint(
            { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
            'color',
            colorVar
        )];
    } else {
        rect.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 0.3 }];
    }

    iconFrame.appendChild(rect);
    iconFrame.cornerRadius = 4;

    return iconFrame;
}

// Helper: Create Button component
async function createButton(
    variant: string,
    state: string,
    config: AtomsConfig,
    findVar: (terms: string[], type?: VariableResolvedDataType) => Variable | undefined,
    atomVars: Record<string, Variable>
): Promise<FrameNode | ComponentNode> {
    const btn = config.asComponents
        ? figma.createComponent()
        : figma.createFrame();

    btn.name = `Button/${variant}/${state}`;
    btn.layoutMode = 'HORIZONTAL';
    btn.primaryAxisSizingMode = 'AUTO';
    btn.counterAxisSizingMode = 'AUTO';
    btn.primaryAxisAlignItems = 'CENTER';
    btn.counterAxisAlignItems = 'CENTER';

    // Bind padding directly from Aliases
    const vPaddingVar = findVar(['padding/y/sm'], 'FLOAT');
    if (vPaddingVar) {
        btn.setBoundVariable('paddingTop', vPaddingVar);
        btn.setBoundVariable('paddingBottom', vPaddingVar);
    } else {
        btn.paddingTop = 12;
        btn.paddingBottom = 12;
    }

    const hPaddingVar = findVar(['padding/x/lg', 'padding/x/md'], 'FLOAT');
    if (hPaddingVar) {
        btn.setBoundVariable('paddingLeft', hPaddingVar);
        btn.setBoundVariable('paddingRight', hPaddingVar);
    } else {
        btn.paddingLeft = 24;
        btn.paddingRight = 24;
    }

    // Bind corner radius directly from Aliases
    const radiusVar = findVar(['radius/md', 'radius/sm'], 'FLOAT');
    if (radiusVar) {
        btn.setBoundVariable('topLeftRadius', radiusVar);
        btn.setBoundVariable('topRightRadius', radiusVar);
        btn.setBoundVariable('bottomLeftRadius', radiusVar);
        btn.setBoundVariable('bottomRightRadius', radiusVar);
    } else {
        btn.cornerRadius = 8;
    }

    // Background color based on variant and state
    let bgVarTerms: string[] = [];
    let textVarTerms: string[] = [];

    if (variant === 'primary') {
        if (state === 'hover') bgVarTerms = ['action/primaryhover', 'primaryhover'];
        else if (state === 'active') bgVarTerms = ['action/primaryactive', 'primaryactive'];
        else if (state === 'disabled') bgVarTerms = ['action/primarydisabled', 'primarydisabled'];
        else bgVarTerms = ['action/primary'];
        textVarTerms = ['action/primarytext', 'text/inverse'];
    } else if (variant === 'secondary') {
        if (state === 'hover') bgVarTerms = ['action/secondaryhover', 'secondaryhover'];
        else bgVarTerms = ['action/secondary'];
        textVarTerms = ['action/secondarytext', 'text/primary'];
    } else if (variant === 'ghost') {
        if (state === 'hover') bgVarTerms = ['action/ghosthover', 'ghosthover'];
        else bgVarTerms = ['action/ghost', 'background/primary'];
        textVarTerms = ['action/ghosttext', 'text/brand', 'action/primary'];
    } else if (variant === 'destructive') {
        if (state === 'hover') bgVarTerms = ['action/destructivehover', 'destructivehover'];
        else bgVarTerms = ['action/destructive'];
        textVarTerms = ['action/destructivetext', 'text/inverse'];
    }

    // Apply background
    const bgVar = findVar(bgVarTerms, 'COLOR');
    if (bgVar) {
        btn.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }, 'color', bgVar)];
    } else {
        btn.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.6, b: 0.9 } }];
    }

    // Add border for secondary/ghost
    if (variant === 'secondary' || variant === 'ghost') {
        const borderVar = findVar(['border/default'], 'COLOR');
        if (borderVar) {
            btn.strokes = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }, 'color', borderVar)];
            btn.strokeWeight = 1;
        }
    }

    // Opacity for disabled
    if (state === 'disabled') {
        btn.opacity = 0.5;
    }

    // Get text color variable for icons
    const textVar = findVar(textVarTerms, 'COLOR');

    // Create icon left using icon-size from Aliases
    const iconSizeVar = findVar(['Icon-Size/lg', 'Icon-Size/md'], 'FLOAT');
    const iconLeft = await createIconInstanceWithVar('IconLeft', iconSizeVar, textVar);
    iconLeft.visible = false;
    btn.appendChild(iconLeft);

    // Text - Load font first (required before any text operations)
    const text = figma.createText();
    text.name = 'Label';
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    text.fontName = { family: 'Inter', style: 'Medium' };

    const defaultLabel = variant.charAt(0).toUpperCase() + variant.slice(1);
    text.characters = defaultLabel;

    // Bind font size directly from Aliases
    const fontSizeVar = findVar(['Typography/Body/base', 'Body/base'], 'FLOAT');
    if (fontSizeVar) {
        text.setBoundVariable('fontSize', fontSizeVar);
    } else {
        text.fontSize = 16;
    }

    // Bind font family directly from Aliases
    const fontFamilyVar = findVar(['Typography/Font Family/Body', 'Font Family/Body'], 'STRING');
    if (fontFamilyVar) {
        text.setBoundVariable('fontFamily', fontFamilyVar);
    }

    // Bind font weight directly from Aliases
    const fontWeightVar = findVar(['Typography/Font Weight/Medium', 'Font Weight/Medium'], 'FLOAT');
    if (fontWeightVar) {
        text.setBoundVariable('fontWeight', fontWeightVar);
    }

    // Bind letter-spacing directly from Aliases
    const letterSpacingVar = findVar(['Typography/Letter Spacing/normal', 'Letter Spacing/normal', 'letter-spacing/normal'], 'FLOAT');
    if (letterSpacingVar) {
        text.setBoundVariable('letterSpacing', letterSpacingVar);
    }

    // Bind line height from Atoms (this one is special - links to icon-size)
    const lineHeightVar = atomVars['Button/line-height'];
    if (lineHeightVar) {
        text.setBoundVariable('lineHeight', lineHeightVar);
    }

    // Text color
    if (textVar) {
        text.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', textVar)];
    }

    btn.appendChild(text);

    // Create icon right (hidden by default)
    const iconRight = await createIconInstanceWithVar('IconRight', iconSizeVar, textVar);
    iconRight.visible = false;
    btn.appendChild(iconRight);

    // Bind gap directly from Aliases
    const gapVar = findVar(['gap/md', 'gap/sm'], 'FLOAT');
    if (gapVar) {
        btn.setBoundVariable('itemSpacing', gapVar);
    } else {
        btn.itemSpacing = 12;
    }

    // Add component properties for icons (only for ComponentNode)
    if (config.asComponents && btn.type === 'COMPONENT') {
        const component = btn as ComponentNode;

        // Add text property
        const textPropName = component.addComponentProperty('Text', 'TEXT', defaultLabel);
        text.componentPropertyReferences = { characters: textPropName };

        // Add boolean properties for icon visibility
        const showIconLeftProp = component.addComponentProperty('showIconLeft', 'BOOLEAN', false);
        iconLeft.componentPropertyReferences = { visible: showIconLeftProp };

        const showIconRightProp = component.addComponentProperty('showIconRight', 'BOOLEAN', false);
        iconRight.componentPropertyReferences = { visible: showIconRightProp };

        // Add INSTANCE_SWAP properties for icon swapping (only if icons are instances)
        if (iconLeft.type === 'INSTANCE') {
            const mainCompLeft = await iconLeft.getMainComponentAsync();
            if (mainCompLeft) {
                const swapLeftProp = component.addComponentProperty('SwapIconLeft', 'INSTANCE_SWAP', mainCompLeft.id);
                iconLeft.componentPropertyReferences = {
                    ...iconLeft.componentPropertyReferences,
                    mainComponent: swapLeftProp
                };
            }
        }
        if (iconRight.type === 'INSTANCE') {
            const mainCompRight = await iconRight.getMainComponentAsync();
            if (mainCompRight) {
                const swapRightProp = component.addComponentProperty('SwapIconRight', 'INSTANCE_SWAP', mainCompRight.id);
                iconRight.componentPropertyReferences = {
                    ...iconRight.componentPropertyReferences,
                    mainComponent: swapRightProp
                };
            }
        }
    }

    return btn;
}

// Helper: Create Input component
async function createInput(
    variant: string,
    state: string,
    config: AtomsConfig,
    findVar: (terms: string[], type?: VariableResolvedDataType) => Variable | undefined,
    atomVars: Record<string, Variable>
): Promise<FrameNode | ComponentNode> {
    const input = config.asComponents
        ? figma.createComponent()
        : figma.createFrame();

    input.name = `Input/${variant}/${state}`;
    input.layoutMode = 'HORIZONTAL';
    input.primaryAxisSizingMode = 'FIXED';
    input.counterAxisSizingMode = 'AUTO';
    input.counterAxisAlignItems = 'CENTER';
    input.resize(240, input.height);
    input.clipsContent = true; // Required to enable spread on drop shadows

    // Bind padding directly from Aliases
    const vPaddingVar = findVar(['padding/y/sm'], 'FLOAT');
    if (vPaddingVar) {
        input.setBoundVariable('paddingTop', vPaddingVar);
        input.setBoundVariable('paddingBottom', vPaddingVar);
    } else {
        input.paddingTop = 12;
        input.paddingBottom = 12;
    }

    const hPaddingVar = findVar(['padding/x/sm', 'padding/y/sm'], 'FLOAT');

    if (hPaddingVar) {
        input.setBoundVariable('paddingLeft', hPaddingVar);
        // For select variant, use vertical padding for right side (balanced padding)
        if (variant === 'select' && vPaddingVar) {
            input.setBoundVariable('paddingRight', vPaddingVar);
        } else if (variant === 'select') {
            input.paddingRight = 12; // Fallback: same as vertical padding
        } else {
            input.setBoundVariable('paddingRight', hPaddingVar);
        }
    } else {
        input.paddingLeft = 16;
        input.paddingRight = variant === 'select' ? 12 : 16;
    }

    // Bind corner radius directly from Aliases
    const radiusVar = findVar(['radius/md', 'radius/sm'], 'FLOAT');
    if (radiusVar) {
        input.setBoundVariable('topLeftRadius', radiusVar);
        input.setBoundVariable('topRightRadius', radiusVar);
        input.setBoundVariable('bottomLeftRadius', radiusVar);
        input.setBoundVariable('bottomRightRadius', radiusVar);
    } else {
        input.cornerRadius = 8;
    }

    // Background
    const bgVar = findVar(['surface/card', 'surface/primary', 'background/primary'], 'COLOR');
    if (bgVar) {
        input.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', bgVar)];
    } else {
        input.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    }

    // Border based on state
    let borderTerms: string[] = ['border/default'];
    if (state === 'focus') borderTerms = ['border/focus'];
    else if (state === 'error') borderTerms = ['border/error', 'status/error'];
    else if (state === 'warning') borderTerms = ['border/warning', 'status/warning'];
    else if (state === 'success') borderTerms = ['border/success', 'status/success'];
    else if (state === 'disabled') borderTerms = ['border/disabled'];

    const borderVar = findVar(borderTerms, 'COLOR');
    if (borderVar) {
        input.strokes = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }, 'color', borderVar)];
    } else {
        input.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
    }
    // Stroke weight: 2px for interactive states, 1px for default/disabled
    input.strokeWeight = (state === 'focus' || state === 'error' || state === 'warning' || state === 'success') ? 2 : 1;

    // Add drop shadow for focus, error, warning, and success states
    if (state === 'focus' || state === 'error' || state === 'warning' || state === 'success') {
        // Use theme variables for shadow colors (responsive to light/dark mode)
        let shadowColorTerms: string[] = [];
        if (state === 'focus') {
            shadowColorTerms = ['Interactive/focusRing'];
        } else if (state === 'error') {
            shadowColorTerms = ['Interactive/errorRing'];
        } else if (state === 'warning') {
            shadowColorTerms = ['Interactive/warningRing'];
        } else if (state === 'success') {
            shadowColorTerms = ['Interactive/successRing'];
        }

        const shadowColor = findVar(shadowColorTerms, 'COLOR');

        if (shadowColor) {
            // Determine fallback color based on state
            let fallbackColor = { r: 0.78, g: 0.82, b: 0.96, a: 1 }; // Indigo-200
            if (state === 'error') {
                fallbackColor = { r: 0.99, g: 0.82, b: 0.82, a: 1 }; // Red-200
            } else if (state === 'warning') {
                fallbackColor = { r: 0.99, g: 0.92, b: 0.73, a: 1 }; // Yellow-200
            } else if (state === 'success') {
                fallbackColor = { r: 0.73, g: 0.92, b: 0.79, a: 1 }; // Green-200
            }

            const shadowEffect: DropShadowEffect = {
                type: 'DROP_SHADOW',
                color: fallbackColor,
                offset: { x: 0, y: 0 },
                radius: 0,
                spread: 0,
                visible: true,
                blendMode: 'NORMAL'
            };

            // Bind color variable to the effect
            const boundEffect = figma.variables.setBoundVariableForEffect(shadowEffect, 'color', shadowColor) as DropShadowEffect;

            // Set spread=4 on the bound effect
            const finalEffect: DropShadowEffect = {
                ...boundEffect,
                spread: 4
            };

            input.effects = [finalEffect];
        }
    }

    // Opacity for disabled
    if (state === 'disabled') {
        input.opacity = 0.5;
    }

    // Get icon color and size directly from Aliases
    const iconColorVar = findVar(['text/secondary', 'icon/default'], 'COLOR');
    const iconSizeVar = findVar(['Icon-Size/lg', 'Icon-Size/md'], 'FLOAT');

    // Declare icon variables
    let iconLeft: InstanceNode | FrameNode | null = null;
    let iconRight: InstanceNode | FrameNode | null = null;

    // For text and select variants, add left icon (hidden by default)
    if (variant !== 'textarea') {
        iconLeft = await createIconInstanceWithVar('IconLeft', iconSizeVar, iconColorVar);
        iconLeft.visible = false;
        input.appendChild(iconLeft);
    }

    // Placeholder text
    const text = figma.createText();
    text.name = 'Placeholder';
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    text.fontName = { family: 'Inter', style: 'Regular' };
    text.characters = state === 'disabled' ? 'Disabled' : (variant === 'textarea' ? 'Enter text...' : 'Placeholder');

    // Bind font size directly from Aliases
    const fontSizeVar = findVar(['Typography/Body/base', 'Body/base'], 'FLOAT');
    if (fontSizeVar) {
        text.setBoundVariable('fontSize', fontSizeVar);
    } else {
        text.fontSize = 16;
    }

    // Bind font family directly from Aliases
    const fontFamilyVar = findVar(['Typography/Font Family/Body', 'Font Family/Body'], 'STRING');
    if (fontFamilyVar) {
        text.setBoundVariable('fontFamily', fontFamilyVar);
    }

    // Bind font weight directly from Aliases
    const fontWeightVar = findVar(['Typography/Font Weight/Regular', 'Font Weight/Regular'], 'FLOAT');
    if (fontWeightVar) {
        text.setBoundVariable('fontWeight', fontWeightVar);
    }

    // Bind letter-spacing directly from Aliases
    const letterSpacingVar = findVar(['Typography/Letter Spacing/normal', 'Letter Spacing/normal', 'letter-spacing/normal'], 'FLOAT');
    if (letterSpacingVar) {
        text.setBoundVariable('letterSpacing', letterSpacingVar);
    }

    // Bind line height from Atoms (special - links to icon-size)
    const lineHeightVar = atomVars['Input/line-height'];
    if (lineHeightVar) {
        text.setBoundVariable('lineHeight', lineHeightVar);
    }

    text.layoutGrow = 1;

    // Text color based on state
    let textColorTerms: string[] = ['text/placeholder', 'text/tertiary'];
    if (state === 'focus') {
        textColorTerms = ['text/primary'];
    } else if (state === 'error' || state === 'warning' || state === 'success') {
        textColorTerms = ['text/primary', 'text/secondary'];
    }

    const textVar = findVar(textColorTerms, 'COLOR');
    if (textVar) {
        text.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }, 'color', textVar)];
    }

    input.appendChild(text);

    // For text inputs, add right icon (hidden by default)
    if (variant === 'text') {
        iconRight = await createIconInstanceWithVar('IconRight', iconSizeVar, iconColorVar);
        iconRight.visible = false;
        input.appendChild(iconRight);
    }

    // Add chevron icon for select variant (always visible)
    if (variant === 'select') {
        const chevron = await createIconInstanceWithVar('Chevron', iconSizeVar, iconColorVar, ['expand_more', 'chevron_down', 'arrow_drop_down']);
        input.appendChild(chevron);
    }

    // Bind gap directly from Aliases
    if (variant !== 'textarea') {
        const gapVar = findVar(['gap/md', 'gap/sm'], 'FLOAT');
        if (gapVar) {
            input.setBoundVariable('itemSpacing', gapVar);
        } else {
            input.itemSpacing = 8;
        }
    }

    // Make textarea taller
    if (variant === 'textarea') {
        input.layoutMode = 'VERTICAL';
        input.resize(240, 100);
        input.primaryAxisSizingMode = 'FIXED';
    }

    // Add component properties (only for ComponentNode)
    if (config.asComponents && input.type === 'COMPONENT') {
        const component = input as ComponentNode;
        const defaultPlaceholder = text.characters;
        const propName = component.addComponentProperty('Placeholder', 'TEXT', defaultPlaceholder);
        text.componentPropertyReferences = { characters: propName };

        // Add icon visibility and swap properties (for text and select inputs)
        if (iconLeft) {
            const showIconLeftProp = component.addComponentProperty('showIconLeft', 'BOOLEAN', false);
            iconLeft.componentPropertyReferences = { visible: showIconLeftProp };

            // Add INSTANCE_SWAP for icon swapping
            if (iconLeft.type === 'INSTANCE') {
                const mainCompLeft = await iconLeft.getMainComponentAsync();
                if (mainCompLeft) {
                    const swapLeftProp = component.addComponentProperty('SwapIconLeft', 'INSTANCE_SWAP', mainCompLeft.id);
                    iconLeft.componentPropertyReferences = {
                        ...iconLeft.componentPropertyReferences,
                        mainComponent: swapLeftProp
                    };
                }
            }
        }

        // Only text inputs have right icon
        if (iconRight && variant === 'text') {
            const showIconRightProp = component.addComponentProperty('showIconRight', 'BOOLEAN', false);
            iconRight.componentPropertyReferences = { visible: showIconRightProp };

            // Add INSTANCE_SWAP for icon swapping
            if (iconRight.type === 'INSTANCE') {
                const mainCompRight = await iconRight.getMainComponentAsync();
                if (mainCompRight) {
                    const swapRightProp = component.addComponentProperty('SwapIconRight', 'INSTANCE_SWAP', mainCompRight.id);
                    iconRight.componentPropertyReferences = {
                        ...iconRight.componentPropertyReferences,
                        mainComponent: swapRightProp
                    };
                }
            }
        }
    }

    return input;
}

// Helper: Create Badge component
async function createBadge(
    variant: string,
    config: AtomsConfig,
    findVar: (terms: string[], type?: VariableResolvedDataType) => Variable | undefined,
    atomVars: Record<string, Variable>
): Promise<FrameNode | ComponentNode> {
    const badge = config.asComponents
        ? figma.createComponent()
        : figma.createFrame();

    badge.name = `Badge/${variant}`;
    badge.layoutMode = 'HORIZONTAL';
    badge.primaryAxisSizingMode = 'AUTO';
    badge.counterAxisSizingMode = 'AUTO';
    badge.primaryAxisAlignItems = 'CENTER';
    badge.counterAxisAlignItems = 'CENTER';

    // Bind padding directly from Aliases
    const vPaddingVar = findVar(['padding/y/sm', 'padding/y/xs'], 'FLOAT');
    if (vPaddingVar) {
        badge.setBoundVariable('paddingTop', vPaddingVar);
        badge.setBoundVariable('paddingBottom', vPaddingVar);
    } else {
        badge.paddingTop = 4;
        badge.paddingBottom = 4;
    }

    const hPaddingVar = findVar(['padding/x/md', 'padding/x/sm'], 'FLOAT');
    if (hPaddingVar) {
        badge.setBoundVariable('paddingLeft', hPaddingVar);
        badge.setBoundVariable('paddingRight', hPaddingVar);
    } else {
        badge.paddingLeft = 12;
        badge.paddingRight = 12;
    }

    // Bind corner radius directly from Aliases
    const radiusVar = findVar(['radius/full', 'radius/lg'], 'FLOAT');
    if (radiusVar) {
        badge.setBoundVariable('topLeftRadius', radiusVar);
        badge.setBoundVariable('topRightRadius', radiusVar);
        badge.setBoundVariable('bottomLeftRadius', radiusVar);
        badge.setBoundVariable('bottomRightRadius', radiusVar);
    } else {
        badge.cornerRadius = 999; // Pill shape fallback
    }

    // Background based on variant
    let bgTerms: string[] = [];
    let textTerms: string[] = [];

    if (variant === 'neutral') {
        bgTerms = ['surface/card', 'background/secondary'];
        textTerms = ['text/primary'];
    } else if (variant === 'primary') {
        bgTerms = ['action/primary'];
        textTerms = ['text/inverse'];
    } else if (variant === 'success') {
        bgTerms = ['status/success'];
        textTerms = ['text/inverse'];
    } else if (variant === 'warning') {
        bgTerms = ['status/warning'];
        textTerms = ['text/inverse'];
    } else if (variant === 'error') {
        bgTerms = ['status/error'];
        textTerms = ['text/inverse'];
    }

    const bgVar = findVar(bgTerms, 'COLOR');
    if (bgVar) {
        badge.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }, 'color', bgVar)];
    } else {
        badge.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    }

    // Neutral gets a border
    if (variant === 'neutral') {
        const borderVar = findVar(['border/default'], 'COLOR');
        if (borderVar) {
            badge.strokes = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }, 'color', borderVar)];
            badge.strokeWeight = 1;
        }
    }

    // Get text color and icon size directly from Aliases
    const textVar = findVar(textTerms, 'COLOR');
    const iconSizeVar = findVar(['Icon-Size/md', 'Icon-Size/sm'], 'FLOAT');

    // Create icon left (hidden by default)
    const iconLeft = await createIconInstanceWithVar('IconLeft', iconSizeVar, textVar);
    iconLeft.visible = false;
    badge.appendChild(iconLeft);

    // Text
    const text = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    text.fontName = { family: 'Inter', style: 'Medium' };

    const labelMap: Record<string, string> = {
        neutral: 'Label',
        primary: 'New',
        success: 'Success',
        warning: 'Warning',
        error: 'Error'
    };
    text.characters = labelMap[variant] || 'Badge';

    // Bind font size directly from Aliases
    const fontSizeVar = findVar(['Typography/Body/sm', 'Body/sm'], 'FLOAT');
    if (fontSizeVar) {
        text.setBoundVariable('fontSize', fontSizeVar);
    } else {
        text.fontSize = 14;
    }

    // Bind font family directly from Aliases
    const fontFamilyVar = findVar(['Typography/Font Family/Body', 'Font Family/Body'], 'STRING');
    if (fontFamilyVar) {
        text.setBoundVariable('fontFamily', fontFamilyVar);
    }

    // Bind font weight directly from Aliases
    const fontWeightVar = findVar(['Typography/Font Weight/Medium', 'Font Weight/Medium'], 'FLOAT');
    if (fontWeightVar) {
        text.setBoundVariable('fontWeight', fontWeightVar);
    }

    // Bind letter-spacing directly from Aliases
    const letterSpacingVar = findVar(['Typography/Letter Spacing/normal', 'Letter Spacing/normal', 'letter-spacing/normal'], 'FLOAT');
    if (letterSpacingVar) {
        text.setBoundVariable('letterSpacing', letterSpacingVar);
    }

    // Bind line height from Atoms (special - links to icon-size)
    const lineHeightVar = atomVars['Badge/line-height'];
    if (lineHeightVar) {
        text.setBoundVariable('lineHeight', lineHeightVar);
    }

    if (textVar) {
        text.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', textVar)];
    }

    badge.appendChild(text);

    // Create icon right (hidden by default)
    const iconRight = await createIconInstanceWithVar('IconRight', iconSizeVar, textVar);
    iconRight.visible = false;
    badge.appendChild(iconRight);

    // Bind gap directly from Aliases
    const gapVar = findVar(['gap/sm', 'gap/xs'], 'FLOAT');
    if (gapVar) {
        badge.setBoundVariable('itemSpacing', gapVar);
    } else {
        badge.itemSpacing = 4;
    }

    // Add component properties (only for ComponentNode)
    if (config.asComponents && badge.type === 'COMPONENT') {
        const component = badge as ComponentNode;
        const defaultLabel = text.characters;
        const propName = component.addComponentProperty('Text', 'TEXT', defaultLabel);
        text.componentPropertyReferences = { characters: propName };

        // Add icon properties
        const showIconLeftProp = component.addComponentProperty('showIconLeft', 'BOOLEAN', false);
        iconLeft.componentPropertyReferences = { visible: showIconLeftProp };

        const showIconRightProp = component.addComponentProperty('showIconRight', 'BOOLEAN', false);
        iconRight.componentPropertyReferences = { visible: showIconRightProp };

        // Add INSTANCE_SWAP properties for icon swapping
        if (iconLeft.type === 'INSTANCE') {
            const mainCompLeft = await iconLeft.getMainComponentAsync();
            if (mainCompLeft) {
                const swapLeftProp = component.addComponentProperty('SwapIconLeft', 'INSTANCE_SWAP', mainCompLeft.id);
                iconLeft.componentPropertyReferences = {
                    ...iconLeft.componentPropertyReferences,
                    mainComponent: swapLeftProp
                };
            }
        }
        if (iconRight.type === 'INSTANCE') {
            const mainCompRight = await iconRight.getMainComponentAsync();
            if (mainCompRight) {
                const swapRightProp = component.addComponentProperty('SwapIconRight', 'INSTANCE_SWAP', mainCompRight.id);
                iconRight.componentPropertyReferences = {
                    ...iconRight.componentPropertyReferences,
                    mainComponent: swapRightProp
                };
            }
        }
    }

    return badge;
}

// Helper: Create NavMenuItem component
async function createMenuItem(
    state: string,
    config: AtomsConfig,
    findVar: (terms: string[], type?: VariableResolvedDataType) => Variable | undefined,
    atomVars: Record<string, Variable>
): Promise<FrameNode | ComponentNode> {
    const item = config.asComponents
        ? figma.createComponent()
        : figma.createFrame();

    item.name = `NavMenuItem/${state}`;
    item.layoutMode = 'HORIZONTAL';
    item.primaryAxisSizingMode = 'AUTO';
    item.counterAxisSizingMode = 'AUTO';
    item.primaryAxisAlignItems = 'CENTER';
    item.counterAxisAlignItems = 'CENTER';

    // Padding directly from Aliases
    const vPaddingVar = findVar(['padding/y/xs', 'padding/y/sm'], 'FLOAT');
    if (vPaddingVar) {
        item.setBoundVariable('paddingTop', vPaddingVar);
        item.setBoundVariable('paddingBottom', vPaddingVar);
    } else {
        item.paddingTop = 8;
        item.paddingBottom = 8;
    }

    const hPaddingVar = findVar(['padding/x/sm', 'padding/x/xs'], 'FLOAT');
    if (hPaddingVar) {
        item.setBoundVariable('paddingLeft', hPaddingVar);
        item.setBoundVariable('paddingRight', hPaddingVar);
    } else {
        item.paddingLeft = 12;
        item.paddingRight = 12;
    }

    // Corner radius directly from Aliases
    const radiusVar = findVar(['radius/sm', 'radius/xs'], 'FLOAT');
    if (radiusVar) {
        item.setBoundVariable('topLeftRadius', radiusVar);
        item.setBoundVariable('topRightRadius', radiusVar);
        item.setBoundVariable('bottomLeftRadius', radiusVar);
        item.setBoundVariable('bottomRightRadius', radiusVar);
    } else {
        item.cornerRadius = 6;
    }

    // Background color based on state
    let bgVarTerms: string[] = [];
    let textVarTerms: string[] = [];
    let iconVarTerms: string[] = [];

    if (state === 'default') {
        bgVarTerms = []; // Transparent background
        textVarTerms = ['text/secondary', 'text/primary'];
        iconVarTerms = ['icon/secondary', 'icon/primary'];
    } else if (state === 'hover') {
        bgVarTerms = ['surface/hover', 'surface/card', 'background/secondary'];
        textVarTerms = ['text/primary'];
        iconVarTerms = ['icon/primary'];
    } else if (state === 'active') {
        bgVarTerms = ['action/ghost', 'surface/primary', 'background/brand'];
        textVarTerms = ['text/brand', 'action/primary', 'text/primary'];
        iconVarTerms = ['icon/brand', 'action/primary', 'icon/primary'];
    } else if (state === 'disabled') {
        bgVarTerms = [];
        textVarTerms = ['text/disabled', 'text/tertiary'];
        iconVarTerms = ['icon/disabled', 'icon/tertiary'];
    }

    // Apply background using findVar
    if (bgVarTerms.length > 0) {
        const bgVar = findVar(bgVarTerms, 'COLOR');
        if (bgVar) {
            item.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }, 'color', bgVar)];
        } else {
            item.fills = [];
        }
    } else {
        item.fills = [];
    }

    // Opacity for disabled
    if (state === 'disabled') {
        item.opacity = 0.5;
    }

    // Get text and icon color variables using findVar
    const textVar = findVar(textVarTerms, 'COLOR');
    const iconVar = findVar(iconVarTerms, 'COLOR');

    // Create icon left - icon-size from Aliases
    const iconSizeVar = findVar(['Icon-Size/md', 'Icon-Size/sm'], 'FLOAT');
    const iconLeft = await createIconInstanceWithVar('IconLeft', iconSizeVar, iconVar);
    iconLeft.visible = false; // Hidden by default
    item.appendChild(iconLeft);

    // Create text label
    const text = figma.createText();
    text.name = 'Label';
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    text.fontName = { family: 'Inter', style: 'Medium' };
    text.characters = 'Menu Item';

    // Bind font size directly from Aliases
    const fontSizeVar = findVar(['Typography/Body/sm', 'Body/sm'], 'FLOAT');
    if (fontSizeVar) {
        text.setBoundVariable('fontSize', fontSizeVar);
    } else {
        text.fontSize = 14;
    }

    // Bind font family directly from Aliases
    const fontFamilyVar = findVar(['Typography/Font Family/Body', 'Font Family/Body'], 'STRING');
    if (fontFamilyVar) {
        text.setBoundVariable('fontFamily', fontFamilyVar);
    }

    // Bind font weight directly from Aliases
    const fontWeightVar = findVar(['Typography/Font Weight/Medium', 'Font Weight/Medium'], 'FLOAT');
    if (fontWeightVar) {
        text.setBoundVariable('fontWeight', fontWeightVar);
    }

    // Bind letter-spacing directly from Aliases
    const letterSpacingVar = findVar(['Typography/Letter Spacing/normal', 'Letter Spacing/normal', 'letter-spacing/normal'], 'FLOAT');
    if (letterSpacingVar) {
        text.setBoundVariable('letterSpacing', letterSpacingVar);
    }

    // Bind line-height from Atoms (special - links to icon-size for consistent height)
    const lineHeightVar = atomVars['NavMenuItem/line-height'];
    if (lineHeightVar) {
        text.setBoundVariable('lineHeight', lineHeightVar);
    }

    // Apply text color using the found variable
    if (textVar) {
        text.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }, 'color', textVar)];
    }

    item.appendChild(text);

    // Create badge counter (hidden by default)
    const badgeFrame = figma.createFrame();
    badgeFrame.name = 'BadgeCounter';
    badgeFrame.layoutMode = 'HORIZONTAL';
    badgeFrame.primaryAxisSizingMode = 'AUTO';
    badgeFrame.counterAxisSizingMode = 'AUTO';
    badgeFrame.primaryAxisAlignItems = 'CENTER';
    badgeFrame.counterAxisAlignItems = 'CENTER';
    badgeFrame.paddingLeft = 6;
    badgeFrame.paddingRight = 6;
    badgeFrame.paddingTop = 2;
    badgeFrame.paddingBottom = 2;
    badgeFrame.cornerRadius = 10;
    badgeFrame.visible = false;

    // Badge background - use findVar with fallbacks
    const badgeBgVar = findVar(['status/error', 'action/primary'], 'COLOR');
    if (badgeBgVar) {
        badgeFrame.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.9, g: 0.2, b: 0.2 } }, 'color', badgeBgVar)];
    } else {
        // No variable found, leave with placeholder
        badgeFrame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.2, b: 0.2 } }];
    }

    // Badge text
    const badgeText = figma.createText();
    badgeText.name = 'Count';
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    badgeText.fontName = { family: 'Inter', style: 'Bold' };
    badgeText.fontSize = 10;
    badgeText.characters = '3';

    // Badge text color - use findVar
    const badgeTextVar = findVar(['text/inverse'], 'COLOR');
    if (badgeTextVar) {
        badgeText.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', badgeTextVar)];
    } else {
        badgeText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    }

    badgeFrame.appendChild(badgeText);
    item.appendChild(badgeFrame);

    // Create icon right (for expandable menus, hidden by default)
    const iconRight = await createIconInstanceWithVar('IconRight', iconSizeVar, iconVar);
    iconRight.visible = false;
    item.appendChild(iconRight);

    // Gap between elements directly from Aliases
    const gapVar = findVar(['gap/sm', 'gap/xs'], 'FLOAT');
    if (gapVar) {
        item.setBoundVariable('itemSpacing', gapVar);
    } else {
        item.itemSpacing = 8;
    }

    // Add component properties (only for ComponentNode)
    if (config.asComponents && item.type === 'COMPONENT') {
        const component = item as ComponentNode;

        // Text property
        const textProp = component.addComponentProperty('Text', 'TEXT', 'Menu Item');
        text.componentPropertyReferences = { characters: textProp };

        // Badge count property
        const badgeCountProp = component.addComponentProperty('BadgeCount', 'TEXT', '3');
        badgeText.componentPropertyReferences = { characters: badgeCountProp };

        // Icon visibility
        const showIconLeftProp = component.addComponentProperty('showIcon', 'BOOLEAN', false);
        iconLeft.componentPropertyReferences = { visible: showIconLeftProp };

        // Badge visibility
        const showBadgeProp = component.addComponentProperty('showBadge', 'BOOLEAN', false);
        badgeFrame.componentPropertyReferences = { visible: showBadgeProp };

        // Chevron/arrow visibility (for submenus)
        const showChevronProp = component.addComponentProperty('showChevron', 'BOOLEAN', false);
        iconRight.componentPropertyReferences = { visible: showChevronProp };

        // Add INSTANCE_SWAP for left icon
        if (iconLeft.type === 'INSTANCE') {
            const mainComp = await iconLeft.getMainComponentAsync();
            if (mainComp) {
                const swapProp = component.addComponentProperty('SwapIcon', 'INSTANCE_SWAP', mainComp.id);
                iconLeft.componentPropertyReferences = {
                    ...iconLeft.componentPropertyReferences,
                    mainComponent: swapProp
                };
            }
        }

        // Add INSTANCE_SWAP for right icon (chevron)
        if (iconRight.type === 'INSTANCE') {
            const mainCompRight = await iconRight.getMainComponentAsync();
            if (mainCompRight) {
                const swapChevronProp = component.addComponentProperty('SwapChevron', 'INSTANCE_SWAP', mainCompRight.id);
                iconRight.componentPropertyReferences = {
                    ...iconRight.componentPropertyReferences,
                    mainComponent: swapChevronProp
                };
            }
        }
    }

    return item;
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

        // Helper: Find source variable or next larger one if exact doesn't exist
        const findSourceOrNextLarger = (group: string, leafName: string): Variable | undefined => {
            // First try exact match
            const exact = findSource(group, leafName);
            if (exact) return exact;

            // Extract numeric value from leafName (e.g., "18px" -> 18)
            const numMatch = leafName.match(/^(\d+(?:\.\d+)?)/);
            if (!numMatch) return undefined;

            const targetNum = parseFloat(numMatch[1]);

            // Find all numeric measure variables in the group
            const measureVars = allVars.filter(v =>
                v.variableCollectionId === sourceCollectionId &&
                v.resolvedType === 'FLOAT' &&
                v.name.startsWith(group + '/')
            );

            // Extract values and find next larger
            const candidates: { variable: Variable; value: number }[] = [];
            for (const mv of measureVars) {
                const nameParts = mv.name.split('/');
                const lastPart = nameParts[nameParts.length - 1];
                const valMatch = lastPart.match(/^(\d+(?:\.\d+)?)/);
                if (valMatch) {
                    const val = parseFloat(valMatch[1]);
                    if (val >= targetNum) {
                        candidates.push({ variable: mv, value: val });
                    }
                }
            }

            // Sort by value and return smallest that's >= target
            candidates.sort((a, b) => a.value - b.value);
            return candidates.length > 0 ? candidates[0].variable : undefined;
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

        // Progress tracking with yield for UI updates
        const totalSteps = 15; // Total number of alias categories
        let currentStep = 0;
        const updateProgress = async (message: string): Promise<void> => {
            currentStep++;
            figma.ui.postMessage({
                type: 'progress-update',
                payload: {
                    current: currentStep,
                    total: totalSteps,
                    message: message
                }
            });
            // Yield to allow UI to update
            await new Promise(resolve => setTimeout(resolve, 50));
        };

        // --- REFACTORED SECTIONS ---

        // 1. Text Size Aliases (REMOVED)
        // User requested to remove this section.
        // const textSizeTShirtMap = ['3xs', '2xs', 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];

        await updateProgress('Creating letter-spacing aliases...');

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

        await updateProgress('Creating font-family aliases...');

        // Font Family Aliases - Reference Typography Font Family primitives
        // These are the same across all modes (not responsive)
        const fontFamilyMap = [
            { name: 'Typography/Font Family/Body' },
            { name: 'Typography/Font Family/Heading' },
            { name: 'Typography/Font Family/Code' },
        ];

        for (const item of fontFamilyMap) {
            // Check if alias already exists
            let aliasVar = allVars.find(v => v.variableCollectionId === targetCollection!.id && v.name === item.name);

            if (!aliasVar) {
                // Find the primitive variable to reference
                const primitiveName = item.name.replace('Typography/', `${typoGroup}/`);
                const primitiveVar = allVars.find(v =>
                    v.variableCollectionId === sourceCollectionId &&
                    (v.name === primitiveName || v.name === item.name.replace('Typography/', ''))
                );

                if (primitiveVar) {
                    aliasVar = figma.variables.createVariable(item.name, targetCollection!, 'STRING');
                    aliasVar.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: primitiveVar.id });
                    aliasVar.setValueForMode(tabletId, { type: 'VARIABLE_ALIAS', id: primitiveVar.id });
                    aliasVar.setValueForMode(mobileId, { type: 'VARIABLE_ALIAS', id: primitiveVar.id });

                } else {
                    // Create with fallback value
                    aliasVar = figma.variables.createVariable(item.name, targetCollection!, 'STRING');
                    const fallback = item.name.includes('Code') ? 'Roboto Mono' : 'Inter';
                    aliasVar.setValueForMode(desktopId, fallback);
                    aliasVar.setValueForMode(tabletId, fallback);
                    aliasVar.setValueForMode(mobileId, fallback);

                }
            }
        }

        await updateProgress('Creating font-weight aliases...');

        // Font Weight Aliases - Reference Typography Font Weight primitives
        const fontWeightMap = [
            { name: 'Typography/Font Weight/Regular', primitiveLeaf: 'Regular' },
            { name: 'Typography/Font Weight/Medium', primitiveLeaf: 'Medium' },
            { name: 'Typography/Font Weight/SemiBold', primitiveLeaf: 'SemiBold' },
            { name: 'Typography/Font Weight/Bold', primitiveLeaf: 'Bold' },
        ];

        for (const item of fontWeightMap) {
            let aliasVar = allVars.find(v => v.variableCollectionId === targetCollection!.id && v.name === item.name);

            if (!aliasVar) {
                // Find the primitive variable
                const primitiveVar = findSource(typoGroup, item.primitiveLeaf);

                if (primitiveVar) {
                    aliasVar = figma.variables.createVariable(item.name, targetCollection!, 'FLOAT');
                    aliasVar.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: primitiveVar.id });
                    aliasVar.setValueForMode(tabletId, { type: 'VARIABLE_ALIAS', id: primitiveVar.id });
                    aliasVar.setValueForMode(mobileId, { type: 'VARIABLE_ALIAS', id: primitiveVar.id });

                } else {
                    // Create with fallback numeric value
                    const fallbacks: Record<string, number> = { 'Regular': 400, 'Medium': 500, 'SemiBold': 600, 'Bold': 700 };
                    aliasVar = figma.variables.createVariable(item.name, targetCollection!, 'FLOAT');
                    aliasVar.setValueForMode(desktopId, fallbacks[item.primitiveLeaf] || 400);
                    aliasVar.setValueForMode(tabletId, fallbacks[item.primitiveLeaf] || 400);
                    aliasVar.setValueForMode(mobileId, fallbacks[item.primitiveLeaf] || 400);

                }
            }
        }

        await updateProgress('Creating radius aliases...');

        // 3. Radius Aliases (Using Measures) - RESPONSIVE
        // Reduced radius on smaller screens for better visual balance
        const radiusMap = [
            { name: 'Radius/none', desktop: '0px', tablet: '0px', mobile: '0px' },
            { name: 'Radius/2xs', desktop: '2px', tablet: '2px', mobile: '2px' },
            { name: 'Radius/xs', desktop: '4px', tablet: '4px', mobile: '2px' },
            { name: 'Radius/sm', desktop: '6px', tablet: '4px', mobile: '4px' },
            { name: 'Radius/md', desktop: '8px', tablet: '6px', mobile: '4px' },
            { name: 'Radius/lg', desktop: '12px', tablet: '8px', mobile: '6px' },
            { name: 'Radius/xl', desktop: '16px', tablet: '12px', mobile: '8px' },
            { name: 'Radius/2xl', desktop: '24px', tablet: '16px', mobile: '12px' },
            { name: 'Radius/3xl', desktop: '32px', tablet: '24px', mobile: '16px' },
            { name: 'Radius/full', desktop: 'full', tablet: 'full', mobile: 'full' } // Special case
        ];

        for (const item of radiusMap) {
            const v = await findOrCreateVar(item.name);

            const setModeVal = (modeId: string, val: string) => {
                if (val === 'full') {
                    // Set direct numeric value for circular corners
                    v.setValueForMode(modeId, 9999);
                    return;
                }
                const sourceVar = findSource(measureGroup, val);
                if (sourceVar) {
                    v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                } else {
                    // Fallback to numeric value
                    const numVal = parseFloat(val) || 0;
                    v.setValueForMode(modeId, numVal);
                }
            };

            setModeVal(desktopId, item.desktop);
            setModeVal(tabletId, item.tablet);
            setModeVal(mobileId, item.mobile);
        }

        await updateProgress('Creating border-width aliases...');

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

        await updateProgress('Creating typography aliases...');

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

            // Body - All size variants for UI components (expanded for Atoms)
            { name: 'Typography/Body/2xs', desktop: '2xs', tablet: '2xs', mobile: '2xs' },
            { name: 'Typography/Body/xs', desktop: 'xs', tablet: '2xs', mobile: '2xs' },
            { name: 'Typography/Body/sm', desktop: 'sm', tablet: 'xs', mobile: 'xs' },
            { name: 'Typography/Body/base', desktop: 'base', tablet: 'sm', mobile: 'sm' },
            { name: 'Typography/Body/lg', desktop: 'lg', tablet: 'base', mobile: 'base' },
            { name: 'Typography/Body/xl', desktop: 'xl', tablet: 'lg', mobile: 'lg' },
            { name: 'Typography/Body/2xl', desktop: '2xl', tablet: 'xl', mobile: 'lg' },

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

        await updateProgress('Creating spacing/gap aliases...');

        // 6. Spacing Aliases (Responsive Gaps)
        const spaceMap = [
            { name: 'Spacing/Gap/3xs', desktop: '2px', tablet: '2px', mobile: '1px' },
            { name: 'Spacing/Gap/2xs', desktop: '4px', tablet: '4px', mobile: '2px' },
            { name: 'Spacing/Gap/xs', desktop: '8px', tablet: '6px', mobile: '4px' },
            { name: 'Spacing/Gap/sm', desktop: '12px', tablet: '10px', mobile: '8px' },
            { name: 'Spacing/Gap/md', desktop: '16px', tablet: '14px', mobile: '12px' },
            { name: 'Spacing/Gap/lg', desktop: '24px', tablet: '20px', mobile: '16px' },
            { name: 'Spacing/Gap/xl', desktop: '32px', tablet: '28px', mobile: '24px' },
            { name: 'Spacing/Gap/2xl', desktop: '48px', tablet: '40px', mobile: '32px' },
            { name: 'Spacing/Gap/3xl', desktop: '64px', tablet: '56px', mobile: '48px' },
            { name: 'Spacing/Gap/4xl', desktop: '96px', tablet: '80px', mobile: '64px' },
        ];

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

        await updateProgress('Creating padding aliases...');

        // 7. Padding Aliases (Responsive - 4 directions)
        const paddingScale = [
            { size: '3xs', desktop: '2px', tablet: '2px', mobile: '1px' },
            { size: '2xs', desktop: '4px', tablet: '4px', mobile: '2px' },
            { size: 'xs', desktop: '8px', tablet: '6px', mobile: '4px' },
            { size: 'sm', desktop: '12px', tablet: '10px', mobile: '8px' },
            { size: 'md', desktop: '16px', tablet: '14px', mobile: '12px' },
            { size: 'lg', desktop: '24px', tablet: '20px', mobile: '16px' },
            { size: 'xl', desktop: '32px', tablet: '28px', mobile: '24px' },
            { size: '2xl', desktop: '48px', tablet: '40px', mobile: '32px' },
            { size: '3xl', desktop: '64px', tablet: '56px', mobile: '48px' },
            { size: '4xl', desktop: '96px', tablet: '80px', mobile: '64px' },
        ];

        const directions = ['top', 'right', 'bottom', 'left'];

        // Padding
        for (const dir of directions) {
            for (const scale of paddingScale) {
                const v = await findOrCreateVar(`Spacing/Padding/${dir}/${scale.size}`);

                const setMode = (modeId: string, val: string): void => {
                    const safeName = val.replace('.', '_');
                    const sourceVar = findSource(measureGroup, safeName);
                    if (sourceVar) {
                        v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                    }
                };

                setMode(desktopId, scale.desktop);
                setMode(tabletId, scale.tablet);
                setMode(mobileId, scale.mobile);
            }
        }

        await updateProgress('Creating margin aliases...');

        // 8. Margin Aliases (Responsive - 4 directions)
        for (const dir of directions) {
            for (const scale of paddingScale) { // Reuse same scale
                const v = await findOrCreateVar(`Spacing/Margin/${dir}/${scale.size}`);

                const setMode = (modeId: string, val: string): void => {
                    const safeName = val.replace('.', '_');
                    const sourceVar = findSource(measureGroup, safeName);
                    if (sourceVar) {
                        v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                    }
                };

                setMode(desktopId, scale.desktop);
                setMode(tabletId, scale.tablet);
                setMode(mobileId, scale.mobile);
            }
        }

        await updateProgress('Creating axis padding aliases...');

        // 9. Axis-based Padding (X = horizontal, Y = vertical)
        const axes = ['x', 'y'];

        for (const axis of axes) {
            for (const scale of paddingScale) {
                const v = await findOrCreateVar(`Spacing/Padding/${axis}/${scale.size}`);

                const setMode = (modeId: string, val: string): void => {
                    const safeName = val.replace('.', '_');
                    const sourceVar = findSource(measureGroup, safeName);
                    if (sourceVar) {
                        v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                    }
                };

                setMode(desktopId, scale.desktop);
                setMode(tabletId, scale.tablet);
                setMode(mobileId, scale.mobile);
            }
        }

        await updateProgress('Creating axis margin aliases...');

        // 10. Axis-based Margin (X = horizontal, Y = vertical)
        for (const axis of axes) {
            for (const scale of paddingScale) {
                const v = await findOrCreateVar(`Spacing/Margin/${axis}/${scale.size}`);

                const setMode = (modeId: string, val: string): void => {
                    const safeName = val.replace('.', '_');
                    const sourceVar = findSource(measureGroup, safeName);
                    if (sourceVar) {
                        v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                    }
                };

                setMode(desktopId, scale.desktop);
                setMode(tabletId, scale.tablet);
                setMode(mobileId, scale.mobile);
            }
        }

        await updateProgress('Creating effects aliases...');

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

                } else {
                    // Fallback: try to find by partial name match
                    const fallbackVar = allVars.find(fv =>
                        fv.variableCollectionId === sourceCollectionId &&
                        fv.name.toLowerCase().includes(valName.toLowerCase()) &&
                        fv.resolvedType === 'FLOAT'
                    );
                    if (fallbackVar) {
                        v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: fallbackVar.id });

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





        await updateProgress('Creating shadow aliases...');

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

        await updateProgress('Creating icon-size aliases...');

        // Icon Size Aliases - Responsive icon sizes for component integration
        // Icons scale down on smaller screens for visual balance
        const iconSizeMap = [
            { name: 'Icon-Size/sm', desktop: '16', tablet: '14', mobile: '12' },
            { name: 'Icon-Size/md', desktop: '20', tablet: '18', mobile: '16' },
            { name: 'Icon-Size/lg', desktop: '24', tablet: '20', mobile: '18' },
            { name: 'Icon-Size/xl', desktop: '32', tablet: '28', mobile: '24' },
        ];

        for (const item of iconSizeMap) {
            const v = await findOrCreateVar(item.name);

            const setIconSizeMode = (modeId: string, val: string) => {
                const sourceVar = findSourceOrNextLarger(measureGroup, val);
                if (sourceVar) {
                    v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
                } else {
                    // Fallback to numeric value
                    const numVal = parseFloat(val) || 0;
                    v.setValueForMode(modeId, numVal);
                }
            };

            setIconSizeMode(desktopId, item.desktop);
            setIconSizeMode(tabletId, item.tablet);
            setIconSizeMode(mobileId, item.mobile);
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
    tokenOverrides?: Record<string, TokenOverride>
): Promise<void> {
    // tokenOverrides contains user-specified scale values for tokens
    const overrides = tokenOverrides || {};
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
            { name: 'Action/primaryText', light: '50', dark: '950', useAccent: true }, // Text on primary button
            { name: 'Action/secondary', light: '100', dark: '800' },
            { name: 'Action/secondaryHover', light: '200', dark: '700' },
            { name: 'Action/secondaryText', light: '700', dark: '200' }, // Text on secondary button
            { name: 'Action/ghost', light: '50', dark: '900' },
            { name: 'Action/ghostHover', light: '100', dark: '800' },
            { name: 'Action/ghostText', light: '600', dark: '400', useAccent: true }, // Text on ghost button
            { name: 'Action/destructive', light: '600', dark: '500', useStatus: 'error' },
            { name: 'Action/destructiveHover', light: '700', dark: '400', useStatus: 'error' },
            { name: 'Action/destructiveText', light: '50', dark: '950', useStatus: 'error' }, // Text on destructive button

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

            // Interactive (ring states for focus feedback)
            { name: 'Interactive/focusRing', light: '200', dark: '200', useAccent: true },
            { name: 'Interactive/errorRing', light: '200', dark: '200', useStatus: 'error' },
            { name: 'Interactive/warningRing', light: '200', dark: '200', useStatus: 'warning' },
            { name: 'Interactive/successRing', light: '200', dark: '200', useStatus: 'success' },
        ];

        const resolveVar = (entry: { name?: string; light: string; dark: string; useAccent?: boolean; useStatus?: string }, mode: 'light' | 'dark'): Variable | null => {
            // Check if there's an override for this token
            let scale = entry[mode];
            if (entry.name && overrides[entry.name] && overrides[entry.name][mode]) {
                scale = overrides[entry.name][mode] as string;
            }
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

            case 'generate-atoms':
                await generateAtomicComponents(msg.config as AtomsConfig);
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

            case 'import-icons':
                await importIconsFromSvg(
                    msg.icons as Array<{ name: string; svg: string }>,
                    msg.options as { size: number; prefix: string; asComponents: boolean; addColorProperty: boolean }
                );
                break;

            case 'scan-existing-icons':
                await scanExistingIcons(msg.prefix as string);
                break;

            case 'delete-icons':
                await deleteIcons(msg.iconIds as string[]);
                break;

            case 'add-icons-to-library':
                await addIconsToLibrary(
                    msg.icons as Array<{ name: string; svg: string }>,
                    msg.options as { size: number; prefix: string; asComponents: boolean; addColorProperty: boolean },
                    msg.libraryFrameId as string | null
                );
                break;

            case 'resize-window':
                figma.ui.resize(msg.width as number, msg.height as number);
                break;

            case 'convert-json': {
                const collectionId = msg.collectionId as string;
                const groupName = msg.groupName as string;



                try {
                    const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
                    if (!collection) {
                        console.error('Collection not found:', collectionId);
                        figma.notify('Collection not found');
                        figma.ui.postMessage({ type: 'conversion-result', payload: [] });
                        return;
                    }



                    const variables: Variable[] = [];
                    for (const id of collection.variableIds) {
                        const variable = await figma.variables.getVariableByIdAsync(id);
                        if (variable) {
                            variables.push(variable);
                        }
                    }



                    // Filter by group if specified
                    const filtered = groupName && groupName !== ''
                        ? variables.filter(v => v.name.startsWith(groupName + '/'))
                        : variables;



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
