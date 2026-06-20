#!/usr/bin/env node
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "rewrite-mcp/tools/mcp/idea-inbox-server.js");

let server;
let msgId = 0;
const pending = new Map();

function nextId() { return ++msgId; }

function send(msg) {
  return new Promise((resolve, reject) => {
    const id = nextId();
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Timeout msg ${id} (60s)`));
    }, 60000);

    pending.set(id, (res) => {
      clearTimeout(timeout);
      resolve(res);
    });

    server.stdin.write(JSON.stringify({ ...msg, id }) + "\n");
  });
}

async function start() {
  return new Promise((resolve, reject) => {
    server = spawn("node", [serverPath], { stdio: ["pipe", "pipe", "pipe"] });

    let initialized = false;

    server.stdout.on("data", (data) => {
      const lines = data.toString().split("\n").filter(l => l.trim());
      for (const line of lines) {
        try {
          const res = JSON.parse(line);
          if (res.id && pending.has(res.id)) {
            console.log(`[Response id=${res.id}]`);
            const cb = pending.get(res.id);
            pending.delete(res.id);
            cb(res);
          } else if (res.result?.protocolVersion) {
            initialized = true;
          }
        } catch (e) {
          console.log(`[Parse error]: ${line.substring(0, 100)}`);
        }
      }
    });

    server.stderr.on("data", (data) => {
      console.error("\n[SERVER ERROR]:", data.toString());
    });

    server.on("error", reject);

    setTimeout(() => {
      server.stdin.write(JSON.stringify({ method: "initialize", params: {} }) + "\n");
      setTimeout(() => {
        if (initialized || server.exitCode === null) {
          resolve();
        } else {
          reject(new Error("Init failed"));
        }
      }, 100);
    }, 100);
  });
}

async function stop() {
  return new Promise((resolve) => {
    if (server) {
      server.kill();
      server.on("exit", resolve);
      setTimeout(resolve, 1000);
    } else {
      resolve();
    }
  });
}

async function test() {
  console.log("\n=== HARVEST OLLAMA INTEGRATION TEST ===\n");

  try {
    // Clean data
    const fs = await import("fs");
    const dataDir = "C:\\dev\\rewrite-mcp\\data\\idea-inbox";
    if (fs.existsSync(dataDir)) {
      fs.rmSync(dataDir, { recursive: true, force: true });
    }

    await start();
    console.log("✓ Server started\n");

    // Capture
    console.log("1. Capture idea...");
    const captResp = await send({
      method: "tools/call",
      params: {
        name: "idea:capture",
        arguments: {
          title: "Performance boost",
          raw_content: "Cache auth tokens to reduce latency",
          source: "chat",
          captured_by: "test"
        }
      }
    });

    if (captResp.error) throw new Error(captResp.error.message);
    const captRes = JSON.parse(captResp.result.text);
    console.log(`✅ Captured: ${captRes.idea_id}\n`);

    // Harvest
    console.log("2. Harvest with Ollama...");
    const harvResp = await send({
      method: "tools/call",
      params: {
        name: "idea:harvest",
        arguments: { idea_id: captRes.idea_id }
      }
    });

    if (harvResp.error) throw new Error(harvResp.error.message);
    const harvRes = JSON.parse(harvResp.result.text);
    console.log(`✅ Harvested:`);
    console.log(`   Status: ${harvRes.status}`);
    console.log(`   Classification: ${harvRes.classification}`);
    console.log(`   Score: ${harvRes.harvest_score}`);
    console.log(`   Confidence: ${(harvRes.confidence * 100).toFixed(1)}%\n`);

    console.log("✅ OLLAMA INTEGRATION WORKS!");

  } catch (e) {
    console.error(`\n❌ FAILED: ${e.message}`);
    process.exit(1);
  } finally {
    await stop();
  }
}

test().catch(e => {
  console.error("Fatal:", e.message);
  stop().then(() => process.exit(1));
});
