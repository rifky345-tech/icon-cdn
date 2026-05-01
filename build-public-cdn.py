import os

def build_public_cdn():
    print("Membangun Public CDN Universal...")
    
    # 1. Read icon-map.js
    with open('icon-map.js', 'r', encoding='utf-8') as f:
        icon_map = f.read().strip()
        if icon_map.endswith(';'):
            icon_map = icon_map[:-1]
            
    # 2. Define universal all.js content
    js_content = f"""
const SCRIPT_URL = document.currentScript ? document.currentScript.src : 'https://icon-cdn.pages.dev/all.js';
const CDN_URL = SCRIPT_URL.substring(0, SCRIPT_URL.lastIndexOf('/') + 1);

// Peta ikon lengkap untuk publik (semua puluhan ribu ikon FA)
{icon_map};

const ICON_VARIANTS = {{
  "fa-solid": {{ font: "fa-solid-900", fontFamily: "Font Awesome 7 Pro", weight: 900 }},
  "fa-regular": {{ font: "fa-regular-400", fontFamily: "Font Awesome 7 Pro", weight: 400 }},
  "fa-light": {{ font: "fa-light-300", fontFamily: "Font Awesome 7 Pro", weight: 300 }},
  "fa-thin": {{ font: "fa-thin-100", fontFamily: "Font Awesome 7 Pro", weight: 100 }},
  "fa-brands": {{ font: "fa-brands-400", fontFamily: "Font Awesome 7 Brands", weight: 400 }},
  "fa-duotone": {{ font: "fa-duotone-900", fontFamily: "Font Awesome 7 Duotone", weight: 900, isDuo: true }},
  
  "fa-utility-fill": {{ font: "fa-utility-fill-semibold-600", fontFamily: "Font Awesome 7 Utility Fill", weight: 600 }},
  "fa-utility-duo": {{ font: "fa-utility-duo-semibold-600", fontFamily: "Font Awesome 7 Utility Duo", weight: 600, isDuo: true }},
  
  "fa-sharp": {{ font: "fa-sharp-solid-900", fontFamily: "Font Awesome 7 Sharp", weight: 900 }},
}};

const loadedFonts = new Set();
const loadedVariants = new Set();

function extractIconClasses(element) {{
  const classList = Array.from(element.classList);
  return classList.filter((cls) => cls.startsWith("fa-") && _IM[cls]);
}}

function detectVariant(element) {{
  const classList = Array.from(element.classList);
  
  // Kombinasi khusus (misal: fa-sharp fa-regular)
  if (classList.includes('fa-sharp') && classList.includes('fa-regular')) return 'fa-sharp-regular';
  if (classList.includes('fa-sharp') && classList.includes('fa-light')) return 'fa-sharp-light';
  if (classList.includes('fa-sharp') && classList.includes('fa-thin')) return 'fa-sharp-thin';
  if (classList.includes('fa-sharp') && classList.includes('fa-solid')) return 'fa-sharp';
  if (classList.includes('fa-sharp-duotone') && classList.includes('fa-regular')) return 'fa-sharp-duotone-regular';
  if (classList.includes('fa-sharp-duotone') && classList.includes('fa-solid')) return 'fa-sharp-duotone-solid';
  
  for (const variantKey of Object.keys(ICON_VARIANTS)) {{
    if (classList.includes(variantKey)) {{
      return variantKey;
    }}
  }}
  return 'fa-solid'; // Default fallback
}}

// Tambahkan kombinasi Sharp ke Variants
ICON_VARIANTS['fa-sharp-regular'] = {{ font: "fa-sharp-regular-400", fontFamily: "Font Awesome 7 Sharp", weight: 400 }};
ICON_VARIANTS['fa-sharp-light'] = {{ font: "fa-sharp-light-300", fontFamily: "Font Awesome 7 Sharp", weight: 300 }};
ICON_VARIANTS['fa-sharp-thin'] = {{ font: "fa-sharp-thin-100", fontFamily: "Font Awesome 7 Sharp", weight: 100 }};
ICON_VARIANTS['fa-sharp-duotone-regular'] = {{ font: "fa-sharp-duotone-regular-400", fontFamily: "Font Awesome 7 Sharp Duotone", weight: 400, isDuo: true }};
ICON_VARIANTS['fa-sharp-duotone-solid'] = {{ font: "fa-sharp-duotone-solid-900", fontFamily: "Font Awesome 7 Sharp Duotone", weight: 900, isDuo: true }};

function loadSmartIconFonts() {{
  const iconElements = document.querySelectorAll('[class*="fa-"]');
  const variantsNeeded = new Set();
  const iconsFound = new Map();

  iconElements.forEach((el) => {{
    const variant = detectVariant(el);
    const icons = extractIconClasses(el);
    
    if (icons.length > 0) {{
      variantsNeeded.add(variant);
      if (!iconsFound.has(variant)) iconsFound.set(variant, new Set());
      icons.forEach((ic) => iconsFound.get(variant).add(ic));
    }}
  }});

  if (variantsNeeded.size === 0) return;

  let css = "";

  variantsNeeded.forEach((variantKey) => {{
    const v = ICON_VARIANTS[variantKey];
    if (!v) return;
    
    // Menggunakan folder webfonts/ untuk full font
    const fontFile = `${{CDN_URL}}webfonts/${{v.font}}.woff2`;

    if (!loadedFonts.has(v.font)) {{
      loadedFonts.add(v.font);
      css += `
@font-face {{
  font-family: "${{v.fontFamily}}";
  font-style: normal;
  font-weight: ${{v.weight}};
  font-display: swap;
  src: url("${{fontFile}}") format("woff2");
}}
`;
    }}

    if (!loadedVariants.has(variantKey)) {{
      loadedVariants.add(variantKey);
      css += `
.${{variantKey}},
.${{variantKey}}::before {{
  font-family: "${{v.fontFamily}}" !important;
  font-weight: ${{v.weight}};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
}}
.${{variantKey}}::before {{
  content: var(--fa);
}}
`;

      if (v.isDuo) {{
        css += `
.${{variantKey}}::after {{
  font-family: "${{v.fontFamily}}" !important;
  font-weight: ${{v.weight}};
  content: var(--fa);
  font-feature-settings: "ss01";
}}
`;
      }}
    }}

    const icons = iconsFound.get(variantKey);
    if (icons) {{
      icons.forEach((iconClass) => {{
        if (_IM[iconClass]) {{
          const cssRule = `.${{iconClass}} {{ --fa: ${{_IM[iconClass]}}; }}\\n`;
          if (!css.includes(cssRule)) {{
              css += cssRule;
          }}
        }}
      }});
    }}
  }});

  if (css.trim()) {{
    const style = document.createElement("style");
    style.textContent = css;
    style.setAttribute("data-icon-cdn", "true");
    document.head.appendChild(style);
  }}
}}

if (document.readyState === "loading") {{
  document.addEventListener("DOMContentLoaded", loadSmartIconFonts);
}} else {{
  loadSmartIconFonts();
}}

if (typeof MutationObserver !== "undefined") {{
  const mo = new MutationObserver(() => loadSmartIconFonts());
  if (document.body) {{
    mo.observe(document.body, {{
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    }});
  }}
}}
"""

    with open('all.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("Selesai! File all.js sekarang bersifat Universal (Public CDN).")
    print("Daftar ikon lengkap telah digabungkan.")
    print("Skrip kini akan menggunakan font utuh dari folder webfonts/.")

if __name__ == '__main__':
    build_public_cdn()
