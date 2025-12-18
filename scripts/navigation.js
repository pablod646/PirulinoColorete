// Navigation and Section Management
const sectionTitles = {
    'scale': { title: 'Color Palettes', desc: 'Generate color scales for your design system.' },
    'measures': { title: 'Measure Generator', desc: 'Create spacing and sizing variables.' },
    'typography': { title: 'Typography System', desc: 'Define font families, sizes, and weights.' },
    'aliases': { title: 'Responsive Semantics', desc: 'Generate semantic tokens that adapt to viewport size.' },
    'theme': { title: 'Theme Generator', desc: 'Create intelligent Light/Dark themes from your color primitives.' },
    'icons': { title: 'Icon Library', desc: 'Search and import icons from Iconify (100,000+ icons).' },
    'atoms': { title: 'Atomic Components', desc: 'Generate Buttons, Inputs, and Badges using your design tokens.' },
    'collections': { title: 'Documentation', desc: 'View and manage your variable collections.' },
    'devtools': { title: "Dev's Tools", desc: 'Export your design tokens for developers in multiple formats.' }
};

function initNavigation() {
    
    const navItems = document.querySelectorAll('.nav-item');

    if (navItems.length === 0) {
        console.warn('⚠️ No nav items found. DOM might not be ready.');
        return;
    }

    navItems.forEach(navItem => {
        navItem.addEventListener('click', () => {
            const section = navItem.dataset.section;
            

            // Remove active class from all nav items and sections
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));

            // Add active class to clicked nav item and corresponding section
            navItem.classList.add('active');
            const sectionElement = document.getElementById('section-' + section);
            if (sectionElement) {
                sectionElement.classList.add('active');
            } else {
                console.error(`❌ Section element #section-${section} not found!`);
            }

            // Update page title and description
            const titleInfo = sectionTitles[section];
            if (titleInfo) {
                const titleEl = document.getElementById('page-title');
                const descEl = document.getElementById('page-description');
                if (titleEl) titleEl.textContent = titleInfo.title;
                if (descEl) descEl.textContent = titleInfo.desc;
            }

            // Load collections when entering sections that require them
            if (['theme', 'measures', 'scale', 'typography', 'aliases', 'collections', 'devtools', 'atoms'].includes(section)) {
                
                parent.postMessage({ pluginMessage: { type: 'load-collections' } }, '*');
            }
        });
    });
    
}

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}
