const SCRIPT_URL = document.currentScript ? document.currentScript.src : 'https://icon-cdn.pages.dev/all.js';
const CDN_URL = SCRIPT_URL.substring(0, SCRIPT_URL.lastIndexOf('/') + 1);

const _IM = {
  "fa-arrow-down": "'\\f063'",
  "fa-angle-left": "'\\f104'",
  "fa-angle-right": "'\\f105'",
  "fa-arrow-right": "'\\f061'",
  "fa-envelope": "'\\f0e0'",
  "fa-instagram": "'\\f16d'",
  "fa-github": "'\\f09b'",
  "fa-linkedin": "'\\f08c'",
};

const ICON_VARIANTS = {
  "fa-utility-fill": {
    name: "fa-utility-fill-subset",
    icons: ["fa-arrow-down", "fa-envelope"],
    fontFamily: "Font Awesome 7 Utility Fill",
  },
  "fa-utility-duo": {
    name: "fa-utility-duo-subset",
    icons: ["fa-angle-left", "fa-angle-right", "fa-arrow-right"],
    fontFamily: "Font Awesome 7 Utility Duo",
  },
  "fa-brands": {
    name: "fa-brands-subset",
    icons: ["fa-instagram", "fa-github", "fa-linkedin"],
    fontFamily: "Font Awesome 7 Brands",
  },
};

const loadedVariants = new Set();

function extractIconClasses(element) {
  const classList = Array.from(element.classList);
  return classList.filter((cls) => cls.startsWith("fa-") && _IM[cls]);
}

function detectVariant(iconClass) {
  for (const [variantKey, variantConfig] of Object.entries(ICON_VARIANTS)) {
    if (variantConfig.icons.includes(iconClass)) {
      return variantKey;
    }
  }
  return null;
}
``
function generateFontFaceCSS(variantKey) {
  const variant = ICON_VARIANTS[variantKey];
  if (!variant) return "";

  const fontPath = `${CDN_URL}webfonts-subset/${variant.name}.woff2`;

  return `
    @font-face {
      font-family: "${variant.fontFamily}";
      src: url("${fontPath}") format("woff2");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
  `;
}

function generateIconCSS(variantKey) {
  const variant = ICON_VARIANTS[variantKey];
  if (!variant) return "";

  let css = `
    /* Icons dari ${variantKey} */
    .${variantKey} {
      font-family: "${variant.fontFamily}";
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      display: inline-block;
      font-style: normal;
      font-variant: normal;
      text-rendering: auto;
      line-height: 1;
    }
    .${variantKey}::before {
      content: var(--fa);
    }
  `;

  variant.icons.forEach((iconClass) => {
    if (_IM[iconClass]) {
      const unicode = _IM[iconClass];
      css += `\n    .${iconClass} { --fa: ${unicode}; }`;
    }
  });

  return css;
}

/**
 * Inject CSS ke head
 */
function injectCSS(cssText) {
  const style = document.createElement("style");
  style.textContent = cssText;
  style.setAttribute("data-icon-cdn", "true");
  document.head.appendChild(style);
}

/**
 * Main loader function
 */
function loadSmartIconFonts() {
  const iconElements = document.querySelectorAll('[class*="fa-"]');
  const requiredVariants = new Set();

  iconElements.forEach((el) => {
    const icons = extractIconClasses(el);
    icons.forEach((iconClass) => {
      const variant = detectVariant(iconClass);
      if (variant) {
        requiredVariants.add(variant);
      }
    });
  });

  if (requiredVariants.size === 0) return;

  let combinedCSS = "";

  requiredVariants.forEach((variantKey) => {
    if (!loadedVariants.has(variantKey)) {
      const fontFaceCSS = generateFontFaceCSS(variantKey);
      const iconCSS = generateIconCSS(variantKey);
      combinedCSS += fontFaceCSS + iconCSS;
      loadedVariants.add(variantKey);
    }
  });

  if (combinedCSS) {
    injectCSS(combinedCSS);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSmartIconFonts);
} else {
  loadSmartIconFonts();
}

// Support untuk dynamic content
if (typeof MutationObserver !== "undefined") {
  const observer = new MutationObserver(() => {
    loadSmartIconFonts();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}

// Export untuk testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { loadSmartIconFonts, ICON_VARIANTS, detectVariant };
}

