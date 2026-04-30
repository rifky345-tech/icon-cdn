/**
 * Smart Icon Font Loader
 * Detect icon yang dipake di halaman → Load hanya subset font yang dibutuhkan
 * Reduce dari 476KB jadi ~60KB (cuma icon yang dipake)
 */

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

// Mapping icon ke variant font dan codepoint
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

// Cache untuk variant yang sudah di-load
const loadedVariants = new Set();

/**
 * Extract icon class dari element
 * Misal: class="fa-utility-fill fa-arrow-down" → ['fa-arrow-down']
 */
function extractIconClasses(element) {
  const classList = Array.from(element.classList);
  return classList.filter((cls) => cls.startsWith("fa-") && _IM[cls]);
}

/**
 * Detect variant dari icon
 * Misal: 'fa-arrow-down' → 'fa-utility-fill'
 */
function detectVariant(iconClass) {
  for (const [variantKey, variantConfig] of Object.entries(ICON_VARIANTS)) {
    if (variantConfig.icons.includes(iconClass)) {
      return variantKey;
    }
  }
  return null;
}

/**
 * Generate @font-face CSS untuk subset font
 */
function generateFontFaceCSS(variantKey) {
  const variant = ICON_VARIANTS[variantKey];
  if (!variant) return "";

  const fontPath = `/webfonts-subset/${variant.name}.woff2`;

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

/**
 * Generate CSS rules untuk icon yang dipake
 * Misal: .fa-arrow-down { --fa: '\f063'; }
 */
function generateIconCSS(variantKey) {
  const variant = ICON_VARIANTS[variantKey];
  if (!variant) return "";

  let css = `
    /* Icons dari ${variantKey} */
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
 * Run ini saat DOM ready
 */
function loadSmartIconFonts() {
  // Step 1: Detect semua icon yang dipake di halaman
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

  // Step 2: Load hanya variant yang dibutuhkan
  if (requiredVariants.size === 0) {
    console.warn("[Icon CDN] No icons detected on this page");
    return;
  }

  console.log("[Icon CDN] Loading variants:", Array.from(requiredVariants));

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
    console.log(`[Icon CDN] Loaded ${requiredVariants.size} variant(s)`);
  }
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSmartIconFonts);
} else {
  loadSmartIconFonts();
}

/**
 * Support untuk dynamic content (SPA, lazy-loaded elements)
 * MutationObserver untuk detect icon baru yang ditambahkan
 */
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
