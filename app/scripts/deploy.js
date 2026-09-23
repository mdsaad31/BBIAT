const fs = require("fs");
const path = require("path");

const distFile = path.join(__dirname, "../dist/bundle.js");

if (!fs.existsSync(distFile)) {
  console.error("No build artifact found. Run `npm run build` first.");
  process.exit(1);
}

console.log("Deploying application...");
console.log(`Artifact: ${distFile}`);
console.log(`Size: ${fs.statSync(distFile).size} bytes`);
console.log("Deployment complete (simulated).");
