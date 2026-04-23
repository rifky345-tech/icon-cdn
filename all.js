(function() {
    const scriptSrc = document.currentScript ? document.currentScript.src : 'https://icon-cdn.pages.dev/all.js';
    const baseUrl = scriptSrc.replace('all.js', 'css/');
    
    const styles = {
        'fa-solid': 'solid.css', 'fas': 'solid.css',
        'fa-regular': 'regular.css', 'far': 'regular.css',
        'fa-light': 'light.css', 'fal': 'light.css',
        'fa-thin': 'thin.css', 'fat': 'thin.css',
        'fa-duotone': 'duotone.css', 'fad': 'duotone.css',
        'fa-brands': 'brands.css', 'fab': 'brands.css',
        'fa-sharp-solid': 'sharp-solid.css',
        'fa-sharp-regular': 'sharp-regular.css',
        'fa-sharp-light': 'sharp-light.css',
        'fa-sharp-thin': 'sharp-thin.css',
        'fa-sharp-duotone-solid': 'sharp-duotone-solid.css',
        'fa-sharp-duotone-regular': 'sharp-duotone-regular.css',
        'fa-sharp-duotone-light': 'sharp-duotone-light.css',
        'fa-sharp-duotone-thin': 'sharp-duotone-thin.css',
        'fa-semibold': 'utility-semibold.css',
        'fa-utility': 'utility-semibold.css',
        'fa-utility-fill': 'utility-fill-semibold.css',
        'fa-utility-duo': 'utility-duo-semibold.css',
        'fa-jelly': 'jelly-regular.css',
        'fa-jelly-fill': 'jelly-fill-regular.css',
        'fa-jelly-duo': 'jelly-duo-regular.css',
        'fa-chisel': 'chisel-regular.css',
        'fa-etch': 'etch-solid.css',
        'fa-notdog': 'notdog-solid.css',
        'fa-notdog-duo': 'notdog-duo-solid.css',
        'fa-slab': 'slab-regular.css',
        'fa-slab-press': 'slab-press-regular.css',
        'fa-whiteboard': 'whiteboard-semibold.css',
        'fa-graphite': 'graphite-thin.css',
        'fa-thumbprint': 'thumbprint-light.css'
    };

    const loaded = new Set();

    function loadCSS(file) {
        if (loaded.has(file)) return;
        const href = baseUrl + file;
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
            loaded.add(file);
        }
    }

    loadCSS('fontawesome.css');

    function scanIcons() {
        const icons = document.querySelectorAll('[class*="fa-"], [class^="fa"]');
        icons.forEach(icon => {
            const classes = Array.from(icon.classList);
            Object.keys(styles).forEach(prefix => {
                if (classes.includes(prefix)) {
                    loadCSS(styles[prefix]);
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scanIcons);
    } else {
        scanIcons();
    }

    let debounceTimer;
    const observer = new MutationObserver((mutations) => {
        let hasNewNodes = false;
        for (let i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                hasNewNodes = true;
                break;
            }
        }
        if (hasNewNodes) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(scanIcons, 300); 
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
