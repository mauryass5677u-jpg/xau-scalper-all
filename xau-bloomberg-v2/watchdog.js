#!/usr/bin/env node
/* ============================================================
   XAU/USDT OMNISCIENT SCALPER TERMINAL v12.0 — WATCHDOG
   Permanent 24/7 supervisor.
   - Starts the local server on port 8080
   - Starts a Cloudflare quick tunnel -> universal https link
   - Auto-restarts either if it crashes
   - Survives PC reboots when registered as a logon task
   - Writes the current universal URL to url.txt
   Usage: node watchdog.js
   ============================================================ */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SERVER_PORT = 8080;
const SERVER = "serve.js";
const TUNNEL = path.join(ROOT, "cloudflared.exe");
const URL_FILE = path.join(ROOT, "url.txt");
const LOG_FILE = path.join(ROOT, "watchdog.log");
const LOCK_FILE = path.join(ROOT, "watchdog.pid");

/* ---------- SINGLE-INSTANCE GUARD ---------- */
function checkSingleInstance() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const oldPid = parseInt(fs.readFileSync(LOCK_FILE, "utf8").trim(), 10);
      if (oldPid && !isNaN(oldPid)) {
        try {
          process.kill(oldPid, 0); // throws if process doesn't exist
          console.log("[watchdog] Another watchdog already running (pid " + oldPid + "). Exiting.");
          process.exit(0);
        } catch (_) { /* stale pid, continue */ }
      }
    }
    fs.writeFileSync(LOCK_FILE, String(process.pid));
  } catch (_) {}
}
checkSingleInstance();
process.on("exit", () => { try { fs.unlinkSync(LOCK_FILE); } catch (_) {} });

let server = null, tunnel = null;
let tunnelBuf = "";
let serverRestarts = 0, tunnelRestarts = 0;
let currentUrl = "";
let stopping = false;

function log(msg) {
  const line = "[" + new Date().toISOString() + "] " + msg;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch (_) {}
}

function writeUrl(url) {
  currentUrl = url;
  try {
    const content = "XAU/USDT OMNISCIENT SCALPER TERMINAL v12.0\n" +
      "LOCAL LINK:  http://localhost:" + SERVER_PORT + "\n" +
      "UNIVERSAL:   " + url + "\n" +
      "Updated:     " + new Date().toISOString() + "\n";
    fs.writeFileSync(URL_FILE, content);
  } catch (_) {}
}

/* ---------- SERVER ---------- */
function startServer() {
  log("Starting server: node " + SERVER + " on port " + SERVER_PORT);
  server = spawn("node", [SERVER, String(SERVER_PORT)], {
    cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], windowsHide: true
  });
  server.stdout.on("data", d => log("[server] " + d.toString().trim()));
  server.stderr.on("data", d => log("[server-err] " + d.toString().trim()));
  server.on("exit", (code, sig) => {
    log("Server exited (" + (sig || "code " + code) + "). " + (stopping ? "Stopped." : "Restarting in 3s..."));
    server = null;
    if (!stopping) {
      serverRestarts++;
      setTimeout(startServer, 3000);
    }
  });
  server.on("error", err => {
    log("Server spawn error: " + err.message);
    server = null;
    if (!stopping) setTimeout(startServer, 5000);
  });
}

/* ---------- TUNNEL ---------- */
function startTunnel() {
  if (!fs.existsSync(TUNNEL)) {
    log("cloudflared.exe not found at " + TUNNEL + " — tunnel disabled, local only.");
    return;
  }
  log("Starting Cloudflare tunnel -> http://localhost:" + SERVER_PORT);
  tunnel = spawn(TUNNEL, ["tunnel", "--no-autoupdate", "--url", "http://localhost:" + SERVER_PORT], {
    cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], windowsHide: true
  });
  tunnel.stdout.on("data", d => { tunnelBuf += d.toString(); scanTunnel(tunnelBuf); });
  tunnel.stderr.on("data", d => { tunnelBuf += d.toString(); scanTunnel(tunnelBuf); });
  tunnel.on("exit", (code, sig) => {
    log("Tunnel exited (" + (sig || "code " + code) + "). " + (stopping ? "Stopped." : "Restarting in 5s..."));
    tunnel = null;
    if (!stopping) {
      tunnelRestarts++;
      setTimeout(startTunnel, 5000);
    }
  });
  tunnel.on("error", err => {
    log("Tunnel spawn error: " + err.message);
    tunnel = null;
    if (!stopping) setTimeout(startTunnel, 7000);
  });
}

function scanTunnel(buf) {
  const m = buf.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (m && m[0] !== currentUrl) {
    log("Universal link ready: " + m[0]);
    writeUrl(m[0]);
  }
  if (tunnelBuf.length > 20000) tunnelBuf = tunnelBuf.slice(-10000);
}

/* ---------- HEALTH PING ---------- */
function healthCheck() {
  if (stopping) return;
  const http = require("http");
  const req = http.get({ host: "localhost", port: SERVER_PORT, path: "/", timeout: 4000 }, res => {
    res.resume();
    if (res.statusCode !== 200) log("Health check: server returned " + res.statusCode);
  });
  req.on("error", () => {
    log("Health check FAILED — server not responding.");
    if (!server) { log("(server process already dead, restart pending)"); }
    else {
      log("Forcing server restart...");
      try { server.kill("SIGKILL"); } catch (_) {}
      server = null;
      setTimeout(startServer, 1000);
    }
  });
  req.setTimeout(4000, () => { try { req.destroy(); } catch (_) {} });
}

/* ---------- STATS + SHUTDOWN ---------- */
function stats() {
  log("STATUS | server=" + (server ? "RUNNING" : "DOWN") +
      " tunnel=" + (tunnel ? "RUNNING" : "DOWN") +
      " | serverRestarts=" + serverRestarts + " tunnelRestarts=" + tunnelRestarts +
      " | " + currentUrl);
}

function shutdown() {
  if (stopping) return;
  stopping = true;
  log("Watchdog stopping — shutting down children...");
  try { if (server) server.kill(); } catch (_) {}
  try { if (tunnel) tunnel.kill(); } catch (_) {}
  setTimeout(() => process.exit(0), 1500);
}

/* ---------- MAIN ---------- */
log("=== WATCHDOG STARTING v12.0 ===");
writeUrl("(tunnel starting...)");
startServer();
setTimeout(startTunnel, 1500);
setInterval(healthCheck, 10000);      // ping every 10s
setInterval(stats, 60 * 1000);        // status every 60s
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", err => log("UNCAUGHT: " + err.message));
process.on("unhandledRejection", err => log("UNHANDLED REJECTION: " + (err && err.message)));
