import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * MCP Client
 *
 * The CLIENT is the middle layer in the MCP architecture:
 *   Host → Client → Server
 *
 * It maintains a 1:1 connection with a single MCP server.
 * The client handles:
 *   - Establishing the connection (via stdio transport here)
 *   - Protocol negotiation (capabilities, version)
 *   - Sending requests to the server (list tools, call tools)
 *   - Receiving responses and forwarding them to the host
 */

export class MedellinNewsClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;

  constructor() {
    this.client = new Client({
      name: "medellin-news-client",
      version: "1.0.0",
    });
  }

  async connect(): Promise<void> {
    // StdioClientTransport spawns the server as a child process
    // and communicates via stdin/stdout (JSON-RPC over stdio)
    this.transport = new StdioClientTransport({
      command: "node",
      args: [require("path").resolve(__dirname, "../server/index.js")],
    });

    await this.client.connect(this.transport);
    console.log("Client connected to Medellín News MCP Server");
  }

  async listTools(): Promise<void> {
    const result = await this.client.listTools();
    console.log("\n--- Available Tools ---");
    for (const tool of result.tools) {
      console.log(`\n  Tool: ${tool.name}`);
      console.log(`  Description: ${tool.description}`);
      console.log(`  Input Schema: ${JSON.stringify(tool.inputSchema, null, 4)}`);
    }
    console.log("\n----------------------");
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<string> {
    const result = await this.client.callTool({ name, arguments: args });
    const content = result.content as Array<{ type: string; text: string }>;
    return content.map((c) => c.text).join("\n");
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log("Client disconnected");
  }
}

// --- Standalone test: run the client directly ---

async function main() {
  const client = new MedellinNewsClient();
  await client.connect();

  // List available tools
  await client.listTools();

  // Test: get_news from El Tiempo with 3 headlines
  console.log("\n--- Calling get_news (eltiempo, limit: 3) ---");
  const news = await client.callTool("get_news", { feed: "eltiempo", limit: 3 });
  console.log(news);

  await client.disconnect();
}

main().catch((err) => {
  console.error("Client error:", err);
  process.exit(1);
});
