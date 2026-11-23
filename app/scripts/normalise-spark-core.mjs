import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('public/symbols/spark-core');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.svg'));

let cleaned = 0;
for (const file of files) {
  const fullPath = path.join(DIR, file);
  let svg = fs.readFileSync(fullPath, 'utf8');

  const wMatch = svg.match(/\bwidth="(\d+(?:\.\d+)?)"/);
  const hMatch = svg.match(/\bheight="(\d+(?:\.\d+)?)"/);
  const w = wMatch ? wMatch[1] : '1024';
  const h = hMatch ? hMatch[1] : '1024';

  if (!/\bviewBox=/.test(svg)) {
    svg = svg.replace(/<svg\b/, `<svg viewBox="0 0 ${w} ${h}"`);
  }
  svg = svg
    .replace(/\s*\bwidth="\d+(?:\.\d+)?"/, '')
    .replace(/\s*\bheight="\d+(?:\.\d+)?"/, '');

  svg = svg.replace(
    /<path\b[^>]*\bd="M\s*0[\s,]+0\b[^"]*"[^>]*\bfill="#(?:fff(?:fff)?|fefefe|fdfdfd|fcfcfc)"[^>]*\/?>/gi,
    ''
  );

  fs.writeFileSync(fullPath, svg, 'utf8');
  cleaned++;
}

console.log(`Normalised ${cleaned} Spark Core SVGs cleanly.`);
