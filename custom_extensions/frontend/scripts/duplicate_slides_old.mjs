// Node script to duplicate all non-avatar slide templates to *_old files
// Usage: node custom_extensions/frontend/scripts/duplicate_slides_old.mjs

import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.resolve(process.cwd(), 'custom_extensions/frontend/src/components/templates');

const isAvatarFile = (filename) => {
  const lower = filename.toLowerCase();
  return lower.includes('avatar') || lower.startsWith('avatar');
};

const isTemplateFile = (filename) => {
  // Heuristic: include .tsx files in templates folder, skip base and registry
  return (
    filename.endsWith('.tsx') &&
    !filename.endsWith('_old.tsx') &&
    filename !== 'registry.ts' &&
    !filename.includes('/base/')
  );
};

const rewriteExports = (content) => {
  // Rename named exports like `export const Foo =` to `export const Foo_old =`
  let out = content.replace(/export\s+const\s+([A-Za-z0-9_]+)\s*=\s*/g, (m, name) => {
    if (name.endsWith('_old')) return m; // already old
    return m.replace(name, `${name}_old`);
  });

  // Rename default export component names used above if present
  out = out.replace(/export\s+default\s+([A-Za-z0-9_]+)/g, (m, name) => {
    if (name.endsWith('_old')) return m;
    return m.replace(name, `${name}_old`);
  });

  // Rename function declarations exported, e.g., export function Foo(
  out = out.replace(/export\s+function\s+([A-Za-z0-9_]+)\s*\(/g, (m, name) => {
    if (name.endsWith('_old')) return m;
    return m.replace(name, `${name}_old`);
  });

  return out;
};

const main = () => {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error('[duplicate_slides_old] Templates directory not found:', TEMPLATES_DIR);
    process.exit(1);
  }

  const entries = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
  let duplicated = 0;

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip base subdir
      if (entry.name === 'base') continue;
      // Process files inside as well
      const subdir = path.join(TEMPLATES_DIR, entry.name);
      const subfiles = fs.readdirSync(subdir, { withFileTypes: true });
      for (const f of subfiles) {
        if (!f.isFile()) continue;
        const full = path.join(subdir, f.name);
        if (!isTemplateFile(full) || isAvatarFile(full)) continue;
        const target = full.replace(/\.tsx$/, '_old.tsx');
        if (fs.existsSync(target)) continue;
        const content = fs.readFileSync(full, 'utf8');
        const rewritten = rewriteExports(content);
        fs.writeFileSync(target, rewritten, 'utf8');
        duplicated++;
      }
      continue;
    }

    if (!entry.isFile()) continue;
    const file = path.join(TEMPLATES_DIR, entry.name);
    if (!isTemplateFile(file) || isAvatarFile(file)) continue;
    const target = file.replace(/\.tsx$/, '_old.tsx');
    if (fs.existsSync(target)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const rewritten = rewriteExports(content);
    fs.writeFileSync(target, rewritten, 'utf8');
    duplicated++;
  }

  console.log(`[duplicate_slides_old] Duplicated ${duplicated} files to *_old variants.`);
};

main();


