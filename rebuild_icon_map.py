import re
import os
import glob

def build_map():
    map_dict = {}
    
    # Read all css files to collect all icons
    css_files = glob.glob('css/*.css')
    for file in css_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Split by } to get rules
        rules = content.split('}')
        for rule in rules:
            if "{--fa:" in rule:
                selector, val = rule.split("{--fa:", 1)
                val = val.strip().replace("'", "").replace('"', "").replace("\\", "")
                
                # handle space like \30 (fa-0)
                val = val.strip()
                
                # Selector can be .fa-brands, .fa-github, etc.
                # Remove pseudo classes like :before
                selector = selector.split(':')[0]
                
                classes = selector.split(',')
                for cls in classes:
                    cls = cls.strip()
                    if cls.startswith('.fa-'):
                        class_name = cls[1:] # remove dot
                        class_name = class_name.split()[0] # handle things like .fa-instagram.solid
                        map_dict[class_name] = f"'\\\\{val}'"
                        
    # Generate JS content
    js_content = "const _IM = {"
    items = []
    for k, v in map_dict.items():
        items.append(f'"{k}":{v}')
    js_content += ",".join(items)
    js_content += "};"
    
    with open('icon-map.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Generated {len(map_dict)} icon mappings.")

if __name__ == '__main__':
    build_map()
