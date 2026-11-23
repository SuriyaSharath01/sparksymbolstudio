import fs from 'fs';
import path from 'path';

const targetDirs = [
  path.resolve('public/symbols'),
  path.resolve('public/symbols/spark-core'),
];

const COLOR_MAP = [
  // Primary dark strokes -> --spark-stroke
  { regex: /(["':\s])(?:#0f172a|#1e293b|#111827|#000000|#000)\b/gi, token: '$1var(--spark-stroke, #0F172A)' },
  // Brand accent orange/amber -> --spark-accent
  { regex: /(["':\s])(?:#d45a1a|#f59e0b|#ea580c)\b/gi, token: '$1var(--spark-accent, #D45A1A)' },
  // Clinical/positive green -> --spark-success
  { regex: /(["':\s])(?:#15803d|#10b981|#059669|#34d399)\b/gi, token: '$1var(--spark-success, #15803D)' },
  // Alert/negation red -> --spark-danger
  { regex: /(["':\s])(?:#dc2626|#ef4444|#f43f5e)\b/gi, token: '$1var(--spark-danger, #DC2626)' },
  // Pure white surfaces -> --spark-surface
  { regex: /(["':\s])(?:#ffffff|#fff)\b/gi, token: '$1var(--spark-surface, #FFFFFF)' },
  // Soft pastel tints -> --spark-tint (preserving original as fallback)
  { regex: /(["':\s])(#fef3c7|#fde68a|#fed7aa|#dcfce7|#ecfdf5|#fee2e2|#eff6ff|#fff1f2|#f3e8ff|#e0e7ff)\b/gi, token: '$1var(--spark-tint, $2)' },
];

function normaliseSvgFile(filePath) {
  let svg = fs.readFileSync(filePath, 'utf8');

  // Strip XML declaration and comments
  svg = svg.replace(/<\?xml[\s\S]*?\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '').trim();

  // Strip full-canvas solid white background rect if exported by Recraft/Illustrator
  svg = svg.replace(/<rect[^>]*width=["'](?:100%|256|512|1024)["'][^>]*height=["'](?:100%|256|512|1024)["'][^>]*fill=["'](?:#fff|#ffffff|white)["'][^>]*\/?>/gi, '');

  // Ensure explicit width/height and viewBox exist
  if (!/\bviewBox=/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, '<svg viewBox="0 0 256 256"');
  }
  if (!/\bwidth=/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, '<svg width="256" height="256"');
  }

  // Only tokenise if not already tokenised
  if (!svg.includes('var(--spark-')) {
    for (const rule of COLOR_MAP) {
      svg = svg.replace(rule.regex, rule.token);
    }
  }

  // Tag root <svg> as a native Living SVG
  if (!svg.includes('data-spark-living="true"')) {
    svg = svg.replace(/<svg\b/i, '<svg data-spark-living="true"');
  }

  fs.writeFileSync(filePath, svg + '\n', 'utf8');
}

let count = 0;
for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) continue;
  const isSparkCoreDir = dir.endsWith('spark-core');
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.svg')) continue;
    if (!isSparkCoreDir && !file.startsWith('spark_')) continue;
    normaliseSvgFile(path.join(dir, file));
    count += 1;
  }
}

console.log(`Normalised ${count} Spark Living SVGs with live CSS theme tokens.`);
