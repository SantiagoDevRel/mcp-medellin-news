# mcp-medellin-news

MCP server for Medellín, Colombia news and city data.

## Tools available

- **fetch_news** - Articles from 6 local news sources (RSS)
- **fetch_telegram** - Messages from public citizen channels (requires bot token)
- **fetch_air_quality** - SIATA air quality data for the Aburrá Valley
- **list_sources** - All available news and data sources

## Sources

| ID | Name | URL | Description |
|----|------|-----|-------------|
| telemedellin | Telemedellín | https://telemedellin.tv/feed/ | Canal de TV público municipal |
| eltiempo_medellin | El Tiempo Medellín | https://www.eltiempo.com/rss/colombia_medellin.xml | Sección Medellín del principal diario nacional |
| minuto30 | Minuto30 | https://www.minuto30.com/feed | Noticias locales en tiempo real |
| vivir_poblado | Vivir en El Poblado | https://www.vivirenelpoblado.com/feed | Noticias hiperlocales de El Poblado |
| elmundo_medellin | El Mundo Medellín | http://www.elmundo.com/portal/servicios/rss/ | Diario local de Antioquia |
| google_news_medellin | Google News Medellín | https://news.google.com/rss/search?q=medellín+colombia | Agregador de múltiples fuentes |

## Quick start

```bash
npm install
npm run build
npm start
```

## Playground

```bash
cd playground
npm install
npm run dev
```

Opens a React UI at http://localhost:5173 where you can test all MCP tools interactively.

## Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

- `TELEGRAM_BOT_TOKEN` - Optional. Only needed for `fetch_telegram`. Get one from [@BotFather](https://t.me/BotFather).

## MCP client configuration

Add to your Claude Desktop or MCP client config:

```json
{
  "mcpServers": {
    "medellin-news": {
      "command": "node",
      "args": ["path/to/mcp-medellin-news/dist/index.js"]
    }
  }
}
```
