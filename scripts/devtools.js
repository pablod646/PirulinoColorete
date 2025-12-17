// Dev Tools Section Logic
console.log('🛠️ Dev Tools script loaded');

function initDevTools() {
    console.log('🛠️ Initializing Dev Tools section...');

    // UI Elements
    const collectionSelect = document.getElementById('devtools-collection');
    const groupSelect = document.getElementById('devtools-group');
    const generateBtn = document.getElementById('generate-export-btn');
    const previewContainer = document.getElementById('export-preview-container');
    const outputElement = document.getElementById('export-output');
    const copyBtn = document.getElementById('copy-export-btn');
    const downloadBtn = document.getElementById('download-export-btn');
    const varsCountBadge = document.getElementById('export-vars-count');
    const formatBadge = document.getElementById('export-format-badge');

    // Options
    const formatRadios = document.querySelectorAll('input[name="export-format"]');
    const namingRadios = document.querySelectorAll('input[name="naming-convention"]');
    const optIncludeModes = document.getElementById('opt-include-modes');
    const optResolveRefs = document.getElementById('opt-resolve-refs');
    const optIncludeMetadata = document.getElementById('opt-include-metadata');

    if (!generateBtn) {
        console.warn('⚠️ Dev Tools UI elements not found');
        return;
    }

    // State
    let exportedData = '';
    let currentFormat = 'json';

    // Format option highlighting
    formatRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.format-option').forEach(opt => opt.classList.remove('active'));
            radio.closest('.format-option').classList.add('active');
            currentFormat = radio.value;
        });
    });

    // Message Listener
    window.addEventListener('plugin-message', (event) => {
        const { type, payload } = event.detail;

        if (type === 'load-collections') {
            // Populate Collection Select
            collectionSelect.innerHTML = '<option value="" disabled selected>Select collection...</option><option value="ALL">All Collections</option>';
            payload.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.name;
                collectionSelect.appendChild(option);
            });
            console.log('🛠️ Dev Tools: Collections loaded');

        } else if (type === 'load-groups-devtools') {
            groupSelect.innerHTML = '<option value="">All Groups</option>';
            payload.forEach(g => {
                const option = document.createElement('option');
                option.value = g;
                option.textContent = g;
                groupSelect.appendChild(option);
            });
            groupSelect.disabled = false;

        } else if (type === 'export-variables-result') {
            renderExport(payload);
        }
    });

    // Events
    collectionSelect.onchange = () => {
        const val = collectionSelect.value;
        if (val && val !== 'ALL') {
            parent.postMessage({ pluginMessage: { type: 'get-groups-for-devtools', collectionId: val } }, '*');
        } else {
            groupSelect.innerHTML = '<option value="">All Groups</option>';
            groupSelect.disabled = true;
        }
    };

    generateBtn.onclick = () => {
        const collectionId = collectionSelect.value;
        if (!collectionId) {
            alert('Please select a collection first');
            return;
        }

        const format = document.querySelector('input[name="export-format"]:checked').value;
        const naming = document.querySelector('input[name="naming-convention"]:checked').value;
        const colorFormat = document.querySelector('input[name="color-format"]:checked').value;

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="icon animate-spin">⏳</span> Generating...';

        parent.postMessage({
            pluginMessage: {
                type: 'export-variables',
                collectionId: collectionId === 'ALL' ? null : collectionId,
                groupName: groupSelect.value || null,
                options: {
                    format,
                    naming,
                    colorFormat,
                    includeModes: optIncludeModes.checked,
                    resolveRefs: optResolveRefs.checked,
                    includeMetadata: optIncludeMetadata.checked
                }
            }
        }, '*');
    };

    function renderExport(data) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span> Generate Export';

        if (!data || !data.output) {
            outputElement.innerHTML = '<code>// No variables found</code>';
            previewContainer.style.display = 'block';
            return;
        }

        exportedData = data.output;
        outputElement.innerHTML = `<code>${escapeHtml(data.output)}</code>`;
        varsCountBadge.textContent = `${data.count} variables`;
        formatBadge.textContent = data.format.toUpperCase();
        previewContainer.style.display = 'block';

        // Scroll to preview
        previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Copy to clipboard (with fallback for Figma sandbox)
    copyBtn.onclick = () => {
        if (!exportedData) return;

        // Try modern clipboard API first, fallback to execCommand
        const copyToClipboard = (text) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            } else {
                // Fallback for Figma sandbox
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    return Promise.resolve();
                } catch (err) {
                    return Promise.reject(err);
                } finally {
                    document.body.removeChild(textarea);
                }
            }
        };

        copyToClipboard(exportedData).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="icon">✓</span> Copied!';
            copyBtn.classList.add('success');
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('success');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Copy failed. Please select and copy manually.');
        });
    };

    // Download file
    downloadBtn.onclick = () => {
        if (!exportedData) return;

        const format = document.querySelector('input[name="export-format"]:checked').value;
        const extensions = {
            json: 'json',
            css: 'css',
            scss: 'scss',
            tailwind: 'js',
            typescript: 'ts'
        };
        const ext = extensions[format] || 'txt';
        const filename = `design-tokens.${ext}`;

        const blob = new Blob([exportedData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDevTools);
} else {
    initDevTools();
}
