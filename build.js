const fs = require('fs');
const css = fs.readFileSync('css/fontawesome.css', 'utf8');

// Split at boundary: after .fa-inverse rule, icon definitions begin
const marker = '.fa-inverse{color:var(--fa-inverse,#fff)}';
const splitIdx = css.indexOf(marker);
if (splitIdx === -1) { console.error('Marker not found'); process.exit(1); }

const baseCss = css.substring(0, splitIdx + marker.length);
const iconsPart = css.substring(splitIdx + marker.length);

// Write base CSS
fs.writeFileSync('css/fontawesome-base.css', baseCss);
console.log('Base CSS: ' + baseCss.length + ' bytes');

// Parse icon definitions into map
const iconMap = {};
let pos = 0, count = 0;

while (pos < iconsPart.length) {
    const ob = iconsPart.indexOf('{', pos);
    if (ob === -1) break;
    const cb = iconsPart.indexOf('}', ob);
    if (cb === -1) break;

    const selStr = iconsPart.substring(pos, ob);
    const propStr = iconsPart.substring(ob + 1, cb);

    if (propStr.startsWith('--fa:')) {
        const rawVal = propStr.substring(5); // CSS value including quotes
        selStr.split(',').forEach(s => {
            s = s.trim();
            if (s.startsWith('.')) {
                iconMap[s.substring(1)] = rawVal;
                count++;
            }
        });
    }
    pos = cb + 1;
}

console.log('Icon entries: ' + count);

// Build JS: store raw CSS values, escape for JS string safely
// Use JSON.stringify for each key and value to handle escaping
let entries = [];
for (const [cls, val] of Object.entries(iconMap)) {
    entries.push(JSON.stringify(cls) + ':' + JSON.stringify(val));
}
const jsMapStr = '{' + entries.join(',') + '}';

fs.writeFileSync('icon-map.js', 'const _IM=' + jsMapStr + ';\n');
console.log('Icon map JS: ' + jsMapStr.length + ' bytes');
console.log('Done!');
