// Sidebar card component showing a single MCP tool
// Props: name, description, isSelected, onClick

interface ToolCardProps {
  name: string
  description: string
  isSelected: boolean
  onClick: () => void
}

export default function ToolCard({ name, description, isSelected, onClick }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '12px 16px',
        marginBottom: '8px',
        background: isSelected ? '#1a1a2e' : 'transparent',
        border: 'none',
        borderLeft: isSelected ? '3px solid #00ff88' : '3px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: '0 6px 6px 0',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        if (!isSelected) e.currentTarget.style.background = '#111122'
      }}
      onMouseLeave={e => {
        if (!isSelected) e.currentTarget.style.background = 'transparent'
      }}
    >
      <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>
        {name}
      </div>
      <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
        {description}
      </div>
    </button>
  )
}
