import * as readline from "readline";
import { MedellinNewsClient } from "../client/index";

/**
 * MCP Host
 *
 * The HOST is the top-level application in the MCP architecture:
 *   Host → Client → Server
 *
 * Think of it like Claude Desktop, Cursor, or any AI app.
 * The host:
 *   - Creates and manages one or more MCP clients
 *   - Each client connects to one MCP server
 *   - Provides the user interface (here: interactive CLI)
 *   - Decides which tools to call based on user input
 *
 * Architecture flow:
 *   User → Host (this CLI) → Client (protocol handler) → Server (tool executor)
 */

class MedellinNewsHost {
  private client: MedellinNewsClient;
  private rl: readline.Interface;

  constructor() {
    this.client = new MedellinNewsClient();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => resolve(answer.trim()));
    });
  }

  private printHelp(): void {
    console.log(`
╔══════════════════════════════════════════════════════╗
║         Medellín News MCP Host                       ║
╠══════════════════════════════════════════════════════╣
║  Commands:                                           ║
║                                                      ║
║  tools        - List available MCP tools             ║
║  news <feed>  - Get news from a specific feed        ║
║                 Feeds: eltiempo, telemedellin,        ║
║                        googlenews                    ║
║  all          - Get news from ALL feeds              ║
║  limit <n>    - Set max headlines (default: 5)       ║
║  help         - Show this menu                       ║
║  quit         - Exit                                 ║
╚══════════════════════════════════════════════════════╝
`);
  }

  async run(): Promise<void> {
    console.log("\n🔌 Connecting to Medellín News MCP Server...\n");
    await this.client.connect();

    this.printHelp();

    let limit = 5;
    let running = true;

    while (running) {
      const input = await this.prompt("\nmcp> ");
      const [command, ...args] = input.split(/\s+/);

      switch (command?.toLowerCase()) {
        case "tools": {
          await this.client.listTools();
          break;
        }

        case "news": {
          const feed = args[0];
          if (!feed || !["eltiempo", "telemedellin", "googlenews"].includes(feed)) {
            console.log("Usage: news <eltiempo|telemedellin|googlenews>");
            break;
          }
          console.log(`\nFetching ${feed} (limit: ${limit})...\n`);
          const result = await this.client.callTool("get_news", { feed, limit });
          this.prettyPrint(result, feed);
          break;
        }

        case "all": {
          console.log(`\nFetching ALL feeds (limit: ${limit} each)...\n`);
          const result = await this.client.callTool("get_all_news", { limit });
          this.prettyPrintAll(result);
          break;
        }

        case "limit": {
          const n = parseInt(args[0]);
          if (isNaN(n) || n < 1 || n > 50) {
            console.log("Usage: limit <1-50>");
          } else {
            limit = n;
            console.log(`Limit set to ${limit}`);
          }
          break;
        }

        case "help": {
          this.printHelp();
          break;
        }

        case "quit":
        case "exit":
        case "q": {
          running = false;
          break;
        }

        case "": {
          break;
        }

        default: {
          console.log(`Unknown command: "${command}". Type "help" for options.`);
        }
      }
    }

    console.log("\nDisconnecting...");
    await this.client.disconnect();
    this.rl.close();
    console.log("Goodbye!");
  }

  private prettyPrint(json: string, feedName: string): void {
    try {
      const items = JSON.parse(json);
      console.log(`\n═══ ${feedName.toUpperCase()} ═══\n`);
      for (const item of items) {
        console.log(`  📰 ${item.title}`);
        console.log(`     Source: ${item.source}`);
        console.log(`     Date:   ${item.publishedAt}`);
        console.log(`     URL:    ${item.url}`);
        if (item.description) {
          const desc = item.description.substring(0, 120);
          console.log(`     ${desc}${item.description.length > 120 ? "..." : ""}`);
        }
        console.log();
      }
    } catch {
      console.log(json);
    }
  }

  private prettyPrintAll(json: string): void {
    try {
      const feeds = JSON.parse(json);
      for (const [feedKey, items] of Object.entries(feeds)) {
        if (typeof items === "string") {
          console.log(`\n═══ ${feedKey.toUpperCase()} ═══`);
          console.log(`  ${items}`);
          continue;
        }
        this.prettyPrint(JSON.stringify(items), feedKey);
      }
    } catch {
      console.log(json);
    }
  }
}

// --- Start the host ---

const host = new MedellinNewsHost();
host.run().catch((err) => {
  console.error("Host error:", err);
  process.exit(1);
});
