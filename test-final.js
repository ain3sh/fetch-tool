#!/usr/bin/env node

// Final comprehensive test with --ignore-robots-txt flag
import { spawn } from 'child_process';

console.log('🧪 DEEP-FETCH MCP SERVER - COMPREHENSIVE TEST\n');
console.log('═'.repeat(70));

// Start server with --ignore-robots-txt to avoid DNS issues in sandbox
const server = spawn('node', ['dist/index.js', '--ignore-robots-txt']);

let responseBuffer = '';
let requestId = 0;
let testResults = [];

function test(name, passed, details = '') {
  testResults.push({ name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${details ? ': ' + details : ''}`);
}

function sendRequest(method, params = {}) {
  const req = {
    jsonrpc: "2.0",
    id: ++requestId,
    method,
    params
  };
  server.stdin.write(JSON.stringify(req) + '\n');
  return requestId;
}

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop();

  for (const line of lines) {
    if (line.trim()) {
      try {
        const json = JSON.parse(line);

        if (json.error) {
          test(`Request #${json.id}`, false, json.error.message);
          continue;
        }

        // Test 1: Initialize
        if (json.id === 1 && json.result) {
          test('Server initialization', true);
          test('Server name', json.result.serverInfo.name === 'deep-fetch', json.result.serverInfo.name);
          test('Protocol version', json.result.protocolVersion === '2024-11-05', json.result.protocolVersion);
          test('Tools capability', json.result.capabilities.tools !== undefined);
          test('Resources capability', json.result.capabilities.resources !== undefined);

          console.log('\n📋 Listing available tools...');
          sendRequest('tools/list');
        }

        // Test 2: Tools list
        if (json.id === 2 && json.result && json.result.tools) {
          const tools = json.result.tools;
          test('Tools list response', tools.length > 0, `${tools.length} tool(s)`);

          if (tools.length > 0) {
            const tool = tools[0];
            test('Tool name', tool.name === 'fetch', tool.name);
            test('Tool description exists', tool.description && tool.description.length > 100);
            test('Tool has inputSchema', tool.inputSchema !== undefined);
            test('inputSchema has url property', tool.inputSchema.properties?.url !== undefined);
            test('inputSchema has images property', tool.inputSchema.properties?.images !== undefined);
            test('inputSchema has text property', tool.inputSchema.properties?.text !== undefined);
          }

          console.log('\n🌐 Testing fetch tool with example.com...');
          sendRequest('tools/call', {
            name: 'fetch',
            arguments: {
              url: 'https://example.com',
              text: { maxLength: 2000 }
            }
          });
        }

        // Test 3: Fetch call
        if (json.id === 3 && json.result) {
          if (json.result.isError) {
            test('Fetch execution', false, json.result.content[0]?.text);
          } else {
            const content = json.result.content[0];
            test('Fetch execution', true);
            test('Response has content', content !== undefined);
            test('Content type is text', content.type === 'text');

            const text = content.text || '';
            test('Content length', text.length > 0, `${text.length} chars`);
            test('Content mentions "Example"', text.includes('Example'));
            test('Content is markdown', text.includes('#') || text.includes('**'));

            console.log('\n📄 Fetched content preview:');
            console.log('─'.repeat(70));
            console.log(text.substring(0, 500));
            if (text.length > 500) console.log('...');
            console.log('─'.repeat(70));

            // Test 4: Fetch with different parameters
            console.log('\n🔧 Testing with raw HTML option...');
            sendRequest('tools/call', {
              name: 'fetch',
              arguments: {
                url: 'https://example.com',
                text: { raw: true, maxLength: 500 }
              }
            });
          }
        }

        // Test 4: Raw HTML fetch
        if (json.id === 4 && json.result) {
          if (!json.result.isError) {
            const content = json.result.content[0];
            const text = content.text || '';
            test('Raw HTML fetch', true);
            test('Raw HTML has HTML tags', text.includes('<html>') || text.includes('<!DOCTYPE'));

            console.log('\n📄 Raw HTML preview:');
            console.log('─'.repeat(70));
            console.log(text.substring(0, 300));
            console.log('─'.repeat(70));
          }

          // Done!
          setTimeout(() => {
            printSummary();
          }, 500);
        }

      } catch (e) {
        // Skip parse errors
      }
    }
  }
});

function printSummary() {
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 TEST SUMMARY:\n');

  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;
  const total = testResults.length;

  console.log(`   ✅ Passed: ${passed}/${total}`);
  console.log(`   ❌ Failed: ${failed}/${total}`);

  if (failed > 0) {
    console.log('\n   Failed tests:');
    testResults.filter(t => !t.passed).forEach(t => {
      console.log(`     • ${t.name}${t.details ? ': ' + t.details : ''}`);
    });
  }

  console.log('\n' + '═'.repeat(70));

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Deep-fetch MCP server is fully operational!\n');
    server.kill();
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check output above.\n`);
    server.kill();
    process.exit(1);
  }
}

server.stderr.on('data', (data) => {
  const msg = data.toString();
  if (msg.includes('Server started')) {
    console.log('🚀 Server started successfully\n');
  }
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

// Start test sequence
setTimeout(() => {
  console.log('🔌 Initializing connection...\n');
  sendRequest('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "deep-fetch-test",
      version: "1.0.0"
    }
  });
}, 1000);

// Safety timeout
setTimeout(() => {
  console.error('\n❌ Tests timed out after 30 seconds');
  printSummary();
  server.kill();
  process.exit(1);
}, 30000);
