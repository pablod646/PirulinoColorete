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
    const ICON_PREFIX = 'material-symbols'; // Material Symbols for rounded variants

    // Essential Icons - Suggested for new projects (Material Symbols Rounded - outlined)
    const ESSENTIAL_ICONS = [
        // Navigation
        'material-symbols:menu-rounded', 'material-symbols:close-rounded',
        'material-symbols:arrow-back-rounded', 'material-symbols:arrow-forward-rounded',
        'material-symbols:arrow-upward-rounded', 'material-symbols:arrow-downward-rounded',
        'material-symbols:chevron-left-rounded', 'material-symbols:chevron-right-rounded',
        'material-symbols:expand-less-rounded', 'material-symbols:expand-more-rounded',
        'material-symbols:home-outline-rounded', 'material-symbols:more-vert', 'material-symbols:more-horiz',

        // Actions
        'material-symbols:add-rounded', 'material-symbols:remove-rounded',
        'material-symbols:edit-outline-rounded', 'material-symbols:delete-outline-rounded',
        'material-symbols:check-rounded', 'material-symbols:cancel-outline-rounded',
        'material-symbols:refresh-rounded', 'material-symbols:download-rounded', 'material-symbols:upload-rounded',
        'material-symbols:share', 'material-symbols:content-copy', 'material-symbols:content-paste',
        'material-symbols:search-rounded', 'material-symbols:filter-alt-outline',
        'material-symbols:sort-rounded', 'material-symbols:tune-rounded',

        // Status & Feedback
        'material-symbols:check-circle-outline-rounded', 'material-symbols:error-outline-rounded',
        'material-symbols:info-outline-rounded', 'material-symbols:help-outline-rounded',
        'material-symbols:progress-activity', 'material-symbols:star-outline-rounded', 'material-symbols:favorite-outline-rounded',

        // User & Account
        'material-symbols:person-outline-rounded', 'material-symbols:account-circle-outline',
        'material-symbols:person-add-outline-rounded', 'material-symbols:group-outline-rounded',
        'material-symbols:login-rounded', 'material-symbols:logout-rounded',
        'material-symbols:settings-outline-rounded', 'material-symbols:notifications-outline-rounded',

        // Content & Media
        'material-symbols:image-outline-rounded', 'material-symbols:photo-camera-outline-rounded',
        'material-symbols:videocam-outline-rounded', 'material-symbols:description-outline-rounded',
        'material-symbols:folder-outline-rounded', 'material-symbols:link-rounded', 'material-symbols:attach-file-rounded',
        'material-symbols:calendar-today-outline-rounded', 'material-symbols:schedule-outline-rounded',

        // Communication
        'material-symbols:mail-outline-rounded', 'material-symbols:call-outline-rounded',
        'material-symbols:chat-bubble-outline-rounded', 'material-symbols:send-outline-rounded',
        'material-symbols:forum-outline-rounded',

        // E-commerce
        'material-symbols:shopping-cart-outline-rounded', 'material-symbols:credit-card-outline',
        'material-symbols:sell-outline', 'material-symbols:percent-rounded',

        // UI Elements
        'material-symbols:visibility-outline-rounded', 'material-symbols:visibility-off-outline-rounded',
        'material-symbols:lock-outline', 'material-symbols:lock-open-outline-rounded',
        'material-symbols:bookmark-outline-rounded', 'material-symbols:flag-outline-rounded',
        'material-symbols:thumb-up-outline-rounded', 'material-symbols:thumb-down-outline-rounded',
        'material-symbols:location-on-outline-rounded', 'material-symbols:language'
    ];

    // State
    let existingIcons = []; // Array of { id, name, displayName }
    let pendingIcons = [];  // Array of { name, svg, displayName }
    let selectedForDelete = new Set();
    let libraryFrameId = null;
    let iconCache = {};
    let hasScanned = false;

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
            if (hasScanned && existingIcons.length === 0) {
                // Show essential icons suggestion
                showEssentialIconsSuggestion();
            } else {
                libraryContainer.innerHTML = '<div class="library-placeholder"><span>Click "Sync" to load existing icons</span></div>';
            }
            libraryCountBadge.style.display = 'none';
            pendingCountBadge.style.display = 'none';
            deleteSelectedBtn.disabled = true;
            clearPendingBtn.disabled = pendingIcons.length === 0;
            importBtn.disabled = pendingIcons.length === 0;
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
                    // Convert display name to API-friendly format
                    const iconName = icon.displayName.replace(/_/g, '-');
                    const cacheKey = `icon:${iconName}`;

                    if (iconCache[cacheKey]) {
                        element.innerHTML = `
                            <div class="status-dot"></div>
                            ${iconCache[cacheKey]}
                            <span class="icon-name">${icon.displayName}</span>
                        `;
                        return;
                    }

                    // Try material-symbols first (with various suffixes)
                    const tryUrls = [
                        `${ICONIFY_API}/material-symbols/${iconName}.svg?height=22`,
                        `${ICONIFY_API}/material-symbols/${iconName}-outline.svg?height=22`,
                        `${ICONIFY_API}/material-symbols/${iconName}-rounded.svg?height=22`,
                        `${ICONIFY_API}/material-symbols/${iconName}-outline-rounded.svg?height=22`,
                        `${ICONIFY_API}/mdi/${iconName}.svg?height=22`
                    ];

                    let svgText = null;
                    for (const url of tryUrls) {
                        try {
                            const response = await fetch(url);
                            if (response.ok) {
                                svgText = await response.text();
                                break;
                            }
                        } catch (e) {
                            // Continue to next URL
                        }
                    }

                    if (svgText) {
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

    // ========================================
    // Essential Icons Suggestion
    // ========================================

    function showEssentialIconsSuggestion() {
        libraryContainer.innerHTML = `
            <div class="essential-icons-prompt">
                <div class="essential-header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54"/>
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54"/>
                    </svg>
                    <span>No icons found! Start with essentials?</span>
                </div>
                <p class="essential-description">
                    We've curated ${ESSENTIAL_ICONS.length} essential icons commonly used in design projects.
                    Click below to add them to your pending list.
                </p>
                <button id="add-essential-icons-btn" class="secondary" style="width: 100%;">
                    <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></span>
                    Add ${ESSENTIAL_ICONS.length} Essential Icons
                </button>
            </div>
        `;

        document.getElementById('add-essential-icons-btn').onclick = addEssentialIcons;
    }

    async function addEssentialIcons() {
        const btn = document.getElementById('add-essential-icons-btn');
        btn.disabled = true;
        btn.innerHTML = `<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></span> Loading...`;

        // Fetch SVGs for essential icons
        const batchSize = 10;
        for (let i = 0; i < ESSENTIAL_ICONS.length; i += batchSize) {
            const batch = ESSENTIAL_ICONS.slice(i, i + batchSize);

            await Promise.all(batch.map(async (iconName) => {
                try {
                    const displayName = iconName.split(':')[1];

                    // Skip if already pending
                    if (pendingIcons.some(p => p.name === iconName)) return;

                    // Check cache
                    if (!iconCache[iconName]) {
                        const svgUrl = `${ICONIFY_API}/${iconName}.svg?height=24`;
                        const svgResponse = await fetch(svgUrl);
                        if (svgResponse.ok) {
                            iconCache[iconName] = await svgResponse.text();
                        }
                    }

                    pendingIcons.push({
                        name: iconName,
                        displayName: displayName,
                        svg: iconCache[iconName] || ''
                    });
                } catch (e) {
                    console.error(`Error loading ${iconName}:`, e);
                }
            }));

            // Update button text with progress
            btn.innerHTML = `<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></span> Loading ${Math.min(i + batchSize, ESSENTIAL_ICONS.length)}/${ESSENTIAL_ICONS.length}...`;
        }

        renderLibrary();
    }

    // ========================================
    // Toggle & Delete
    // ========================================

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
                hasScanned = true;
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

    // Auto-scan on load (detect existing icons automatically)
    function autoScan() {
        const prefix = iconPrefix.value.trim() || 'Icon/';
        parent.postMessage({
            pluginMessage: {
                type: 'scan-existing-icons',
                prefix: prefix
            }
        }, '*');
    }

    // Trigger auto-scan after a short delay to ensure plugin is ready
    setTimeout(autoScan, 300);
})();
