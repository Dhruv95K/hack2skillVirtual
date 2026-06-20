const fs = require('fs').promises;
const path = require('path');
const babel = require('@babel/core');

async function getFiles(dir, fileList = []) {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (item.name !== 'node_modules' && item.name !== '.next') {
          await getFiles(fullPath, fileList);
        }
      } else if (item.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
        fileList.push(fullPath);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return fileList;
}

async function main() {
  const directories = ['src', '__tests__', 'e2e', 'prisma'];
  
  const files = [];
  for (const dir of directories) {
    const dirFiles = await getFiles(dir);
    files.push(...dirFiles);
  }
  
  let convertedCount = 0;

  for (const file of files) {
    if (file.endsWith('.d.ts')) {
      console.log(`Deleting ${file} as it is a type definition...`);
      await fs.unlink(file);
      continue;
    }

    const isTsx = file.endsWith('.tsx');
    const ext = path.extname(file);
    const newExt = isTsx ? '.jsx' : '.js';
    const newFile = file.slice(0, -ext.length) + newExt;

    try {
      const result = await babel.transformFileAsync(file, {
        configFile: false,
        babelrc: false,
        presets: [
          ['@babel/preset-typescript']
        ],
        plugins: [
          '@babel/plugin-syntax-jsx'
        ]
      });

      if (result && result.code != null) {
        await fs.writeFile(newFile, result.code, 'utf-8');
        await fs.unlink(file);
        console.log(`Converted ${file} -> ${newFile}`);
        convertedCount++;
      } else {
        console.error(`Failed to transform ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  console.log(`Successfully converted ${convertedCount} files.`);
}

main().catch(console.error);
