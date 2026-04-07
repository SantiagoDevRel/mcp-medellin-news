// Shared TypeScript types for the MCP Medellín News server

export interface NewsArticle {
  title: string
  url: string
  source: string
  publishedAt: string
  description: string
  category?: string
}

export interface TelegramMessage {
  id: number
  text: string
  date: string
  channel: string
  views?: number
}

export interface SIATAAlert {
  station: string
  parameter: string  // PM2.5, temperature, rain, etc
  value: number
  unit: string
  timestamp: string
  level: 'good' | 'moderate' | 'unhealthy' | 'hazardous'
}

export interface MCPToolResult<T> {
  success: boolean
  data: T | null
  error?: string
  fetchedAt: string
  source: string
}
