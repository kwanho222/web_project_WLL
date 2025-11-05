const fs = require('fs');
const path = require('path');

const root = path.resolve('c:\\Users\\Sain\\바탕 화면\\vscode\\WebWarriors-main\\WebWorriors');

const files = [];
function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    console.error('readDir error', dir, e.message);
    return;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isFile()) files.push(p);
    else if (e.isDirectory()) walk(p);
  }
}

try {
  walk(root);
  const now = new Date();
  for (const f of files) {
    try {
      fs.utimesSync(f, now, now);
    } catch (e) {
      console.error('utimes error', f, e.message);
    }
  }
  console.log('Updated', files.length, 'files. Sample (mtime ISO, path):');
  files.slice(0, 10).forEach(f => {
    try {
      const stat = fs.statSync(f);
      console.log(stat.mtime.toISOString(), f);
    } catch (e) { /* ignore */ }
  });
} catch (err) {
  console.error('Fatal error', err);
  process.exit(1);
}
