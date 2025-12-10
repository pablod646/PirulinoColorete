// Collections (Documentation) Section Logic
console.log('📚 Collections script loaded');

function initCollections() {
    console.log('📚 Initializing Collections section...');

    // UI Elements
    const collectionSelect = document.getElementById('collection-select');
    const groupSelect = document.getElementById('group-select');
    const convertBtn = document.getElementById('convert-btn');
    const generateBtn = document.getElementById('generate-btn');
    const resultDiv = document.getElementById('result');

    if (!convertBtn) {
        console.warn('⚠️ Collections UI elements not found');
        return;
    }

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-collections') {
            collectionSelect.innerHTML = '<option value="" disabled selected>Select collection...</option>';
            payload.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                collectionSelect.appendChild(opt);
            });
            console.log('📚 Collections loaded');

        } else if (type === 'load-groups') {
            groupSelect.innerHTML = '<option value="">All Groups</option>';
            payload.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g;
                groupSelect.appendChild(opt);
            });
            groupSelect.disabled = false;
            console.log('📚 Groups loaded');

        } else if (type === 'conversion-result') {
            // Render result in UI
            resultDiv.innerHTML = '';

            if (payload.length === 0) {
                resultDiv.innerHTML = '<p style="color:#666; text-align:center;">No variables found.</p>';
                return;
            }

            payload.forEach(item => {
                const row = document.createElement('div');
                row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;';

                const info = document.createElement('div');
                info.innerHTML = `
                    <div style="font-weight: 500; font-size: 13px;">${item.name}</div>
                    <div style="font-size: 11px; color: #888;">${item.type}</div>
                `;

                const val = document.createElement('div');
                if (item.type === 'COLOR') {
                    val.style.cssText = 'display:flex; align-items:center; gap:8px;';
                    val.innerHTML = '<span style="font-size: 14px;">🎨</span>';
                } else {
                    val.textContent = 'Variable';
                }

                row.appendChild(info);
                row.appendChild(val);
                resultDiv.appendChild(row);
            });
        }
    });

    // Events
    collectionSelect.onchange = () => {
        const id = collectionSelect.value;
        console.log('📚 Collection changed:', id);
        parent.postMessage({ pluginMessage: { type: 'get-groups', collectionId: id } }, '*');
    };

    convertBtn.onclick = () => {
        const id = collectionSelect.value;
        if (!id) return;

        console.log('📚 Converting/Listing JSON...');
        parent.postMessage({
            pluginMessage: {
                type: 'convert-json',
                collectionId: id,
                groupName: groupSelect.value
            }
        }, '*');
        resultDiv.innerHTML = '<p style="color:#666; text-align:center;">Loading...</p>';
    };

    generateBtn.onclick = () => {
        const id = collectionSelect.value;
        if (!id) return;

        console.log('📚 Generating canvas documentation...');
        parent.postMessage({
            pluginMessage: {
                type: 'generate-canvas',
                collectionId: id,
                groupName: groupSelect.value
            }
        }, '*');
    };
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollections);
} else {
    initCollections();
}
