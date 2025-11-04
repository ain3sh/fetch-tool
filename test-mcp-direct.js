#!/usr/bin/env node

// Direct stdio test - send JSON-RPC to server
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js']);

let responseBuffer = '';

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop(); // Keep incomplete line in buffer

  for (const line of lines) {
    if (line.trim()) {
      console.log('📨 Server response:');
      try {
        const json = JSON.parse(line);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Raw:', line);
      }
    }
  }
});

server.stderr.on('data', (data) => {
  console.error('📢 Server stderr:', data.toString());
});

// Wait for server to start
setTimeout(() => {
  console.log('📤 Sending initialize request...\n');
  const initializeRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  };

  server.stdin.write(JSON.stringify(initializeRequest) + '\n');

  setTimeout(() => {
    console.log('\n📤 Sending tools/list request...\n');
    const toolsListRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    };

    server.stdin.write(JSON.stringify(toolsListRequest) + '\n');

    setTimeout(() => {
      server.kill();
      process.exit(0);
    }, 2000);
  }, 1000);
}, 1000);
