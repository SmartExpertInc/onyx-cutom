// Fix _old.tsx files: rename component identifiers to match _old suffix
// Usage: node custom_extensions/frontend/scripts/fix_old_component_names.mjs

import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.resolve(process.cwd(), 'custom_extensions/frontend/src/components/templates');

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern: export const FooTemplate = ... or export const FooTemplate: React.FC
  // Replace with FooTemplate_old
  const exportConstPattern = /export const ([A-Za-z0-9_]+Template)(\s*[:=])/g;
  content = content.replace(exportConstPattern, (match, name, separator) => {
    if (name.endsWith('_old')) return match; // already fixed
    modified = true;
    return `export const ${name}_old${separator}`;
  });

  // Pattern: export function FooTemplate(
  const exportFunctionPattern = /export function ([A-Za-z0-9_]+Template)(\s*\()/g;
  content = content.replace(exportFunctionPattern, (match, name, separator) => {
    if (name.endsWith('_old')) return match;
    modified = true;
    return `export function ${name}_old${separator}`;
  });

  // Pattern: const FooTemplate = ... (not exported directly, but used in default export)
  // Only rename if there's a corresponding export default FooTemplate_old
  if (content.includes('export default') && content.match(/_old[;\s]*$/m)) {
    const constPattern = /\bconst ([A-Za-z0-9_]+Template)(\s*[:=])/g;
    content = content.replace(constPattern, (match, name, separator) => {
      if (name.endsWith('_old')) return match;
      // Check if this name appears in export default
      const defaultExportPattern = new RegExp(`export default ${name}_old`);
      if (defaultExportPattern.test(content)) {
        modified = true;
        return `const ${name}_old${separator}`;
      }
      return match;
    });
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
};

const main = () => {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error('[fix_old_component_names] Templates directory not found:', TEMPLATES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('_old.tsx'));
  let fixed = 0;

  for (const file of files) {
    const fullPath = path.join(TEMPLATES_DIR, file);
    if (fixFile(fullPath)) {
      console.log(`✓ Fixed: ${file}`);
      fixed++;
    }
  }

  console.log(`\n[fix_old_component_names] Fixed ${fixed} out of ${files.length} files.`);
};

main();

