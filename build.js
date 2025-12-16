#!/usr/bin/env node

/**
 * Build script for PirulinoColorete Figma Plugin v2.0
 * Combines modular HTML/CSS/JS files into a single ui.html
 * Supports both legacy and new UI structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories
const ROOT_DIR = __dirname;
const SRC_UI_DIR = path.join(ROOT_DIR, 'src', 'ui');
const LEGACY_SECTIONS_DIR = path.join(ROOT_DIR, 'sections');
const LEGACY_STYLES_DIR = path.join(ROOT_DIR, 'styles');
const LEGACY_SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts');
const OUTPUT_FILE = path.join(ROOT_DIR, 'ui.html');

// Configuration
const USE_NEW_UI = process.argv.includes('--new-ui');
const isWatch = process.argv.includes('--watch');

console.log('\n🔨 Building PirulinoColorete UI...\n');
console.log(`📦 Mode: ${USE_NEW_UI ? 'New Premium UI' : 'Legacy UI'}`);

// ============================================
// Style Loading
// ============================================
function loadStyles() {
    let stylesCSS = '';

    if (USE_NEW_UI) {
        // New premium styles
        const newStyleFiles = [
            path.join(SRC_UI_DIR, 'styles', 'design-tokens.css'),
            path.join(SRC_UI_DIR, 'styles', 'layout.css'),
            path.join(SRC_UI_DIR, 'styles', 'components.css'),
            path.join(SRC_UI_DIR, 'styles', 'icons.css'), // Icon system
            path.join(LEGACY_STYLES_DIR, 'custom-select.css'), // Include custom select from legacy
        ];

        newStyleFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                stylesCSS += fs.readFileSync(filePath, 'utf8') + '\n';
                console.log(`✅ Loaded style: ${path.basename(filePath)}`);
            } else {
                console.warn(`⚠️  Missing style: ${filePath}`);
            }
        });
    } else {
        // Legacy styles
        const cssFiles = ['layout.css', 'components.css', 'custom-select.css'];
        cssFiles.forEach(file => {
            const filePath = path.join(LEGACY_STYLES_DIR, file);
            if (fs.existsSync(filePath)) {
                stylesCSS += fs.readFileSync(filePath, 'utf8') + '\n';
                console.log(`✅ Loaded style: ${file}`);
            } else {
                console.warn(`⚠️  Missing style: ${file}`);
            }
        });
    }

    return stylesCSS;
}

// ============================================
// Section Loading
// ============================================
function loadSections() {
    const sections = ['colors', 'measures', 'typography', 'aliases', 'theme', 'collections', 'devtools'];
    let sectionsHTML = '';

    const sectionsDir = USE_NEW_UI
        ? path.join(SRC_UI_DIR, 'sections')
        : LEGACY_SECTIONS_DIR;

    sections.forEach(section => {
        const filePath = path.join(sectionsDir, `${section}.html`);

        // Fallback to legacy if new file doesn't exist
        let actualPath = filePath;
        if (USE_NEW_UI && !fs.existsSync(filePath)) {
            actualPath = path.join(LEGACY_SECTIONS_DIR, `${section}.html`);
        }

        if (fs.existsSync(actualPath)) {
            sectionsHTML += fs.readFileSync(actualPath, 'utf8') + '\n';
            console.log(`✅ Loaded section: ${section}.html`);
        } else {
            console.warn(`⚠️  Missing section: ${section}.html`);
        }
    });

    return sectionsHTML;
}

// ============================================
// Script Loading
// ============================================
function loadScripts() {
    const scriptFiles = [
        'common.js',
        'colors.js',
        'measures.js',
        'typography.js',
        'aliases.js',
        'theme.js',
        'collections.js',
        'devtools.js',
        'navigation.js'
    ];

    let scriptsJS = '';

    scriptFiles.forEach(file => {
        const filePath = path.join(LEGACY_SCRIPTS_DIR, file);
        if (fs.existsSync(filePath)) {
            scriptsJS += `/* --- ${file} --- */\n` + fs.readFileSync(filePath, 'utf8') + '\n\n';
            console.log(`✅ Loaded script: ${file}`);
        } else {
            console.warn(`⚠️  Missing script: ${file}`);
        }
    });

    return scriptsJS;
}

// ============================================
// Build HTML
// ============================================
function buildHTML() {
    const stylesCSS = loadStyles();
    const sectionsHTML = loadSections();
    const scriptsJS = loadScripts();

    const finalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PirulinoColorete</title>
    <style>
${stylesCSS}
    </style>
</head>
<body>
    <!-- Sidebar Navigation -->
    <div class="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">PirulinoColorete</div>
            <div class="sidebar-subtitle">DESIGN ARCHITECT</div>
        </div>
        <nav class="sidebar-nav">
            <div class="nav-item active" data-section="scale">
                <span class="nav-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg></span>
                <span class="nav-item-label">Colors</span>
            </div>
            <div class="nav-item" data-section="measures">
                <span class="nav-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg></span>
                <span class="nav-item-label">Measures</span>
            </div>
            <div class="nav-item" data-section="typography">
                <span class="nav-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg></span>
                <span class="nav-item-label">Typography</span>
            </div>
            <div class="nav-item" data-section="aliases">
                <span class="nav-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span>
                <span class="nav-item-label">Aliases</span>
            </div>
            <div class="nav-item" data-section="theme">
                <span class="nav-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg></span>
                <span class="nav-item-label">Theme</span>
            </div>
            <div class="nav-item" data-section="collections">
                <span class="nav-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg></span>
                <span class="nav-item-label">Documentation</span>
            </div>
            <div class="nav-item" data-section="devtools">
                <span class="nav-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
                <span class="nav-item-label">Dev's Tools</span>
            </div>
        </nav>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
        <div class="content-header">
            <h1 id="page-title">Color Palettes</h1>
            <p id="page-description">Generate color scales for your design system.</p>
        </div>
        <div class="content-body">
            <div class="content-container">
                <!-- Sections -->
${sectionsHTML}
            </div>
        </div>
    </div>

    <script>
${scriptsJS}

        // Initialize navigation immediately
        initNavigation();
    </script>
</body>
</html>`;

    return finalHTML;
}

// ============================================
// Main Build
// ============================================
function build() {
    try {
        const html = buildHTML();
        fs.writeFileSync(OUTPUT_FILE, html, 'utf8');

        const stats = fs.statSync(OUTPUT_FILE);
        console.log(`\n✨ Build complete! Output: ${OUTPUT_FILE}`);
        console.log(`📦 File size: ${(stats.size / 1024).toFixed(2)} KB\n`);
    } catch (err) {
        console.error('❌ Build failed:', err.message);
        process.exit(1);
    }
}

// ============================================
// Watch Mode
// ============================================
if (isWatch) {
    console.log('👀 Watching for changes...\n');

    const watchDirs = [
        LEGACY_SECTIONS_DIR,
        LEGACY_STYLES_DIR,
        LEGACY_SCRIPTS_DIR,
        path.join(SRC_UI_DIR, 'sections'),
        path.join(SRC_UI_DIR, 'styles'),
    ];

    watchDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.watch(dir, { recursive: true }, (eventType, filename) => {
                console.log(`\n🔄 Change detected: ${filename}`);
                build();
            });
        }
    });
}

// Initial build
build();
