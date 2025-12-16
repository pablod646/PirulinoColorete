// Colors Section Logic
console.log('🎨 Colors script loaded');

function initColors() {
    console.log('🎨 Initializing Colors section...');

    // UI Elements
    const collectionSelect = document.getElementById('var-collection-select');
    const customCollectionInput = document.getElementById('var-collection-custom');
    const groupSelect = document.getElementById('var-group-select');
    const customGroupInput = document.getElementById('var-group-custom');
    const newColorName = document.getElementById('new-color-name');
    const newColorHex = document.getElementById('new-color-hex');
    const newColorSwatch = document.getElementById('new-color-swatch');
    const addColorBtn = document.getElementById('add-color-btn');
    const addError = document.getElementById('add-error');
    const colorQueueDiv = document.getElementById('color-queue');
    const queueCountSpan = document.getElementById('queue-count-badge');
    const previewScaleBtn = document.getElementById('preview-scale-btn');
    const scalePreviewContainer = document.getElementById('scale-preview-container');
    const scaleList = document.getElementById('scale-list');
    const createVarsBtn = document.getElementById('create-vars-btn');

    // Progress Bar Elements
    const progressDiv = document.getElementById('creation-progress');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressMessage = document.getElementById('progress-message');
    const progressPercent = document.getElementById('progress-percent');

    // Existing Palettes Elements
    const existingPalettesContainer = document.getElementById('existing-palettes-container');
    const existingPalettesList = document.getElementById('existing-palettes-list');
    const existingPalettesCount = document.getElementById('existing-palettes-count');

    if (!addColorBtn) {
        console.error('❌ Critical Error: add-color-btn not found. DOM might not be ready.');
        return;
    }

    // Initial Load
    console.log('📨 Requesting collections...');
    parent.postMessage({ pluginMessage: { type: 'load-collections' } }, '*');

    // State
    let colorQueue = [];

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;
        console.log(`🎨 Colors received message: ${type}`, payload);

        if (type === 'progress-start') {
            if (progressDiv) {
                progressDiv.style.display = 'block';
                progressBarFill.style.width = '0%';
                progressMessage.textContent = payload || 'Starting...';
                progressPercent.textContent = '0%';
                createVarsBtn.disabled = true;
                createVarsBtn.style.opacity = '0.5';
            }

        } else if (type === 'progress-update') {
            if (progressDiv && payload) {
                const percent = Math.round((payload.current / payload.total) * 100);
                progressBarFill.style.width = `${percent}%`;
                progressMessage.textContent = payload.message;
                progressPercent.textContent = `${percent}%`;
            }

        } else if (type === 'progress-end') {
            if (progressDiv) {
                progressBarFill.style.width = '100%';
                progressPercent.textContent = '100%';
                progressMessage.textContent = 'Done!';

                setTimeout(() => {
                    progressDiv.style.display = 'none';
                    createVarsBtn.disabled = false;
                    createVarsBtn.style.opacity = '1';

                    // Close the preview container smoothly if tasks are done
                    if (colorQueue.length === 0) {
                        scalePreviewContainer.style.display = 'none';
                    }
                }, 1500);
            }

        } else if (type === 'variables-created-success') {
            colorQueue = [];
            updateQueueUI();

        } else if (type === 'load-collections') {
            if (!collectionSelect) return;
            // Populate Collection Select
            // Reset but keep first 2 options
            while (collectionSelect.options.length > 2) {
                collectionSelect.remove(2);
            }

            payload.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.name;
                collectionSelect.appendChild(option);
            });
            console.log(`✅ Loaded ${payload.length} collections into dropdown`);

        } else if (type === 'load-groups-tab1') {
            if (!groupSelect) return;
            // Populate Group Select
            groupSelect.innerHTML = '<option value="">(Root / No Group)</option><option value="NEW_GROUP">+ New Group...</option>';
            payload.forEach(g => {
                const option = document.createElement('option');
                option.value = g;
                option.textContent = g;
                groupSelect.appendChild(option);
            });
            groupSelect.disabled = false;

            // Request existing palettes for this collection
            const selectedCollection = collectionSelect.value;
            if (selectedCollection && selectedCollection !== 'NEW_COLLECTION') {
                parent.postMessage({
                    pluginMessage: {
                        type: 'get-existing-palettes',
                        collectionId: selectedCollection,
                        groupName: '' // Root initially
                    }
                }, '*');
            }

        } else if (type === 'existing-palettes-loaded') {
            // Render existing palettes
            renderExistingPalettes(payload);

        } else if (type === 'preview-scale-batch-result') {
            // Render Previews
            scaleList.innerHTML = '';

            payload.forEach(item => {
                const row = document.createElement('div');
                row.style.marginBottom = '24px';

                const title = document.createElement('div');
                title.style.fontWeight = '600';
                title.style.marginBottom = '8px';
                title.style.fontSize = '13px';
                title.textContent = item.name;
                row.appendChild(title);

                const swatches = document.createElement('div');
                swatches.style.display = 'flex';
                swatches.style.borderRadius = '8px';
                swatches.style.overflow = 'hidden';
                swatches.style.height = '40px';

                // Sort keys: 50, 100, ... 950
                const steps = Object.keys(item.steps).sort((a, b) => parseInt(a) - parseInt(b));

                steps.forEach(step => {
                    const data = item.steps[step];
                    const hex = data.hex;
                    const isDark = (step >= 500); // Simple heuristic for text color

                    const chip = document.createElement('div');
                    chip.style.flex = '1';
                    chip.style.backgroundColor = hex;
                    chip.style.display = 'flex';
                    chip.style.alignItems = 'center';
                    chip.style.justifyContent = 'center';
                    chip.style.color = isDark ? 'white' : 'black';
                    chip.style.fontSize = '10px';
                    chip.innerText = step;

                    swatches.appendChild(chip);
                });

                row.appendChild(swatches);
                scaleList.appendChild(row);
            });

            scalePreviewContainer.style.display = 'block';
            createVarsBtn.disabled = false;
        }
    });

    // Event Handlers

    // Collection Select Change
    if (collectionSelect) {
        collectionSelect.onchange = () => {
            const val = collectionSelect.value;
            if (val === 'NEW_COLLECTION') {
                customCollectionInput.style.display = 'block';
                // Enable group selection so user can create a group in the new collection
                groupSelect.disabled = false;
                // Reset to default options: Root and New Group
                groupSelect.innerHTML = '<option value="">(Root / No Group)</option><option value="NEW_GROUP">+ New Group...</option>';
            } else {
                customCollectionInput.style.display = 'none';
                // Load groups for this collection
                parent.postMessage({ pluginMessage: { type: 'get-groups-for-tab1', collectionId: val } }, '*');
            }
        };
    }

    // Group Select Change
    if (groupSelect) {
        groupSelect.onchange = () => {
            if (groupSelect.value === 'NEW_GROUP') {
                customGroupInput.style.display = 'block';
                // Hide existing palettes when creating new group
                if (existingPalettesContainer) {
                    existingPalettesContainer.style.display = 'none';
                }
            } else {
                customGroupInput.style.display = 'none';
                // Request existing palettes for selected group
                const selectedCollection = collectionSelect.value;
                if (selectedCollection && selectedCollection !== 'NEW_COLLECTION') {
                    parent.postMessage({
                        pluginMessage: {
                            type: 'get-existing-palettes',
                            collectionId: selectedCollection,
                            groupName: groupSelect.value || ''
                        }
                    }, '*');
                }
            }
        };
    }

    // Function to render existing palettes (uses same style as preview)
    function renderExistingPalettes(palettes) {
        if (!existingPalettesContainer || !existingPalettesList) return;

        if (!palettes || Object.keys(palettes).length === 0) {
            existingPalettesContainer.style.display = 'none';
            return;
        }

        existingPalettesList.innerHTML = '';
        const paletteNames = Object.keys(palettes);

        if (existingPalettesCount) {
            existingPalettesCount.textContent = `${paletteNames.length} palette${paletteNames.length !== 1 ? 's' : ''}`;
        }

        paletteNames.forEach(paletteName => {
            const colors = palettes[paletteName];
            if (!colors || colors.length === 0) return;

            const row = document.createElement('div');
            row.style.marginBottom = '16px';

            // Extract just the palette name (last part of path)
            const displayName = paletteName.split('/').pop();

            const title = document.createElement('div');
            title.style.fontWeight = '600';
            title.style.marginBottom = '8px';
            title.style.fontSize = '13px';
            title.textContent = displayName;
            row.appendChild(title);

            const swatches = document.createElement('div');
            swatches.style.display = 'flex';
            swatches.style.borderRadius = '8px';
            swatches.style.overflow = 'hidden';
            swatches.style.height = '40px';

            // Sort colors by step number
            const sortedColors = [...colors].sort((a, b) => {
                const aNum = parseInt(a.step.split('-').pop() || '0');
                const bNum = parseInt(b.step.split('-').pop() || '0');
                return aNum - bNum;
            });

            sortedColors.forEach(color => {
                const stepNum = parseInt(color.step.split('-').pop() || '0');
                const isDark = (stepNum >= 500);

                const chip = document.createElement('div');
                chip.style.flex = '1';
                chip.style.backgroundColor = color.hex;
                chip.style.display = 'flex';
                chip.style.alignItems = 'center';
                chip.style.justifyContent = 'center';
                chip.style.color = isDark ? 'white' : 'black';
                chip.style.fontSize = '10px';
                chip.title = `${color.step}: ${color.hex}`;
                chip.innerText = stepNum;

                swatches.appendChild(chip);
            });

            row.appendChild(swatches);
            existingPalettesList.appendChild(row);
        });

        existingPalettesContainer.style.display = 'block';
    }

    // Hex/Color Input Preview (Supports Hex, RGB, HSL, OKLCH, etc.)
    if (newColorHex) {
        newColorHex.oninput = () => {
            const val = newColorHex.value.trim();
            // Try to set the background color. If it's valid CSS, the browser will apply it.
            if (val) {
                newColorSwatch.style.backgroundColor = val;
                // Check if it worked (simple validation hack)
                // Note: This isn't perfect but allows flexibility
            } else {
                newColorSwatch.style.backgroundColor = '#f3f4f6';
            }
        };
    }

    // Add to Queue
    addColorBtn.onclick = () => {
        console.log('➕ Add Color Button Clicked');
        const name = newColorName.value.trim();
        const colorVal = newColorHex.value.trim();

        // Validation: Just check if not empty. Let CSS/Backend handle exact validity.
        if (!name || !colorVal) {
            addError.style.display = 'block';
            addError.textContent = 'Name and Value are required';
            console.warn('⚠️ Empty input');
            return;
        }
        addError.style.display = 'none';

        colorQueue.push({ name, hex: colorVal, id: Date.now() }); // We use 'hex' key but it can store any string
        updateQueueUI();

        // Clear inputs
        newColorName.value = '';
        newColorHex.value = '';
        newColorSwatch.style.backgroundColor = '#f3f4f6';
        newColorName.focus(); // Focus back to name for fast entry
    };

    function updateQueueUI() {
        if (queueCountSpan) {
            queueCountSpan.textContent = colorQueue.length + ' colors'; // Add 'colors' suffix to match design
        }

        colorQueueDiv.innerHTML = '';

        if (colorQueue.length === 0) {
            colorQueueDiv.innerHTML = '<p id="empty-queue-msg" style="font-size: 11px; color: #999; font-style: italic;">No colors added yet.</p>';
            previewScaleBtn.disabled = true;
            return;
        }

        previewScaleBtn.disabled = false;

        colorQueue.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'color-queue-item'; // Use correct class from CSS

            el.innerHTML = `
                <div class="swatch" style="background-color: ${item.hex};"></div>
                <div class="info">
                    <div class="name">${item.name}</div>
                    <div class="hex">${item.hex}</div>
                </div>
                <button class="remove-btn" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            colorQueueDiv.appendChild(el);
        });

        // Add remove listeners
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.currentTarget.dataset.index); // Use currentTarget to ensure we get the button
                colorQueue.splice(idx, 1);
                updateQueueUI();
            };
        });
    }

    // Preview
    previewScaleBtn.onclick = () => {
        console.log('👁️ Preview Scale Clicked', colorQueue);
        parent.postMessage({ pluginMessage: { type: 'preview-scale-batch', colors: colorQueue } }, '*');
    };

    // Create Variables
    createVarsBtn.onclick = () => {
        console.log('🚀 Create Variables Clicked');
        if (colorQueue.length === 0) return;

        let collectionId = collectionSelect.value;
        let collectionName = null;
        if (collectionId === 'NEW_COLLECTION') {
            collectionName = customCollectionInput.value.trim();
            if (!collectionName) {
                alert('Please enter a collection name');
                return;
            }
            collectionId = null; // Backend handles creation
        }

        let groupName = groupSelect.value;
        if (groupName === 'NEW_GROUP') {
            groupName = customGroupInput.value.trim();
        } else if (groupName === '') {
            groupName = null; // Root
        }

        const config = {
            collectionId,
            collectionName,
            groupName
        };

        parent.postMessage({
            pluginMessage: {
                type: 'create-variables-batch',
                colors: colorQueue,
                config
            }
        }, '*');
    };
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initColors);
} else {
    initColors();
}
