// Icons Section - Unified Icon Library
(function () {
    'use strict';

    // Elements
    const searchQuery = document.getElementById('icon-search-query');
    const searchBtn = document.getElementById('search-icons-btn');
    const resultsContainer = document.getElementById('icon-results');
    const libraryContainer = document.getElementById('icon-library');
    const libraryCountBadge = document.getElementById('library-count-badge');
    const pendingCountBadge = document.getElementById('pending-count-badge');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const clearPendingBtn = document.getElementById('clear-pending-btn');
    const importBtn = document.getElementById('import-icons-btn');
    const iconSize = document.getElementById('icon-size');
    const iconPrefix = document.getElementById('icon-prefix');
    const asComponents = document.getElementById('icon-as-components');
    const scanLibraryBtn = document.getElementById('scan-library-btn');

    if (!searchQuery) return;

    // Iconify API
    const ICONIFY_API = 'https://api.iconify.design';
    const ICON_PREFIX = 'mdi';

    // State
    let existingIcons = []; // Array of { id, name, displayName }
    let pendingIcons = [];  // Array of { name, svg, displayName }
    let selectedForDelete = new Set();
    let libraryFrameId = null;
    let iconCache = {};

    // ========================================
    // Library Management
    // ========================================

    scanLibraryBtn.onclick = () => {
        const prefix = iconPrefix.value.trim() || 'Icon/';
        parent.postMessage({
            pluginMessage: {
                type: 'scan-existing-icons',
                prefix: prefix
            }
        }, '*');
    };

    async function renderLibrary() {
        const totalCount = existingIcons.length + pendingIcons.length;

        if (totalCount === 0) {
            libraryContainer.innerHTML = '<div class="library-placeholder"><span>Click "Sync" to load existing icons or search & add new ones</span></div>';
            libraryCountBadge.style.display = 'none';
            pendingCountBadge.style.display = 'none';
            deleteSelectedBtn.disabled = true;
            clearPendingBtn.disabled = true;
            importBtn.disabled = true;
            return;
        }

        libraryCountBadge.textContent = totalCount;
        libraryCountBadge.style.display = 'inline-flex';

        clearPendingBtn.disabled = pendingIcons.length === 0;
        importBtn.disabled = pendingIcons.length === 0;

        if (pendingIcons.length > 0) {
            pendingCountBadge.textContent = pendingIcons.length;
            pendingCountBadge.style.display = 'inline-flex';
        } else {
            pendingCountBadge.style.display = 'none';
        }

        libraryContainer.innerHTML = '';

        // Render existing icons first
        const existingElements = existingIcons.map(icon => {
            const iconEl = document.createElement('div');
            iconEl.className = 'library-icon existing';
            iconEl.dataset.id = icon.id;
            iconEl.dataset.name = icon.displayName;
            iconEl.dataset.type = 'existing';
            iconEl.title = `${icon.name} (in library)`;

            if (selectedForDelete.has(icon.id)) {
                iconEl.classList.add('selected-for-delete');
            }

            iconEl.innerHTML = `
                <div class="status-dot"></div>
                <div class="icon-skeleton"></div>
                <span class="icon-name">${icon.displayName}</span>
            `;

            iconEl.onclick = () => toggleDeleteSelection(icon.id, iconEl);
            libraryContainer.appendChild(iconEl);

            return { icon, element: iconEl };
        });

        // Render pending icons
        pendingIcons.forEach(icon => {
            const iconEl = document.createElement('div');
            iconEl.className = 'library-icon pending';
            iconEl.dataset.name = icon.name;
            iconEl.dataset.type = 'pending';
            iconEl.title = `${icon.displayName} (pending import)`;

            const svgHtml = icon.svg || `<span class="icon-char">${icon.displayName.charAt(0).toUpperCase()}</span>`;
            iconEl.innerHTML = `
                <div class="status-dot"></div>
                ${svgHtml}
                <span class="icon-name">${icon.displayName}</span>
            `;

            iconEl.onclick = () => removePendingIcon(icon.name);
            libraryContainer.appendChild(iconEl);
        });

        updateDeleteButton();

        // Fetch SVGs for existing icons in background
        const batchSize = 10;
        for (let i = 0; i < existingElements.length; i += batchSize) {
            const batch = existingElements.slice(i, i + batchSize);

            await Promise.all(batch.map(async ({ icon, element }) => {
                try {
                    const mdiName = icon.displayName.replace(/_/g, '-');
                    const cacheKey = `mdi:${mdiName}`;

                    if (iconCache[cacheKey]) {
                        element.innerHTML = `
                            <div class="status-dot"></div>
                            ${iconCache[cacheKey]}
                            <span class="icon-name">${icon.displayName}</span>
                        `;
                        return;
                    }

                    const svgUrl = `${ICONIFY_API}/mdi/${mdiName}.svg?height=22`;
                    const svgResponse = await fetch(svgUrl);

                    if (svgResponse.ok) {
                        const svgText = await svgResponse.text();
                        iconCache[cacheKey] = svgText;
                        element.innerHTML = `
                            <div class="status-dot"></div>
                            ${svgText}
                            <span class="icon-name">${icon.displayName}</span>
                        `;
                    } else {
                        element.innerHTML = `
                            <div class="status-dot"></div>
                            <span class="icon-char">${icon.displayName.charAt(0).toUpperCase()}</span>
                            <span class="icon-name">${icon.displayName}</span>
                        `;
                    }
                } catch (e) {
                    element.innerHTML = `
                        <div class="status-dot"></div>
                        <span class="icon-char">${icon.displayName.charAt(0).toUpperCase()}</span>
                        <span class="icon-name">${icon.displayName}</span>
                    `;
                }
            }));
        }
    }

    function toggleDeleteSelection(id, element) {
        if (selectedForDelete.has(id)) {
            selectedForDelete.delete(id);
            element.classList.remove('selected-for-delete');
        } else {
            selectedForDelete.add(id);
            element.classList.add('selected-for-delete');
        }
        updateDeleteButton();
    }

    function updateDeleteButton() {
        if (selectedForDelete.size > 0) {
            deleteSelectedBtn.disabled = false;
            deleteSelectedBtn.innerHTML = `
                <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></span> Delete ${selectedForDelete.size}
            `;
        } else {
            deleteSelectedBtn.disabled = true;
            deleteSelectedBtn.innerHTML = `
                <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></span> Delete Selected
            `;
        }
    }

    function removePendingIcon(name) {
        pendingIcons = pendingIcons.filter(icon => icon.name !== name);
        // Update search results UI
        const gridItem = resultsContainer.querySelector(`[data-icon="${name}"]`);
        if (gridItem) gridItem.classList.remove('in-queue');
        renderLibrary();
    }

    deleteSelectedBtn.onclick = () => {
        if (selectedForDelete.size === 0) return;

        parent.postMessage({
            pluginMessage: {
                type: 'delete-icons',
                iconIds: Array.from(selectedForDelete)
            }
        }, '*');
    };

    clearPendingBtn.onclick = () => {
        pendingIcons = [];
        document.querySelectorAll('.icon-item.in-queue').forEach(el => {
            el.classList.remove('in-queue');
        });
        renderLibrary();
    };

    // ========================================
    // Search Icons
    // ========================================

    searchBtn.onclick = async () => {
        const query = searchQuery.value.trim();
        if (!query) {
            showPlaceholder('Enter a search term');
            return;
        }

        showLoading();

        try {
            const url = `${ICONIFY_API}/search?query=${encodeURIComponent(query)}&prefix=${ICON_PREFIX}&limit=48`;
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

    searchQuery.onkeypress = (e) => {
        if (e.key === 'Enter') {
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

        const iconElements = icons.map(iconName => {
            const nameParts = iconName.split(':');
            const displayName = nameParts.length > 1 ? nameParts[1] : nameParts[0];

            const iconItem = document.createElement('div');
            iconItem.className = 'icon-item';
            iconItem.dataset.icon = iconName;
            iconItem.title = iconName;

            // Check if already pending or existing
            if (pendingIcons.some(q => q.name === iconName)) {
                iconItem.classList.add('in-queue');
            }

            iconItem.innerHTML = `
                <div class="icon-skeleton"></div>
                <span class="icon-name">${displayName}</span>
            `;

            iconItem.onclick = () => addToQueue(iconName, displayName, iconItem);
            resultsContainer.appendChild(iconItem);

            return { iconName, displayName, element: iconItem };
        });

        // Fetch SVGs in parallel batches
        const batchSize = 10;
        for (let i = 0; i < iconElements.length; i += batchSize) {
            const batch = iconElements.slice(i, i + batchSize);

            await Promise.all(batch.map(async ({ iconName, displayName, element }) => {
                try {
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

    // ========================================
    // Add to Pending Queue
    // ========================================

    function addToQueue(iconName, displayName, element) {
        const existingIndex = pendingIcons.findIndex(q => q.name === iconName);
        if (existingIndex !== -1) {
            pendingIcons.splice(existingIndex, 1);
            element.classList.remove('in-queue');
        } else {
            const svg = iconCache[iconName] || '';
            pendingIcons.push({ name: iconName, displayName, svg });
            element.classList.add('in-queue');
        }

        renderLibrary();
    }

    // ========================================
    // Import Icons
    // ========================================

    importBtn.onclick = async () => {
        if (pendingIcons.length === 0) return;

        const progress = document.getElementById('icons-progress');
        const progressFill = progress.querySelector('.progress-fill');
        const progressText = progress.querySelector('.progress-text');

        progress.style.display = 'block';
        importBtn.disabled = true;

        const iconsToImport = [];
        const total = pendingIcons.length;
        let fetched = 0;

        progressText.textContent = 'Preparing icons...';

        for (const item of pendingIcons) {
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

        progressText.textContent = 'Adding to library...';
        progressFill.style.width = '60%';

        parent.postMessage({
            pluginMessage: {
                type: 'add-icons-to-library',
                icons: iconsToImport,
                options: {
                    size: parseInt(iconSize.value),
                    prefix: iconPrefix.value.trim() || 'Icon/',
                    asComponents: asComponents.checked,
                    addColorProperty: true
                },
                libraryFrameId: libraryFrameId
            }
        }, '*');
    };

    // ========================================
    // Message Handler
    // ========================================

    window.addEventListener('message', (event) => {
        const msg = event.data.pluginMessage;
        if (!msg) return;

        switch (msg.type) {
            case 'existing-icons-loaded':
                existingIcons = msg.icons || [];
                libraryFrameId = msg.libraryFrameId;
                selectedForDelete.clear();
                renderLibrary();
                break;

            case 'icons-deleted':
                existingIcons = existingIcons.filter(icon => !selectedForDelete.has(icon.id));
                selectedForDelete.clear();
                renderLibrary();
                break;

            case 'icons-import-complete':
                const progress = document.getElementById('icons-progress');
                progress.style.display = 'none';
                importBtn.disabled = false;

                pendingIcons = [];
                document.querySelectorAll('.icon-item.in-queue').forEach(el => {
                    el.classList.remove('in-queue');
                });

                // Rescan library to show new icons
                setTimeout(() => {
                    scanLibraryBtn.click();
                }, 500);
                break;

            case 'icons-import-progress':
                const progressEl = document.getElementById('icons-progress');
                const progressFillEl = progressEl.querySelector('.progress-fill');
                const progressTextEl = progressEl.querySelector('.progress-text');
                progressFillEl.style.width = `${msg.percent}%`;
                progressTextEl.textContent = msg.message;
                break;
        }
    });

    // Initialize
    renderLibrary();
})();
