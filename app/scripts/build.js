const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../src");
const distDir = path.join(__dirname, "../dist");

fs.mkdirSync(distDir, { recursive: true });

const srcFile = path.join(srcDir, "index.js");
const distFile = path.join(distDir, "bundle.js");

const source = fs.readFileSync(srcFile, "utf8");
const banner = `// BBIAT Sample App - Built at ${new Date().toISOString()}\n`;
fs.writeFileSync(distFile, banner + source);

console.log(`Build complete: ${distFile}`);
