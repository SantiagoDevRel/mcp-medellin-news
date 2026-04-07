// Fetches air quality and weather alerts from SIATA
// SIATA is the Sistema de Alerta Temprana del Valle de Aburrá
// (Early Warning System for the Aburrá Valley)
// Uses their public JSON endpoints scraped from siata.gov.co

import { SIATAAlert, MCPToolResult } from '../types'

export async function fetchSIATAAlerts(): Promise<MCPToolResult<SIATAAlert[]>> {
  try {
    // SIATA public air quality endpoint
    const response = await fetch(
      'https://siata.gov.co/EntregaData1/index.php/calidad_aire/calidadAireRedSIATA',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      }
    )
    const data = await response.json()

    // Map SIATA response to our SIATAAlert type
    // SIATA returns an array of station readings
    const alerts: SIATAAlert[] = []
    if (Array.isArray(data)) {
      for (const station of data) {
        const pm25 = parseFloat(station.pm25 || station.PM25 || '0')
        alerts.push({
          station: station.nombre || station.station || 'Unknown',
          parameter: 'PM2.5',
          value: pm25,
          unit: 'µg/m³',
          timestamp: station.fecha || new Date().toISOString(),
          // WHO guidelines: good <12, moderate 12-35, unhealthy 35-55, hazardous >55
          level: pm25 < 12 ? 'good'
            : pm25 < 35 ? 'moderate'
            : pm25 < 55 ? 'unhealthy'
            : 'hazardous'
        })
      }
    }
    return {
      success: true,
      data: alerts,
      fetchedAt: new Date().toISOString(),
      source: 'SIATA'
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: `SIATA fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fetchedAt: new Date().toISOString(),
      source: 'SIATA'
    }
  }
}
