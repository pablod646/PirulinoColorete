// Aliases (Responsive Semantics) Section Logic
console.log('🔗 Aliases script loaded');

function initAliases() {
    console.log('🔗 Initializing Aliases section...');

    // Mode Toggle
    const modeTokensBtn = document.getElementById('mode-tokens');
    const modeStylesBtn = document.getElementById('mode-styles');
    const tokensModeSection = document.getElementById('aliases-mode-tokens');
    const stylesModeSection = document.getElementById('aliases-mode-styles');

    // Tokens Mode Elements
    const sourceCollection = document.getElementById('alias-source-collection');
    const measureGroup = document.getElementById('alias-measures-group');
    const typoGroup = document.getElementById('alias-typo-group');
    const targetNameInput = document.getElementById('alias-target-name');
    const createBtn = document.getElementById('create-aliases-btn');

    // Styles Mode Elements
    const stylesCollection = document.getElementById('styles-source-collection');
    const stylesPrefixInput = document.getElementById('styles-prefix');
    const scanBtn = document.getElementById('scan-styles-btn');
    const createStylesBtn = document.getElementById('create-styles-btn');
    const stylesCategories = document.getElementById('styles-categories');
    const noVarsWarning = document.getElementById('styles-no-vars-warning');
    const goToTokensBtn = document.getElementById('go-to-tokens-btn');
    const selectedCountSpan = document.getElementById('selected-styles-count');

    // Text Styles Section
    const textStylesSection = document.getElementById('text-styles-section');
    const textStylesList = document.getElementById('text-styles-list');

    // Effect Styles Section
    const effectStylesSection = document.getElementById('effect-styles-section');
    const effectStylesList = document.getElementById('effect-styles-list');

    if (!createBtn) {
        console.warn('⚠️ Aliases UI elements not found');
        return;
    }

    // State
    let scannedStyles = { textStyles: [], effectStyles: [] };
    let currentMode = 'tokens';

    // Mode Toggle
    function setMode(mode) {
        currentMode = mode;
        if (mode === 'tokens') {
            modeTokensBtn.classList.add('active');
            modeStylesBtn.classList.remove('active');
            tokensModeSection.style.display = 'block';
            stylesModeSection.style.display = 'none';
        } else {
            modeStylesBtn.classList.add('active');
            modeTokensBtn.classList.remove('active');
            tokensModeSection.style.display = 'none';
            stylesModeSection.style.display = 'block';
        }
    }

    modeTokensBtn.onclick = () => setMode('tokens');
    modeStylesBtn.onclick = () => setMode('styles');

    if (goToTokensBtn) {
        goToTokensBtn.onclick = () => setMode('tokens');
    }

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-collections') {
            // Fill both collection selects
            [sourceCollection, stylesCollection].forEach(sel => {
                if (!sel) return;
                sel.innerHTML = '<option value="" disabled selected>Select Collection...</option>';
                payload.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    sel.appendChild(opt);
                });
            });
            console.log('🔗 Aliases: Loaded collections');

        } else if (type === 'load-groups-alias') {
            // For Tokens mode
            const fill = (sel, label) => {
                sel.innerHTML = `<option value="" disabled selected>${label}</option>`;
                payload.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g;
                    opt.textContent = g;
                    sel.appendChild(opt);
                });
                sel.disabled = false;
            };

            fill(measureGroup, 'Select Measures Group...');
            fill(typoGroup, 'Select Typography Group...');
            console.log('🔗 Aliases: Loaded groups for tokens mode');

        } else if (type === 'scan-styles-result') {
            // Reset scan button
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span> Scan Collection';

            scannedStyles = payload;

            if ((!payload.textStyles || payload.textStyles.length === 0) &&
                (!payload.effectStyles || payload.effectStyles.length === 0)) {
                // No styles found
                noVarsWarning.style.display = 'flex';
                stylesCategories.style.display = 'none';
                createStylesBtn.style.display = 'none';
            } else {
                noVarsWarning.style.display = 'none';
                stylesCategories.style.display = 'block';
                createStylesBtn.style.display = 'flex';

                // Render Text Styles
                if (payload.textStyles && payload.textStyles.length > 0) {
                    textStylesSection.style.display = 'block';
                    renderStylesList(textStylesList, payload.textStyles, 'text');
                    textStylesSection.querySelector('.styles-section-count').textContent = `${payload.textStyles.length} styles`;
                } else {
                    textStylesSection.style.display = 'none';
                }

                // Render Effect Styles
                if (payload.effectStyles && payload.effectStyles.length > 0) {
                    effectStylesSection.style.display = 'block';
                    renderStylesList(effectStylesList, payload.effectStyles, 'effect');
                    effectStylesSection.querySelector('.styles-section-count').textContent = `${payload.effectStyles.length} styles`;
                } else {
                    effectStylesSection.style.display = 'none';
                }

                updateSelectedCount();
            }
        }
    });

    // Render styles list with checkboxes
    function renderStylesList(container, styles, type) {
        try {
            container.innerHTML = '';
            console.log(`RenderStylesList: Rendering ${styles.length} items of type ${type}`);

            if (type === 'text') {
                // "GRID OF CARDS" STRATEGY (The "Oh God Finally" Edition)
                // Structure:
                // Section (Main Group, e.g. "Body")
                //   -> Grid Container
                //      -> Card (SubGroup, e.g. "Large")
                //         -> List of Variants

                const hierarchy = {};

                // --- Step 1: Build Hierarchy Tree ---
                styles.forEach((style, index) => {
                    // Filter out primitive groups that don't make sense as composite styles
                    if (style.name.startsWith('Weight/') || style.name.startsWith('Family/') || style.name.startsWith('Line Height/')) {
                        return;
                    }

                    const originalIndex = style.originalIndex !== undefined ? style.originalIndex : index;

                    const separatorIndex = style.name.lastIndexOf(' / ');
                    let fullGroupName = '', weightName = '';

                    if (separatorIndex !== -1) {
                        fullGroupName = style.name.substring(0, separatorIndex);
                        weightName = style.name.substring(separatorIndex + 3);
                    } else {
                        weightName = style.name.split('/').pop();
                        fullGroupName = 'Other';
                    }

                    const slashIndex = fullGroupName.indexOf('/');
                    let mainGroup = fullGroupName, subGroup = 'Base';

                    if (slashIndex !== -1) {
                        mainGroup = fullGroupName.substring(0, slashIndex);
                        subGroup = fullGroupName.substring(slashIndex + 1);
                    }

                    if (!hierarchy[mainGroup]) hierarchy[mainGroup] = {};
                    if (!hierarchy[mainGroup][subGroup]) hierarchy[mainGroup][subGroup] = [];

                    hierarchy[mainGroup][subGroup].push({
                        ...style,
                        weightName,
                        originalIndex
                    });
                });

                // --- Step 1.5: Global Weight Shortcuts ---
                // Extract unique weights across all styles
                const allWeights = new Set();
                styles.forEach(s => {
                    // Re-parse weight name consistent with logic below
                    const separatorIndex = s.name.lastIndexOf(' / ');
                    let weightName = separatorIndex !== -1 ? s.name.substring(separatorIndex + 3) : s.name.split('/').pop();
                    allWeights.add(weightName);
                });

                if (allWeights.size > 0) {
                    const shortcutsContainer = document.createElement('div');
                    shortcutsContainer.className = 'weight-shortcuts';
                    shortcutsContainer.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; align-items: center;';

                    const label = document.createElement('span');
                    label.textContent = 'Shortcuts:';
                    label.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; margin-right: 4px;';
                    shortcutsContainer.appendChild(label);

                    const weightOrder = {
                        'thin': 10,
                        'extralight': 20, 'extra light': 20,
                        'light': 30,
                        'regular': 40, 'normal': 40,
                        'medium': 50,
                        'semibold': 60, 'semi bold': 60,
                        'bold': 70,
                        'extrabold': 80, 'extra bold': 80,
                        'black': 90,
                        'heavy': 95
                    };

                    Array.from(allWeights).sort((a, b) => {
                        const wa = weightOrder[a.toLowerCase()] || 100; // Default to end if unknown
                        const wb = weightOrder[b.toLowerCase()] || 100;
                        if (wa !== wb) return wa - wb;
                        return a.localeCompare(b); // Fallback to alphabetical
                    }).forEach(weight => {
                        const chip = document.createElement('label');
                        chip.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); cursor: pointer; padding: 4px 8px; background: var(--bg-subtle); border-radius: 4px; border: 1px solid transparent; transition: all 0.1s; user-select: none;';

                        // Hover effect
                        chip.onmouseenter = () => { chip.style.borderColor = 'var(--border-subtle)'; };
                        chip.onmouseleave = () => { chip.style.borderColor = 'transparent'; };

                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.checked = true; // Default all on
                        cb.style.margin = '0';

                        // GLOBAL TOGGLE LOGIC
                        cb.onclick = (e) => {
                            const isChecked = e.target.checked;
                            // Find all variant checkboxes that match this weight name.
                            // We can identify them by the text content of their sibling label.
                            // Or better/robust: add a data attribute to the variant row or input during render.

                            // Let's assume we will add data-weight attribute to the inputs in render below.
                            const allStyleInputs = container.querySelectorAll(`input[data-weight="${weight}"]`);
                            allStyleInputs.forEach(input => {
                                input.checked = isChecked;
                                // Optional: Update visual parent state? (Group checkboxes)
                                // Ideally we'd trigger a massive update or use event bubbling but manual is faster here.
                            });
                            updateSelectedCount();
                        };

                        const span = document.createElement('span');
                        span.textContent = weight;

                        chip.appendChild(cb);
                        chip.appendChild(span);
                        shortcutsContainer.appendChild(chip);
                    });

                    container.appendChild(shortcutsContainer);
                }

                // --- Step 2: Render Sections & Grids ---

                // CSS (Injecting for self-contained component logic)
                const s_Section = 'margin-bottom: 24px; animation: fadeIn 0.3s ease-out;';
                const s_SectionHeader = 'display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);';
                const s_SectionTitle = 'font-size: 14px; font-weight: 700; color: var(--text-primary); text-transform: capitalize; letter-spacing: 0.5px;';
                const s_Badge = 'background: var(--bg-hover); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;';

                // Grid of Cards
                // Using auto-fill/minmax for responsive card sizing like the reference image
                const s_GridContainer = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;';

                // The Card
                const s_Card = 'background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;';

                const s_CardHeader = 'background: var(--bg-subtle); padding: 8px 12px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;';
                const s_CardTitle = 'font-size: 12px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

                const s_CardBody = 'padding: 8px; flex: 1; display: flex; flex-direction: column; gap: 4px;';

                // Variant Row inside Card
                const s_VariantRow = 'display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 4px; cursor: pointer; transition: background 0.1s;';
                const s_VariantLabel = 'font-size: 11px; color: var(--text-secondary); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';

                Object.keys(hierarchy).sort().forEach((mainGroup, l1Index) => {
                    const subGroups = hierarchy[mainGroup];
                    const niceMainGroup = mainGroup.charAt(0).toUpperCase() + mainGroup.slice(1); // Capitalize

                    // SECTION CONTAINER
                    const section = document.createElement('div');
                    section.style.cssText = s_Section;

                    // SECTION HEADER
                    const sectionHeader = document.createElement('div');
                    sectionHeader.style.cssText = s_SectionHeader;

                    const chevron = document.createElement('div');
                    chevron.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    chevron.style.color = 'var(--text-tertiary)';
                    chevron.style.cursor = 'pointer';
                    chevron.style.transition = 'transform 0.2s';

                    const title = document.createElement('span');
                    title.textContent = niceMainGroup;
                    title.style.cssText = s_SectionTitle;

                    const countBadge = document.createElement('span');
                    const totalStyles = Object.values(subGroups).reduce((acc, arr) => acc + arr.length, 0);
                    countBadge.textContent = `${totalStyles}`;
                    countBadge.style.cssText = s_Badge;

                    // Master Checkbox for Section
                    const cbSection = document.createElement('input');
                    cbSection.type = 'checkbox';
                    cbSection.checked = true;
                    cbSection.style.marginLeft = 'auto'; // Right align
                    cbSection.title = 'Toggle all in this group';

                    sectionHeader.appendChild(chevron);
                    sectionHeader.appendChild(title);
                    sectionHeader.appendChild(countBadge);
                    sectionHeader.appendChild(cbSection);
                    section.appendChild(sectionHeader);

                    // GRID CONTAINER
                    const grid = document.createElement('div');
                    grid.style.cssText = s_GridContainer;

                    // SECTION COLLAPSE LOGIC
                    let isExpanded = true;
                    chevron.onclick = () => {
                        isExpanded = !isExpanded;
                        grid.style.display = isExpanded ? 'grid' : 'none';
                        chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
                    };

                    // SECTION CHECKBOX LOGIC
                    cbSection.onclick = (e) => {
                        const isChecked = e.target.checked;
                        const allBoxes = grid.querySelectorAll('input[type="checkbox"]');
                        allBoxes.forEach(b => b.checked = isChecked);
                        updateSelectedCount();
                    };

                    // RENDER CARDS (Subgroups)
                    Object.keys(subGroups).sort().forEach(subGroup => {
                        const stylesInSub = subGroups[subGroup];

                        const card = document.createElement('div');
                        card.className = 'subgroup-card'; // For finding via DOM if needed
                        card.style.cssText = s_Card;

                        // Card Hover Effect (JS instead of CSS class for inline simplicity)
                        card.onmouseenter = () => { card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; card.style.borderColor = 'var(--border-color)'; };
                        card.onmouseleave = () => { card.style.boxShadow = 'none'; card.style.borderColor = 'var(--border-subtle)'; };

                        // CARD HEADER
                        const cardHeader = document.createElement('div');
                        cardHeader.style.cssText = s_CardHeader;

                        const cardTitle = document.createElement('span');
                        cardTitle.textContent = subGroup === 'Base' ? 'Styles' : subGroup;
                        cardTitle.style.cssText = s_CardTitle;

                        const cbCard = document.createElement('input');
                        cbCard.type = 'checkbox';
                        cbCard.checked = true;

                        // Card Checkbox Logic
                        cbCard.onclick = (e) => {
                            e.stopPropagation();
                            const isChecked = e.target.checked;
                            const variantBoxes = body.querySelectorAll('input[type="checkbox"]');
                            variantBoxes.forEach(b => b.checked = isChecked);
                            updateSelectedCount();
                        };

                        cardHeader.appendChild(cardTitle);
                        cardHeader.appendChild(cbCard);
                        card.appendChild(cardHeader);

                        // CARD BODY (Variants List)
                        const body = document.createElement('div');
                        body.style.cssText = s_CardBody;

                        stylesInSub.forEach(style => {
                            const row = document.createElement('div');
                            row.style.cssText = s_VariantRow;

                            row.onmouseenter = () => row.style.backgroundColor = 'var(--bg-hover)';
                            row.onmouseleave = () => row.style.backgroundColor = 'transparent';

                            // Row click toggles checkbox
                            row.onclick = (e) => {
                                if (e.target.type !== 'checkbox') {
                                    const cb = row.querySelector('input');
                                    cb.checked = !cb.checked;
                                    cb.dispatchEvent(new Event('change'));
                                }
                            };

                            const cbVariant = document.createElement('input');
                            cbVariant.type = 'checkbox';
                            cbVariant.id = `${type}-style-${style.originalIndex}`;
                            cbVariant.checked = true;
                            cbVariant.dataset.type = type;
                            cbVariant.dataset.index = style.originalIndex;
                            cbVariant.dataset.weight = style.weightName; // ADDED FOR GLOBAL SHORTCUTS
                            cbVariant.style.margin = '0';
                            cbVariant.onchange = updateSelectedCount;

                            const label = document.createElement('span');
                            label.textContent = style.weightName;
                            label.style.cssText = s_VariantLabel;

                            // Preview Aa (Tiny)
                            // const fontSize = Math.min(style.fontSize || 12, 14);
                            // const preview = document.createElement('span');
                            // preview.textContent = 'Aa';
                            // preview.style.fontSize = `${fontSize}px`;
                            // preview.style.lineHeight = '1';
                            // preview.style.color = 'var(--text-tertiary)';

                            row.appendChild(cbVariant);
                            row.appendChild(label);
                            // row.appendChild(preview);
                            body.appendChild(row);
                        });

                        card.appendChild(body);
                        grid.appendChild(card);
                    });

                    section.appendChild(grid);
                    container.appendChild(section);
                });
            } else {
                // Flat list for EFFECT styles (untouched logic)
                styles.forEach((style, index) => {
                    // ... same flat logic as before ...
                    const item = document.createElement('div');
                    item.className = 'style-item';
                    item.style.display = 'flex';
                    item.style.alignItems = 'center';
                    item.style.gap = '8px';
                    item.style.padding = '8px';
                    item.style.borderBottom = '1px solid var(--border-subtle)';

                    let previewHtml = '';
                    if (type === 'effect') {
                        previewHtml = `<div class="shadow-preview" style="box-shadow: ${style.shadowPreview || '0 2px 4px rgba(0,0,0,0.2)'}; margin-left: auto;"></div>`;
                    }

                    item.innerHTML = `
                            <input type="checkbox" id="${type}-style-${index}" checked data-type="${type}" data-index="${index}">
                            <div class="style-info" style="flex: 1; overflow: hidden;">
                                <span class="style-name" style="display:block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${style.name}</span>
                                <span class="style-details" style="display:block; font-size: 10px; color: var(--text-tertiary);">${style.details || ''}</span>
                            </div>
                            ${previewHtml}
                        `;

                    const checkbox = item.querySelector('input');
                    checkbox.onchange = updateSelectedCount;

                    container.appendChild(item);
                });
            }

        } catch (err) {
            console.error('Render Error:', err);
            container.innerHTML = `<div style="padding: 10px; color: #ff4d4d;">Error: ${err.message}</div>`;
        }
    }

    // Update selected count
    function updateSelectedCount() {
        const textChecked = textStylesList.querySelectorAll('input[type="checkbox"]:checked').length;
        const effectChecked = effectStylesList.querySelectorAll('input[type="checkbox"]:checked').length;
        const total = textChecked + effectChecked;
        selectedCountSpan.textContent = total;
        createStylesBtn.disabled = total === 0;
    }

    // Select/Deselect helpers
    function setupSelectButtons() {
        document.querySelector('.select-all-text')?.addEventListener('click', () => {
            textStylesList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
            updateSelectedCount();
        });
        document.querySelector('.deselect-all-text')?.addEventListener('click', () => {
            textStylesList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateSelectedCount();
        });
        document.querySelector('.select-all-effects')?.addEventListener('click', () => {
            effectStylesList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
            updateSelectedCount();
        });
        document.querySelector('.deselect-all-effects')?.addEventListener('click', () => {
            effectStylesList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateSelectedCount();
        });
    }
    setupSelectButtons();

    // ==================== TOKENS MODE EVENTS ====================
    sourceCollection.onchange = () => {
        console.log('🔗 Aliases: Collection changed', sourceCollection.value);
        parent.postMessage({ pluginMessage: { type: 'get-groups-for-alias', collectionId: sourceCollection.value } }, '*');
    };

    createBtn.onclick = () => {
        if (!sourceCollection.value || !measureGroup.value || !typoGroup.value) {
            alert('Please select Source Collection, Measures Group and Typography Group');
            return;
        }

        const targetName = targetNameInput.value.trim() || 'Tokens';

        const config = {
            sourceCollectionId: sourceCollection.value,
            measureGroup: measureGroup.value,
            typoGroup: typoGroup.value,
            targetName: targetName
        };

        console.log('🔗 Creating aliases with config:', config);

        parent.postMessage({
            pluginMessage: {
                type: 'create-aliases',
                config
            }
        }, '*');
    };

    // ==================== STYLES MODE EVENTS ====================
    stylesCollection.onchange = () => {
        console.log('🔗 Styles: Collection changed', stylesCollection.value);
        scanBtn.disabled = false;
        // Reset state
        stylesCategories.style.display = 'none';
        createStylesBtn.style.display = 'none';
        noVarsWarning.style.display = 'none';
    };

    scanBtn.onclick = () => {
        if (!stylesCollection.value) {
            alert('Please select a Collection');
            return;
        }

        scanBtn.disabled = true;
        scanBtn.innerHTML = '<span class="icon animate-spin">⏳</span> Scanning...';

        parent.postMessage({
            pluginMessage: {
                type: 'scan-for-styles',
                collectionId: stylesCollection.value,
                prefix: stylesPrefixInput.value.trim() // Allow empty
            }
        }, '*');
    };

    createStylesBtn.onclick = () => {
        // Collect selected styles
        const selectedTextStyles = [];
        const selectedEffectStyles = [];

        textStylesList.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            const index = parseInt(cb.dataset.index);
            if (scannedStyles.textStyles[index]) {
                selectedTextStyles.push(scannedStyles.textStyles[index]);
            }
        });

        effectStylesList.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            const index = parseInt(cb.dataset.index);
            if (scannedStyles.effectStyles[index]) {
                selectedEffectStyles.push(scannedStyles.effectStyles[index]);
            }
        });

        if (selectedTextStyles.length === 0 && selectedEffectStyles.length === 0) {
            alert('Please select at least one style to create');
            return;
        }

        console.log('🔗 Creating styles:', {
            textStyles: selectedTextStyles.length,
            effectStyles: selectedEffectStyles.length
        });

        parent.postMessage({
            pluginMessage: {
                type: 'create-figma-styles',
                collectionId: stylesCollection.value,
                prefix: stylesPrefixInput.value.trim(),
                textStyles: selectedTextStyles,
                effectStyles: selectedEffectStyles
            }
        }, '*');
    };
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAliases);
} else {
    initAliases();
}
