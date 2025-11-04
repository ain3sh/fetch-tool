#!/usr/bin/env node

// Verbose test
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
      console.log('📨 Raw response:', line.substring(0, 200));
      try {
        const json = JSON.parse(line);
        console.log('✅ Parsed JSON, id:', json.id, 'method:', json.method || 'response');

        if (json.result) {
          if (json.id === 1) {
            console.log('   Initialize successful');
          } else if (json.id === 2) {
            console.log('   Fetch call result received');
            if (json.result.content) {
              console.log('   Content length:', json.result.content.length);
              const text = json.result.content[0]?.text || '';
              console.log('   Text preview:', text.substring(0, 100));
            }
            server.kill();
            process.exit(0);
          }
        }

        if (json.error) {
          console.error('❌ Error:', json.error);
          server.kill();
          process.exit(1);
        }
      } catch (e) {
        console.log('⚠️  Parse error:', e.message);
      }
    }
  }
});

server.stderr.on('data', (data) => {
  console.log('📢 Server log:', data.toString().trim());
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

setTimeout(() => {
  console.log('1️⃣  Sending initialize...');
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
    console.log('2️⃣  Sending fetch call...');
    const fetchReq = {
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/call",
      params: {
        name: "fetch",
        arguments: {
          url: "https://example.com",
          text: { maxLength: 500 }
        }
      }
    };
    server.stdin.write(JSON.stringify(fetchReq) + '\n');
  }, 1000);
}, 500);

setTimeout(() => {
  console.error('❌ Test timed out after 20s');
  server.kill();
  process.exit(1);
}, 20000);
