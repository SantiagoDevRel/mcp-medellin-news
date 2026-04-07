// Simple Express proxy server for the MCP Medellín playground
// Runs alongside the Vite dev server on port 3333
// Fetches RSS feeds server-side to avoid CORS restrictions in the browser

import express from 'express'
import cors from 'cors'
import Parser from 'rss-parser'

const app = express()
const parser = new Parser()
app.use(cors())
app.use(express.json())

// RSS sources config (mirrors src/sources/sources.ts)
const RSS_SOURCES = [
  { id: 'telemedellin', name: 'Telemedellín', url: 'https://telemedellin.tv/feed/' },
  { id: 'eltiempo_medellin', name: 'El Tiempo Medellín', url: 'https://www.eltiempo.com/rss/colombia_medellin.xml' },
  { id: 'minuto30', name: 'Minuto30', url: 'https://www.minuto30.com/feed' },
  { id: 'vivir_poblado', name: 'Vivir en El Poblado', url: 'https://www.vivirenelpoblado.com/feed' },
  { id: 'centropolis', name: 'Centrópolis Medellín', url: 'https://www.centropolismedellin.com/feed' },
  { id: 'google_news_medellin', name: 'Google News Medellín', url: 'https://news.google.com/rss/search?q=medell%C3%ADn+colombia&hl=es-419&gl=CO&ceid=CO:es-419' }
]

// GET /api/news?source_id=all&limit=10
// Fetches one or all RSS sources and returns articles
app.get('/api/news', async (req, res) => {
  const sourceId = (req.query.source_id as string) || 'all'
  const limit = Math.min(parseInt(req.query.limit as string || '10'), 20)

  const sources = sourceId === 'all'
    ? RSS_SOURCES
    : RSS_SOURCES.filter(s => s.id === sourceId)

  if (sources.length === 0) {
    res.json({
      success: false,
      error: `Source ${sourceId} not found`,
      available: RSS_SOURCES.map(s => s.id)
    })
    return
  }

  const results = await Promise.all(
    sources.map(async source => {
      try {
        const feed = await parser.parseURL(source.url)
        const articles = feed.items.slice(0, limit).map(item => ({
          title: item.title || '',
          url: item.link || '',
          source: source.name,
          publishedAt: item.pubDate || new Date().toISOString(),
          description: item.contentSnippet || item.content || ''
        }))
        return { success: true, data: articles, source: source.name, fetchedAt: new Date().toISOString() }
      } catch (error) {
        return {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          source: source.name,
          fetchedAt: new Date().toISOString()
        }
      }
    })
  )

  res.json(results)
})

// GET /api/air-quality
// Fetches SIATA PM2.5 data server-side
app.get('/api/air-quality', async (req, res) => {
  try {
    const response = await fetch(
      'https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_pm25.json',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    if (!response.ok) throw new Error(`SIATA returned ${response.status}`)
    const data: any = await response.json()

    // Parse nested station structure
    const alerts: any[] = []
    if (Array.isArray(data)) {
      for (const station of data) {
        if (!Array.isArray(station.datos) || station.datos.length === 0) continue
        const validReadings = station.datos.filter(
          (d: any) => d.valor !== -9999 && parseFloat(d.calidad || '999') <= 2.5
        )
        if (validReadings.length === 0) continue
        const latest = validReadings[validReadings.length - 1]
        const pm25 = latest.valor
        alerts.push({
          station: station.nombreCorto || station.nombre || 'Unknown',
          parameter: 'PM2.5',
          value: pm25,
          unit: 'µg/m³',
          timestamp: latest.fecha || new Date().toISOString(),
          level: pm25 < 12 ? 'good' : pm25 < 35 ? 'moderate' : pm25 < 55 ? 'unhealthy' : 'hazardous'
        })
      }
    }

    res.json({ success: true, data: alerts, fetchedAt: new Date().toISOString(), source: 'SIATA' })
  } catch (error) {
    res.json({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt: new Date().toISOString(),
      source: 'SIATA'
    })
  }
})

// GET /api/sources
// Returns all available sources
app.get('/api/sources', (req, res) => {
  res.json({ success: true, data: RSS_SOURCES, fetchedAt: new Date().toISOString() })
})

const PORT = 3333
app.listen(PORT, () => {
  console.log(`MCP Medellín proxy server running on http://localhost:${PORT}`)
})
