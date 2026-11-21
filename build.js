const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// Resolve root directory
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Copy templates/index.html -> dist/index.html
const indexSrc = path.join(rootDir, 'templates', 'index.html');
const indexDest = path.join(distDir, 'index.html');
if (fs.existsSync(indexSrc)) {
  fs.copyFileSync(indexSrc, indexDest);
  console.log('Copied templates/index.html -> dist/index.html');
}

// 2. Copy templates/login.html -> dist/login.html
const loginSrc = path.join(rootDir, 'templates', 'login.html');
const loginDest = path.join(distDir, 'login.html');
if (fs.existsSync(loginSrc)) {
  fs.copyFileSync(loginSrc, loginDest);
  console.log('Copied templates/login.html -> dist/login.html');
}

// 3. Copy static folder -> dist/static
const staticSrc = path.join(rootDir, 'static');
const staticDest = path.join(distDir, 'static');
if (fs.existsSync(staticSrc)) {
  copyRecursiveSync(staticSrc, staticDest);
  console.log('Copied static/ -> dist/static/');
}

// 4. Also copy static files (manifest.json, sw.js) to dist root for direct PWA access
const manifestSrc = path.join(rootDir, 'static', 'manifest.json');
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, path.join(distDir, 'manifest.json'));
}
const swSrc = path.join(rootDir, 'static', 'sw.js');
if (fs.existsSync(swSrc)) {
  fs.copyFileSync(swSrc, path.join(distDir, 'sw.js'));
}

// 5. Duplicate into node_backend/dist in case platform root directory is set to node_backend
const nodeBackendDist = path.join(rootDir, 'node_backend', 'dist');
if (!fs.existsSync(nodeBackendDist)) {
  fs.mkdirSync(nodeBackendDist, { recursive: true });
}
copyRecursiveSync(distDir, nodeBackendDist);
console.log('Synchronized dist/ -> node_backend/dist/');

console.log('Build completed successfully: dist/ generated with all static and template assets.');
