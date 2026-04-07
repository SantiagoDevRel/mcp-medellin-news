// Main playground app - dark-theme UI for testing MCP tools
// Calls the local Express proxy server (port 3333) to avoid CORS issues.
// The proxy fetches RSS feeds and SIATA data server-side.

import { useState } from 'react'
import ToolCard from './components/ToolCard'
import ResultViewer from './components/ResultViewer'

const PROXY_URL = 'http://localhost:3333'

const RSS_SOURCES = [
  { id: 'telemedellin', name: 'Telemedellín' },
  { id: 'eltiempo_medellin', name: 'El Tiempo Medellín' },
  { id: 'minuto30', name: 'Minuto30' },
  { id: 'vivir_poblado', name: 'Vivir en El Poblado' },
  { id: 'centropolis', name: 'Centrópolis Medellín' },
  { id: 'google_news_medellin', name: 'Google News Medellín' },
]

const TOOLS = [
  { name: 'fetch_news', description: 'Fetch news articles from Medellín media sources' },
  { name: 'fetch_telegram', description: 'Fetch messages from public Telegram channels' },
  { name: 'fetch_air_quality', description: 'Get SIATA air quality readings for Medellín' },
  { name: 'list_sources', description: 'List all available news and data sources' },
]

const TELEGRAM_CHANNELS = [
  { value: 'chismefrescomedallo', label: 'Chisme Fresco Medellín' },
  { value: 'denunciasantioqu', label: 'Denuncias Antioquia' },
]

export default function App() {
  const [selectedTool, setSelectedTool] = useState('fetch_news')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // fetch_news params
  const [sourceId, setSourceId] = useState('all')
  const [limit, setLimit] = useState(10)

  // fetch_telegram params
  const [channel, setChannel] = useState('chismefrescomedallo')

  async function runTool() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (selectedTool === 'fetch_news') {
        const res = await fetch(`${PROXY_URL}/api/news?source_id=${sourceId}&limit=${limit}`)
        if (!res.ok) throw new Error(`Proxy returned ${res.status}`)
        const data = await res.json()
        setResult(data)
      } else if (selectedTool === 'fetch_air_quality') {
        const res = await fetch(`${PROXY_URL}/api/air-quality`)
        if (!res.ok) throw new Error(`Proxy returned ${res.status}`)
        const data = await res.json()
        setResult(data)
      } else if (selectedTool === 'list_sources') {
        const res = await fetch(`${PROXY_URL}/api/sources`)
        if (!res.ok) throw new Error(`Proxy returned ${res.status}`)
        const data = await res.json()
        setResult(data)
      } else if (selectedTool === 'fetch_telegram') {
        setResult({
          success: false,
          data: null,
          error: 'Requires TELEGRAM_BOT_TOKEN - configure in .env to enable',
          fetchedAt: new Date().toISOString(),
          source: channel,
        })
      }
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    }

    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      margin: 0,
      overflow: 'hidden',
    }}>
      {/* LEFT SIDEBAR */}
      <aside style={{
        width: '280px',
        minWidth: '280px',
        borderRight: '1px solid #1a1a1a',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            MCP Medellín
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
          </h1>
          <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 0' }}>Model Context Protocol Hub</p>
        </div>

        <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>
          Tools Available
        </div>

        {TOOLS.map(tool => (
          <ToolCard
            key={tool.name}
            name={tool.name}
            description={tool.description}
            isSelected={selectedTool === tool.name}
            onClick={() => { setSelectedTool(tool.name); setResult(null); setError(null) }}
          />
        ))}
      </aside>

      {/* RIGHT PANEL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: '16px', color: '#00ff88' }}>
            {selectedTool}
          </span>
          <button
            onClick={runTool}
            disabled={loading}
            style={{
              padding: '8px 20px',
              background: loading ? '#004422' : '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            {loading ? 'Running...' : 'Run Tool'}
          </button>
        </div>

        {/* Parameters */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>
            Parameters
          </div>

          {selectedTool === 'fetch_news' && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>source_id</span>
                <select
                  value={sourceId}
                  onChange={e => setSourceId(e.target.value)}
                  style={{
                    background: '#111',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  <option value="all">All sources</option>
                  {RSS_SOURCES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>limit</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={limit}
                  onChange={e => setLimit(Number(e.target.value))}
                  style={{
                    background: '#111',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    width: '70px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                />
              </label>
            </div>
          )}

          {selectedTool === 'fetch_telegram' && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>channel</span>
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  style={{
                    background: '#111',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  {TELEGRAM_CHANNELS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {(selectedTool === 'fetch_air_quality' || selectedTool === 'list_sources') && (
            <span style={{ color: '#555', fontSize: '13px' }}>No parameters required</span>
          )}
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>
            Result
          </div>
          <ResultViewer result={result} loading={loading} error={error} />
        </div>
      </main>
    </div>
  )
}
