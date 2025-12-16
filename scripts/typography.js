// Typography Section Logic
console.log('✍️ Typography script loaded');

function initTypography() {
    console.log('✍️ Initializing Typography section...');

    // UI Elements
    const fontHeading = document.getElementById('font-heading');
    const fontBody = document.getElementById('font-body');
    const fontCode = document.getElementById('font-code');
    const typoWeights = document.getElementById('typo-weights');
    const typoSpacing = document.getElementById('typo-spacing');
    const typoSizes = document.getElementById('typo-sizes');
    const typoCollection = document.getElementById('typo-collection-select');
    const typoGroup = document.getElementById('typo-group-select');
    const typoGroupCustom = document.getElementById('typo-group-custom');
    const createBtn = document.getElementById('create-typo-btn');

    if (!createBtn) {
        console.warn('⚠️ Typography UI elements not found');
        return;
    }

    // Initial Load of Fonts
    console.log('✍️ Requesting font list...');
    parent.postMessage({ pluginMessage: { type: 'get-fonts' } }, '*');

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-fonts') {
            const fonts = payload; // ['Inter', 'Roboto', ...]
            console.log('✍️ Fonts loaded:', fonts.length);
            const updateSelect = (sel) => {
                sel.innerHTML = '<option value="" disabled selected>Select Font...</option>';
                fonts.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f;
                    opt.textContent = f;
                    sel.appendChild(opt);
                });
            };

            updateSelect(fontHeading);
            updateSelect(fontBody);
            updateSelect(fontCode);

            // Set defaults if available
            if (fonts.includes('Inter')) {
                fontHeading.value = 'Inter';
                fontBody.value = 'Inter';
            }
            if (fonts.includes('Roboto Mono')) {
                fontCode.value = 'Roboto Mono';
            }

        } else if (type === 'load-collections') {
            typoCollection.innerHTML = '<option value="" disabled selected>Select Collection...</option>';
            payload.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                typoCollection.appendChild(opt);
            });
            console.log('✍️ Typography: Collections loaded');

        } else if (type === 'load-groups-typo') {
            console.log('✍️ Typography: Groups loaded');
            typoGroup.innerHTML = '<option value="">(Root / No Group)</option><option value="NEW_GROUP">+ New Group...</option>';
            payload.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g;
                typoGroup.appendChild(opt);
            });
            typoGroup.disabled = false;
        }
    });

    // Events
    typoCollection.onchange = () => {
        console.log('✍️ Typography: Collection changed');
        parent.postMessage({ pluginMessage: { type: 'get-groups-for-typo', collectionId: typoCollection.value } }, '*');
    };

    typoGroup.onchange = () => {
        if (typoGroup.value === 'NEW_GROUP') {
            typoGroupCustom.style.display = 'block';
        } else {
            typoGroupCustom.style.display = 'none';
        }
    };

    createBtn.onclick = () => {
        if (!typoCollection.value) {
            alert('Select a collection');
            return;
        }

        const families = {
            heading: fontHeading.value,
            body: fontBody.value,
            code: fontCode.value
        };

        const parseList = (el) => el.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

        const weights = parseList(typoWeights);
        const spacing = parseList(typoSpacing);
        const sizes = parseList(typoSizes);

        let groupName = typoGroup.value;
        if (groupName === 'NEW_GROUP') {
            groupName = typoGroupCustom.value.trim();
        } else if (groupName === '') {
            groupName = null;
        }

        const config = {
            collectionId: typoCollection.value,
            groupName
        };

        console.log('✍️ Creating typography...', config);

        parent.postMessage({
            pluginMessage: {
                type: 'create-typography',
                families,
                weights,
                spacing,
                sizes,
                config
            }
        }, '*');
    };
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypography);
} else {
    initTypography();
}
