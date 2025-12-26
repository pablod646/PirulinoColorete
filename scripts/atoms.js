// Atoms Section - Generate Atomic Components
(function () {
    'use strict';

    // Elements
    const themeCollectionSelect = document.getElementById('atoms-theme-collection');
    const aliasesCollectionSelect = document.getElementById('atoms-aliases-collection');
    const generateBtn = document.getElementById('generate-atoms-btn');
    const previewContainer = document.getElementById('atoms-preview');

    // Component checkboxes
    const genButtons = document.getElementById('gen-buttons');
    const genInputs = document.getElementById('gen-inputs');
    const genBadges = document.getElementById('gen-badges');
    const genNavMenu = document.getElementById('gen-navmenu');

    // Output options
    const prefixInput = document.getElementById('atoms-prefix');
    const outputSelect = document.getElementById('atoms-output');
    const asComponentsCheckbox = document.getElementById('atoms-as-components');

    // Load collections on init
    function init() {
        parent.postMessage({ pluginMessage: { type: 'get-collections' } }, '*');
    }

    // Handle messages from plugin
    window.addEventListener('message', (event) => {
        const msg = event.data.pluginMessage;
        if (!msg) return;

        switch (msg.type) {
            case 'load-collections':
                populateCollections(msg.payload);
                break;
            case 'atoms-generation-progress':
                updateProgress(msg.payload);
                break;
            case 'atoms-generation-complete':
                hideProgress();
                showNotification(`Generated ${msg.payload.count} components!`, 'success');
                break;
            case 'atoms-generation-error':
                hideProgress();
                showNotification('Error: ' + msg.payload, 'error');
                break;
        }
    });

    function populateCollections(collections) {
        if (!themeCollectionSelect || !aliasesCollectionSelect) return;

        const defaultTheme = '<option value="" disabled selected>Select theme...</option>';
        const defaultAliases = '<option value="" disabled selected>Select aliases...</option>';

        const options = collections.map(c =>
            `<option value="${c.id}">${c.name}</option>`
        ).join('');

        themeCollectionSelect.innerHTML = defaultTheme + options;
        aliasesCollectionSelect.innerHTML = defaultAliases + options;
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const config = buildConfig();
            if (!validateConfig(config)) return;

            showProgress();
            parent.postMessage({
                pluginMessage: {
                    type: 'generate-atoms',
                    config
                }
            }, '*');
        });
    }

    function buildConfig() {
        // Collect button variants
        const buttonVariants = [];
        document.querySelectorAll('input[name="btn-variant"]:checked').forEach(cb => {
            buttonVariants.push(cb.value);
        });

        // Collect button styles (filled, outlined)
        const buttonStyles = [];
        document.querySelectorAll('input[name="btn-style"]:checked').forEach(cb => {
            buttonStyles.push(cb.value);
        });

        // Collect button sizes
        const buttonSizes = [];
        document.querySelectorAll('input[name="btn-size"]:checked').forEach(cb => {
            buttonSizes.push(cb.value);
        });

        // Collect input variants
        const inputVariants = [];
        document.querySelectorAll('input[name="input-variant"]:checked').forEach(cb => {
            inputVariants.push(cb.value);
        });

        // Collect input states
        const inputStates = [];
        document.querySelectorAll('input[name="input-state"]:checked').forEach(cb => {
            inputStates.push(cb.value);
        });

        // Collect badge variants
        const badgeVariants = [];
        document.querySelectorAll('input[name="badge-variant"]:checked').forEach(cb => {
            badgeVariants.push(cb.value);
        });

        // Collect badge sizes
        const badgeSizes = [];
        document.querySelectorAll('input[name="badge-size"]:checked').forEach(cb => {
            badgeSizes.push(cb.value);
        });

        // Collect nav menu states
        const navMenuStates = [];
        document.querySelectorAll('input[name="navmenu-state"]:checked').forEach(cb => {
            navMenuStates.push(cb.value);
        });

        return {
            themeCollectionId: themeCollectionSelect ? themeCollectionSelect.value : '',
            aliasesCollectionId: aliasesCollectionSelect ? aliasesCollectionSelect.value : '',
            prefix: prefixInput ? prefixInput.value : '',
            output: outputSelect ? outputSelect.value : 'frame',
            asComponents: asComponentsCheckbox ? asComponentsCheckbox.checked : true,
            components: {
                buttons: genButtons && genButtons.checked ? { variants: buttonVariants, styles: buttonStyles, sizes: buttonSizes } : null,
                inputs: genInputs && genInputs.checked ? { variants: inputVariants, states: inputStates } : null,
                badges: genBadges && genBadges.checked ? { variants: badgeVariants, sizes: badgeSizes } : null,
                navMenu: genNavMenu && genNavMenu.checked ? { states: navMenuStates } : null
            }
        };
    }

    function validateConfig(config) {
        if (!config.themeCollectionId) {
            showNotification('Please select a Theme collection', 'error');
            return false;
        }

        const hasComponents = config.components.buttons || config.components.inputs || config.components.badges || config.components.navMenu;
        if (!hasComponents) {
            showNotification('Please select at least one component type', 'error');
            return false;
        }

        return true;
    }

    function updatePreview() {
        if (!previewContainer) return;

        let html = '<div class="preview-components">';

        if (genButtons && genButtons.checked) {
            html += '<div class="preview-btn primary">Primary</div>';
            html += '<div class="preview-btn secondary">Secondary</div>';
            html += '<div class="preview-btn ghost">Ghost</div>';
        }

        if (genInputs && genInputs.checked) {
            html += '<input type="text" class="preview-input" placeholder="Text input" readonly>';
        }

        if (genBadges && genBadges.checked) {
            html += '<span class="preview-badge primary">New</span>';
            html += '<span class="preview-badge success">Success</span>';
            html += '<span class="preview-badge warning">Warning</span>';
            html += '<span class="preview-badge error">Error</span>';
        }

        html += '</div>';
        previewContainer.innerHTML = html;
    }

    function showProgress() {
        const progress = document.getElementById('atoms-progress');
        const fill = document.getElementById('atoms-progress-bar-fill');
        const message = document.getElementById('atoms-progress-message');
        const percent = document.getElementById('atoms-progress-percent');

        if (progress) {
            progress.style.display = 'block';
            if (fill) fill.style.width = '0%';
            if (message) message.textContent = 'Initializing...';
            if (percent) percent.textContent = '0%';
        }
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.5';
        }
    }

    function hideProgress() {
        const progress = document.getElementById('atoms-progress');
        const fill = document.getElementById('atoms-progress-bar-fill');
        const message = document.getElementById('atoms-progress-message');
        const percent = document.getElementById('atoms-progress-percent');

        if (fill) fill.style.width = '100%';
        if (message) message.textContent = 'Complete!';
        if (percent) percent.textContent = '100%';

        setTimeout(() => {
            if (progress) progress.style.display = 'none';
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.style.opacity = '1';
            }
        }, 1500);
    }

    function updateProgress(data) {
        const fill = document.getElementById('atoms-progress-bar-fill');
        const message = document.getElementById('atoms-progress-message');
        const percent = document.getElementById('atoms-progress-percent');

        if (fill) fill.style.width = `${data.percent}%`;
        if (message) message.textContent = data.message || 'Generating...';
        if (percent) percent.textContent = `${data.percent}%`;
    }

    function showNotification(message, type) {

        // Could use figma.notify via postMessage
    }

    // Toggle component options visibility
    if (genButtons) genButtons.addEventListener('change', updatePreview);
    if (genInputs) genInputs.addEventListener('change', updatePreview);
    if (genBadges) genBadges.addEventListener('change', updatePreview);

    // Initialize
    init();
    updatePreview();
})();
