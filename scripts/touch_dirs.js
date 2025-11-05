const fs = require('fs');
const path = require('path');

const root = path.resolve('c:\\Users\\Sain\\바탕 화면\\vscode\\WebWarriors-main\\WebWorriors');

const dirs = [];
function walkDirs(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    console.error('readdir error', dir, e.message);
    return;
  }
  dirs.push(dir);
  for (const e of entries) {
    if (e.isDirectory()) walkDirs(path.join(dir, e.name));
  }
}

try {
  walkDirs(root);
  const now = new Date();
  for (const d of dirs) {
    try {
      fs.utimesSync(d, now, now);
    } catch (e) {
      console.error('utimes error', d, e.message);
    }
  }
  console.log('Updated', dirs.length, 'directories. Sample (mtime ISO, path):');
  dirs.slice(0, 20).forEach(d => {
    try {
      const stat = fs.statSync(d);
      console.log(stat.mtime.toISOString(), d);
    } catch (e) { /* ignore */ }
  });
} catch (err) {
  console.error('Fatal error', err);
  process.exit(1);
}
