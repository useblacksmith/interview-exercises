const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(
  path.join(__dirname, '..', 'src', 'server.js'),
  path.join(outputDir, 'server.js'),
);

console.log('build completed');
