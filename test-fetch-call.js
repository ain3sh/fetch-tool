#!/usr/bin/env node

// Test the fetch tool with a real call
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js']);

let responseBuffer = '';
let requestId = 1;

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop();

  for (const line of lines) {
    if (line.trim()) {
      try {
        const json = JSON.parse(line);
        if (json.result && json.id === 3) {
          console.log('✅ Fetch call successful!\n');
          console.log('📄 Response content:');
          if (json.result.content && json.result.content[0]) {
            const text = json.result.content[0].text;
            console.log(text.substring(0, 500) + '...\n');
          } else {
            console.log(JSON.stringify(json.result, null, 2));
          }
          server.kill();
          process.exit(0);
        }
      } catch (e) {
        // Skip parse errors
      }
    }
  }
});

server.stderr.on('data', (data) => {
  // Suppress server logs
});

setTimeout(() => {
  // Initialize
  const initReq = {
    jsonrpc: "2.0",
    id: requestId++,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test", version: "1.0.0" }
    }
  };
  server.stdin.write(JSON.stringify(initReq) + '\n');

  setTimeout(() => {
    // Call fetch tool
    console.log('🌐 Testing fetch with example.com...\n');
    const fetchReq = {
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/call",
      params: {
        name: "fetch",
        arguments: {
          url: "https://example.com",
          text: { maxLength: 1000 }
        }
      }
    };
    server.stdin.write(JSON.stringify(fetchReq) + '\n');
  }, 500);
}, 500);

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Test timed out');
  server.kill();
  process.exit(1);
}, 15000);
