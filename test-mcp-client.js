#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testMCPServer() {
  console.log("🧪 Testing deep-fetch MCP server...\n");

  // Create client transport
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
  });

  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  }, {
    capabilities: {},
  });

  try {
    // Connect to server
    console.log("📡 Connecting to server...");
    await client.connect(transport);
    console.log("✅ Connected!\n");

    // List tools
    console.log("🔧 Listing tools...");
    const toolsResponse = await client.request({
      method: "tools/list",
    }, {});

    console.log(`✅ Found ${toolsResponse.tools.length} tool(s):`);
    for (const tool of toolsResponse.tools) {
      console.log(`   - ${tool.name}: ${tool.description.split('\n')[0]}`);
    }
    console.log("");

    // Test a simple fetch (using a lightweight page)
    console.log("🌐 Testing fetch tool with example.com...");
    const fetchResponse = await client.request({
      method: "tools/call",
      params: {
        name: "fetch",
        arguments: {
          url: "https://example.com",
          text: { maxLength: 500 },
        },
      },
    }, {});

    console.log("✅ Fetch successful!\n");
    console.log("📄 Response:");
    if (fetchResponse.content && fetchResponse.content[0]) {
      const content = fetchResponse.content[0].text;
      console.log(content.substring(0, 300) + "...\n");
    }

    // Close connection
    await client.close();
    console.log("✅ Test completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.stack) {
      console.error("\n📚 Stack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testMCPServer();
