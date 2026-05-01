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
    font: "fa-utility-fill-subset",
    fontFamily: "Font Awesome 7 Utility Fill",
    weight: 600,
    icons: ["fa-arrow-down", "fa-envelope"],
  },
  "fa-utility-duo": {
    font: "fa-utility-duo-subset",
    fontFamily: "Font Awesome 7 Utility Duo",
    weight: 600,
    icons: ["fa-angle-left", "fa-angle-right", "fa-arrow-right", "fa-envelope"],
    isDuo: true,
  },
  "fa-brands": {
    font: "fa-brands-subset",
    fontFamily: "Font Awesome 7 Brands",
    weight: 400,
    icons: ["fa-instagram", "fa-github", "fa-linkedin"],
  },
  "fa-solid": {
    font: "fa-utility-fill-subset",
    fontFamily: "Font Awesome 7 Utility Fill",
    weight: 600,
    icons: ["fa-arrow-down", "fa-envelope"],
  },
};

const loadedFonts = new Set();
const loadedVariants = new Set();

function extractIconClasses(element) {
  const classList = Array.from(element.classList);
  return classList.filter((cls) => cls.startsWith("fa-") && _IM[cls]);
}

function detectVariant(element) {
  const classList = Array.from(element.classList);
  for (const variantKey of Object.keys(ICON_VARIANTS)) {
    if (classList.includes(variantKey)) {
      return variantKey;
    }
  }
  return null;
}

function loadSmartIconFonts() {
  const iconElements = document.querySelectorAll('[class*="fa-"]');
  const variantsNeeded = new Set();
  const iconsFound = new Map();

  iconElements.forEach((el) => {
    const variant = detectVariant(el);
    if (!variant) return;

    const icons = extractIconClasses(el);
    if (icons.length > 0) {
      variantsNeeded.add(variant);
      if (!iconsFound.has(variant)) iconsFound.set(variant, new Set());
      icons.forEach((ic) => iconsFound.get(variant).add(ic));
    }
  });

  if (variantsNeeded.size === 0) return;

  let css = "";

  variantsNeeded.forEach((variantKey) => {
    if (loadedVariants.has(variantKey)) return;
    loadedVariants.add(variantKey);

    const v = ICON_VARIANTS[variantKey];
    const fontFile = `${CDN_URL}webfonts-subset/${v.font}.woff2`;

    if (!loadedFonts.has(v.font)) {
      loadedFonts.add(v.font);
      css += `
@font-face {
  font-family: "${v.fontFamily}";
  font-style: normal;
  font-weight: ${v.weight};
  font-display: swap;
  src: url("${fontFile}") format("woff2");
}
`;
    }

    // Base styles untuk variant ini
    css += `
.${variantKey},
.${variantKey}::before {
  font-family: "${v.fontFamily}" !important;
  font-weight: ${v.weight};
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

    // Duotone ::after
    if (v.isDuo) {
      css += `
.${variantKey}::after {
  font-family: "${v.fontFamily}" !important;
  font-weight: ${v.weight};
  content: var(--fa);
  font-feature-settings: "ss01";
}
`;
    }

    // Icon unicode mappings
    const icons = iconsFound.get(variantKey) || v.icons;
    icons.forEach((iconClass) => {
      if (_IM[iconClass]) {
        css += `.${iconClass} { --fa: ${_IM[iconClass]}; }\n`;
      }
    });
  });

  if (css) {
    const style = document.createElement("style");
    style.textContent = css;
    style.setAttribute("data-icon-cdn", "true");
    document.head.appendChild(style);
  }
}

// Initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSmartIconFonts);
} else {
  loadSmartIconFonts();
}

// Support dynamic content
if (typeof MutationObserver !== "undefined") {
  const mo = new MutationObserver(() => loadSmartIconFonts());
  if (document.body) {
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      mo.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    });
  }
}
