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
    const injectedIcons = new Set();
    let iconStyleEl = null;

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

    // Load base CSS (structural only, ~8.5 KiB - almost 100% used)
    loadCSS('fontawesome-base.css');

    // Icon map: loaded async from icon-map.js
    let iconMap = null;
    let iconMapPromise = null;

    function loadIconMap() {
        if (iconMap) return Promise.resolve();
        if (iconMapPromise) return iconMapPromise;
        iconMapPromise = fetch(baseUrl.replace('css/', '') + 'icon-map.js')
            .then(r => r.text())
            .then(text => {
                // Execute to get _IM variable
                const fn = new Function(text + '; return _IM;');
                iconMap = fn();
            })
            .catch(() => {
                // Fallback: load full fontawesome.css if icon map fails
                loadCSS('fontawesome.css');
                iconMap = {};
            });
        return iconMapPromise;
    }

    function getOrCreateStyleEl() {
        if (!iconStyleEl) {
            iconStyleEl = document.createElement('style');
            iconStyleEl.id = 'fa-icon-defs';
            document.head.appendChild(iconStyleEl);
        }
        return iconStyleEl;
    }

    function injectIconRules(classes) {
        if (!iconMap) return;
        const el = getOrCreateStyleEl();
        let newRules = '';
        classes.forEach(cls => {
            if (!injectedIcons.has(cls) && iconMap[cls]) {
                newRules += '.' + cls + '{--fa:' + iconMap[cls] + '}';
                injectedIcons.add(cls);
            }
        });
        if (newRules) {
            el.textContent += newRules;
        }
    }

    function scanIcons() {
        const icons = document.querySelectorAll('[class*="fa-"], [class^="fa"]');
        const neededIconClasses = new Set();

        icons.forEach(icon => {
            const classes = Array.from(icon.classList);
            // Load style-specific CSS files
            Object.keys(styles).forEach(prefix => {
                if (classes.includes(prefix)) {
                    loadCSS(styles[prefix]);
                }
            });
            // Collect icon name classes (fa-xxx)
            classes.forEach(cls => {
                if (cls.startsWith('fa-') && !styles[cls] && !injectedIcons.has(cls)) {
                    neededIconClasses.add(cls);
                }
            });
        });

        if (neededIconClasses.size > 0) {
            loadIconMap().then(() => injectIconRules(neededIconClasses));
        }
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
