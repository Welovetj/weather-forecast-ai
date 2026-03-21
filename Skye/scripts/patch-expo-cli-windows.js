const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'metro',
  'externals.js'
);

if (!fs.existsSync(targetFile)) {
  console.log('[patch-expo-cli-windows] target file not found, skipping');
  process.exit(0);
}

const source = fs.readFileSync(targetFile, 'utf8');

if (source.includes('replace(/^node:/')) {
  console.log('[patch-expo-cli-windows] patch already applied');
  process.exit(0);
}

const filterPattern = /(\.filter\(\(x\)=>!\/^_\|\^\(internal\|v8\|node-inspect\)\\\/\|\\\/\/\.test\(x\) && !\[\s*"sys"\s*\]\.includes\(x\)\s*\))/m;

if (!filterPattern.test(source)) {
  console.log('[patch-expo-cli-windows] expected source segment not found, skipping');
  process.exit(0);
}

const patched = source.replace(
  filterPattern,
  '$1.map((x)=>x.replace(/^node:/, ""))'
);
fs.writeFileSync(targetFile, patched, 'utf8');
console.log('[patch-expo-cli-windows] patch applied');
