// All RSS and data source configurations for Medellín
// Each source has a name, URL, type, and description of what it covers

export interface RSSSource {
  id: string
  name: string
  url: string
  type: 'rss' | 'api' | 'telegram'
  description: string
  language: string
  category: string
}

export const RSS_SOURCES: RSSSource[] = [
  {
    id: 'telemedellin',
    name: 'Telemedellín',
    url: 'https://telemedellin.tv/feed/',
    type: 'rss',
    description: 'Canal de TV público municipal de Medellín',
    language: 'es',
    category: 'general'
  },
  {
    id: 'eltiempo_medellin',
    name: 'El Tiempo Medellín',
    url: 'https://www.eltiempo.com/rss/colombia_medellin.xml',
    type: 'rss',
    description: 'Sección Medellín del principal diario nacional',
    language: 'es',
    category: 'general'
  },
  {
    id: 'minuto30',
    name: 'Minuto30',
    url: 'https://www.minuto30.com/feed',
    type: 'rss',
    description: 'Noticias locales de Medellín en tiempo real',
    language: 'es',
    category: 'breaking'
  },
  {
    id: 'vivir_poblado',
    name: 'Vivir en El Poblado',
    url: 'https://www.vivirenelpoblado.com/feed',
    type: 'rss',
    description: 'Noticias hiperlocales de El Poblado y Medellín',
    language: 'es',
    category: 'local'
  },
  {
    id: 'elmundo_medellin',
    name: 'El Mundo Medellín',
    url: 'http://www.elmundo.com/portal/servicios/rss/',
    type: 'rss',
    description: 'Diario local de circulación en Antioquia',
    language: 'es',
    category: 'general'
  },
  {
    id: 'google_news_medellin',
    name: 'Google News Medellín',
    url: 'https://news.google.com/rss/search?q=medell%C3%ADn+colombia&hl=es-419&gl=CO&ceid=CO:es-419',
    type: 'rss',
    description: 'Agrega múltiples fuentes colombianas sobre Medellín',
    language: 'es',
    category: 'aggregator'
  }
]

export const TELEGRAM_SOURCES = [
  {
    id: 'chisme_fresco',
    name: 'Chisme Fresco Medellín',
    channel: 'chismefrescomedallo',
    description: 'Canal ciudadano 24/7 con incidentes en tiempo real'
  },
  {
    id: 'denuncias_antioquia',
    name: 'Denuncias Antioquia',
    channel: 'denunciasantioqu',
    description: 'Incidentes de seguridad ciudadana en Antioquia'
  }
]
