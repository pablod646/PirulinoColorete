// Measures Section Logic
console.log('📏 Measures script loaded');

function initMeasures() {
    console.log('📏 Initializing Measures section...');

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

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-collections') {
            console.log('📏 Measures received load-collections. Payload:', payload);

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
                    console.log(`✅ Measures: Populated ${payload.length} collections.`);

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
            console.log('📏 Measures: Loaded groups', payload);
            groupSelect.innerHTML = '<option value="">(Root / No Group)</option><option value="NEW_GROUP">+ New Group...</option>';
            payload.forEach(g => {
                const option = document.createElement('option');
                option.value = g;
                option.textContent = g;
                groupSelect.appendChild(option);
            });
            groupSelect.disabled = false;

        } else if (type === 'measures-created-success') {
            alert('Measures created successfully!');
            measurePreviewContainer.style.display = 'none';
        }
    });

    // UI Events
    previewBtn.onclick = () => {
        console.log('📏 Preview Measures Clicked');
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

        measurePreviewContainer.style.display = 'block';

        // Always request collections to ensure freshness
        console.log('📏 Requesting collections refresh from preview...');
        parent.postMessage({ pluginMessage: { type: 'load-collections' } }, '*');
    };

    collectionSelect.onchange = () => {
        const val = collectionSelect.value;
        console.log('📏 Collection changed:', val);
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

            console.log('📏 Creating measures:', values, config);

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
    console.log('📏 Sending initial load-collections request from init.');
    parent.postMessage({ pluginMessage: { type: 'load-collections' } }, '*');
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMeasures);
} else {
    initMeasures();
}
