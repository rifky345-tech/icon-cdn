#!/usr/bin/env python3
"""
Font Subsetting Script untuk Icon CDN
Memangkas ukuran font dengan hanya menyertakan icon yang benar-benar dipakai
"""

import os
import subprocess
import json
from pathlib import Path

# List icon yang dipakai (dari scan index.html)
ICONS_TO_SUBSET = {
    # Utility Fill (fa-utility-fill-semibold-600.woff2)
    'fa-utility-fill': {
        'font_file': 'fa-utility-fill-semibold-600.woff2',
        'icons': ['fa-arrow-down', 'fa-envelope']
    },
    # Utility Duo (fa-utility-duo-semibold-600.woff2)
    'fa-utility-duo': {
        'font_file': 'fa-utility-duo-semibold-600.woff2',
        'icons': ['fa-angle-left', 'fa-angle-right', 'fa-arrow-right']
    },
    # Brands (fa-brands-400.woff2)
    'fa-brands': {
        'font_file': 'fa-brands-400.woff2',
        'icons': ['fa-instagram', 'fa-github', 'fa-linkedin']
    }
}

# Unicode mapping dari icon-map.js
ICON_UNICODE_MAP = {
    'fa-arrow-down': '\\f063',
    'fa-angle-left': '\\f104',
    'fa-angle-right': '\\f105',
    'fa-arrow-right': '\\f061',
    'fa-envelope': '\\f0e0',
    'fa-instagram': '\\f16d',
    'fa-github': '\\f09b',
    'fa-linkedin': '\\f08c',
}

def get_unicode_codepoints(icon_names):
    """Convert icon names to unicode codepoints untuk fonttools"""
    codepoints = []
    for icon in icon_names:
        if icon in ICON_UNICODE_MAP:
            unicode_str = ICON_UNICODE_MAP[icon]
            # Convert '\\f063' to actual codepoint 0xf063
            codepoint = int(unicode_str.replace('\\', '0x'), 16)
            codepoints.append(f'U+{codepoint:04X}')
    return ','.join(codepoints)

def subset_font(input_font, output_font, codepoints):
    """Run pyftsubset untuk subset font file"""
    try:
        cmd = [
            'pyftsubset',
            input_font,
            f'--unicodes={codepoints}',
            f'--output-file={output_font}',
            '--flavor=woff2',
            '--with-zopfli'
        ]
        
        print(f"  Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"  ⚠️  Error: {result.stderr}")
            return False
        
        # Check file size
        if os.path.exists(output_font):
            size_kb = os.path.getsize(output_font) / 1024
            print(f"  ✅ Success! Size: {size_kb:.2f} KB")
            return True
        return False
    except Exception as e:
        print(f"  ❌ Exception: {e}")
        return False

def main():
    print("=" * 60)
    print("Font Subsetting Script - Icon CDN")
    print("=" * 60)
    
    # Check if pyftsubset is available
    try:
        subprocess.run(['pyftsubset', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ ERROR: pyftsubset tidak ditemukan!")
        print("\nInstall fonttools dengan:")
        print("  pip install fonttools brotli zopfli")
        return False
    
    # Create output directory
    output_dir = Path('webfonts-subset')
    output_dir.mkdir(exist_ok=True)
    print(f"\n📁 Output directory: {output_dir}/\n")
    
    success_count = 0
    
    # Process each font variant
    for variant_name, variant_config in ICONS_TO_SUBSET.items():
        print(f"\n🔤 Processing: {variant_name}")
        print(f"   Font file: {variant_config['font_file']}")
        print(f"   Icons: {', '.join(variant_config['icons'])}")
        
        # Get codepoints for this variant
        codepoints = get_unicode_codepoints(variant_config['icons'])
        print(f"   Codepoints: {codepoints}")
        
        input_font = Path('webfonts') / variant_config['font_file']
        output_font = output_dir / f"{variant_name}-subset.woff2"
        
        # Check if input file exists
        if not input_font.exists():
            print(f"   ❌ Input file not found: {input_font}")
            continue
        
        # Run subsetting
        if subset_font(str(input_font), str(output_font), codepoints):
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Subsetting completed! {success_count}/{len(ICONS_TO_SUBSET)} variants processed")
    print("=" * 60)
    
    # Generate summary
    print("\n📊 Summary:")
    total_size = sum(
        os.path.getsize(output_dir / f"{variant}-subset.woff2") / 1024
        for variant in ICONS_TO_SUBSET.keys()
        if (output_dir / f"{variant}-subset.woff2").exists()
    )
    print(f"   Total size (all subset fonts): {total_size:.2f} KB")
    print(f"   Original size: ~476 KB")
    print(f"   Reduction: {((476 - total_size) / 476 * 100):.1f}%")
    
    print("\n📝 Next steps:")
    print("   1. Review files in webfonts-subset/")
    print("   2. Replace old webfonts/ dengan webfonts-subset/ (atau update references)")
    print("   3. Update all.js untuk load per-icon (script akan diberikan)")
    print("   4. Push ke GitHub → auto-deploy")
    
    return True

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)