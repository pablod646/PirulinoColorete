// Aliases (Responsive Semantics) Section Logic
console.log('🔗 Aliases script loaded');

function initAliases() {
    console.log('🔗 Initializing Aliases section...');

    // Elements
    const sourceCollection = document.getElementById('alias-source-collection');
    const measureGroup = document.getElementById('alias-measures-group');
    const typoGroup = document.getElementById('alias-typo-group');
    const targetNameInput = document.getElementById('alias-target-name');
    const createBtn = document.getElementById('create-aliases-btn');

    if (!createBtn) {
        console.warn('⚠️ Aliases UI elements not found');
        return;
    }

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-collections') {
            // Fill source collection select
            if (sourceCollection) {
                sourceCollection.innerHTML = '<option value="" disabled selected>Select Collection...</option>';
                payload.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    sourceCollection.appendChild(opt);
                });
            }
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
            console.log('🔗 Aliases: Loaded groups for tokens mode');
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
    };
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAliases);
} else {
    initAliases();
}
