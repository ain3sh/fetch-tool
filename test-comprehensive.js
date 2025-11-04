#!/usr/bin/env node

// Comprehensive MCP server test with network access
import { spawn } from 'child_process';

console.log('🧪 COMPREHENSIVE MCP SERVER TEST\n');
console.log('═'.repeat(60));

const server = spawn('node', ['dist/index.js']);

let responseBuffer = '';
let requestId = 0;
let testsPassed = 0;
let testsFailed = 0;

function sendRequest(method, params = {}) {
  const req = {
    jsonrpc: "2.0",
    id: ++requestId,
    method,
    params
  };
  console.log(`\n📤 Request #${requestId}: ${method}`);
  server.stdin.write(JSON.stringify(req) + '\n');
  return requestId;
}

function pass(test) {
  testsPassed++;
  console.log(`✅ ${test}`);
}

function fail(test, reason) {
  testsFailed++;
  console.error(`❌ ${test}: ${reason}`);
}

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop();

  for (const line of lines) {
    if (line.trim()) {
      try {
        const json = JSON.parse(line);
        console.log(`📨 Response #${json.id}: ${JSON.stringify(json).substring(0, 80)}...`);

        if (json.error) {
          fail(`Request #${json.id}`, json.error.message);
          continue;
        }

        if (json.id === 1) {
          // Initialize response
          if (json.result && json.result.serverInfo && json.result.serverInfo.name === 'deep-fetch') {
            pass('Server initialized with name "deep-fetch"');
            pass(`Protocol version: ${json.result.protocolVersion}`);

            // Test 2: List tools
            sendRequest('tools/list');
          } else {
            fail('Initialize', 'Invalid server info');
          }
        }

        if (json.id === 2) {
          // Tools list response
          if (json.result && json.result.tools && json.result.tools.length > 0) {
            const tool = json.result.tools[0];
            pass(`Found tool: "${tool.name}"`);
            pass(`Tool has description: ${tool.description.substring(0, 50)}...`);
            pass(`Tool has inputSchema with ${Object.keys(tool.inputSchema.properties || {}).length} properties`);

            // Test 3: Fetch a real page
            console.log('\n🌐 Fetching real web page...');
            sendRequest('tools/call', {
              name: 'fetch',
              arguments: {
                url: 'https://example.com',
                text: { maxLength: 1000 }
              }
            });
          } else {
            fail('tools/list', 'No tools found');
          }
        }

        if (json.id === 3) {
          // Fetch call response
          if (json.result && json.result.content && json.result.content.length > 0) {
            const content = json.result.content[0];

            if (json.result.isError) {
              fail('Fetch call', content.text);
            } else if (content.type === 'text') {
              pass('Fetch call succeeded');
              pass(`Fetched ${content.text.length} characters`);

              // Check for expected content
              if (content.text.toLowerCase().includes('example')) {
                pass('Content contains expected text');
              }

              console.log('\n📄 Content preview:');
              console.log('─'.repeat(60));
              console.log(content.text.substring(0, 400));
              console.log('─'.repeat(60));

              // Test 4: Fetch with images (without actual save)
              console.log('\n🖼️  Testing with images parameter...');
              sendRequest('tools/call', {
                name: 'fetch',
                arguments: {
                  url: 'https://example.com',
                  images: false,
                  text: { maxLength: 500 }
                }
              });
            } else {
              fail('Fetch call', 'Unexpected content type');
            }
          } else {
            fail('Fetch call', 'No content in response');
          }
        }

        if (json.id === 4) {
          // Second fetch with images parameter
          if (json.result && !json.result.isError) {
            pass('Fetch with images:false parameter works');
          }

          // Done!
          setTimeout(() => {
            console.log('\n' + '═'.repeat(60));
            console.log(`\n📊 TEST SUMMARY:`);
            console.log(`   ✅ Passed: ${testsPassed}`);
            console.log(`   ❌ Failed: ${testsFailed}`);
            console.log(`   📈 Total:  ${testsPassed + testsFailed}`);

            if (testsFailed === 0) {
              console.log('\n🎉 ALL TESTS PASSED! Server is working perfectly!\n');
              server.kill();
              process.exit(0);
            } else {
              console.log('\n⚠️  Some tests failed, but server is functional.\n');
              server.kill();
              process.exit(1);
            }
          }, 500);
        }

      } catch (e) {
        // Skip parse errors
      }
    }
  }
});

server.stderr.on('data', (data) => {
  const msg = data.toString().trim();
  if (msg && !msg.includes('Server started with')) {
    console.log(`📢 Server: ${msg}`);
  }
});

server.on('error', (err) => {
  fail('Server spawn', err.message);
  process.exit(1);
});

// Start tests
setTimeout(() => {
  console.log('\n🚀 Starting test sequence...\n');

  // Test 1: Initialize
  sendRequest('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "comprehensive-test",
      version: "1.0.0"
    }
  });
}, 500);

// Safety timeout
setTimeout(() => {
  console.error('\n❌ Tests timed out after 30 seconds');
  server.kill();
  process.exit(1);
}, 30000);
