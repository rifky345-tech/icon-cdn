#!/usr/bin/env python3
"""
Font Subsetting Script v3 - Fixed compatibility
Pakai TTFont dan Subsetter langsung dari fontTools
"""

import os
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter

# Icon yang dipakai
ICONS_TO_SUBSET = {
    'fa-utility-fill': {
        'font_file': 'fa-utility-fill-semibold-600.woff2',
        'icons': ['fa-arrow-down', 'fa-envelope']
    },
    'fa-utility-duo': {
        'font_file': 'fa-utility-duo-semibold-600.woff2',
        'icons': ['fa-angle-left', 'fa-angle-right', 'fa-arrow-right']
    },
    'fa-brands': {
        'font_file': 'fa-brands-400.woff2',
        'icons': ['fa-instagram', 'fa-github', 'fa-linkedin']
    }
}

# Unicode mapping
ICON_UNICODE_MAP = {
    'fa-arrow-down': 0xf063,
    'fa-angle-left': 0xf104,
    'fa-angle-right': 0xf105,
    'fa-arrow-right': 0xf061,
    'fa-envelope': 0xf0e0,
    'fa-instagram': 0xf16d,
    'fa-github': 0xf09b,
    'fa-linkedin': 0xf08c,
}

def subset_font_direct(input_font_path, output_font_path, codepoints):
    """
    Subset font using fontTools TTFont + Subsetter
    codepoints: list of unicode codepoints [0xf063, 0xf104, ...]
    """
    try:
        print(f"  Loading font: {input_font_path}")
        
        # Load font using TTFont
        font = TTFont(input_font_path)
        
        # Create subsetter dengan codepoints yang diinginkan
        subsetter = Subsetter()
        subsetter.populate(unicodes=codepoints)
        
        # Apply subset
        subsetter.subset(font)
        
        # Save subset font as WOFF2
        print(f"  Saving to: {output_font_path}")
        font.save(output_font_path)
        
        if os.path.exists(output_font_path):
            size_kb = os.path.getsize(output_font_path) / 1024
            print(f"  ✅ Success! Size: {size_kb:.2f} KB")
            return True, size_kb
        return False, 0
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False, 0

def main():
    print("=" * 70)
    print("Font Subsetting Script v3 - Icon CDN (Fixed)")
    print("=" * 70)
    
    # Create output directory
    output_dir = Path('webfonts-subset')
    output_dir.mkdir(exist_ok=True)
    print(f"\n📁 Output directory: {output_dir}/\n")
    
    success_count = 0
    total_size = 0
    
    # Process each variant
    for variant_name, variant_config in ICONS_TO_SUBSET.items():
        print(f"\n🔤 Processing: {variant_name}")
        print(f"   Font file: {variant_config['font_file']}")
        print(f"   Icons: {', '.join(variant_config['icons'])}")
        
        # Get codepoints for this variant
        codepoints = []
        for icon in variant_config['icons']:
            if icon in ICON_UNICODE_MAP:
                codepoints.append(ICON_UNICODE_MAP[icon])
        
        print(f"   Codepoints: {[hex(cp) for cp in codepoints]}")
        
        input_font = Path('webfonts') / variant_config['font_file']
        output_font = output_dir / f"{variant_name}-subset.woff2"
        
        # Check if input exists
        if not input_font.exists():
            print(f"   ❌ Input file not found: {input_font}")
            continue
        
        # Run subsetting
        success, size_kb = subset_font_direct(str(input_font), str(output_font), codepoints)
        if success:
            success_count += 1
            total_size += size_kb
    
    print("\n" + "=" * 70)
    print(f"✅ Done! {success_count}/{len(ICONS_TO_SUBSET)} variants processed")
    print("=" * 70)
    
    # Summary
    print("\n📊 Summary:")
    if success_count > 0:
        for variant in ICONS_TO_SUBSET.keys():
            font_path = output_dir / f"{variant}-subset.woff2"
            if font_path.exists():
                size_kb = os.path.getsize(font_path) / 1024
                print(f"   {variant}: {size_kb:.2f} KB")
        
        print(f"\n   Total size: {total_size:.2f} KB")
        print(f"   Original size: ~476 KB")
        reduction = ((476 - total_size) / 476 * 100) if total_size > 0 else 0
        print(f"   Reduction: {reduction:.1f}%")
    
    print("\n📝 Next steps:")
    print("   1. ✅ Verify webfonts-subset/ folder dengan 3 font files")
    print("   2. Replace all.js dengan all-updated.js")
    print("   3. git add -A && git commit -m 'feat: dynamic icon subsetting' && git push")
    
    return success_count > 0

if __name__ == '__main__':
    try:
        success = main()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)