#!/usr/bin/env node

/**
 * Build script for PirulinoColorete Figma Plugin
 * Combines modular HTML/CSS/JS files into a single ui.html
 */

const fs = require('fs');
const path = require('path');

const SECTIONS_DIR = path.join(__dirname, 'sections');
const STYLES_DIR = path.join(__dirname, 'styles');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');
const OUTPUT_FILE = path.join(__dirname, 'ui.html');

console.log('🔨 Building PirulinoColorete UI...\n');

// Read all section files
const sections = [
    'colors',
    'measures',
    'typography',
    'aliases',
    'theme',
    'collections'
];

let sectionsHTML = '';
sections.forEach(section => {
    const filePath = path.join(SECTIONS_DIR, `${section}.html`);
    if (fs.existsSync(filePath)) {
        sectionsHTML += fs.readFileSync(filePath, 'utf8') + '\n';
        console.log(`✅ Loaded section: ${section}.html`);
    } else {
        console.warn(`⚠️  Missing section: ${section}.html`);
    }
});

// Read CSS files
const cssFiles = ['layout.css', 'components.css', 'custom-select.css'];
let stylesCSS = '';
cssFiles.forEach(file => {
    const filePath = path.join(STYLES_DIR, file);
    if (fs.existsSync(filePath)) {
        stylesCSS += fs.readFileSync(filePath, 'utf8') + '\n';
        console.log(`✅ Loaded style: ${file}`);
    } else {
        console.warn(`⚠️  Missing style: ${file}`);
    }
});

// Read JS files
const scriptFiles = [
    'common.js', // Global utilities and message routing
    'colors.js',
    'measures.js',
    'typography.js',
    'aliases.js',
    'theme.js',
    'collections.js',
    'navigation.js' // Navigation logic
];

let scriptsJS = '';
scriptFiles.forEach(file => {
    const filePath = path.join(SCRIPTS_DIR, file);
    if (fs.existsSync(filePath)) {
        scriptsJS += `/* --- ${file} --- */\n` + fs.readFileSync(filePath, 'utf8') + '\n\n';
        console.log(`✅ Loaded script: ${file}`);
    } else {
        console.warn(`⚠️  Missing script: ${file}`);
    }
});

// Build the final HTML
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
                <span class="nav-item-icon">🎨</span>
                <span class="nav-item-label">Colors</span>
            </div>
            <div class="nav-item" data-section="measures">
                <span class="nav-item-icon">📏</span>
                <span class="nav-item-label">Measures</span>
            </div>
            <div class="nav-item" data-section="typography">
                <span class="nav-item-icon">✍️</span>
                <span class="nav-item-label">Typography</span>
            </div>
            <div class="nav-item" data-section="aliases">
                <span class="nav-item-icon">🔗</span>
                <span class="nav-item-label">Aliases</span>
            </div>
            <div class="nav-item" data-section="theme">
                <span class="nav-item-icon">🌓</span>
                <span class="nav-item-label">Theme</span>
            </div>
            <div class="nav-item" data-section="collections">
                <span class="nav-item-icon">📚</span>
                <span class="nav-item-label">Documentation</span>
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

// Write the output file
fs.writeFileSync(OUTPUT_FILE, finalHTML, 'utf8');
console.log(`\n✨ Build complete! Output: ${OUTPUT_FILE}`);
console.log(`📦 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB\n`);
