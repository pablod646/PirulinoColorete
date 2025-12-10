// Theme Generator Logic
console.log('🌓 Theme script loaded');

function initTheme() {
    console.log('🌓 Initializing Theme section...');

    // UI Elements
    const sourceCollection = document.getElementById('theme-source-collection');
    const sourceGroup = document.getElementById('theme-source-group');
    const loadBtn = document.getElementById('load-palettes-btn');

    // Selects
    const accentSelect = document.getElementById('theme-accent-palette');
    const neutralSelect = document.getElementById('theme-neutral-palette');
    const successSelect = document.getElementById('theme-success-palette');
    const warningSelect = document.getElementById('theme-warning-palette');
    const errorSelect = document.getElementById('theme-error-palette');

    // Main Actions
    const themeNameInput = document.getElementById('theme-name');
    const generateBtn = document.getElementById('generate-theme-btn');
    const createThemeBtn = document.getElementById('create-theme-btn');

    // Preview Sections
    const previewSection = document.getElementById('theme-preview-section');
    const previewBoard = document.getElementById('theme-preview-board');
    const viewLightBtn = document.getElementById('view-light');
    const viewDarkBtn = document.getElementById('view-dark');

    if (!loadBtn) {
        console.warn('⚠️ Theme UI elements not found');
        return;
    }

    // State
    let loadedPalettes = [];
    let generatedThemeData = null;
    let currentPreviewMode = 'light'; // 'light' or 'dark'

    // Mode Elements
    const modeGenerateBtn = document.getElementById('mode-generate');
    const modeEditBtn = document.getElementById('mode-edit');
    const modeGenerateSection = document.getElementById('theme-mode-generate');
    const modeEditSection = document.getElementById('theme-mode-edit');
    const configSection = document.querySelector('.form-section:nth-of-type(3)'); // Step 2

    // Edit Elements
    const editCollectionSelect = document.getElementById('theme-edit-collection');
    const editGroupSelect = document.getElementById('theme-edit-group');
    const loadExistingBtn = document.getElementById('load-existing-theme-btn');

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-collections') {
            sourceCollection.innerHTML = '<option value="" disabled selected>Select collection...</option>';
            editCollectionSelect.innerHTML = '<option value="" disabled selected>Select theme...</option>';

            payload.forEach(c => {
                // Populate both dropdowns
                const opt1 = document.createElement('option');
                opt1.value = c.id;
                opt1.textContent = c.name;
                sourceCollection.appendChild(opt1);

                const opt2 = document.createElement('option');
                opt2.value = c.id;
                opt2.textContent = c.name;
                editCollectionSelect.appendChild(opt2);
            });
            console.log('🌓 Theme: Collections loaded');

        } else if (type === 'load-groups-theme') {
            sourceGroup.innerHTML = '<option value="">All groups</option>';
            payload.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g;
                sourceGroup.appendChild(opt);
            });
            console.log('🌓 Theme: Groups loaded');
            sourceGroup.disabled = false;

        } else if (type === 'load-groups-theme-edit') { // For Edit Mode
            if (editGroupSelect) {
                editGroupSelect.innerHTML = '<option value="">All groups</option>';
                payload.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g;
                    opt.textContent = g;
                    editGroupSelect.appendChild(opt);
                });
                editGroupSelect.disabled = false;
            }

        } else if (type === 'load-palettes') {
            loadedPalettes = payload;

            const fill = (sel, placeholder) => {
                sel.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
                loadedPalettes.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.name;
                    opt.textContent = p.name;
                    sel.appendChild(opt);
                });
                sel.disabled = false;
            };

            fill(accentSelect, 'Select accent palette...');
            fill(neutralSelect, 'Select neutral palette...');
            fill(successSelect, 'Select success palette...');
            fill(warningSelect, 'Select warning palette...');
            fill(errorSelect, 'Select error palette...');

            generateBtn.disabled = false;
            alert(`Loaded ${loadedPalettes.length} palettes!`);

        } else if (type === 'theme-generated' || type === 'theme-regenerated' || type === 'theme-loaded-for-edit') {
            generatedThemeData = payload;

            // Hide Step 2 if in Edit Mode? NO, we want to SHOW it now if we have config
            if (type === 'theme-loaded-for-edit') {
                generatedThemeData = payload; // Important: update global data

                // 1. Populate Dropdowns if availablePalettes sent
                if (payload.availablePalettes && payload.availablePalettes.length > 0) {
                    const palettes = payload.availablePalettes;
                    const fill = (sel, placeholder) => {
                        sel.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
                        palettes.forEach(p => {
                            const opt = document.createElement('option');
                            opt.value = p.name;
                            opt.textContent = p.name;
                            sel.appendChild(opt);
                        });
                        sel.disabled = false;
                    };

                    fill(accentSelect, 'Select accent palette...');
                    fill(neutralSelect, 'Select neutral palette...');
                    fill(successSelect, 'Select success palette...');
                    fill(warningSelect, 'Select warning palette...');
                    fill(errorSelect, 'Select error palette...');
                }

                // 2. Select Detected Values
                if (payload.detectedConfig) {
                    const c = payload.detectedConfig;
                    if (c.accent && accentSelect) accentSelect.value = c.accent;
                    if (c.neutral && neutralSelect) neutralSelect.value = c.neutral;
                    if (c.status.success && successSelect) successSelect.value = c.status.success;
                    if (c.status.warning && warningSelect) warningSelect.value = c.status.warning;
                    if (c.status.error && errorSelect) errorSelect.value = c.status.error;
                }

                // 3. Show Config Section (Step 2)
                if (configSection) {
                    configSection.style.display = 'block';
                    // Update header to indicate editing?
                    const h3 = configSection.querySelector('h3');
                    if (h3) h3.textContent = 'Step 2: Re-Map Palettes (Edit Mode)';
                }

                if (previewSection) previewSection.style.display = 'block';
                if (payload.themeName && themeNameInput) themeNameInput.value = payload.themeName;
                if (createThemeBtn) createThemeBtn.textContent = 'Update Theme Collection'; // Rebrand button
                if (createThemeBtn) createThemeBtn.disabled = false;
                if (generateBtn) generateBtn.disabled = false; // Allow regeneration

            } else {
                if (previewSection) previewSection.style.display = 'block';
                if (createThemeBtn) createThemeBtn.disabled = false;
            }

            console.log('🌓 Theme Data Ready:', payload);
            renderPreview();
            renderTokenEditor();
        }
    });

    // --- Mode Toggles ---
    const setMode = (mode) => {
        if (!modeGenerateBtn || !modeEditBtn) return;

        if (mode === 'generate') {
            modeGenerateBtn.classList.add('active');
            modeGenerateBtn.style.background = 'white';
            modeGenerateBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
            modeEditBtn.classList.remove('active');
            modeEditBtn.style.background = 'transparent';
            modeEditBtn.style.boxShadow = 'none';

            if (modeGenerateSection) modeGenerateSection.style.display = 'block';
            if (modeEditSection) modeEditSection.style.display = 'none';
            if (configSection) configSection.style.display = 'block'; // Show Step 2
        } else {
            modeEditBtn.classList.add('active');
            modeEditBtn.style.background = 'white';
            modeEditBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
            modeGenerateBtn.classList.remove('active');
            modeGenerateBtn.style.background = 'transparent';
            modeGenerateBtn.style.boxShadow = 'none';

            if (modeEditSection) modeEditSection.style.display = 'block';
            if (modeGenerateSection) modeGenerateSection.style.display = 'none';
            if (configSection) configSection.style.display = 'none'; // Hide Step 2
        }
    };

    modeGenerateBtn.onclick = () => setMode('generate');
    modeEditBtn.onclick = () => setMode('edit');

    // --- Events ---

    sourceCollection.onchange = () => {
        parent.postMessage({ pluginMessage: { type: 'get-groups-for-theme', collectionId: sourceCollection.value } }, '*');
    };

    // Edit Collection Change
    if (editCollectionSelect) {
        editCollectionSelect.onchange = () => {
            parent.postMessage({ pluginMessage: { type: 'get-groups-custom', collectionId: editCollectionSelect.value, returnType: 'load-groups-theme-edit' } }, '*');
        };
    }

    loadBtn.onclick = () => {
        if (!sourceCollection.value) {
            alert('Select a collection first');
            return;
        }
        loadBtn.textContent = 'Loading...';
        parent.postMessage({
            pluginMessage: {
                type: 'load-palettes',
                collectionId: sourceCollection.value,
                groupName: sourceGroup.value
            }
        }, '*');
        setTimeout(() => loadBtn.textContent = 'Load Palettes', 1500);
    };

    if (loadExistingBtn) {
        loadExistingBtn.onclick = () => {
            if (!editCollectionSelect.value) {
                alert('Select a theme collection to edit');
                return;
            }
            // Request to load theme data
            parent.postMessage({
                pluginMessage: {
                    type: 'load-existing-theme',
                    collectionId: editCollectionSelect.value,
                    groupName: editGroupSelect ? editGroupSelect.value : null
                }
            }, '*');
        };
    }

    generateBtn.onclick = () => {
        if (!accentSelect.value || !neutralSelect.value) {
            alert('Accent and Neutral palettes are required');
            return;
        }

        const msg = {
            type: 'generate-theme',
            accentPalette: accentSelect.value,
            neutralPalette: neutralSelect.value,
            statusPalettes: {
                success: successSelect.value,
                warning: warningSelect.value,
                error: errorSelect.value
            },
            themeName: themeNameInput.value.trim(),
            tokenOverrides: {}
        };

        console.log('🌓 Generating theme...', msg);
        parent.postMessage({ pluginMessage: msg }, '*');
    };

    createThemeBtn.onclick = () => {
        if (!generatedThemeData) return;
        parent.postMessage({
            pluginMessage: {
                type: 'create-theme',
                themeData: generatedThemeData
            }
        }, '*');
    };

    // Toggle Preview Mode
    viewLightBtn.onclick = () => {
        currentPreviewMode = 'light';
        viewLightBtn.className = 'toggle-btn active';
        viewLightBtn.style.background = 'white';
        viewLightBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        viewDarkBtn.className = 'toggle-btn';
        viewDarkBtn.style.background = 'transparent';
        viewDarkBtn.style.boxShadow = 'none';
        renderPreview();
    };

    viewDarkBtn.onclick = () => {
        currentPreviewMode = 'dark';
        viewDarkBtn.className = 'toggle-btn active';
        viewDarkBtn.style.background = 'white';
        viewDarkBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        viewLightBtn.className = 'toggle-btn';
        viewLightBtn.style.background = 'transparent';
        viewLightBtn.style.boxShadow = 'none';
        renderPreview();
    };

    // --- Render Logic ---

    function renderPreview() {
        if (!generatedThemeData || !generatedThemeData.preview) return;

        const p = generatedThemeData.preview[currentPreviewMode];

        // Construct the UI Board HTML
        // We use styles injected from the preview data (bg, text, primary)
        // Note: generatedThemeData.preview contains HEX values sent from backend

        previewBoard.innerHTML = `
            <div style="background-color: ${p.bg}; color: ${p.text}; padding: 32px; transition: background 0.3s; font-family: sans-serif;">
                
                <!-- Navbar Mockup -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 16px;">
                    <div style="font-weight: bold; font-size: 18px;">AppLogo</div>
                    <div style="display: flex; gap: 20px; font-size: 14px; opacity: 0.8;">
                        <span>Dashboard</span>
                        <span style="border-bottom: 2px solid ${p.primary}; color: ${p.primary}; font-weight: 500;">Settings</span>
                        <span>Profile</span>
                    </div>
                </div>

                <!-- Content -->
                <div style="max-width: 600px; margin: 0 auto;">
                    <h1 style="font-size: 24px; margin-bottom: 12px; font-weight: 600;">Account Settings</h1>
                    <p style="opacity: 0.7; margin-bottom: 24px; line-height: 1.5;">Manage your profile details and preferences settings.</p>

                    <!-- Card -->
                    <div style="background-color: ${currentPreviewMode === 'light' ? '#fff' : 'rgba(255,255,255,0.05)'}; 
                                border: 1px solid rgba(128,128,128,0.2); 
                                border-radius: 8px; 
                                padding: 24px; 
                                box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        
                        <!-- Form Group -->
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 8px; opacity: 0.8;">USERNAME</label>
                            <div style="display: flex; align-items: center; 
                                        border: 1px solid rgba(128,128,128,0.3); 
                                        border-radius: 6px; 
                                        padding: 8px 12px; 
                                        background: ${currentPreviewMode === 'light' ? '#f9fafb' : 'rgba(0,0,0,0.2)'};">
                                <span style="flex: 1;">johndoe</span>
                            </div>
                        </div>

                        <!-- Primary Button -->
                        <button style="background-color: ${p.primary}; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; font-size: 14px; cursor: pointer;">
                            Save Changes
                        </button>
                        
                        <button style="background: transparent; border: 1px solid rgba(128,128,128,0.3); color: inherit; padding: 10px 20px; border-radius: 6px; font-weight: 500; font-size: 14px; margin-left: 12px; cursor: pointer;">
                            Cancel
                        </button>

                    </div>

                    <!-- Alerts Mockup -->
                    <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
                        <div style="padding: 12px; border-radius: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: ${currentPreviewMode === 'light' ? '#047857' : '#34d399'}; font-size: 13px;">
                            ✅ Profile updated successfully.
                        </div>
                        <div style="padding: 12px; border-radius: 6px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: ${currentPreviewMode === 'light' ? '#b91c1c' : '#f87171'}; font-size: 13px;">
                            ❌ Please verify your email address.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderTokenEditor() {
        if (!generatedThemeData || !generatedThemeData.tokens) return;

        console.log('🌓 Rendering Token Editor...');
        const { tokens, paletteData } = generatedThemeData;

        // Clear containers
        const containers = {
            bg: document.getElementById('editor-bg'),
            text: document.getElementById('editor-text'),
            action: document.getElementById('editor-action'),
            status: document.getElementById('editor-status')
        };

        Object.values(containers).forEach(el => el.innerHTML = '');

        // Generate scale options (50-950)
        const generateOptions = (currentValue) => {
            // currentValue is full variable path? No, we likely want just the scale step for the override.
            // Actually, we need to know WHICH palette to pull from.
            // For simplicity, we just list 50, 100...950 and let backend resolve
            const steps = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
            return steps.map(s => `<option value="${s}" ${currentValue.endsWith(s) ? 'selected' : ''}>${s}</option>`).join('');
        };

        // Helper: Create Token Row
        const createRow = (name, token) => {
            const row = document.createElement('div');
            row.className = 'token-row';
            row.style.cssText = `
                display: flex; flex-direction: column; gap: 4px; 
                padding: 12px; background: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;
            `;

            // Helper to extract scale step
            const getScale = (n) => {
                const parts = n.split(/[\/\- ]/);
                return parts[parts.length - 1];
            };

            const lightStep = getScale(token.light.name);
            const darkStep = getScale(token.dark.name);

            // Show swatch for current preview mode
            const currentHex = currentPreviewMode === 'light' ? token.light.hex : token.dark.hex;

            row.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 600; color: #374151;">${name.split('/')[1]}</span>
                    <div style="width: 24px; height: 24px; background: ${currentHex}; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);" title="Current Preview Color"></div>
                </div>
                
                <!-- Light Mode -->
                <div style="display: flex; gap: 8px; align-items: center;">
                    <label style="font-size: 10px; color: #666; width: 32px;">Light</label>
                    <select class="token-override-select" data-token="${name}" data-mode="light" 
                        style="flex: 1; padding: 4px; font-size: 11px; border: 1px solid #d1d5db; border-radius: 4px;">
                        ${generateOptions(lightStep)}
                    </select>
                </div>

                <!-- Dark Mode -->
                <div style="display: flex; gap: 8px; align-items: center;">
                    <label style="font-size: 10px; color: #666; width: 32px;">Dark</label>
                    <select class="token-override-select" data-token="${name}" data-mode="dark" 
                        style="flex: 1; padding: 4px; font-size: 11px; border: 1px solid #d1d5db; border-radius: 4px;">
                        ${generateOptions(darkStep)}
                    </select>
                </div>
            `;
            return row;
        };

        // Group Tokens into Categories
        Object.entries(tokens).forEach(([name, token]) => {
            let container = containers.bg; // Fallback
            if (name.startsWith('Background/') || name.startsWith('Surface/') || name.startsWith('Overlay/')) container = containers.bg;
            else if (name.startsWith('Text/') || name.startsWith('Icon/')) container = containers.text;
            else if (name.startsWith('Action/') || name.startsWith('Button/') || name.startsWith('Input/')) container = containers.action;
            else if (name.startsWith('Status/') || name.startsWith('Badge/') || name.startsWith('Border/')) container = containers.status;

            if (container) {
                container.appendChild(createRow(name, token));
            }
        });

        // Add Listeners
        document.querySelectorAll('.token-override-select').forEach(sel => {
            sel.onchange = (e) => {
                const name = e.target.dataset.token;
                const mode = e.target.dataset.mode; // 'light' or 'dark'
                const val = e.target.value;

                // Update Overrides
                if (!tokenOverrides[name]) tokenOverrides[name] = {};
                tokenOverrides[name][mode] = val; // e.g. tokenOverrides['Background/primary']['light'] = '50'

                console.log('Override updated:', tokenOverrides);

                // Debounce regeneration? No, button "Regenerate" is better practice usually, 
                // but for "Live" feel, we trigger regeneration.
                // However, regeneration is expensive. 
                // Let's create a "Refresh" button or trigger it.
                // For now, let's trigger it.

                const msg = {
                    type: 'regenerate-theme',
                    accentPalette: accentSelect.value,
                    neutralPalette: neutralSelect.value,
                    statusPalettes: {
                        success: successSelect.value,
                        warning: warningSelect.value,
                        error: errorSelect.value
                    },
                    themeName: themeNameInput.value.trim(),
                    tokenOverrides: tokenOverrides
                };
                parent.postMessage({ pluginMessage: msg }, '*');
            };
        });
    }
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}
