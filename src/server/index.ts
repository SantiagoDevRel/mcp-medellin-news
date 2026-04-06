import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Parser from "rss-parser";

// --- RSS Feed Configuration ---

interface FeedConfig {
  name: string;
  url: string;
}

const FEEDS: Record<string, FeedConfig> = {
  eltiempo: {
    name: "El Tiempo Medellín",
    url: "https://www.eltiempo.com/rss/colombia_medellin.xml",
  },
  telemedellin: {
    name: "Telemedellín",
    url: "https://telemedellin.tv/feed/",
  },
  googlenews: {
    name: "Google News Medellín",
    url: "https://news.google.com/rss/search?q=medell%C3%ADn+colombia&hl=es-419&gl=CO&ceid=CO:es-419",
  },
};

const parser = new Parser();

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description: string;
}

async function fetchFeed(key: string): Promise<NewsItem[]> {
  const config = FEEDS[key];
  if (!config) throw new Error(`Unknown feed key: ${key}`);

  const feed = await parser.parseURL(config.url);
  return feed.items.map((item) => ({
    title: item.title || "",
    url: item.link || "",
    source:
      key === "googlenews"
        ? item.title?.split(" - ").pop()?.trim() || "Google News"
        : config.name,
    publishedAt: item.pubDate || new Date().toISOString(),
    description: item.contentSnippet || item.content || "",
  }));
}

// --- MCP Server Setup ---

const server = new McpServer({
  name: "medellin-news",
  version: "1.0.0",
});

// Tool 1: get_news — fetch a single feed by key
server.tool(
  "get_news",
  "Fetch news headlines from a single Medellín RSS feed",
  {
    feed: z
      .enum(["eltiempo", "telemedellin", "googlenews"])
      .describe("Which feed to fetch"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Max number of headlines to return"),
  },
  async ({ feed, limit }) => {
    try {
      const items = await fetchFeed(feed);
      const limited = items.slice(0, limit);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(limited, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching ${feed}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool 2: get_all_news — fetch all feeds in parallel
server.tool(
  "get_all_news",
  "Fetch news headlines from ALL Medellín RSS feeds in parallel",
  {
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Max headlines per feed"),
  },
  async ({ limit }) => {
    const keys = Object.keys(FEEDS);
    const results = await Promise.allSettled(keys.map((k) => fetchFeed(k)));

    const output: Record<string, NewsItem[] | string> = {};
    results.forEach((result, i) => {
      const key = keys[i];
      if (result.status === "fulfilled") {
        output[key] = result.value.slice(0, limit);
      } else {
        output[key] = `Error: ${result.reason}`;
      }
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(output, null, 2),
        },
      ],
    };
  }
);

// --- Start server on stdio ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Medellín News MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
