// Theme Generator Logic

// ============================================
// APCA (Accessible Perceptual Contrast Algorithm)
// ============================================

// Convert hex to linear RGB
function hexToLinearRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // sRGB to linear
    const toLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return {
        r: toLinear(r),
        g: toLinear(g),
        b: toLinear(b)
    };
}

// Calculate APCA luminance (Y)
function apcaLuminance(hex) {
    const rgb = hexToLinearRGB(hex);
    // APCA coefficients
    return 0.2126729 * rgb.r + 0.7151522 * rgb.g + 0.0721750 * rgb.b;
}

// Calculate APCA contrast value (Lc)
function calculateAPCA(textHex, bgHex) {
    const Ytext = apcaLuminance(textHex);
    const Ybg = apcaLuminance(bgHex);

    // APCA constants
    const normBG = 0.56;
    const normTXT = 0.57;
    const revTXT = 0.62;
    const revBG = 0.65;
    const blkThrs = 0.022;
    const blkClmp = 1.414;
    const scaleBoW = 1.14;
    const scaleWoB = 1.14;
    const loBoWoffset = 0.027;
    const loWoBoffset = 0.027;

    // Clamp black levels
    let Ytxt = (Ytext > blkThrs) ? Ytext : Ytext + Math.pow(blkThrs - Ytext, blkClmp);
    let Ybkg = (Ybg > blkThrs) ? Ybg : Ybg + Math.pow(blkThrs - Ybg, blkClmp);

    // SAPC contrast
    let SAPC = 0;
    if (Ybkg > Ytxt) {
        // Light background, dark text
        SAPC = (Math.pow(Ybkg, normBG) - Math.pow(Ytxt, normTXT)) * scaleBoW;
        return (SAPC < loBoWoffset) ? 0 : (SAPC - loBoWoffset) * 100;
    } else {
        // Dark background, light text
        SAPC = (Math.pow(Ybkg, revBG) - Math.pow(Ytxt, revTXT)) * scaleWoB;
        return (SAPC > -loWoBoffset) ? 0 : (SAPC + loWoBoffset) * 100;
    }
}

// APCA thresholds by use case
const APCA_THRESHOLDS = {
    bodyText: 75,      // Fluent text, body copy
    largeText: 60,     // Headlines, large text
    uiElement: 45,     // Icons, UI components
    decorative: 30,    // Borders, decorative
};

// Define which background each token should be compared against
// APCA only applies to content that needs to be readable (text, icons, borders)
// Surface/Background tokens don't need APCA - they are containers, not content
const CONTRAST_PAIRS = {
    // Text tokens - MUST have good contrast for readability
    'Text/primary': { bg: 'Background/primary', threshold: 'bodyText' },
    'Text/secondary': { bg: 'Background/primary', threshold: 'bodyText' },
    'Text/tertiary': { bg: 'Background/primary', threshold: 'largeText' },
    'Text/brand': { bg: 'Background/primary', threshold: 'bodyText' },
    'Text/link': { bg: 'Background/primary', threshold: 'bodyText' },
    'Text/linkHover': { bg: 'Background/primary', threshold: 'bodyText' },
    'Text/inverse': { bg: 'Background/inverse', threshold: 'bodyText' },
    'Text/disabled': { bg: 'Background/primary', threshold: 'decorative' }, // Disabled can have lower contrast
    'Text/placeholder': { bg: 'Surface/card', threshold: 'largeText' },

    // Action text - must be readable on buttons
    'Action/primaryText': { bg: 'Action/primary', threshold: 'uiElement' },
    'Action/secondaryText': { bg: 'Action/secondary', threshold: 'uiElement' },

    // Icon tokens - must be visible
    'Icon/primary': { bg: 'Background/primary', threshold: 'uiElement' },
    'Icon/secondary': { bg: 'Background/primary', threshold: 'uiElement' },
    'Icon/brand': { bg: 'Background/primary', threshold: 'uiElement' },
    'Icon/inverse': { bg: 'Background/inverse', threshold: 'uiElement' },
    // Icon/disabled intentionally excluded - low contrast is expected

    // Border tokens that serve functional purpose
    'Border/focus': { bg: 'Background/primary', threshold: 'uiElement' },
    'Border/error': { bg: 'Background/primary', threshold: 'uiElement' },
    'Border/success': { bg: 'Background/primary', threshold: 'uiElement' },
    'Border/warning': { bg: 'Background/primary', threshold: 'uiElement' },
    // Border/default, Border/subtle, Border/disabled intentionally excluded - decorative

    // Status colors when used as indicators
    'Status/success': { bg: 'Background/primary', threshold: 'uiElement' },
    'Status/warning': { bg: 'Background/primary', threshold: 'uiElement' },
    'Status/error': { bg: 'Background/primary', threshold: 'uiElement' },
    'Status/info': { bg: 'Background/primary', threshold: 'uiElement' },
};

function initTheme() {


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
    const createThemeBtn = document.getElementById('create-theme-btn');
    const generateThemeBtn = document.getElementById('generate-theme-btn');

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
    let tokenOverrides = {}; // Store user overrides
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


        } else if (type === 'load-groups-theme') {
            sourceGroup.innerHTML = '<option value="">All groups</option>';
            payload.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g;
                sourceGroup.appendChild(opt);
            });

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

            alert(`Loaded ${loadedPalettes.length} palettes!`);

        } else if (type === 'theme-generated' || type === 'theme-regenerated' || type === 'theme-loaded-for-edit') {
            generatedThemeData = payload;

            // Hide Step 2 if in Edit Mode? NO, we want to SHOW it now if we have config
            if (type === 'theme-loaded-for-edit') {
                generatedThemeData = payload; // Important: update global data

                // Extract paletteData first for custom dropdowns
                if (payload.paletteData) {
                    paletteData = payload.paletteData;

                    Object.keys(paletteData).forEach(paletteName => {
                    });
                }

                // 1. Populate Dropdowns - use availablePalettes OR generate from paletteData
                let palettes = [];
                if (payload.availablePalettes && payload.availablePalettes.length > 0) {
                    palettes = payload.availablePalettes;
                } else if (payload.paletteData) {
                    // Generate palettes from paletteData keys
                    // The paletteData has keys like: accent, neutral, success, warning, error
                    // But we need to also load the original palettes from the collection
                    // For now, at least show what we have and mark them as detected


                    // We'll show detected palette info but selectores need to load proper palettes
                    // Enable dropdowns with "Detected" values
                }

                if (palettes.length > 0) {
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
                } else if (loadedPalettes && loadedPalettes.length > 0) {
                    // Use previously loaded palettes if available

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

            } else {
                if (previewSection) previewSection.style.display = 'block';
                if (createThemeBtn) createThemeBtn.disabled = false;
            }


            renderPreview();
            renderTokenEditor();
        }
    });

    // --- Mode Toggles ---
    const setMode = (mode) => {
        if (!modeGenerateBtn || !modeEditBtn) return;

        if (mode === 'generate') {
            modeGenerateBtn.classList.add('active');
            modeEditBtn.classList.remove('active');

            if (modeGenerateSection) modeGenerateSection.style.display = 'block';
            if (modeEditSection) modeEditSection.style.display = 'none';
            if (configSection) configSection.style.display = 'block'; // Show Step 2
        } else {
            modeEditBtn.classList.add('active');
            modeGenerateBtn.classList.remove('active');

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

    // Live Preview / Regeneration Logic
    const triggerRegeneration = () => {
        if (!accentSelect.value || !neutralSelect.value) return;

        // Gather current overrides from the UI if any
        const currentOverrides = {};
        document.querySelectorAll('.token-override-select').forEach(sel => {
            const token = sel.dataset.token;
            const mode = sel.dataset.mode;
            const val = sel.value;
            if (val) {
                if (!currentOverrides[token]) currentOverrides[token] = {};
                currentOverrides[token][mode] = val;
            }
        });

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
            tokenOverrides: currentOverrides, // Send existing overrides so they aren't lost
            isRegenerate: true // Flag to tell backend this is a live update
        };


        parent.postMessage({ pluginMessage: msg }, '*');

        // Disable button after generating
        if (generateThemeBtn) {
            generateThemeBtn.disabled = true;
            generateThemeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                Theme Generated
            `;
        }
    };

    // Enable button when palette selection changes
    const enableGenerateBtn = () => {
        if (accentSelect.value && neutralSelect.value && generateThemeBtn) {
            generateThemeBtn.disabled = false;
            generateThemeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3v3m6.36-.36-2.12 2.12M21 12h-3m.36 6.36-2.12-2.12M12 21v-3m-6.36.36 2.12-2.12M3 12h3m-.36-6.36 2.12 2.12"/>
                </svg>
                Generate Theme
            `;
        }
    };

    [accentSelect, neutralSelect, successSelect, warningSelect, errorSelect].forEach(sel => {
        if (sel) sel.onchange = enableGenerateBtn;
    });

    // Generate Theme Button click
    if (generateThemeBtn) {
        generateThemeBtn.onclick = triggerRegeneration;
    }

    createThemeBtn.onclick = () => {
        if (!generatedThemeData) return;

        // Always use the current theme name from the input field
        const currentThemeName = themeNameInput ? themeNameInput.value.trim() : 'Theme';
        generatedThemeData.themeName = currentThemeName || 'Theme';

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
        viewLightBtn.classList.add('active');
        viewDarkBtn.classList.remove('active');
        renderPreview();
    };

    viewDarkBtn.onclick = () => {
        currentPreviewMode = 'dark';
        viewDarkBtn.classList.add('active');
        viewLightBtn.classList.remove('active');
        renderPreview();
    };

    // --- Render Logic ---

    function renderPreview() {
        if (!generatedThemeData || !generatedThemeData.preview) return;

        const p = generatedThemeData.preview[currentPreviewMode];
        const isDark = currentPreviewMode === 'dark';

        // Helper for consistent small styles
        const cardStyle = `background-color: ${p.surface.card}; border: 1px solid ${p.border.default}; border-radius: 8px; padding: 20px;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);`;
        const labelStyle = `display: block; font-size: 11px; font-weight: 600; margin-bottom: 6px; color: ${p.text.secondary}; letter-spacing: 0.025em; text-transform: uppercase;`;

        previewBoard.innerHTML = `
            <div data-tokens="Background/primary Text/primary" style="background-color: ${p.bg.primary}; color: ${p.text.primary}; padding: 32px; transition: background 0.3s; font-family: 'Inter', sans-serif; min-height: 480px;">
                
                <!-- Navbar -->
                <nav data-tokens="Border/subtle Text/brand Text/primary Text/secondary" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding-bottom: 16px; border-bottom: 1px solid ${p.border.subtle || p.border.default};">
                    <div data-tokens="Text/brand" style="font-weight: 700; font-size: 18px; color: ${p.text.brand || p.text.primary}; letter-spacing: -0.02em;">Acme Inc.</div>
                    <div style="display: flex; gap: 24px; font-size: 14px;">
                        <span data-tokens="Text/primary" style="color: ${p.text.primary}; font-weight: 500;">Dashboard</span>
                        <span data-tokens="Text/secondary" style="color: ${p.text.secondary};">Team</span>
                        <span data-tokens="Text/secondary" style="color: ${p.text.secondary};">Projects</span>
                    </div>
                </nav>

                <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; max-width: 900px; margin: 0 auto;">
                    
                    <!-- Main Content Column -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        
                        <!-- Header -->
                        <div>
                            <h1 data-tokens="Text/primary" style="font-size: 24px; font-weight: 700; color: ${p.text.primary}; margin: 0 0 8px 0;">Settings</h1>
                            <p data-tokens="Text/secondary" style="color: ${p.text.secondary}; margin: 0; font-size: 14px;">Manage your team members and permissions.</p>
                        </div>

                        <!-- Main Form Card -->
                        <div data-tokens="Surface/card Border/default" style="${cardStyle}">
                            <div style="margin-bottom: 20px;">
                                <h2 data-tokens="Text/primary" style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0; color: ${p.text.primary};">Profile Information</h2>
                                <p data-tokens="Text/secondary" style="font-size: 13px; color: ${p.text.secondary}; margin: 0;">Update your account's profile information and email address.</p>
                            </div>

                            <!-- Input Group -->
                            <div style="margin-bottom: 16px;">
                                <label data-tokens="Text/secondary" style="${labelStyle}">Username</label>
                                <div data-tokens="Border/default Background/tertiary" style="display: flex; border: 1px solid ${p.border.default}; border-radius: 6px; overflow: hidden;">
                                    <span data-tokens="Background/tertiary Text/secondary" style="background: ${p.bg.tertiary || p.bg.secondary}; color: ${p.text.secondary}; padding: 8px 12px; font-size: 13px; border-right: 1px solid ${p.border.default};">acme.com/</span>
                                    <input data-tokens="Background/primary Text/primary" type="text" value="johndoe" style="flex: 1; border: none; padding: 8px 12px; font-size: 13px; background: ${p.bg.primary}; color: ${p.text.primary}; outline: none;">
                                </div>
                            </div>
                            
                            <!-- Input Focus State Mockup -->
                            <div style="margin-bottom: 24px;">
                                <label data-tokens="Text/secondary" style="${labelStyle}">Email Address</label>
                                <input data-tokens="Border/focus Action/primary Background/primary Text/primary" type="text" value="john@example.com" style="width: 100%; border: 1px solid ${p.border.focus}; box-shadow: 0 0 0 3px ${p.action.primary}20; border-radius: 6px; padding: 8px 12px; font-size: 13px; background: ${p.bg.primary}; color: ${p.text.primary}; outline: none;">
                                <span data-tokens="Text/secondary" style="display: block; margin-top: 4px; font-size: 11px; color: ${p.text.tertiary || p.text.secondary};">We'll never share your email with anyone else.</span>
                            </div>

                            <!-- Actions -->
                            <div data-tokens="Border/subtle" style="display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid ${p.border.subtle || p.border.default};">
                                <button data-tokens="Action/primary" style="background-color: ${p.action.primary}; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer;">Save Changes</button>
                                <button data-tokens="Text/primary Border/default" style="background-color: transparent; color: ${p.text.primary}; border: 1px solid ${p.border.strong || p.border.default}; padding: 8px 16px; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer;">Cancel</button>
                            </div>
                        </div>

                    </div>

                    <!-- Sidebar Column -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        
                        <!-- Status Cards -->
                        <div data-tokens="Surface/card Border/default" style="${cardStyle}">
                            <h3 data-tokens="Text/secondary" style="font-size: 13px; font-weight: 600; text-transform: uppercase; color: ${p.text.secondary}; margin: 0 0 16px 0; letter-spacing: 0.05em;">System Status</h3>
                            
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <!-- Success -->
                                <div data-tokens="Status/successBg Status/success" style="display: flex; gap: 12px; align-items: start; padding: 12px; border-radius: 6px; background: ${p.status.successBg}; border: 1px solid ${p.status.success}30;">
                                    <div data-tokens="Status/success" style="width: 8px; height: 8px; border-radius: 50%; background: ${p.status.success}; margin-top: 6px;"></div>
                                    <div>
                                        <div data-tokens="Status/success" style="font-size: 13px; font-weight: 600; color: ${p.status.success};">All Systems Operational</div>
                                        <div data-tokens="Status/success" style="font-size: 12px; color: ${p.status.success}; opacity: 0.9;">No incidents reported today.</div>
                                    </div>
                                </div>

                                <!-- Warning -->
                                <div data-tokens="Status/warningBg Status/warning" style="display: flex; gap: 12px; align-items: start; padding: 12px; border-radius: 6px; background: ${p.status.warningBg}; border: 1px solid ${p.status.warning}30;">
                                    <div data-tokens="Status/warning" style="width: 8px; height: 8px; border-radius: 50%; background: ${p.status.warning}; margin-top: 6px;"></div>
                                    <div>
                                        <div data-tokens="Status/warning" style="font-size: 13px; font-weight: 600; color: ${p.status.warning};">Storage Warning</div>
                                        <div data-tokens="Status/warning" style="font-size: 12px; color: ${p.status.warning}; opacity: 0.9;">85% of standard storage used.</div>
                                    </div>
                                </div>

                                <!-- Error -->
                                <div data-tokens="Status/errorBg Status/error" style="display: flex; gap: 12px; align-items: start; padding: 12px; border-radius: 6px; background: ${p.status.errorBg}; border: 1px solid ${p.status.error}30;">
                                    <div data-tokens="Status/error" style="width: 8px; height: 8px; border-radius: 50%; background: ${p.status.error}; margin-top: 6px;"></div>
                                    <div>
                                        <div data-tokens="Status/error" style="font-size: 13px; font-weight: 600; color: ${p.status.error};">Connection Failed</div>
                                        <div data-tokens="Status/error" style="font-size: 12px; color: ${p.status.error}; opacity: 0.9;">Unable to sync with database.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Modal/Overlay Preview (Mini) -->
                        <div data-tokens="Surface/overlay Border/default" style="position: relative; height: 160px; border-radius: 8px; overflow: hidden; border: 1px solid ${p.border.default};">
                             <div data-tokens="Surface/overlay" style="position: absolute; inset: 0; background: ${p.surface.overlay || '#00000080'}; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
                                <div data-tokens="Surface/modal Text/primary" style="background: ${p.surface.modal}; padding: 16px; border-radius: 8px; width: 80%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                                    <div data-tokens="Text/primary" style="font-size: 13px; font-weight: 600; color: ${p.text.primary}; margin-bottom: 4px;">Confirm Deletion</div>
                                    <p data-tokens="Text/secondary" style="font-size: 11px; color: ${p.text.secondary}; margin-bottom: 12px;">Are you sure?</p>
                                    <button data-tokens="Action/destructive" style="width: 100%; background: ${p.action.destructive}; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">Delete Everything</button>
                                </div>
                             </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        // --- NEW PREVIEW INTERACTION LOGIC ---

        // 1. Tooltip Element
        let tooltip = document.getElementById('preview-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'preview-tooltip';
            tooltip.style.cssText = `
                position: fixed; pointer-events: none; z-index: 9999;
                background: rgba(0,0,0,0.85); color: white; padding: 6px 10px;
                border-radius: 4px; font-size: 11px; font-weight: 500;
                display: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1);
            `;

            document.body.appendChild(tooltip);
        }

        // 2. Attach Events to Elements with Tokens
        setTimeout(() => {
            const elements = previewBoard.querySelectorAll('[data-tokens]');
            elements.forEach(el => {
                // Style cursor to indicate clickable
                el.style.cursor = 'crosshair';

                el.addEventListener('mouseenter', (e) => {
                    e.stopPropagation(); // Prefer inner elements
                    // Highlight self
                    el.style.outline = '2px dashed #18A0FB';

                    // Show Tooltip
                    const tokenList = el.dataset.tokens.replace(/ /g, ', ');
                    tooltip.textContent = tokenList;
                    tooltip.style.display = 'block';
                });

                el.addEventListener('mousemove', (e) => {
                    tooltip.style.left = (e.clientX + 12) + 'px';
                    tooltip.style.top = (e.clientY + 12) + 'px';
                });

                el.addEventListener('mouseleave', () => {
                    el.style.outline = '';
                    tooltip.style.display = 'none';
                });

                el.addEventListener('click', (e) => {
                    // Check if there's a more specific child element with data-tokens
                    // between the click target and this element
                    let target = e.target;
                    let hasMoreSpecificChild = false;

                    // Walk up from target to this element
                    while (target && target !== el) {
                        if (target.hasAttribute && target.hasAttribute('data-tokens')) {
                            // Found a child element with data-tokens
                            hasMoreSpecificChild = true;
                            break;
                        }
                        target = target.parentElement;
                    }

                    if (hasMoreSpecificChild) {
                        // Let the more specific child handle it
                        return;
                    }

                    // This is the most specific element, handle the click
                    e.stopPropagation();

                    // Robust parsing: split by space, trim, remove empty strings
                    const tokens = el.dataset.tokens.split(' ').map(t => t.trim()).filter(Boolean);



                    if (tokens.length > 0) {
                        let scrolled = false;
                        let foundAny = false;

                        tokens.forEach(tokenName => {
                            const safeName = tokenName.replace(/\//g, '-');
                            const targetId = `token-row-${safeName}`;
                            const targetRow = document.getElementById(targetId);



                            if (targetRow) {
                                foundAny = true;
                                // Scroll to the FIRST compatible row found
                                if (!scrolled) {
                                    // First, ensure the parent <details> is open
                                    const parentDetails = targetRow.closest('details');
                                    if (parentDetails && !parentDetails.open) {

                                        parentDetails.open = true;
                                    }

                                    // Add "Back to Preview" button to the summary
                                    if (parentDetails) {
                                        const summary = parentDetails.querySelector('summary');
                                        // Remove any existing back button first
                                        document.querySelectorAll('.back-to-preview-btn').forEach(b => b.remove());

                                        if (summary && !summary.querySelector('.back-to-preview-btn')) {
                                            const backBtn = document.createElement('button');
                                            backBtn.className = 'back-to-preview-btn secondary btn-sm';
                                            backBtn.style.cssText = 'margin-left: auto; padding: 4px 8px; font-size: 11px;';
                                            backBtn.innerHTML = `<span class="icon" style="margin-right: 4px;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg></span>Preview`;
                                            backBtn.onclick = (evt) => {
                                                evt.stopPropagation();
                                                previewBoard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            };
                                            summary.appendChild(backBtn);
                                        }
                                    }

                                    // Use scrollIntoView which works better with accordions

                                    setTimeout(() => {
                                        targetRow.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'center',
                                            inline: 'nearest'
                                        });
                                    }, parentDetails && !parentDetails.open ? 100 : 0);

                                    scrolled = true;
                                }
                                // Flash ALL compatible rows

                                targetRow.classList.add('editor-flash');
                                setTimeout(() => targetRow.classList.remove('editor-flash'), 1500);
                            } else {
                            }
                        });

                        if (!foundAny) {
                        }
                    }
                });
            });
        }, 100); // Small delay to ensure DOM render
    }

    function renderTokenEditor() {
        if (!generatedThemeData || !generatedThemeData.tokens) return;


        const { tokens, paletteData } = generatedThemeData;

        // Clear containers
        const containers = {
            bg: document.getElementById('editor-bg'),
            text: document.getElementById('editor-text'),
            action: document.getElementById('editor-action'),
            border: document.getElementById('editor-border'),
            status: document.getElementById('editor-status'),
            interactive: document.getElementById('editor-interactive')
        };

        Object.values(containers).forEach(el => { if (el) el.innerHTML = ''; });

        // DEBUG: Log palette data to see what we're working with

        if (paletteData && typeof paletteData === 'object') {
            Object.keys(paletteData).forEach(paletteName => {
                const colors = paletteData[paletteName];
            });
        }

        // Helper: Determine which palette a token should use
        const getPaletteForToken = (tokenName) => {
            // Status tokens
            if (tokenName.startsWith('Status/success')) return 'success';
            if (tokenName.startsWith('Status/warning')) return 'warning';
            if (tokenName.startsWith('Status/error')) return 'error';
            if (tokenName.startsWith('Status/info')) return 'accent';

            // Destructive actions (use error palette)
            if (tokenName.startsWith('Action/destructive')) return 'error';

            // Other actions and buttons (use accent)
            if (tokenName.startsWith('Action/') || tokenName.startsWith('Button/')) return 'accent';

            // Backgrounds
            if (tokenName.startsWith('Background/brand') || tokenName.startsWith('Background/accent')) return 'accent';

            // Text
            if (tokenName.startsWith('Text/brand') || tokenName.startsWith('Text/link')) return 'accent';

            // Badges
            if (tokenName.startsWith('Badge/brand')) return 'accent';

            // Navigation
            if (tokenName.startsWith('Nav/')) return 'accent';

            // Icons
            if (tokenName.startsWith('Icon/brand')) return 'accent';

            // Borders - check status first, then brand/focus
            if (tokenName.startsWith('Border/error')) return 'error';
            if (tokenName.startsWith('Border/warning')) return 'warning';
            if (tokenName.startsWith('Border/success')) return 'success';
            if (tokenName.startsWith('Border/brand') || tokenName.startsWith('Border/focus')) return 'accent';

            // Inputs
            if (tokenName.startsWith('Input/borderFocus')) return 'accent';

            // Interactive states
            if (tokenName.startsWith('Interactive/focus')) return 'accent';
            if (tokenName.startsWith('Interactive/error')) return 'error';
            if (tokenName.startsWith('Interactive/warning')) return 'warning';
            if (tokenName.startsWith('Interactive/success')) return 'success';

            // Default to neutral for everything else
            return 'neutral';
        };

        // Generate custom dropdown with color swatches
        const generateCustomSelect = (paletteColors, currentValue, overrideValue, tokenName, mode) => {
            if (!paletteColors || Object.keys(paletteColors).length === 0) {
                // Fallback to generic if palette data missing
                const steps = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
                paletteColors = {};
                steps.forEach(s => paletteColors[s] = '#cccccc');
            }

            const targetVal = overrideValue ? String(overrideValue) : String(currentValue);

            // Smart fallback: if targetVal doesn't exist in palette, find nearest available value
            let actualTargetVal = targetVal;
            if (!paletteColors[targetVal]) {
                const availableScales = Object.keys(paletteColors).map(Number).sort((a, b) => a - b);
                const requestedScale = Number(targetVal);

                // Find closest scale
                let closest = availableScales[0];
                let minDiff = Math.abs(requestedScale - closest);

                for (const scale of availableScales) {
                    const diff = Math.abs(requestedScale - scale);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = scale;
                    }
                }

                actualTargetVal = String(closest);
            }

            const selectedHex = paletteColors[actualTargetVal] || '#cccccc';

            // Create unique ID for this dropdown
            const dropdownId = `dropdown-${tokenName.replace(/\//g, '-')}-${mode}`;

            // Generate options HTML
            const optionsHtml = Object.entries(paletteColors)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([scale, hex]) => {
                    const isSelected = actualTargetVal === scale;
                    return `
                        <div class="custom-option ${isSelected ? 'selected' : ''}" data-value="${scale}" data-hex="${hex}">
                            <span class="color-swatch" style="background: ${hex};"></span>
                            <span class="scale-value">${scale}</span>
                        </div>
                    `;
                }).join('');

            return `
                <div class="custom-select" data-token="${tokenName}" data-mode="${mode}" id="${dropdownId}">
                    <div class="custom-select-trigger">
                        <span class="color-swatch" style="background: ${selectedHex};"></span>
                        <span class="scale-value">${actualTargetVal}</span>
                        <span class="dropdown-arrow">▼</span>
                    </div>
                    <div class="custom-options">
                        ${optionsHtml}
                    </div>
                </div>
            `;
        };

        // Helper: Create Token Row
        const createRow = (name, token) => {
            const row = document.createElement('div');
            // Create a safe ID string: replace / with -
            const safeName = name.replace(/\//g, '-');
            row.id = `token-row-${safeName}`;
            row.className = 'token-row';
            // Removed inline styles - using CSS class now

            const getScale = (n) => {
                if (!n) return '500';
                const parts = n.split(/[\/\- ]/);
                return parts[parts.length - 1];
            };

            const lightStep = getScale(token.light.name);
            const darkStep = getScale(token.dark.name);

            // Get Overrides if any
            const overrideLight = tokenOverrides[name] && tokenOverrides[name].light;
            const overrideDark = tokenOverrides[name] && tokenOverrides[name].dark;

            // Determine which palette to use for this token
            const paletteName = getPaletteForToken(name);
            const paletteColors = paletteData[paletteName] || {};

            // Calculate APCA if this token has a contrast pair defined
            const getAPCAIndicator = (tokenHex, mode) => {
                const pair = CONTRAST_PAIRS[name];
                if (!pair) return ''; // No contrast check for this token

                const bgTokenName = pair.bg;
                const bgToken = tokens[bgTokenName];
                if (!bgToken) return ''; // Background token not found

                const bgHex = mode === 'light' ? bgToken.light.hex : bgToken.dark.hex;
                const lc = calculateAPCA(tokenHex, bgHex);
                const absLc = Math.abs(lc);
                const threshold = APCA_THRESHOLDS[pair.threshold] || 60;

                const pass = absLc >= threshold;
                const icon = pass ? '✓' : '✗';
                const colorClass = pass ? 'apca-pass' : 'apca-fail';

                return `<span class="apca-indicator ${colorClass}" title="APCA Lc: ${absLc.toFixed(0)} (min: ${threshold})">APCA: ${absLc.toFixed(0)} ${icon}</span>`;
            };

            const apcaLight = getAPCAIndicator(token.light.hex, 'light');
            const apcaDark = getAPCAIndicator(token.dark.hex, 'dark');

            row.innerHTML = `
                <div class="token-row-header">
                    <span class="token-name">${name.split('/')[1]}</span>
                    <span class="token-palette-badge">${paletteName}</span>
                </div>
                <div class="token-mode-row">
                    <label class="mode-label">L</label>
                    <div class="color-preview" style="background: ${token.light.hex};" title="${token.light.hex}"></div>
                    ${generateCustomSelect(paletteColors, lightStep, overrideLight, name, 'light')}
                </div>
                ${apcaLight ? `<div class="token-apca-row">${apcaLight}</div>` : ''}
                <div class="token-mode-row">
                    <label class="mode-label">D</label>
                    <div class="color-preview" style="background: ${token.dark.hex};" title="${token.dark.hex}"></div>
                    ${generateCustomSelect(paletteColors, darkStep, overrideDark, name, 'dark')}
                </div>
                ${apcaDark ? `<div class="token-apca-row">${apcaDark}</div>` : ''}
            `;

            // Highlighter Events
            const highlightMatch = () => {
                document.querySelectorAll(`[data-tokens]`).forEach(el => {
                    const tokens = el.dataset.tokens.split(' ');
                    if (tokens.includes(name)) {
                        el.classList.add('preview-highlight');
                    } else {
                        el.classList.remove('preview-highlight');
                    }
                });
            };

            const removeHighlight = () => {
                document.querySelectorAll('.preview-highlight').forEach(el => el.classList.remove('preview-highlight'));
            };

            row.addEventListener('mouseenter', highlightMatch);
            row.addEventListener('mouseleave', removeHighlight);

            return row;
        };

        // Group Tokens into Categories
        Object.entries(tokens).forEach(([name, token]) => {
            let container = containers.bg; // Fallback

            if (name.startsWith('Background/') || name.startsWith('Surface/') || name.startsWith('Overlay/')) {
                container = containers.bg;
            } else if (name.startsWith('Text/') || name.startsWith('Icon/')) {
                container = containers.text;
            } else if (name.startsWith('Action/') || name.startsWith('Button/') || name.startsWith('Input/')) {
                container = containers.action;
            } else if (name.startsWith('Border/')) {
                container = containers.border;
            } else if (name.startsWith('Status/') || name.startsWith('Badge/') || name.startsWith('A11y/')) {
                container = containers.status;
            } else if (name.startsWith('Interactive/')) {
                container = containers.interactive;
            }

            if (container) {
                container.appendChild(createRow(name, token));
            }
        });

        // Add Listeners for Custom Selects
        document.querySelectorAll('.custom-select').forEach(customSelect => {
            const trigger = customSelect.querySelector('.custom-select-trigger');
            const options = customSelect.querySelectorAll('.custom-option');
            const tokenName = customSelect.dataset.token;
            const mode = customSelect.dataset.mode;

            // Toggle dropdown
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other dropdowns
                document.querySelectorAll('.custom-select.open').forEach(other => {
                    if (other !== customSelect) other.classList.remove('open');
                });

                const wasOpen = customSelect.classList.contains('open');
                customSelect.classList.toggle('open');

                // Position dropdown if opening
                if (!wasOpen) {
                    const optionsEl = customSelect.querySelector('.custom-options');
                    const rect = trigger.getBoundingClientRect();
                    optionsEl.style.top = `${rect.bottom + 4}px`;
                    optionsEl.style.left = `${rect.left}px`;
                    optionsEl.style.width = `${rect.width}px`;
                }
            });

            // Handle option selection
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const value = option.dataset.value;
                    const hex = option.dataset.hex;

                    // Update UI
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');

                    // Update trigger
                    const triggerSwatch = trigger.querySelector('.color-swatch');
                    const triggerValue = trigger.querySelector('.scale-value');
                    triggerSwatch.style.background = hex;
                    triggerValue.textContent = value;

                    // Close dropdown
                    customSelect.classList.remove('open');

                    // Update Overrides
                    if (!tokenOverrides) tokenOverrides = {};
                    if (!tokenOverrides[tokenName]) tokenOverrides[tokenName] = {};
                    tokenOverrides[tokenName][mode] = value;

                    // Trigger Regeneration
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

                    // Store scroll position to restore after re-render
                    window.lastEditorScroll = document.getElementById('editor-panel') ? document.getElementById('editor-panel').scrollTop : 0;

                    parent.postMessage({ pluginMessage: msg }, '*');
                });
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-select.open').forEach(select => {
                select.classList.remove('open');
            });
        });

        // Restore Scroll Position if available
        if (typeof window.lastEditorScroll !== 'undefined') {
            const editorPanel = document.getElementById('editor-panel');
            if (editorPanel) {
                editorPanel.scrollTop = window.lastEditorScroll;
                // Optional: clear it to avoid sticking on next manual render
                // window.lastEditorScroll = undefined; 
            }
        }
    }
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}
