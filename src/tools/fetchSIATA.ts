// Fetches air quality and weather alerts from SIATA
// SIATA is the Sistema de Alerta Temprana del Valle de Aburrá
// (Early Warning System for the Aburrá Valley)
// Primary: JSON endpoint for PM2.5 data
// Fallback: graceful error (SIATA RSS returns HTML, not valid RSS)

import { SIATAAlert, MCPToolResult } from '../types'

const SIATA_JSON_URL = 'https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_pm25.json'

// SIATA JSON structure:
// Array of station objects, each with:
//   nombre: full station name
//   nombreCorto: short name
//   latitud, longitud: coordinates
//   datos: array of { variableConsulta: "pm25", fecha, calidad, valor }
//     valor: PM2.5 reading (-9999 = invalid/missing)
//     calidad: quality flag (<=2.5 = valid data per SIATA docs)

async function fetchFromJSON(): Promise<SIATAAlert[]> {
  const response = await fetch(SIATA_JSON_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`SIATA JSON endpoint returned ${response.status}`)
  }

  const data: any = await response.json()

  if (!Array.isArray(data)) {
    console.error('SIATA JSON structure unexpected:', typeof data, Object.keys(data || {}))
    throw new Error('SIATA JSON response is not an array')
  }

  const alerts: SIATAAlert[] = []
  for (const station of data) {
    if (!Array.isArray(station.datos) || station.datos.length === 0) continue

    // Get the most recent valid reading for this station
    // Valid = valor != -9999 and calidad <= 2.5
    const validReadings = station.datos.filter(
      (d: any) => d.valor !== -9999 && parseFloat(d.calidad || '999') <= 2.5
    )

    if (validReadings.length === 0) continue

    // Take the last (most recent) valid reading
    const latest = validReadings[validReadings.length - 1]
    const pm25 = latest.valor

    alerts.push({
      station: station.nombreCorto || station.nombre || 'Unknown',
      parameter: 'PM2.5',
      value: pm25,
      unit: 'µg/m³',
      timestamp: latest.fecha || new Date().toISOString(),
      // WHO guidelines: good <12, moderate 12-35, unhealthy 35-55, hazardous >55
      level: pm25 < 12 ? 'good'
        : pm25 < 35 ? 'moderate'
        : pm25 < 55 ? 'unhealthy'
        : 'hazardous'
    })
  }
  return alerts
}

export async function fetchSIATAAlerts(): Promise<MCPToolResult<SIATAAlert[]>> {
  // Try primary JSON endpoint
  try {
    const alerts = await fetchFromJSON()
    return {
      success: true,
      data: alerts,
      fetchedAt: new Date().toISOString(),
      source: 'SIATA'
    }
  } catch (jsonError) {
    console.error('SIATA JSON failed:', jsonError instanceof Error ? jsonError.message : jsonError)
  }

  // JSON failed, return graceful error
  return {
    success: false,
    data: null,
    error: 'SIATA unavailable - try again later',
    fetchedAt: new Date().toISOString(),
    source: 'SIATA'
  }
}
