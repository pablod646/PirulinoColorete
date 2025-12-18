// Icons Section - Import icons from Iconify API
(function () {
    'use strict';

    // Elements
    const iconSetSelect = document.getElementById('icon-set-select');
    const iconStyleSelect = document.getElementById('icon-style-select');
    const searchQuery = document.getElementById('icon-search-query');
    const searchBtn = document.getElementById('search-icons-btn');
    const resultsContainer = document.getElementById('icon-results');
    const importQueue = document.getElementById('import-queue');
    const queueCountBadge = document.getElementById('queue-count-badge');
    const clearQueueBtn = document.getElementById('clear-queue-btn');
    const importBtn = document.getElementById('import-icons-btn');
    const iconSize = document.getElementById('icon-size');
    const iconPrefix = document.getElementById('icon-prefix');
    const asComponents = document.getElementById('icon-as-components');

    if (!iconSetSelect) return;

    // Iconify API base URL
    const ICONIFY_API = 'https://api.iconify.design';

    // Icon set styles configuration
    const iconSetStyles = {
        'mdi': [
            { value: 'mdi', label: 'Default' },
            { value: 'mdi-light', label: 'Light' }
        ],
        'lucide': [
            { value: 'lucide', label: 'Default' }
        ],
        'ph': [
            { value: 'ph', label: 'Regular' },
            { value: 'ph-thin', label: 'Thin' },
            { value: 'ph-light', label: 'Light' },
            { value: 'ph-bold', label: 'Bold' },
            { value: 'ph-fill', label: 'Fill' },
            { value: 'ph-duotone', label: 'Duotone' }
        ],
        'heroicons': [
            { value: 'heroicons', label: 'Outline (24)' },
            { value: 'heroicons-solid', label: 'Solid (24)' },
            { value: 'heroicons-outline', label: 'Outline (20)' }
        ],
        'tabler': [
            { value: 'tabler', label: 'Default' }
        ],
        'carbon': [
            { value: 'carbon', label: 'Default' }
        ],
        'ri': [
            { value: 'ri', label: 'Default (includes line/fill)' }
        ],
        'bi': [
            { value: 'bi', label: 'Default' }
        ],
        'feather': [
            { value: 'feather', label: 'Default' }
        ],
        'ion': [
            { value: 'ion', label: 'Default (includes outline/sharp/filled)' }
        ]
    };

    // State
    let currentPrefix = '';
    let importQueueList = []; // Array of { name, svg, displayName }
    let iconCache = {};

    // Icon Set Selection
    iconSetSelect.onchange = () => {
        const setKey = iconSetSelect.value;
        const styles = iconSetStyles[setKey] || [];

        iconStyleSelect.innerHTML = '';
        styles.forEach(style => {
            const opt = document.createElement('option');
            opt.value = style.value;
            opt.textContent = style.label;
            iconStyleSelect.appendChild(opt);
        });

        iconStyleSelect.disabled = false;
        searchQuery.disabled = false;
        searchBtn.disabled = false;

        currentPrefix = styles[0]?.value || setKey;
        showPlaceholder('Search for icons in this set');
    };

    iconStyleSelect.onchange = () => {
        currentPrefix = iconStyleSelect.value;
    };

    // Search icons
    searchBtn.onclick = async () => {
        const query = searchQuery.value.trim();
        if (!query || !currentPrefix) {
            showPlaceholder('Enter a search term');
            return;
        }

        showLoading();

        try {
            const url = `${ICONIFY_API}/search?query=${encodeURIComponent(query)}&prefix=${currentPrefix}&limit=60`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.icons && data.icons.length > 0) {
                await renderIcons(data.icons);
            } else {
                showPlaceholder('No icons found. Try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            showPlaceholder('Error searching icons. Check your connection.');
        }
    };

    // Enter key to search
    searchQuery.onkeypress = (e) => {
        if (e.key === 'Enter' && !searchBtn.disabled) {
            searchBtn.click();
        }
    };

    function showLoading() {
        resultsContainer.innerHTML = '<div class="icon-loading">Searching</div>';
    }

    function showPlaceholder(text) {
        resultsContainer.innerHTML = `<div class="icon-placeholder"><span>${text}</span></div>`;
    }

    async function renderIcons(icons) {
        resultsContainer.innerHTML = '';

        // First, render all placeholders immediately for instant feedback
        const iconElements = icons.map(iconName => {
            const nameParts = iconName.split(':');
            const displayName = nameParts.length > 1 ? nameParts[1] : nameParts[0];

            const iconItem = document.createElement('div');
            iconItem.className = 'icon-item';
            iconItem.dataset.icon = iconName;
            iconItem.title = iconName;

            // Check if already in queue
            if (importQueueList.some(q => q.name === iconName)) {
                iconItem.classList.add('in-queue');
            }

            // Show loading placeholder
            iconItem.innerHTML = `
                <div class="icon-skeleton"></div>
                <span class="icon-name">${displayName}</span>
            `;

            iconItem.onclick = () => addToQueue(iconName, displayName, iconItem);
            resultsContainer.appendChild(iconItem);

            return { iconName, displayName, element: iconItem };
        });

        // Now fetch all SVGs in parallel (in batches of 10 for performance)
        const batchSize = 10;
        for (let i = 0; i < iconElements.length; i += batchSize) {
            const batch = iconElements.slice(i, i + batchSize);

            await Promise.all(batch.map(async ({ iconName, displayName, element }) => {
                try {
                    // Check cache first
                    if (iconCache[iconName]) {
                        element.innerHTML = `
                            ${iconCache[iconName]}
                            <span class="icon-name">${displayName}</span>
                        `;
                        return;
                    }

                    const svgUrl = `${ICONIFY_API}/${iconName}.svg?height=24`;
                    const svgResponse = await fetch(svgUrl);
                    const svgText = await svgResponse.text();

                    iconCache[iconName] = svgText;

                    element.innerHTML = `
                        ${svgText}
                        <span class="icon-name">${displayName}</span>
                    `;
                } catch (e) {
                    element.innerHTML = `
                        <span style="font-size: 20px; color: var(--text-tertiary);">?</span>
                        <span class="icon-name">${displayName}</span>
                    `;
                }
            }));
        }
    }

    function addToQueue(iconName, displayName, element) {
        // Check if already in queue
        const existingIndex = importQueueList.findIndex(q => q.name === iconName);
        if (existingIndex !== -1) {
            // Remove from queue
            importQueueList.splice(existingIndex, 1);
            element.classList.remove('in-queue');
        } else {
            // Add to queue
            const svg = iconCache[iconName] || '';
            importQueueList.push({ name: iconName, displayName, svg });
            element.classList.add('in-queue');
        }

        renderQueue();
    }

    function renderQueue() {
        if (importQueueList.length === 0) {
            importQueue.innerHTML = '<div class="queue-placeholder"><span>Click icons above to add them here</span></div>';
            queueCountBadge.style.display = 'none';
            clearQueueBtn.disabled = true;
            importBtn.disabled = true;
            return;
        }

        queueCountBadge.textContent = importQueueList.length;
        queueCountBadge.style.display = 'inline-flex';
        clearQueueBtn.disabled = false;
        importBtn.disabled = false;

        importQueue.innerHTML = '';
        importQueueList.forEach((item, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item';
            queueItem.title = `Click to remove: ${item.name}`;

            const svgHtml = item.svg || '<span>?</span>';
            queueItem.innerHTML = `
                ${svgHtml}
                <span>${item.displayName}</span>
                <span class="remove-icon">✕</span>
            `;

            queueItem.onclick = () => {
                importQueueList.splice(index, 1);
                // Update the grid item if visible
                const gridItem = resultsContainer.querySelector(`[data-icon="${item.name}"]`);
                if (gridItem) gridItem.classList.remove('in-queue');
                renderQueue();
            };

            importQueue.appendChild(queueItem);
        });
    }

    // Clear Queue
    clearQueueBtn.onclick = () => {
        importQueueList = [];
        document.querySelectorAll('.icon-item.in-queue').forEach(el => {
            el.classList.remove('in-queue');
        });
        renderQueue();
    };

    // Import icons
    importBtn.onclick = async () => {
        if (importQueueList.length === 0) return;

        const progress = document.getElementById('icons-progress');
        const progressFill = progress.querySelector('.progress-fill');
        const progressText = progress.querySelector('.progress-text');

        progress.style.display = 'block';
        importBtn.disabled = true;

        const iconsToImport = [];
        const total = importQueueList.length;
        let fetched = 0;

        progressText.textContent = 'Preparing icons...';

        // Fetch full-size SVGs for any missing
        for (const item of importQueueList) {
            try {
                let svg = item.svg;
                if (!svg) {
                    const size = iconSize.value;
                    const svgUrl = `${ICONIFY_API}/${item.name}.svg?height=${size}`;
                    const response = await fetch(svgUrl);
                    svg = await response.text();
                }

                iconsToImport.push({
                    name: item.name,
                    svg: svg
                });

                fetched++;
                progressFill.style.width = `${Math.round((fetched / total) * 50)}%`;
                progressText.textContent = `Fetching ${fetched}/${total}...`;
            } catch (error) {
                console.error(`Error fetching ${item.name}:`, error);
            }
        }

        // Send to plugin
        progressText.textContent = 'Creating components...';
        progressFill.style.width = '60%';

        parent.postMessage({
            pluginMessage: {
                type: 'import-icons',
                icons: iconsToImport,
                options: {
                    size: parseInt(iconSize.value),
                    prefix: iconPrefix.value.trim(),
                    asComponents: asComponents.checked,
                    addColorProperty: true
                }
            }
        }, '*');
    };

    // Listen for completion
    window.addEventListener('message', (event) => {
        const msg = event.data.pluginMessage;
        if (!msg) return;

        if (msg.type === 'icons-import-complete') {
            const progress = document.getElementById('icons-progress');
            progress.style.display = 'none';
            importBtn.disabled = false;

            // Clear queue after successful import
            importQueueList = [];
            document.querySelectorAll('.icon-item.in-queue').forEach(el => {
                el.classList.remove('in-queue');
            });
            renderQueue();
        } else if (msg.type === 'icons-import-progress') {
            const progress = document.getElementById('icons-progress');
            const progressFill = progress.querySelector('.progress-fill');
            const progressText = progress.querySelector('.progress-text');
            progressFill.style.width = `${msg.percent}%`;
            progressText.textContent = msg.message;
        }
    });

    // Initialize
    renderQueue();
})();
