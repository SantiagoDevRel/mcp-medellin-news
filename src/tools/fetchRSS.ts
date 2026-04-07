// Generic RSS fetcher tool
// Used by all RSS sources in the MCP server
// Returns an array of NewsArticle objects from any RSS feed URL

import Parser from 'rss-parser'
import { NewsArticle, MCPToolResult } from '../types'

const parser = new Parser()

export async function fetchRSS(
  url: string,
  sourceName: string,
  limit = 10
): Promise<MCPToolResult<NewsArticle[]>> {
  try {
    const feed = await parser.parseURL(url)
    const articles: NewsArticle[] = feed.items
      .slice(0, limit)
      .map(item => ({
        title: item.title || '',
        url: item.link || '',
        source: sourceName,
        publishedAt: item.pubDate || new Date().toISOString(),
        description: item.contentSnippet || item.content || ''
      }))
    return {
      success: true,
      data: articles,
      fetchedAt: new Date().toISOString(),
      source: sourceName
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt: new Date().toISOString(),
      source: sourceName
    }
  }
}
