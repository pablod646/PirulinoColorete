// Aliases (Responsive Semantics) Section Logic
console.log('🔗 Aliases script loaded');

function initAliases() {
    console.log('🔗 Initializing Aliases section...');

    // UI Elements
    const sourceCollection = document.getElementById('alias-source-collection');
    const measureGroup = document.getElementById('alias-measures-group');
    const typoGroup = document.getElementById('alias-typo-group');
    const targetNameInput = document.getElementById('alias-target-name');
    const createBtn = document.getElementById('create-aliases-btn');
    const createStylesBtn = document.getElementById('create-styles-btn');

    if (!createBtn) {
        console.warn('⚠️ Aliases UI elements not found');
        return;
    }

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-collections') {
            sourceCollection.innerHTML = '<option value="" disabled selected>Select Collection...</option>';
            payload.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                sourceCollection.appendChild(opt);
            });
            console.log('🔗 Aliases: Loaded collections');

        } else if (type === 'load-groups-alias') {
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
            console.log('🔗 Aliases: Loaded groups');
        }
    });

    // Events
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

        // Enable next step
        createStylesBtn.disabled = false;
    };

    createStylesBtn.onclick = () => {
        // Validation re-check because user might simply click this if enabled previously
        if (!sourceCollection.value || !typoGroup.value) {
            alert('Please select Source Collection and Typography Group (required for linking variables)');
            return;
        }

        const config = {
            sourceCollectionId: sourceCollection.value,
            measureGroup: measureGroup.value, // Passed for consistency though mostly typo needed
            typoGroup: typoGroup.value,
            targetName: targetNameInput.value.trim() || 'Tokens'
        };

        console.log('🔗 Creating text styles with config:', config);

        parent.postMessage({
            pluginMessage: {
                type: 'create-text-styles',
                config
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
