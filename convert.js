const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory && f !== 'node_modules' && f !== 'dist' && f !== 'build') {
      walk(dirPath, callback);
    } else if (!isDirectory) {
      callback(dirPath);
    }
  });
}

function processFiles(targetPath) {
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    processFile(targetPath);
  } else {
    walk(targetPath, processFile);
  }
}

function processFile(filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      // Exclude d.ts files
      if (filePath.endsWith('.d.ts')) {
        fs.unlinkSync(filePath);
        return;
      }
      
      const isTSX = filePath.endsWith('.tsx');
      
      const result = babel.transformFileSync(filePath, {
        presets: [
          ['@babel/preset-typescript']
        ],
        plugins: [
          // Keep JSX intact, just strip types
          '@babel/plugin-syntax-jsx'
        ],
        retainLines: true, // Attempt to keep original line numbers
      });

      const newExt = isTSX ? '.jsx' : '.js';
      const newPath = filePath.replace(/\.tsx?$/, newExt);
      
      fs.writeFileSync(newPath, result.code);
      console.log(`Converted ${filePath} to ${newPath}`);
      fs.unlinkSync(filePath);
    }
}

processFiles(path.join(__dirname, 'client', 'src'));
processFiles(path.join(__dirname, 'client', 'vite.config.ts'));
processFiles(path.join(__dirname, 'server', 'src'));
processFiles(path.join(__dirname, 'server', 'prisma', 'seed.ts'));
processFiles(path.join(__dirname, 'server', 'test_end_to_end.ts'));
