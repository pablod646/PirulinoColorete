console.clear();

figma.showUI(__html__, { width: 300, height: 400 });

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
    const hex = msg.color;
    const color = parseHex(hex);
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
    const color = parseHex(baseColorHex);
    if (color) {
      const scale = calculateScale(color);
      await createVariables(scale, config);
    }
  } else if (msg.type === 'get-selection-color') {
    // Force a re-check of current selection
    handleSelectionChange();
  } else if (msg.type === 'get-groups-for-tab2') {
    const collectionId = msg.collectionId;
    await getGroups(collectionId, true); // true = indicate tab2
  }
};

// Helper: Parse Hex
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

// Logic: Calculate Scale (Shared)
function calculateScale(baseColor) {
  const mix = (c1, c2, weight) => {
    return {
      r: c1.r * (1 - weight) + c2.r * weight,
      g: c1.g * (1 - weight) + c2.g * weight,
      b: c1.b * (1 - weight) + c2.b * weight
    };
  };
  const white = { r: 1, g: 1, b: 1 };
  const black = { r: 0, g: 0, b: 0 };

  return {
    50: mix(baseColor, white, 0.95),
    100: mix(baseColor, white, 0.85),
    200: mix(baseColor, white, 0.60),
    300: mix(baseColor, white, 0.40),
    400: mix(baseColor, white, 0.20),
    500: baseColor,
    600: mix(baseColor, black, 0.20),
    700: mix(baseColor, black, 0.40),
    800: mix(baseColor, black, 0.60),
    900: mix(baseColor, black, 0.80),
    950: mix(baseColor, black, 0.90),
  };
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

async function generateScale(baseColor, hexCode = "") {
}

// Logic: Get Groups
async function getGroups(collectionId, isTab2 = false) {
  try {
    const allVariables = await figma.variables.getLocalVariablesAsync();
    const collectionVariables = allVariables.filter(v => v.variableCollectionId === collectionId && v.resolvedType === 'COLOR');
    // Extract unique groups (first part of name)
    const groupSet = new Set();
    collectionVariables.forEach(v => {
      const parts = v.name.split('/');
      if (parts.length > 1) {
        groupSet.add(parts[0]);
      }
    });

    const payload = Array.from(groupSet).sort();
    if (isTab2) {
      figma.ui.postMessage({ type: 'load-groups-tab2', payload });
    } else {
      figma.ui.postMessage({ type: 'load-groups', payload });
    }
  } catch (error) {
    console.error('Error loading groups:', error);
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
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToOklch(r, g, b) {
  // 1. Linearize sRGB
  const linearize = (c) => {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  // 2. Linear sRGB to OKLab (approximate matrices)
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // 3. OKLab to OKLCH
  const C = Math.sqrt(a * a + b_ * b_);
  let h = Math.atan2(b_, a) * (180 / Math.PI);

  if (h < 0) {
    h += 360;
  }

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`;
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