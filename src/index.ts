// MCP server entry point for mcp-medellin-news
// Exposes the following tools to any MCP client (Claude, agents, etc):
// - fetch_news: get articles from a specific RSS source or all sources
// - fetch_telegram: get recent messages from a public Telegram channel
// - fetch_air_quality: get SIATA air quality alerts for the Aburrá Valley
// - list_sources: list all available news sources

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { fetchRSS } from './tools/fetchRSS'
import { fetchTelegramChannel } from './tools/fetchTelegram'
import { fetchSIATAAlerts } from './tools/fetchSIATA'
import { RSS_SOURCES, TELEGRAM_SOURCES } from './sources/sources'

const server = new McpServer({
  name: 'mcp-medellin-news',
  version: '0.1.0'
})

// Tool 1: fetch_news
// Fetches articles from one specific source or all sources combined
server.tool(
  'fetch_news',
  'Fetch recent news articles from Medellín media sources',
  {
    source_id: z.string().optional().describe(
      'Source ID to fetch from. If omitted, fetches from all sources. ' +
      'Available: telemedellin, eltiempo_medellin, minuto30, ' +
      'vivir_poblado, elmundo_medellin, google_news_medellin'
    ),
    limit: z.number().optional().default(10).describe(
      'Number of articles to return per source (max 20)'
    )
  },
  async ({ source_id, limit = 10 }) => {
    const safeLimit = Math.min(limit, 20)

    if (source_id) {
      const source = RSS_SOURCES.find(s => s.id === source_id)
      if (!source) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              error: `Source ${source_id} not found`,
              available: RSS_SOURCES.map(s => s.id)
            })
          }]
        }
      }
      const result = await fetchRSS(source.url, source.name, safeLimit)
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] }
    }

    // Fetch all sources in parallel
    const results = await Promise.all(
      RSS_SOURCES.map(source => fetchRSS(source.url, source.name, safeLimit))
    )
    return { content: [{ type: 'text' as const, text: JSON.stringify(results) }] }
  }
)

// Tool 2: fetch_telegram
// Reads recent messages from a public Telegram channel
server.tool(
  'fetch_telegram',
  'Fetch recent messages from a public Medellín Telegram channel',
  {
    channel: z.enum(['chismefrescomedallo', 'denunciasantioqu']).describe(
      'Telegram channel username to fetch from'
    ),
    limit: z.number().optional().default(10).describe(
      'Number of messages to return (max 20)'
    )
  },
  async ({ channel, limit = 10 }) => {
    const result = await fetchTelegramChannel(channel, Math.min(limit, 20))
    return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] }
  }
)

// Tool 3: fetch_air_quality
// Gets SIATA air quality data for the Aburrá Valley
server.tool(
  'fetch_air_quality',
  'Get current air quality readings from SIATA monitoring stations in Medellín',
  {},
  async () => {
    const result = await fetchSIATAAlerts()
    return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] }
  }
)

// Tool 4: list_sources
// Returns all available sources so clients know what they can query
server.tool(
  'list_sources',
  'List all available news and data sources for Medellín',
  {},
  async () => {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          rss: RSS_SOURCES,
          telegram: TELEGRAM_SOURCES,
          other: [{ id: 'siata', name: 'SIATA', type: 'api', description: 'Air quality and weather alerts' }]
        })
      }]
    }
  }
)

// Start the MCP server using stdio transport
// (stdio means input/output via standard streams, the default MCP transport)
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('mcp-medellin-news server running')
}

main().catch(console.error)
