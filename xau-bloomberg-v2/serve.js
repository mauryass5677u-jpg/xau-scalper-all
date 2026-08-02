// Universal static host for XAU/USDT Omniscient Scalper Terminal
// Usage: node serve.js [port]   (default port 8080)
// Open in browser: http://localhost:8080
// LAN (any device on same wifi): http://<your-LAN-ip>:8080
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.argv[2] || 8080;
const ROOT = __dirname;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/") url = "/index.html";
  const file = path.join(ROOT, url);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found: " + url); }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    });
    res.end(data);
  });
}).listen(PORT, () => {
  const os = require("os");
  const nets = os.networkInterfaces();
  const ips = [];
  Object.values(nets).forEach(n => n.forEach(x => { if (x.family === "IPv4" && !x.internal) ips.push(x.address); }));
  console.log("\n  XAU/USDT OMNISCIENT SCALPER TERMINAL v12.0");
  console.log("  ─────────────────────────────────────────────");
  console.log("  Local:   http://localhost:" + PORT);
  ips.forEach(ip => console.log("  Network: http://" + ip + ":" + PORT + "  <-- open on ANY device"));
  console.log("  ─────────────────────────────────────────────");
});
