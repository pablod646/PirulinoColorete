// Measures Section Logic


function initMeasures() {
    

    // UI Elements
    const measureValues = document.getElementById('measure-values');
    const previewBtn = document.getElementById('preview-measures-btn');
    const measurePreviewContainer = document.getElementById('measure-preview-container');
    const measureList = document.getElementById('measure-list');
    const collectionSelect = document.getElementById('measure-collection-select');
    const groupSelect = document.getElementById('measure-group-select');
    const customGroupInput = document.getElementById('measure-group-custom');
    const createBtn = document.getElementById('create-measures-btn');

    if (!collectionSelect) {
        console.error('❌ Critical: measure-collection-select not found in DOM!');
        return;
    }

    if (!createBtn) {
        console.warn('⚠️ Measures UI create-btn not found. Structure check required.');
    }

    // Presets Logic
    const PRESETS = {
        default: '0, 0.5, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96',
        tailwind: '0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96', // Pixel values for tw scale
        material: '0, 4, 8, 12, 16, 24, 32, 48, 64, 80, 96',
        fibonacci: '1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144',
        golden: '2, 3.24, 5.24, 8.47, 13.71, 22.18, 35.89, 58.07, 93.96, 152.03'
    };

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.onclick = () => {
            const key = btn.dataset.preset;
            if (PRESETS[key] && measureValues) {
                measureValues.value = PRESETS[key];
                // Trigger preview if user wants immediate feedback? Maybe not to avoid spam.
                // But visual feedback on the textarea is enough.
            }
        };
    });

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-collections') {
            

            if (!collectionSelect) {
                console.error('❌ measure-collection-select lost reference!');
                return;
            }

            try {
                // Populate Collection Select
                const currentVal = collectionSelect.value;
                collectionSelect.innerHTML = '<option value="" disabled selected>Select Collection...</option>';

                if (payload && Array.isArray(payload)) {
                    payload.forEach(c => {
                        const option = document.createElement('option');
                        option.value = c.id;
                        option.textContent = c.name;
                        collectionSelect.appendChild(option);
                    });
                    

                    // Restore selection if valid
                    if (currentVal && payload.find(c => c.id === currentVal)) {
                        collectionSelect.value = currentVal;
                    }
                } else {
                    console.warn('⚠️ Payload is not an array:', payload);
                }
            } catch (err) {
                console.error('❌ Error populating measure collections:', err);
            }

        } else if (type === 'load-groups-measures') {
            
            groupSelect.innerHTML = '<option value="">(Root / No Group)</option><option value="NEW_GROUP">+ New Group...</option>';
            payload.forEach(g => {
                const option = document.createElement('option');
                option.value = g;
                option.textContent = g;
                groupSelect.appendChild(option);
            });
            groupSelect.disabled = false;

        } else if (type === 'measures-created-success') {
            alert('Measures created successfully! ✅');

            // Reset UI state
            if (measurePreviewContainer) measurePreviewContainer.style.display = 'none';

            const configContainer = document.getElementById('measure-config-container');
            if (configContainer) configContainer.style.display = 'none';

            // Reset selection to force fresh choice next time
            if (collectionSelect) collectionSelect.value = "";
            if (groupSelect) {
                groupSelect.value = "";
                // Reset group input visibility
                if (customGroupInput) customGroupInput.style.display = 'none';
            }
        }
    });

    // UI Events
    previewBtn.onclick = () => {
        
        const raw = measureValues.value;
        const values = raw.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

        if (values.length === 0) {
            alert('Please enter valid numbers (comma separated)');
            return;
        }

        // Render Preview
        measureList.innerHTML = '';
        values.forEach(v => {
            const chip = document.createElement('div');
            chip.style.cssText = `
                padding: 4px 8px;
                background: #f3f4f6;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
                font-size: 12px;
                font-family: monospace;
                color: #374151;
            `;
            chip.textContent = `${v}px`;
            measureList.appendChild(chip);
        });

        if (measurePreviewContainer) measurePreviewContainer.style.display = 'block';

        const configContainer = document.getElementById('measure-config-container');
        if (configContainer) {
            configContainer.style.display = 'block';
            // Scroll to bottom to show new controls
            setTimeout(() => configContainer.scrollIntoView({ behavior: 'smooth' }), 100);
        }

        // Always request collections to ensure freshness
        
        parent.postMessage({ pluginMessage: { type: 'load-collections' } }, '*');
    };

    collectionSelect.onchange = () => {
        const val = collectionSelect.value;
        
        // Request groups
        parent.postMessage({ pluginMessage: { type: 'get-groups-for-measures', collectionId: val } }, '*');
    };

    if (createBtn) {
        createBtn.onclick = () => {
            if (!collectionSelect.value) {
                alert('Select a collection');
                return;
            }

            const raw = measureValues.value;
            const values = raw.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

            let groupName = groupSelect.value;
            if (groupName === 'NEW_GROUP') {
                groupName = customGroupInput.value.trim();
            } else if (groupName === '') {
                groupName = null;
            }

            const config = {
                collectionId: collectionSelect.value,
                groupName
            };

            

            parent.postMessage({
                pluginMessage: {
                    type: 'create-measure-variables',
                    values,
                    config
                }
            }, '*');
        };
    }

    groupSelect.onchange = () => {
        if (groupSelect.value === 'NEW_GROUP') {
            customGroupInput.style.display = 'block';
        } else {
            customGroupInput.style.display = 'none';
        }
    };

    // Initial load request
    // This handles the case where navigation.js might have missed it or we reloaded the script context
    
    parent.postMessage({ pluginMessage: { type: 'load-collections' } }, '*');
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMeasures);
} else {
    initMeasures();
}
