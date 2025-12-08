console.clear();

// Show the UI with improved dimensions
figma.showUI(__html__, { width: 600, height: 800, themeColors: true });

async function loadCollections() {
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const payload = collections.map(c => ({ id: c.id, name: c.name }));
    figma.ui.postMessage({ type: 'load-collections', payload });
  } catch (error) {
    console.error('Error loading collections:', error);
  }
}

loadCollections();

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'convert-collection') {
    const collectionId = msg.collectionId;
    const group = msg.group;
    await convertCollection(collectionId, group);
  } else if (msg.type === 'get-groups') {
    const collectionId = msg.collectionId;
    await getGroups(collectionId);
  } else if (msg.type === 'generate-on-canvas') {
    const collectionId = msg.collectionId;
    const group = msg.group;
    await generateOnCanvas(collectionId, group);
  } else if (msg.type === 'preview-scale') {
    const rawColor = msg.color;
    const color = parseColor(rawColor); // Updated
    if (color) {
      // Return preview data: { 50: { hex: "#...", r, g, b }, ... }
      const scale = calculateScale(color);
      // Enrich with Hex strings for UI
      const payload = {};
      for (const [k, v] of Object.entries(scale)) {
        payload[k] = {
          hex: rgbToHex(v.r, v.g, v.b).toUpperCase(),
          r: v.r, g: v.g, b: v.b
        };
      }
      figma.ui.postMessage({ type: 'preview-scale-result', payload });
    }
  } else if (msg.type === 'create-variables') {
    const { baseColorHex, config } = msg;
    const color = parseColor(baseColorHex); // Updated
    if (color) {
      const scale = calculateScale(color);
      await createVariables(scale, config);
    }
  } else if (msg.type === 'preview-scale-batch') {
    const batchData = msg.colors; // [{ name: "Red", hex: "#f00" }]
    const results = [];

    for (const item of batchData) {
      const color = parseColor(item.hex);
      if (color) {
        const scale = calculateScale(color);
        const steps = {};
        for (const [k, v] of Object.entries(scale)) {
          steps[k] = {
            hex: rgbToHex(v.r, v.g, v.b).toUpperCase(),
            r: v.r, g: v.g, b: v.b
          };
        }
        results.push({ name: item.name, steps: steps });
      }
    }
    figma.ui.postMessage({ type: 'preview-scale-batch-result', payload: results });

  } else if (msg.type === 'create-variables-batch') {
    const { colors, config } = msg; // colors: [{name, hex}], config: { collectionId, collectionName, groupName }

    try {
      figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Color Variables...' });

      if (!colors || !Array.isArray(colors)) throw new Error("Invalid colors data");
      if (!config) throw new Error("Missing configuration");

      // Create collection if collectionName is provided
      let targetCollectionId = config.collectionId;
      if (config.collectionName && !targetCollectionId) {
        const newCollection = figma.variables.createVariableCollection(config.collectionName);
        targetCollectionId = newCollection.id;
        figma.notify(`Collection "${config.collectionName}" created! ✅`);
        // Reload collections in UI
        await loadCollections();
      }

      if (!targetCollectionId) {
        throw new Error("No collection specified");
      }

      // Update config with actual collection ID
      const finalConfig = Object.assign({}, config, { collectionId: targetCollectionId });

      let createdCount = 0;
      for (const item of colors) {
        if (!item || !item.hex) continue;
        const color = parseColor(item.hex);
        if (color) {
          const scale = calculateScale(color);
          // Override name in config for this specific iteration (Safe Object.assign)
          const itemConfig = Object.assign({}, finalConfig, { colorName: item.name });

          // Ensure we await each creation to avoid race conditions in variable lookup
          await createVariables(scale, itemConfig);
          createdCount++;
        }
      }

      figma.ui.postMessage({ type: 'progress-end' });
      figma.notify(`Created ${createdCount} Color Palettes successfully!`);
      figma.ui.postMessage({ type: 'variables-created-success' });

    } catch (err) {
      console.error(err);
      figma.ui.postMessage({ type: 'progress-end' });
      figma.notify("Error creating batch variables: " + err.message);
    }

  } else if (msg.type === 'get-selection-color') {
    // Force a re-check of current selection
    handleSelectionChange();
  } else if (msg.type === 'get-groups-for-tab2') {
    const collectionId = msg.collectionId;
    await getGroups(collectionId, 'tab2'); // true = indicate tab2
  } else if (msg.type === 'get-groups-for-measures') {
    const collectionId = msg.collectionId;
    await getGroups(collectionId, 'measures');
  } else if (msg.type === 'create-measure-variables') {
    await createMeasureVariables(msg.values, msg.config);
  } else if (msg.type === 'get-fonts') {
    await getUniqueFonts();
  } else if (msg.type === 'get-groups-for-typo') {
    await getGroupsCustom(msg.collectionId, 'load-groups-typo'); // Send type specifically so UI knows where to put it? Wait, getGroups sends 'load-groups' back? 
    // Ah, getGroups implementation (lines 53-58) sends 'load-groups'. 
    // I need to update getGroups to accept a returnType or handle it manually.
    // Current getGroups sends 'load-groups' generically. UI listens to 'load-groups'.
    // Wait, in previous step I added 'load-groups-typo' and 'load-groups-typo-source'.
    // I must refactor getGroups to support custom event types or just duplicate the logic here for safety.
    // Duplicating for safety to avoid breaking other calls.
  } else if (msg.type === 'get-groups-for-typo-source') {
    await getGroupsCustom(msg.collectionId, 'load-groups-typo-source');

  } else if (msg.type === 'create-typography') {
    await createTypographyVariables(msg);
  } else if (msg.type === 'get-groups-for-alias') {
    await getGroupsCustom(msg.collectionId, 'load-groups-alias');
  } else if (msg.type === 'create-aliases') {
    await createSemanticTokens(msg.config);
  } else if (msg.type === 'create-text-styles') {
    await createTextStyles(msg.config);

  } else if (msg.type === 'get-groups-for-theme') {
    await getGroupsCustom(msg.collectionId, 'load-groups-theme');

  } else if (msg.type === 'get-groups-for-tab1') {
    await getGroupsCustom(msg.collectionId, 'load-groups-tab1');

  } else if (msg.type === 'load-palettes') {
    await loadPalettes(msg.collectionId, msg.groupName);

  } else if (msg.type === 'generate-theme') {
    // Correct Signature: (accent, neutral, status, themeName, isRegenerate, tokenOverrides)
    await generateTheme(msg.accentPalette, msg.neutralPalette, msg.statusPalettes, msg.themeName, false, msg.tokenOverrides);

  } else if (msg.type === 'regenerate-theme') {
    // Correct Signature: (accent, neutral, status, themeName, isRegenerate, tokenOverrides)
    await generateTheme(msg.accentPalette, msg.neutralPalette, msg.statusPalettes, msg.themeName, true, msg.tokenOverrides);

  } else if (msg.type === 'create-theme') {
    await createThemeCollection(msg.themeData);
  }
};

// Helper: Parse Color (Hex, RGB, OKLCH - Robust)
function parseColor(input) {
  const str = input.trim().toLowerCase();

  // 1. Hex
  if (str.startsWith('#')) {
    const hex = str;
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
  }

  // 2. Functional Syntax (rgb(...), oklch(...))
  const match = str.match(/^([a-z]+)\((.+)\)$/);
  if (match) {
    const type = match[1];
    // Split params by comma, space, or slash (for alpha)
    // Filter out empty strings
    const params = match[2].split(/[,\s/]+/).filter(x => x.length > 0);

    if ((type === 'rgb' || type === 'rgba') && params.length >= 3) {
      const getVal = (raw) => {
        const val = parseFloat(raw);
        if (raw.includes('%')) return (val / 100) * 255;
        return val;
      };
      return {
        r: getVal(params[0]) / 255,
        g: getVal(params[1]) / 255,
        b: getVal(params[2]) / 255
      };
    }

    if (type === 'oklch' && params.length >= 3) {
      // L C H
      let L = parseFloat(params[0]);
      if (params[0].includes('%') && L > 1) L = L / 100; // Handle 95% -> 0.95

      const C = parseFloat(params[1]);
      const H = parseFloat(params[2]);

      return oklchToRgb(L, C, H);
    }
  }

  return null;
}

// Helper: OKLCH to sRGB
function oklchToRgb(l, c, h) {
  // Convert degrees to radians
  const hRad = h * (Math.PI / 180);

  // 1. OKLCH -> OKLab
  const L = l;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // 2. OKLab -> Linear sRGB (approximate matrices)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLinear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  // 3. Linear sRGB -> sRGB (Gamma correction)
  const srgbTransfer = (val) => {
    let v = val;
    // Gamut mapping constraint (simple clipping)
    // For production, complex gamut mapping is preferred, but clipping is standard MVP.
    // v = Math.max(0, Math.min(1, v)); // We clip later

    if (v <= 0.0031308) {
      return 12.92 * v;
    } else {
      return 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055;
    }
  };

  return {
    r: Math.max(0, Math.min(1, srgbTransfer(rLinear))),
    g: Math.max(0, Math.min(1, srgbTransfer(gLinear))),
    b: Math.max(0, Math.min(1, srgbTransfer(bLinear)))
  };
}

// Logic: Calculate Scale (Tailwind-like Smart Curve)
function calculateScale(baseColorRgb) {
  // 1. Convert Base to OKLCH
  const base = rgbToOklchStruct(baseColorRgb.r, baseColorRgb.g, baseColorRgb.b);

  // 2. Define Distribution Curves
  // Based on analysis of Tailwind v3/v4 standard palettes
  // 500 is the anchor (1.0 relative L/C)

  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  // Specific target Lightness for the extremes (white/black anchors)
  const targetL = {
    50: 0.975, // Paper white
    500: base.l,
    950: 0.28 // Corrected: 0.15 was too dark (Slate rule). 0.28 matches Sky/Rose (Vibrant rule).
  };

  // Chroma Multipliers (Relative to Base Chroma)
  // Tints drop chroma fast to avoid "neon pastels". Shades keep some chroma but darken.
  const chromaFactors = {
    50: 0.08,  // Reduced from 0.1
    100: 0.20, // Reduced from 0.25
    200: 0.45,
    300: 0.75,
    400: 0.92,
    500: 1.0,
    600: 0.92,
    700: 0.80,
    800: 0.65,
    900: 0.50,
    950: 0.40 // Reduced slightly to match Sky/Rose (~0.4 ratio)
  };

  // 3. Interpolation Helper (Piecewise Linear for Lightness)
  // We strictly interpolate L between the anchors (50 <-> 500 <-> 950)
  const getLightness = (step) => {
    if (step === 500) return base.l;

    if (step < 500) {
      // Interpolate between 50 (0.98) and 500 (Base.L)
      // Normalized t (0 at 50, 1 at 500)
      const t = (step - 50) / (450);
      // L = L50 * (1-t) + L500 * t
      return targetL[50] * (1 - t) + targetL[500] * t;
    } else {
      // Interpolate between 500 (Base.L) and 950 (0.15)
      // Normalized t (0 at 500, 1 at 950)
      const t = (step - 500) / (450);
      return targetL[500] * (1 - t) + targetL[950] * t;
    }
  };

  const scale = {};

  steps.forEach(step => {
    const l = getLightness(step);

    // Chroma: Base C * Factor
    // Clamp C to avoid weirdness if base is super dull
    let c = base.c * chromaFactors[step];

    // Hue: Constant (Tailwind sometimes shifts hue, but constant is safer for generic)
    const h = base.h;

    scale[step] = oklchToRgb(l, c, h);
  });

  return scale;
}

// Logic: Create Variables
async function createVariables(scale, config) {
  try {
    const { colorName, collectionId, groupName } = config;

    // 1. Get Collection
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) throw new Error("Collection not found");

    const modeId = collection.defaultModeId;
    figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Variables...' });

    // 2. Iterate and Create
    for (const [step, color] of Object.entries(scale)) {
      // Construct Name: Group/ColorName/ColorName-Step
      // If groupName is empty: ColorName/ColorName-Step
      // Actually user asked for: "nombre del color mas un guion mas el valor de la escala (ej: slate/slate-100)"
      // And "dentro de esa seleccion deberas crear un grupo con el nombre del color".
      // So structure:
      // Group (e.g. Primitives) 
      //   -> Slate (Folder)
      //      -> Slate-100 (Variable)

      let fullPath = "";
      if (groupName) {
        fullPath = `${groupName}/${colorName}/${colorName}-${step}`;
      } else {
        fullPath = `${colorName}/${colorName}-${step}`;
      }

      // Check if variable exists to update, or create new
      // Note: Figma variables are flat list, identified by name path.
      // But we need to check ALL variables in collection to find conflict?
      // createVariable returns existing? No, throws error if name conflict?
      // Actually it allows distinct variables with same name if ids differ, but usually we filter by name.

      // Optimization: Just try create, if fails, look for it. Use existing `find` logic maybe? 
      // Better: loop through all variables ONCE at start or just do createVariable.
      // figma.variables.createVariable(name, collectionId, resolvedType)

      // Let's rely on finding by name first to avoid duplicates.
      const allVars = await figma.variables.getLocalVariablesAsync();
      let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === fullPath);

      if (!variable) {
        // Fix: Pass the collection OBJECT, not the ID.
        variable = figma.variables.createVariable(fullPath, collection, "COLOR");
      }

      // Set Value
      variable.setValueForMode(modeId, color);
    }

    figma.ui.postMessage({ type: 'variables-created-success' });
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify(`Created variables for ${colorName} successfully!`);

  } catch (err) {
    console.error(err);
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify("Error creating variables: " + err.message);
  }
}

// Logic: Create Variables (Measures)
async function createMeasureVariables(values, config) {
  try {
    const { collectionId, groupName } = config;

    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) throw new Error("Collection not found");

    const modeId = collection.defaultModeId;
    figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Measures...' });

    const allVars = await figma.variables.getLocalVariablesAsync();

    for (const value of values) {
      // Figma prohibits '.' in variable names. Replace with '_'
      const safeValueStr = value.toString().replace('.', '_');
      const name = `${safeValueStr}px`; // e.g. "0_5px", "32px"

      let fullPath = "";
      // Sanitize group name too (allow / for nesting, but no dots)
      const safeGroupName = groupName ? groupName.replace(/\./g, '_') : "";

      if (safeGroupName) {
        fullPath = `${safeGroupName}/${name}`;
      } else {
        fullPath = name;
      }

      let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === fullPath);

      if (!variable) {
        variable = figma.variables.createVariable(fullPath, collection, "FLOAT");
      }

      variable.setValueForMode(modeId, value);

      // Scope can be set too (GAP, CORNER_RADIUS, etc), but defaults (ALL) is fine for now.
    }

    figma.ui.postMessage({ type: 'measures-created-success' });
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify(`Created ${values.length} measure variables!`);

  } catch (err) {
    console.error(err);
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify("Error creating measures: " + err.message);
  }
}

async function getUniqueFonts() {
  try {
    // This can be slow, but it's the only way
    const fonts = await figma.listAvailableFontsAsync();
    const families = new Set(fonts.map(f => f.fontName.family));
    const sorted = Array.from(families).sort();
    figma.ui.postMessage({ type: 'load-fonts', payload: sorted });
  } catch (err) {
    console.error(err);
    figma.notify("Error loading fonts: " + err.message);
  }
}

async function createTypographyVariables(data) {
  try {
    const { families, weights, spacing, config } = data;
    const { collectionId, groupName } = config;

    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) throw new Error("Collection not found");

    const modeId = collection.defaultModeId;
    figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Typography...' });

    // 1. Font Families (Strings)
    for (const [key, familyName] of Object.entries(families)) {
      if (!familyName) continue;
      const nameKey = key.charAt(0).toUpperCase() + key.slice(1); // Heading, Body

      let path = `Font Family/${nameKey}`;
      if (groupName) path = `${groupName.replace(/\./g, '_')}/${path}`;

      const allVars = await figma.variables.getLocalVariablesAsync();
      let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === path);
      if (!variable) {
        variable = figma.variables.createVariable(path, collection, "STRING");
      }
      variable.setValueForMode(modeId, familyName);
    }

    // 2. Font Weights (Floats)
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

    for (const w of weights) {
      const humanName = weightNames[w] || w; // Fallback to number if not standard
      let path = `Font Weight/${humanName}`;
      if (groupName) path = `${groupName.replace(/\./g, '_')}/${path}`;

      const allVars = await figma.variables.getLocalVariablesAsync();
      let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === path);
      if (!variable) {
        variable = figma.variables.createVariable(path, collection, "FLOAT");
      }
      variable.setValueForMode(modeId, w);
    }

    // 3. Letter Spacing (Floats)
    for (const s of spacing) {
      // Sanitize: replace . with _ and % with 'pct' or just remove?
      // Figma vars don't allow % in name usually? Actually only . / : etc.
      // Let's safe-string it. 
      let safeName = s.toString().replace(/\./g, '_').replace('%', '');
      let path = `Letter Spacing/${safeName}`;
      if (groupName) path = `${groupName.replace(/\./g, '_')}/${path}`;

      const allVars = await figma.variables.getLocalVariablesAsync();
      let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === path);
      if (!variable) {
        variable = figma.variables.createVariable(path, collection, "FLOAT");
      }
      variable.setValueForMode(modeId, s);
    }

    // 4. Font Sizes (Floats)
    const { sizes } = data; // sizes array passed in

    // Size naming convention (Tailwind-like)
    const sizeNames = {
      8: '3xs',
      10: '2xs',
      12: 'xs',
      14: 'sm',
      16: 'base',
      18: 'lg',
      20: 'xl',
      24: '2xl',
      30: '3xl',
      36: '4xl',
      48: '5xl',
      60: '6xl',
      72: '7xl'
    };

    if (sizes && sizes.length > 0) {
      const allVars = await figma.variables.getLocalVariablesAsync();

      for (const s of sizes) {
        const humanName = sizeNames[s] || s;
        let path = `Font Size/${humanName}`;
        if (groupName) path = `${groupName.replace(/\./g, '_')}/${path}`; // Target Path

        let variable = allVars.find(v => v.variableCollectionId === collectionId && v.name === path);
        if (!variable) {
          variable = figma.variables.createVariable(path, collection, "FLOAT");
        }

        variable.setValueForMode(modeId, s);
      }
    }

    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify("Typography variables created!");

  } catch (err) {
    console.error(err);
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify("Error: " + err.message);
  }
}

async function createSemanticTokens(config) {
  try {
    const { sourceCollectionId, measureGroup, typoGroup, targetName } = config;

    figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Responsive Tokens...' });

    // 1. Setup Target Collection
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    let targetCollection = collections.find(c => c.name === targetName);

    if (!targetCollection) {
      targetCollection = figma.variables.createVariableCollection(targetName);
    }

    // 2. Setup Modes: Desktop, Tablet, Mobile
    // Rename default Mode 1 -> Desktop, add others if missing
    // CAREFUL: Removing modes or renamed modes might exist.
    // Let's assume standard creation.

    // Rename first mode
    if (targetCollection.modes.length > 0) {
      targetCollection.renameMode(targetCollection.modes[0].modeId, "Desktop");
    }

    // Add others if not exist
    const ensureMode = (name) => {
      const existing = targetCollection.modes.find(m => m.name === name);
      if (existing) return existing.modeId;
      return targetCollection.addMode(name);
    };

    const desktopId = targetCollection.modes.find(m => m.name === "Desktop").modeId;
    const tabletId = ensureMode("Tablet");
    const mobileId = ensureMode("Mobile");

    // 3. Prepare Source Variables lookup
    const allVars = await figma.variables.getLocalVariablesAsync();
    // Helper to find source var by simple name (e.g. "4xl", "16px") within the specific group
    const findSource = (group, leafName) => {
      // Source group structure: "TypoGroup/Font Size/4xl" or "MeasureGroup/16px"
      // Typo variables in previous step were created as "Font Size/4xl" inside the group.
      // Measures were created as "16px" inside the group.

      // Try strict path first
      let path = `${group}/${leafName}`;
      let v = allVars.find(v => v.variableCollectionId === sourceCollectionId && v.name === path);
      if (v) return v;

      // Try with Font Size folder
      path = `${group}/Font Size/${leafName}`;
      v = allVars.find(v => v.variableCollectionId === sourceCollectionId && v.name === path);
      if (v) return v;

      // Try with Font Weight folder
      path = `${group}/Font Weight/${leafName}`;
      v = allVars.find(v => v.variableCollectionId === sourceCollectionId && v.name === path);

      return v;
    };


    // 4. Define Semantic Map (The "Brain")
    // GOD TIER SCALING: High Contrast on Desktop, Readable on Mobile.
    // SORT ORDER: Ascending (Small -> Large)
    const textMap = [
      { name: 'Typography/Caption', desktop: 'xs', tablet: 'xs', mobile: 'xs' },
      { name: 'Typography/Body/s', desktop: 'sm', tablet: 'sm', mobile: 'sm' },
      { name: 'Typography/Body/m', desktop: 'base', tablet: 'base', mobile: 'base' },
      { name: 'Typography/Body/l', desktop: 'lg', tablet: 'lg', mobile: 'lg' },
      { name: 'Typography/Heading/h4', desktop: '2xl', tablet: 'xl', mobile: 'lg' },
      { name: 'Typography/Heading/h3', desktop: '3xl', tablet: '2xl', mobile: 'xl' },
      { name: 'Typography/Heading/h2', desktop: '4xl', tablet: '3xl', mobile: '2xl' },
      { name: 'Typography/Heading/h1', desktop: '5xl', tablet: '4xl', mobile: '3xl' },
      { name: 'Typography/Display/h2', desktop: '6xl', tablet: '5xl', mobile: '4xl' },
      { name: 'Typography/Display/h1', desktop: '7xl', tablet: '6xl', mobile: '5xl' }
    ];

    const componentTextMap = [
      { name: 'Typography/Component/badge', desktop: 'xs', tablet: 'xs', mobile: 'xs' },
      { name: 'Typography/Component/label', desktop: 'sm', tablet: 'sm', mobile: 'sm' },
      { name: 'Typography/Component/button', desktop: 'base', tablet: 'base', mobile: 'base' },
      { name: 'Typography/Component/input', desktop: 'base', tablet: 'base', mobile: 'base' }
    ];

    const spaceMap = [
      // Gap: Ascending (Small -> Large)
      { name: 'Spacing/Gap/2xs', desktop: '4px', tablet: '2px', mobile: '2px' },
      { name: 'Spacing/Gap/xs', desktop: '8px', tablet: '4px', mobile: '4px' },
      { name: 'Spacing/Gap/s', desktop: '16px', tablet: '12px', mobile: '8px' },
      { name: 'Spacing/Gap/m', desktop: '24px', tablet: '20px', mobile: '16px' },
      { name: 'Spacing/Gap/l', desktop: '32px', tablet: '24px', mobile: '20px' },
      { name: 'Spacing/Gap/xl', desktop: '48px', tablet: '32px', mobile: '24px' },
      { name: 'Spacing/Gap/2xl', desktop: '64px', tablet: '48px', mobile: '32px' },
      { name: 'Spacing/Gap/container', desktop: '48px', tablet: '32px', mobile: '16px' },
      { name: 'Spacing/Gap/section', desktop: '96px', tablet: '64px', mobile: '48px' },

      // Universal Padding: Ascending
      { name: 'Spacing/Padding/3xs', desktop: '4px', tablet: '4px', mobile: '2px' },
      { name: 'Spacing/Padding/2xs', desktop: '8px', tablet: '4px', mobile: '4px' },
      { name: 'Spacing/Padding/xs', desktop: '12px', tablet: '8px', mobile: '4px' },
      { name: 'Spacing/Padding/sm', desktop: '16px', tablet: '12px', mobile: '8px' },
      { name: 'Spacing/Padding/md', desktop: '24px', tablet: '16px', mobile: '12px' },
      { name: 'Spacing/Padding/lg', desktop: '32px', tablet: '24px', mobile: '16px' },
      { name: 'Spacing/Padding/xl', desktop: '48px', tablet: '32px', mobile: '24px' },
      { name: 'Spacing/Padding/2xl', desktop: '64px', tablet: '48px', mobile: '32px' }
    ];

    const radiusMap = [
      // Radius: Ascending
      { name: 'Spacing/Radius/s', desktop: '4px', tablet: '4px', mobile: '2px' },
      { name: 'Spacing/Radius/m', desktop: '8px', tablet: '8px', mobile: '4px' },
      { name: 'Spacing/Radius/l', desktop: '12px', tablet: '12px', mobile: '8px' },
      { name: 'Spacing/Radius/xl', desktop: '16px', tablet: '16px', mobile: '12px' },
      { name: 'Spacing/Radius/2xl', desktop: '24px', tablet: '20px', mobile: '16px' }
    ];

    // PROCESS SEMANTIC TOKENS (Restored)

    // A. Typography Aliases
    const allTextMaps = [...textMap, ...componentTextMap];
    for (const item of allTextMaps) {
      const createModeVar = (leaf, val) => {
        // val is like 'xs', 'base', '4xl'
        const path = `${item.name}`; // e.g. Typography/Body/m
        let v = allVars.find(varObj => varObj.variableCollectionId === targetCollection.id && varObj.name === path);
        if (!v) v = figma.variables.createVariable(path, targetCollection, "FLOAT");

        // Find Source (Font Size)
        const sourceVar = findSource(typoGroup, val);
        if (sourceVar) {
          v.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
          // If item has specific modes? item.desktop, item.tablet...
          // The map has desktop, tablet, mobile keys!
        }
        return v;
      };

      // Actually we need to handle the responsive keys in the map: desktop, tablet, mobile
      const path = item.name;
      let v = allVars.find(varObj => varObj.variableCollectionId === targetCollection.id && varObj.name === path);
      if (!v) v = figma.variables.createVariable(path, targetCollection, "FLOAT");

      const setMode = (modeId, valName) => {
        const sourceVar = findSource(typoGroup, valName); // e.g. find 4xl
        if (sourceVar) {
          v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
        } else {
          console.warn(`Source not found for ${valName}`);
        }
      };

      setMode(desktopId, item.desktop);
      setMode(tabletId, item.tablet);
      setMode(mobileId, item.mobile);
    }

    // B. Spacing & Radius Aliases
    const allSpaceMaps = [...spaceMap, ...radiusMap];
    for (const item of allSpaceMaps) {
      const path = item.name;
      let v = allVars.find(varObj => varObj.variableCollectionId === targetCollection.id && varObj.name === path);
      if (!v) v = figma.variables.createVariable(path, targetCollection, "FLOAT");

      const setMode = (modeId, valRaw) => {
        // valRaw is '4px', '16px' etc.
        // Clean string
        let safeName = valRaw.replace('.', '_');
        const sourceVar = findSource(measureGroup, safeName);
        if (sourceVar) {
          v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
        } else {
          // Fallback?
          console.warn(`Source not found for ${safeName}`);
        }
      };

      setMode(desktopId, item.desktop);
      setMode(tabletId, item.tablet);
      setMode(mobileId, item.mobile);
    }
    // 5. Shadows / Elevation System
    // Standard Tailwind Shadows
    const shadowMap = [
      { name: 'Elevation/sm', y: 1, blur: 2, spread: 0, opacity: 0.05 },
      { name: 'Elevation/md', y: 4, blur: 6, spread: -1, opacity: 0.1 },
      { name: 'Elevation/lg', y: 10, blur: 15, spread: -3, opacity: 0.1 },
      { name: 'Elevation/xl', y: 20, blur: 25, spread: -5, opacity: 0.1 }
    ];

    // NOTE: User requested NO Color Variables for now. Using raw black with opacity.

    // Process Shadows
    const existingEffectStyles = await figma.getLocalEffectStylesAsync();

    for (const shadow of shadowMap) {
      // Create Semantic Number Variables (Aliased to Primitives if possible)
      // e.g. Elevation/sm/Y -> Alias(Primitives/1px)
      const createGeoVar = (leaf, val) => {
        const path = `${shadow.name}/${leaf}`;
        let v = allVars.find(varObj => varObj.variableCollectionId === targetCollection.id && varObj.name === path);
        if (!v) v = figma.variables.createVariable(path, targetCollection, "FLOAT");

        // Try to find Primitive Source
        // Assuming measureGroup has variables like "1px", "4px", "-1px"
        // Handle negative spread: "-1px"
        let sourceName = `${val}px`;
        // Handle dot?
        sourceName = sourceName.replace('.', '_');

        const sourceVar = findSource(measureGroup, sourceName);

        // Apply to modes
        if (sourceVar) {
          v.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
          v.setValueForMode(tabletId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
          v.setValueForMode(mobileId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
        } else {
          // Fallback to raw value if primitive missing
          v.setValueForMode(desktopId, val);
          v.setValueForMode(tabletId, val);
          v.setValueForMode(mobileId, val);
        }
        return v;
      };

      const varY = createGeoVar('Y', shadow.y);
      const varBlur = createGeoVar('Blur', shadow.blur);
      const varSpread = createGeoVar('Spread', shadow.spread);

      // Create Effect Style
      const styleName = shadow.name;
      let effectStyle = existingEffectStyles.find(s => s.name === styleName);
      if (!effectStyle) {
        effectStyle = figma.createEffectStyle();
        effectStyle.name = styleName;
      }

      // Apply with Bindings (Geometry only)
      // Corrected boundVariables keys: offsetY, radius, spread
      effectStyle.effects = [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: shadow.opacity }, // Raw Color
        offset: { x: 0, y: shadow.y },
        radius: shadow.blur,
        spread: shadow.spread,
        visible: true,
        blendMode: 'NORMAL',
        boundVariables: {
          // Flattened keys for offset
          offsetY: { type: 'VARIABLE_ALIAS', id: varY.id },
          radius: { type: 'VARIABLE_ALIAS', id: varBlur.id },
          spread: { type: 'VARIABLE_ALIAS', id: varSpread.id }
        }
      }];
    }

    // 6. Blurs (Layer & Background)
    const blurMap = [
      { name: 'Blur/sm', radius: 4 },
      { name: 'Blur/md', radius: 8 },
      { name: 'Blur/lg', radius: 16 },
      { name: 'Blur/xl', radius: 24 },
      { name: 'Blur/2xl', radius: 40 },
      { name: 'Blur/3xl', radius: 64 }
    ];

    for (const blur of blurMap) {
      // Create Variable (Aliased to Primitive)
      const path = `Elevation/${blur.name}`;
      let v = allVars.find(varObj => varObj.variableCollectionId === targetCollection.id && varObj.name === path);
      if (!v) v = figma.variables.createVariable(path, targetCollection, "FLOAT");

      // Find Primitive Source
      let sourceName = `${blur.radius}px`;
      const sourceVar = findSource(measureGroup, sourceName);

      if (sourceVar) {
        v.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
        v.setValueForMode(tabletId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
        // Mobile Scaling: 
        // If we have a primitive for the smaller size? 
        // e.g. 16px -> 12px?
        // Hard to guess. For now, let's keep it consistent or use raw calculation if alias fails.
        // User requested "responsive". If we alias, we lock to the primitive.
        // Does the primitive change per mode? No, primitives are usually constant.
        // Semantic variables CHANGE value per mode.
        // So: Desktop = Alias(16px). Mobile = Alias(12px).
        // We need to guess the smaller primitive.

        // Simple fallback: If mobile needs 0.8x, that might not be a clean primitive.
        // Let's use the SAME primitive for now to be safe, unless we have a specific mobile map.
        // Or fallback to raw value for mobile if we want custom scaling.

        v.setValueForMode(mobileId, { type: 'VARIABLE_ALIAS', id: sourceVar.id });
      } else {
        v.setValueForMode(desktopId, blur.radius);
        v.setValueForMode(tabletId, blur.radius);
        v.setValueForMode(mobileId, blur.radius * 0.8);
      }

      // Create Styles
      const layerName = blur.name.replace('Blur/', 'Blur/Layer/');
      let layerStyle = existingEffectStyles.find(s => s.name === layerName);
      if (!layerStyle) { layerStyle = figma.createEffectStyle(); layerStyle.name = layerName; }

      layerStyle.effects = [{
        type: 'LAYER_BLUR',
        radius: blur.radius,
        visible: true,
        boundVariables: { radius: { type: 'VARIABLE_ALIAS', id: v.id } }
      }];

      const bgName = blur.name.replace('Blur/', 'Blur/Background/');
      let bgStyle = existingEffectStyles.find(s => s.name === bgName);
      if (!bgStyle) { bgStyle = figma.createEffectStyle(); bgStyle.name = bgName; }

      bgStyle.effects = [{
        type: 'BACKGROUND_BLUR',
        radius: blur.radius,
        visible: true,
        boundVariables: { radius: { type: 'VARIABLE_ALIAS', id: v.id } }
      }];
    }

    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify("Responsive Tokens + Shadows + Blurs created successfully!");
    figma.ui.postMessage({ type: 'aliases-created' }); // Enable tab button

  } catch (err) {
    console.error(err);
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify("Error: " + err.message);
  }
}

async function createTextStyles(config) {
  // Matrix Generator: Size x Weight
  try {
    const { sourceCollectionId, measureGroup, typoGroup, targetName } = config;
    figma.ui.postMessage({ type: 'progress-start', payload: 'Generating Text Styles Matrix...' });

    // 1. Get Primitives (Weights & Letter Spacing)
    const allVars = await figma.variables.getLocalVariablesAsync();
    const findPrimitive = (subfolder, name) => {
      // name might be "Bold" or "400" or "-1"
      // Path: "Primitivos/Font Weight/Bold"
      let path = `${typoGroup}/${subfolder}/${name}`;
      return allVars.find(v => v.variableCollectionId === sourceCollectionId && v.name === path);
    };

    // Need target collection to find semantic vars
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const targetColl = collections.find(c => c.name === targetName);
    if (!targetColl) throw new Error(`Collection "${targetName}" not found. Run Step 1 first.`);

    const findSemanticSize = (name) => {
      return allVars.find(v => v.variableCollectionId === targetColl.id && v.name === name);
    };

    // Primitive Weights to iterate - CORRECTED FOR INTER (Spaces)

    // Primitive Weights to iterate - CORRECTED FOR INTER (Spaces)
    // We iterate the Font Styles (what Figma expects for Inter)
    const weightNames = ["Thin", "Extra Light", "Light", "Regular", "Medium", "Semi Bold", "Bold", "Extra Bold", "Black"];

    // Map to Variable Names (created in Step 1, likely no spaces if keys were "ExtraLight")
    const weightVarMap = {
      "Extra Light": "ExtraLight",
      "Semi Bold": "SemiBold",
      "Extra Bold": "ExtraBold"
    };

    // Semantic Sizes to iterate (from code logic)
    // ... (sizes array is fine) ...
    const sizes = [
      'Typography/Display/h1', 'Typography/Display/h2',
      'Typography/Heading/h1', 'Typography/Heading/h2', 'Typography/Heading/h3', 'Typography/Heading/h4',
      'Typography/Body/l', 'Typography/Body/m', 'Typography/Body/s',
      'Typography/Caption'
    ];

    // 2. Loop Matrix
    let createdCount = 0;

    // Pre-load a base font (Inter Regular) to ensure we can create/reset styles
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    // Fetch existing styles once
    const existingStyles = await figma.getLocalTextStylesAsync();

    for (const sizeName of sizes) {
      const sizeVar = allVars.find(v => v.variableCollectionId === targetColl.id && v.name === sizeName);
      // if (!sizeVar) continue; // Don't skip, lets debug. 
      if (!sizeVar) {
        console.warn(`Size Variable not found: ${sizeName}`);
        continue;
      }

      // ... (Logic for Family, LS is fine) ...
      // Determine Font Family Binding (Heading vs Body)
      let familyVar = null;
      if (sizeName.includes('Display') || sizeName.includes('Heading')) {
        familyVar = findPrimitive('Font Family', 'Heading');
      } else if (sizeName.includes('Code')) {
        familyVar = findPrimitive('Font Family', 'Code');
      } else {
        familyVar = findPrimitive('Font Family', 'Body');
      }

      let lsName = "0";
      if (sizeName.includes('Display')) lsName = "-0_04";
      else if (sizeName.includes('Heading')) lsName = "-0_02";
      else if (sizeName.includes('Body/l')) lsName = "-0_01";
      else if (sizeName.includes('Caption')) lsName = "0_01";

      let lsVar = findPrimitive('Letter Spacing', lsName);
      if (!lsVar) lsVar = findPrimitive('Letter Spacing', '0');

      for (const w of weightNames) {
        try {
          // Resolve Variable Name: "Extra Light" -> "ExtraLight"
          const varName = weightVarMap[w] || w;
          const wVar = findPrimitive('Font Weight', varName);

          if (!wVar) {
            // console.warn(`Weight variable not found for ${varName}`);
            continue;
          }

          // 1. Prepare Style Name "Display/h1 - Black"
          const shortSize = sizeName.split('/').pop();
          const groupContext = sizeName.includes('Display') ? 'Display' : (sizeName.includes('Heading') ? 'Heading' : 'Body');
          const styleName = `${groupContext}/${shortSize} - ${w}`;

          // 2. Find or Create Style
          let style = existingStyles.find(s => s.name === styleName);
          if (!style) {
            style = figma.createTextStyle();
            style.name = styleName;
          }

          // 3. Ensure base font is loaded to allow editing
          // We don't need to manually set "Inter Bold". Binding the variables will do it.
          await figma.loadFontAsync(style.fontName);

          // 4. Bind Variables
          const tryBind = (prop, variable) => {
            if (!variable) return;
            try {
              // FIX: Pass the Variable OBJECT, not the ID string
              // Error "Expected node, got string" confirms this API expects the Variable Node.
              style.setBoundVariable(prop, variable);
            } catch (e) {
              console.error(`Failed to bind ${prop} to ${styleName}: ${e.message}`);
            }
          };
          if (familyVar) tryBind('fontFamily', familyVar);
          if (sizeVar) tryBind('fontSize', sizeVar);
          if (wVar) tryBind('fontWeight', wVar);
          if (lsVar) tryBind('letterSpacing', lsVar);

          createdCount++;
        } catch (innerErr) {
          console.error(`Failed to process style ${sizeName} / ${w}:`, innerErr);
        }
      }
    }
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify(`Created ${createdCount} Text Styles successfully! ✅`);

  } catch (err) {
    console.error(err);
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify("Error creating styles: " + err.message);
  }
}

async function generateScale(baseColor, hexCode = "") {
}

// Logic: Get Groups
async function getGroups(collectionId, mode = 'tab1') {
  try {
    const allVariables = await figma.variables.getLocalVariablesAsync();
    // Filter by type? For measures, we might want to also see group names even if they only have colors? 
    // Usually groups are mixed. But safer to just list all groups in collection.
    // The previous filter was `resolvedType === 'COLOR'`. 
    // If we want to add numbers to existing groups, we should probably see ALL groups.
    // But let's stick to consistent behavior or relax it. 
    // Let's relax to show groups regardless of variable type.
    const collectionVariables = allVariables.filter(v => v.variableCollectionId === collectionId);

    // Extract unique groups (first part of name)
    const groupSet = new Set();
    collectionVariables.forEach(v => {
      const parts = v.name.split('/');
      if (parts.length > 1) {
        groupSet.add(parts[0]);
      }
    });

    const payload = Array.from(groupSet).sort();
    if (mode === 'tab2') {
      figma.ui.postMessage({ type: 'load-groups-tab2', payload });
    } else if (mode === 'measures') {
      figma.ui.postMessage({ type: 'load-groups-measures', payload });
    } else {
      figma.ui.postMessage({ type: 'load-groups', payload });
    }
  } catch (error) {
    console.error('Error loading groups:', error);
  }
}

// Logic: Get Groups Custom (Filtered)
async function getGroupsCustom(collectionId, returnEventType) {
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    // Get unique groups
    const vars = await figma.variables.getLocalVariablesAsync();
    const groupNames = new Set();
    vars.filter(v => v.variableCollectionId === collectionId).forEach(v => {
      if (v.name.includes('/')) {
        const group = v.name.split('/')[0];
        groupNames.add(group);
      }
    });

    figma.ui.postMessage({ type: returnEventType, payload: Array.from(groupNames).sort() });
  } catch (err) {
    console.error(err);
  }
}

// Helper: Slugify
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Helper: sRGB to Display P3
function rgbToP3(r, g, b) {
  // 1. Linearize sRGB
  const linearize = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  // 2. Matrix transform: Linear sRGB -> XYZ
  const X = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const Y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const Z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;

  // 3. Matrix transform: XYZ -> Linear P3
  // (Using standard P3 D65 matrices)
  const p3r_lin = 2.4934969 * X - 0.9313836 * Y - 0.4027107 * Z;
  const p3g_lin = -0.8294889 * X + 1.7626640 * Y + 0.0236246 * Z;
  const p3b_lin = 0.0358458 * X - 0.0761723 * Y + 0.9568845 * Z;

  // 4. Gamma encode (sRGB transfer function is commonly used for P3 in CSS)
  const gamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055);

  // Clamp values to 0-1 range (though P3 can go outside sRGB, we want to show valid P3 values)
  // Actually, if we are converting FROM sRGB, the values will always be within P3 gamut.
  // But precision errors might cause slight overflow.
  const p3r = Math.max(0, Math.min(1, gamma(p3r_lin)));
  const p3g = Math.max(0, Math.min(1, gamma(p3g_lin)));
  const p3b = Math.max(0, Math.min(1, gamma(p3b_lin)));

  return `color(display-p3 ${p3r.toFixed(3)} ${p3g.toFixed(3)} ${p3b.toFixed(3)})`;
}

async function generateOnCanvas(collectionId, groupFilter) {
  try {
    figma.ui.postMessage({ type: 'progress-start', payload: 'Initializing...' });

    // Load fonts globally as well
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });

    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) throw new Error("Collection not found");

    figma.ui.postMessage({ type: 'progress-update', payload: 'Fetching variables...' });
    const allVariables = await figma.variables.getLocalVariablesAsync();
    let collectionVariables = allVariables.filter(v => v.variableCollectionId === collectionId && v.resolvedType === 'COLOR');

    // Filter by group if provided
    if (groupFilter) {
      collectionVariables = collectionVariables.filter(v => v.name.startsWith(groupFilter + '/'));
    }

    figma.ui.postMessage({ type: 'progress-update', payload: 'Preparing component...' });
    const component = await getOrCreateComponent();
    const modeId = collection.defaultModeId;

    // 1. Group variables by folder
    const groups = {};
    for (const variable of collectionVariables) {
      const parts = variable.name.split('/');
      const groupName = parts.length > 1 ? parts.slice(0, -1).join('/') : 'Uncategorized';

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(variable);
    }

    // 2. Create Main Container
    const mainContainer = figma.createFrame();
    mainContainer.name = collection.name;
    mainContainer.layoutMode = "VERTICAL";
    mainContainer.itemSpacing = 40;
    mainContainer.paddingLeft = 40;
    mainContainer.paddingRight = 40;
    mainContainer.paddingTop = 40;
    mainContainer.paddingBottom = 40;
    mainContainer.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
    mainContainer.cornerRadius = 24;
    mainContainer.primaryAxisSizingMode = "AUTO";
    mainContainer.counterAxisSizingMode = "AUTO";

    // Add Collection Title
    const title = figma.createText();
    title.characters = collection.name;
    title.fontSize = 32;
    title.fontName = { family: "Inter", style: "Bold" };
    mainContainer.appendChild(title);

    // 3. Process each group
    // Sort groups by Hue (Warm to Cold / Rainbow)

    // Helper to get Hue from RGB
    const getHue = (r, g, b) => {
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0;
      if (max === min) return 0;
      let d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      return h * 60;
    };

    // Calculate average/dominant Hue for each group
    const groupsWithHue = Object.keys(groups).map(groupName => {
      const vars = groups[groupName];
      let maxSat = -1;
      let bestHue = 0;

      for (const v of vars) {
        const val = v.valuesByMode[modeId];
        if (val && 'r' in val) {
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

      // Neutral Logic Improvement:
      // 1. Semantic Check: If name contains common neutral keywords, force to end.
      // 2. Saturation Check: Increase threshold to 0.10 (some "Cool Greys" are quite blue).
      const lowerName = groupName.toLowerCase();
      const neutralKeywords = ['gray', 'grey', 'slate', 'zinc', 'stone', 'neutral', 'cement', 'silver', 'ash', 'sand'];
      const isSemanticNeutral = neutralKeywords.some(kw => lowerName.includes(kw));

      if (isSemanticNeutral || maxSat < 0.10) {
        bestHue = 1000; // Force to very end
        // Optional: Secondary sort for neutrals? 
        // We can add "sub-hue" (1000 + hue) to sort neutrals by temperature among themselves
        // or just 1000 and let them sort by original generic hue.
        // Let's keep it simple: 1000.
      }

      return { name: groupName, hue: bestHue };
    });

    // Sort: 0 (Red) -> 60 (Yellow) -> 120 (Green) -> 240 (Blue) -> ... -> 1000 (Neutral)
    groupsWithHue.sort((a, b) => a.hue - b.hue);

    const sortedGroupNames = groupsWithHue.map(g => g.name);
    let totalProcessed = 0;

    for (const groupName of sortedGroupNames) {
      figma.ui.postMessage({ type: 'progress-update', payload: `Processing group: ${groupName}...` });

      const variables = groups[groupName];

      // Sort variables by Luminance (Lightest to Darkest)
      // We need to calculate luminance for sorting
      const variablesWithLum = variables.map(v => {
        const value = v.valuesByMode[modeId];
        let lum = 0;
        if (value && 'r' in value) {
          lum = getLuminance(value.r, value.g, value.b); // Fixed v.b -> value.b
        }
        return { variable: v, lum };
      });

      // Sort descending (Light -> Dark means High Luminance -> Low Luminance)
      variablesWithLum.sort((a, b) => b.lum - a.lum);

      // Group Container
      const groupFrame = figma.createFrame();
      groupFrame.name = groupName;
      groupFrame.layoutMode = "VERTICAL";
      groupFrame.itemSpacing = 16;
      groupFrame.fills = [];
      groupFrame.primaryAxisSizingMode = "AUTO";
      groupFrame.counterAxisSizingMode = "AUTO";
      mainContainer.appendChild(groupFrame);

      // Group Title
      const groupTitle = figma.createText();
      groupTitle.characters = groupName;
      groupTitle.fontSize = 20;
      groupTitle.fontName = { family: "Inter", style: "Bold" };
      groupFrame.appendChild(groupTitle);

      // Row Container (Horizontal)
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

        if (value && 'r' in value) {
          const { r, g, b, a } = value;

          // Calculations
          const hex = rgbToHex(r, g, b);
          const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${(a !== undefined ? a : 1).toFixed(2)})`;
          const oklch = rgbToOklch(r, g, b);
          const p3 = rgbToP3(r, g, b);

          // Smart CSS Var Name: Use leaf name, fallback to group-leaf if leaf starts with number
          const parts = variable.name.split('/');
          const leaf = parts.pop();
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

          // Text Color Logic
          const textColor = contrastWhite > contrastBlack ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 };

          // Create Instance
          const instance = component.createInstance();
          rowFrame.appendChild(instance);

          // Set Fill
          instance.fills = [{ type: 'SOLID', color: { r, g, b }, opacity: a }];

          // Populate Data
          // We use children.find for direct access, assuming flat structure in component v3
          const setText = async (name, text) => {
            const node = instance.children.find(n => n.name === name);
            if (node && node.type === "TEXT") {
              try {
                // Critical: Load the specific font used by this node before editing
                await figma.loadFontAsync(node.fontName);
                node.characters = text;
                node.fills = [{ type: 'SOLID', color: textColor }];
              } catch (err) {
                console.error(`Error setting text for ${name}:`, err);
              }
            }
          };

          // We must await these updates
          await setText("Name", variable.name.split('/').pop());
          await setText("CSS Var", cssVar);
          await setText("Hex", hex.toUpperCase());
          await setText("RGBA", rgba);
          await setText("OKLCH", oklch);
          await setText("P3", p3);
          await setText("Lum", `L: ${luminance.toFixed(3)}`);

          // Format WCAG strings
          const wRating = ratingsWhite.includes("Fail") ? "Fail" : ratingsWhite[0];
          const bRating = ratingsBlack.includes("Fail") ? "Fail" : ratingsBlack[0];

          await setText("WCAG White", `White: ${wRating} (${contrastWhite.toFixed(2)})`);
          await setText("WCAG Black", `Black: ${bRating} (${contrastBlack.toFixed(2)})`);
        }
        totalProcessed++;
      }
    }

    figma.viewport.scrollAndZoomIntoView([mainContainer]);
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify(`Generated ${totalProcessed} advanced color cards!`);

  } catch (error) {
    console.error("Error generating on canvas:", error);
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify("Error: " + error.message);
  }
}

async function getOrCreateComponent() {
  const componentName = "Color Card v6"; // Increment version to force recreation
  const existing = figma.currentPage.findOne(n => n.type === "COMPONENT" && n.name === componentName);

  if (existing) {
    // Robust integrity check: Must have "P3" text node (new in v6)
    const hasP3 = existing.children.find(n => n.name === "P3");
    if (hasP3) {
      return existing;
    } else {
      console.warn("Found broken component, recreating...");
      existing.remove();
    }
  }

  // Load fonts required for component creation
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const component = figma.createComponent();
  component.name = componentName;
  component.layoutMode = "VERTICAL";

  // Use resize for explicit dimensions (Increased height for new data)
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

  // Text Helper
  const createText = (name, fontSize, fontStyle) => {
    const t = figma.createText();
    t.name = name;
    t.fontName = { family: "Inter", style: fontStyle };
    t.fontSize = fontSize;
    t.characters = name;
    t.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    return t;
  };

  // 1. Variable Name (Top)
  const nameText = createText("Name", 20, "Bold");
  component.appendChild(nameText);

  // 2. Spacer
  const spacer = figma.createFrame();
  spacer.name = "Spacer";
  spacer.layoutMode = "VERTICAL";
  spacer.fills = [];
  component.appendChild(spacer);
  spacer.layoutGrow = 1; // Must be set AFTER appending to AutoLayout parent

  // 3. Info (Bottom)
  const wcagBlack = createText("WCAG Black", 11, "Medium");
  component.appendChild(wcagBlack);

  const wcagWhite = createText("WCAG White", 11, "Medium");
  component.appendChild(wcagWhite);

  // Small spacer
  const smallSpacer = figma.createFrame();
  smallSpacer.name = "Small Spacer";
  // DO NOT set layoutMode to VERTICAL here
  smallSpacer.fills = [];
  component.appendChild(smallSpacer);
  smallSpacer.resize(220, 8); // Explicitly set size
  smallSpacer.layoutAlign = "STRETCH";
  smallSpacer.layoutGrow = 0;

  // Advanced Data
  const cssVarText = createText("CSS Var", 11, "Bold");
  component.appendChild(cssVarText);

  const hexText = createText("Hex", 11, "Regular");
  component.appendChild(hexText);

  const rgbaText = createText("RGBA", 11, "Regular");
  component.appendChild(rgbaText);

  const oklchText = createText("OKLCH", 11, "Regular");
  component.appendChild(oklchText);

  const p3Text = createText("P3", 11, "Regular");
  component.appendChild(p3Text);

  const lumText = createText("Lum", 11, "Regular");
  component.appendChild(lumText);

  return component;
}

async function convertCollection(collectionId, groupFilter) {
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collection = collections.find(c => c.id === collectionId);

    if (!collection) {
      console.error('Collection not found');
      return;
    }

    // Get all variables in the collection
    // Note: figma.variables.getLocalVariablesAsync returns ALL variables, we need to filter
    const allVariables = await figma.variables.getLocalVariablesAsync();
    let collectionVariables = allVariables.filter(v => v.variableCollectionId === collectionId && v.resolvedType === 'COLOR');

    // Filter by group if provided
    if (groupFilter) {
      collectionVariables = collectionVariables.filter(v => v.name.startsWith(groupFilter + '/'));
    }

    const results = [];
    const modeId = collection.defaultModeId; // Use the default mode for now

    for (const variable of collectionVariables) {
      const value = variable.valuesByMode[modeId];

      if (value && 'r' in value) {
        const { r, g, b, a } = value;
        const oklch = rgbToOklch(r, g, b);
        const hex = rgbToHex(r, g, b);

        // Accessibility Calculations
        const luminance = getLuminance(r, g, b);
        const contrastWhite = getContrastRatio(luminance, 1.0); // White luminance is 1.0
        const contrastBlack = getContrastRatio(luminance, 0.0); // Black luminance is 0.0

        const ratingsWhite = getWCAGRating(contrastWhite);
        const ratingsBlack = getWCAGRating(contrastBlack);

        results.push({
          name: variable.name,
          oklch: oklch,
          hex: hex,
          accessibility: {
            white: { ratio: contrastWhite.toFixed(2), ratings: ratingsWhite },
            black: { ratio: contrastBlack.toFixed(2), ratings: ratingsBlack }
          }
        });
      }
    }

    figma.ui.postMessage({ type: 'conversion-result', payload: results });

  } catch (error) {
    console.error('Error converting collection:', error);
  }
}

// --- Color Conversion Helpers ---

function rgbToHex(r, g, b) {
  // Handle object input {r,g,b}
  if (typeof r === 'object' && r !== null) {
    const color = r;
    r = color.r;
    g = color.g;
    b = color.b;
  }

  const toHex = (n) => {
    // Clamp values 0-1
    const val = Math.max(0, Math.min(1, n));
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper: RGB to OKLCH (Numeric)
function rgbToOklchStruct(r, g, b) {
  const linearize = (c) => {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + b_ * b_);
  let h = Math.atan2(b_, a) * (180 / Math.PI);

  if (h < 0) {
    h += 360;
  }

  return { l: L, c: C, h: h };
}

function rgbToOklch(r, g, b) {
  const { l, c, h } = rgbToOklchStruct(r, g, b);
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

// --- Accessibility Helpers ---

function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWCAGRating(ratio) {
  if (ratio >= 7) return ["AAA", "AA", "AA Large"];
  if (ratio >= 4.5) return ["AA", "AA Large"];
  if (ratio >= 3) return ["AA Large"];
  return ["Fail"];
}

// ===== THEME SYSTEM =====

// Load available color palettes
async function loadPalettes(collectionId, groupName) {
  try {
    const palettes = [];

    if (!collectionId) {
      figma.ui.postMessage({ type: 'load-palettes', payload: [] });
      return;
    }

    // Use getLocalVariablesAsync and filter manually as getVariablesInCollectionAsync doesn't exist
    const allVariables = await figma.variables.getLocalVariablesAsync();
    const variables = allVariables.filter(v => v.variableCollectionId === collectionId);

    // const variables = await figma.variables.getVariablesInCollectionAsync(collectionId);

    const paletteNames = new Set();

    // Debug info
    const safeGroupName = groupName ? groupName.trim() : '';
    console.log(`Scanning ${variables.length} vars. Filter Group: "${safeGroupName}"`);

    variables.forEach(v => {
      // Only process COLOR variables
      if (v.resolvedType === 'COLOR' && v.name.includes('/')) {
        const name = v.name;

        if (safeGroupName) {
          // Check if variable is inside this group
          const prefix = safeGroupName + '/';
          if (name.startsWith(prefix)) {
            // It is inside. Now we need to find the "Palette Name".
            // Logic: The Palette Name is the full path to the collection of shades.
            // e.g. "Colors/Esmerald/50" -> Palette is "Colors/Esmerald"
            // e.g. "Colors/Actions/Primary/500" -> Palette is "Colors/Actions/Primary"

            // We strip the last segment (Scale)
            const parts = name.split('/');
            // Safety check: must have at least prefix parts + 1 (palette) + 1 (scale)
            // Actually just need enough parts to be inside group + has a shade

            if (parts.length >= 2) {
              // Full logic: take everything except the last part
              const palettePath = parts.slice(0, -1).join('/');
              paletteNames.add(palettePath);
            }
          }
        } else {
          // No group filter: Add all palettes (path minus last segment)
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

    console.log('Palettes found:', palettes);

    if (palettes.length === 0) {
      figma.notify(`⚠️ No palettes found in ${groupName ? 'group' : 'collection'}. Scanned ${variables.length} variables.`);
    }

    figma.ui.postMessage({ type: 'load-palettes', payload: palettes });

  } catch (error) {
    console.error('Error loading palettes:', error);
    figma.notify('❌ Error loading palettes: ' + error.message);
    figma.ui.postMessage({ type: 'load-palettes', payload: [] });
  }
}

// Helper: Extract palette colors for UI Picker
function extractPaletteColors(vars, allVarsMap) {
  const result = {};
  console.log(`Extracting colors from ${vars.length} variables...`);

  // Helper to resolve alias to hex
  const resolveValue = (val) => {
    if (!val) return null;
    if (val.r !== undefined) return rgbToHex(val).toUpperCase();
    if (val.type === 'VARIABLE_ALIAS' && allVarsMap) {
      const target = allVarsMap[val.id];
      if (target) {
        // Get value from target (using first mode as fallback if we don't know mode)
        // Ideally we recursively find the mode but often Primitives have 1 mode.
        const targetModeId = Object.keys(target.valuesByMode)[0];
        return resolveValue(target.valuesByMode[targetModeId]);
      }
    }
    return null;
  };

  let loggedCount = 0;
  vars.forEach(v => {
    const safeName = v.name.trim();

    // 1. Divider match: / - space
    let match = safeName.match(/[\/\-\s]([0-9]+)$/);

    // 2. Direct number match (e.g. "50")
    if (!match) match = safeName.match(/^([0-9]+)$/);

    // 3. Combined match (e.g. "Red50") - risky but maybe needed?
    if (!match) match = safeName.match(/([0-9]+)$/);

    if (match) {
      const scale = match[1];
      const modeId = Object.keys(v.valuesByMode)[0];
      const value = v.valuesByMode[modeId];

      const hex = resolveValue(value);
      if (hex) {
        result[scale] = hex;
        if (loggedCount < 5) console.log(`[Success] Processed variable: ${safeName} -> Scale: ${scale}, Hex: ${hex}`);
      } else {
        if (loggedCount < 5) console.log(`[Fail] Could not resolve value for ${safeName}`);
      }
    } else {
      if (loggedCount < 5) console.log(`[Fail] Regex no match for ${safeName}`);
    }
    loggedCount++;
  });

  console.log(`Extracted keys: ${Object.keys(result).join(', ')}`);
  return result;
}

// Generate theme with intelligent mapping
async function generateTheme(accentPalette, neutralPalette, statusPalettes, themeName, isRegenerate, tokenOverrides) {
  try {
    // Use getLocalVariablesAsync directly
    const allVariables = await figma.variables.getLocalVariablesAsync();

    // Create Map for Alias Resolution
    const allVarsMap = {};
    allVariables.forEach(v => allVarsMap[v.id] = v);

    // Filter variables by palette
    // Fix: Don't force '/', allow other separators
    const filterByPalette = (paletteName) => {
      if (!paletteName) return [];
      return allVariables.filter(v =>
        v.resolvedType === 'COLOR' && (
          v.name.startsWith(paletteName + '/') ||
          v.name.startsWith(paletteName + '-') ||
          v.name.startsWith(paletteName + ' ') ||
          v.name === paletteName // Exact match? Unlikely for a palette root but possible
        )
      );
    };

    const accentVars = filterByPalette(accentPalette);
    const neutralVars = filterByPalette(neutralPalette);

    // Status vars (optional but recommended)
    const successVars = (statusPalettes && statusPalettes.success) ? filterByPalette(statusPalettes.success) : [];
    const warningVars = (statusPalettes && statusPalettes.warning) ? filterByPalette(statusPalettes.warning) : [];
    const errorVars = (statusPalettes && statusPalettes.error) ? filterByPalette(statusPalettes.error) : [];

    console.log(`Generating Theme '${themeName}'...`);
    console.log(`Accent: ${accentPalette} (${accentVars.length})`);
    console.log(`Neutral: ${neutralPalette} (${neutralVars.length})`);
    if (statusPalettes) {
      console.log(`Status: Success=${statusPalettes.success}(${successVars.length}), Warning=${statusPalettes.warning}(${warningVars.length}), Error=${statusPalettes.error}(${errorVars.length})`);
    }

    if (accentVars.length === 0 || neutralVars.length === 0) {
      figma.notify('❌ Selected primary palettes not found');
      return;
    }

    // Find variables by scale value
    const findVar = (vars, scale) => {
      // 1. Try standard path match (e.g. ".../50")
      let found = vars.find(v => v.name.endsWith('/' + scale));

      // 2. Try hyphenated match (e.g. "...-50" or ".../Blue-50")
      if (!found) found = vars.find(v => v.name.endsWith('-' + scale));

      // 3. Try space match (e.g. "... 50")
      if (!found) found = vars.find(v => v.name.endsWith(' ' + scale));

      return found;
    };

    // Get variation index
    // Improvement: Ensure we cycle or pick a different one if regenerating
    // For now, random is fine providing the mapping logic is distinct enough.
    // Let's add more distinct variations.
    const variation = isRegenerate ? Math.floor(Math.random() * 3) : 0; // 0 is default "Standard"

    const mappings = {
      // 0: Standard Modern (Clean, high contrast text)
      0: { bgLight: '50', bgDark: '950', textLight: '900', textDark: '50', actionLight: '600', actionDark: '500' },

      // 1: High Contrast / Stark (Pure white/black extremes)
      1: { bgLight: '0', bgDark: '950', textLight: '950', textDark: '0', actionLight: '700', actionDark: '400' },

      // 2: Soft / Muted (Softer backgrounds, less harsh blacks)
      2: { bgLight: '100', bgDark: '900', textLight: '800', textDark: '100', actionLight: '500', actionDark: '400' }
    };

    const map = mappings[variation];
    const tokens = {};

    const createToken = (name, lightVar, darkVar) => {
      // Check Overrides first
      if (tokenOverrides && tokenOverrides[name]) {
        const override = tokenOverrides[name];
        // Expect override format: { light: '100', dark: '900' }
        // We need to resolve these scale values to actual variables
        // Find variable list based on token type (approximate)
        let targetVars = neutralVars;
        if (name.includes('Action') || name.includes('Accent')) targetVars = accentVars;
        else if (name.includes('Status/success')) targetVars = successVars;
        else if (name.includes('Status/warning')) targetVars = warningVars;
        else if (name.includes('Status/error')) targetVars = errorVars;

        // If specific override var exists, use it
        if (override.light) {
          const found = findVar(targetVars, override.light);
          if (found) lightVar = found;
        }
        if (override.dark) {
          const found = findVar(targetVars, override.dark);
          if (found) darkVar = found;
        }
      }

      if (!lightVar || !darkVar) return;
      const lightColor = lightVar.valuesByMode[Object.keys(lightVar.valuesByMode)[0]];
      const darkColor = darkVar.valuesByMode[Object.keys(darkVar.valuesByMode)[0]];

      // Safety check for color retrieval
      if (!lightColor || !darkColor) return;

      tokens[name] = {
        light: { id: lightVar.id, name: lightVar.name, hex: rgbToHex(lightColor) },
        dark: { id: darkVar.id, name: darkVar.name, hex: rgbToHex(darkColor) }
      };
    };

    // ... Background/Text/Surface/Border/Action tokens (Same as before) ...
    createToken('Background/primary', findVar(neutralVars, map.bgLight), findVar(neutralVars, map.bgDark));
    createToken('Background/secondary', findVar(neutralVars, '100'), findVar(neutralVars, '800'));
    createToken('Background/tertiary', findVar(neutralVars, '200'), findVar(neutralVars, '700'));
    createToken('Text/primary', findVar(neutralVars, map.textLight), findVar(neutralVars, map.textDark));
    createToken('Text/secondary', findVar(neutralVars, '700'), findVar(neutralVars, '300'));
    createToken('Text/disabled', findVar(neutralVars, '400'), findVar(neutralVars, '600'));
    createToken('Surface/default', findVar(neutralVars, '0') || findVar(neutralVars, '50'), findVar(neutralVars, '950') || findVar(neutralVars, '900'));
    createToken('Surface/elevated', findVar(neutralVars, '0') || findVar(neutralVars, '50'), findVar(neutralVars, '900'));
    createToken('Surface/overlay', findVar(neutralVars, '0') || findVar(neutralVars, '50'), findVar(neutralVars, '800'));
    createToken('Border/default', findVar(neutralVars, '200'), findVar(neutralVars, '700'));
    createToken('Border/subtle', findVar(neutralVars, '100'), findVar(neutralVars, '800'));
    createToken('Action/primary', findVar(accentVars, map.actionLight), findVar(accentVars, map.actionDark));
    createToken('Action/primaryHover', findVar(accentVars, '700'), findVar(accentVars, '300'));
    createToken('Action/disabled', findVar(neutralVars, '300'), findVar(neutralVars, '700'));

    // Status tokens uses specific palettes or fallbacks to accent if not provided
    const getStatusVar = (vars, scale) => vars.length > 0 ? findVar(vars, scale) : findVar(accentVars, scale);

    createToken('Status/success', getStatusVar(successVars, '600'), getStatusVar(successVars, '400'));
    createToken('Status/error', getStatusVar(errorVars, '600'), getStatusVar(errorVars, '400'));
    createToken('Status/warning', getStatusVar(warningVars, '600'), getStatusVar(warningVars, '400'));

    // New Subtle Background Tokens (using same lightness level as theme background)
    createToken('Status/successSubtle', getStatusVar(successVars, map.bgLight), getStatusVar(successVars, map.bgDark));
    createToken('Status/errorSubtle', getStatusVar(errorVars, map.bgLight), getStatusVar(errorVars, map.bgDark));
    createToken('Status/warningSubtle', getStatusVar(warningVars, map.bgLight), getStatusVar(warningVars, map.bgDark));

    const validation = { passed: Object.keys(tokens).length, warnings: [] };

    // Extract full palette data for UI Picker
    const paletteData = {
      accent: extractPaletteColors(accentVars, allVarsMap),
      neutral: extractPaletteColors(neutralVars, allVarsMap),
      success: extractPaletteColors(successVars, allVarsMap),
      warning: extractPaletteColors(warningVars, allVarsMap),
      error: extractPaletteColors(errorVars, allVarsMap)
    };

    console.log(`Sending paletteData: ${Object.keys(paletteData).map(k => `${k}(${Object.keys(paletteData[k]).length})`).join(', ')}`);

    const messageType = isRegenerate ? 'theme-regenerated' : 'theme-generated';
    figma.ui.postMessage({
      type: messageType,
      payload: {
        themeName,
        tokens,
        validation,
        accentPalette,
        neutralPalette,
        paletteData // Send full palette data for picker
      }
    });

  } catch (error) {
    console.error("Generate Theme Error:", error);
    figma.notify('❌ Error generating theme: ' + error.message);
  }
}

// Create theme collection
async function createThemeCollection(themeData) {
  try {
    figma.ui.postMessage({ type: 'progress-start', payload: 'Creating Theme Collection...' });
    const { themeName, tokens } = themeData;
    const collection = figma.variables.createVariableCollection(themeName);
    const lightModeId = collection.modes[0].modeId;
    collection.renameMode(lightModeId, 'Light');
    const darkModeId = collection.addMode('Dark');

    for (const [tokenPath, mapping] of Object.entries(tokens)) {
      const variable = figma.variables.createVariable(tokenPath, collection, 'COLOR');
      variable.setValueForMode(lightModeId, { type: 'VARIABLE_ALIAS', id: mapping.light.id });
      variable.setValueForMode(darkModeId, { type: 'VARIABLE_ALIAS', id: mapping.dark.id });
    }

    figma.ui.postMessage({ type: 'progress-end' });
    figma.ui.postMessage({ type: 'theme-created-success', payload: `Theme "${themeName}" created with ${Object.keys(tokens).length} tokens! ✅` });
    figma.notify(`✅ Theme "${themeName}" created successfully!`);
  } catch (error) {
    figma.ui.postMessage({ type: 'progress-end' });
    figma.notify('❌ Error creating theme: ' + error.message);
  }
}
