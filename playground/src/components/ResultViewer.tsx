// Displays MCP tool result as formatted JSON
// Props: result (any), loading (boolean), error (string | null)

interface ResultViewerProps {
  result: any
  loading: boolean
  error: string | null
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '40px', justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00ff88',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let color = '#b5cea8' // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          color = '#00ff88' // key
        } else {
          color = '#ce9178' // string
        }
      } else if (/true|false/.test(match)) {
        color = '#569cd6' // boolean
      } else if (/null/.test(match)) {
        color = '#666' // null
      }
      return `<span style="color:${color}">${match}</span>`
    }
  )
}

export default function ResultViewer({ result, loading, error }: ResultViewerProps) {
  if (loading) return <LoadingDots />

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#ff4444', background: '#1a0000', borderRadius: '8px', fontSize: '14px' }}>
        Error: {error}
      </div>
    )
  }

  if (!result) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#444', fontSize: '14px' }}>
        Select a tool and click "Run Tool" to see results
      </div>
    )
  }

  // Extract summary badges
  const badges: { label: string; value: string; color: string }[] = []
  if (Array.isArray(result)) {
    // Multiple source results
    const successCount = result.filter((r: any) => r.success).length
    badges.push({ label: 'sources', value: `${successCount}/${result.length}`, color: '#00ff88' })
  } else if (result.success !== undefined) {
    badges.push({
      label: 'success',
      value: result.success ? 'true' : 'false',
      color: result.success ? '#00ff88' : '#ff4444'
    })
    if (result.source) badges.push({ label: 'source', value: result.source, color: '#569cd6' })
    if (result.fetchedAt) badges.push({ label: 'fetchedAt', value: result.fetchedAt, color: '#888' })
  }

  const jsonStr = JSON.stringify(result, null, 2)

  return (
    <div>
      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {badges.map(b => (
            <span
              key={b.label}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                background: '#111',
                fontSize: '12px',
                fontFamily: 'monospace',
                border: '1px solid #222',
              }}
            >
              <span style={{ color: '#666' }}>{b.label}: </span>
              <span style={{ color: b.color }}>{b.value}</span>
            </span>
          ))}
        </div>
      )}
      <pre
        style={{
          background: '#111111',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          maxHeight: '600px',
          fontSize: '13px',
          fontFamily: 'monospace',
          lineHeight: '1.5',
          margin: 0,
          color: '#ccc',
        }}
        dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonStr) }}
      />
    </div>
  )
}
