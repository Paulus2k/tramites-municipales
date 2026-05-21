const API_URL = import.meta.env.VITE_API_URL

// Obtener token del usuario autenticado
const getToken = async () => {
  const { supabase } = await import('./supabase')
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

// Headers base
const headers = async () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${await getToken()}`
})

// TRÁMITES
export const crearTramite = async (datos) => {
  const res = await fetch(`${API_URL}/api/tramites`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify(datos)
  })
  return res.json()
}

export const getMisTramites = async () => {
  const res = await fetch(`${API_URL}/api/tramites/mis-tramites`, {
    headers: await headers()
  })
  return res.json()
}

export const getTramite = async (id) => {
  const res = await fetch(`${API_URL}/api/tramites/${id}`, {
    headers: await headers()
  })
  return res.json()
}

export const getBandeja = async () => {
  const res = await fetch(`${API_URL}/api/tramites/bandeja`, {
    headers: await headers()
  })
  return res.json()
}

export const cambiarEstado = async (id, estado, observaciones) => {
  const res = await fetch(`${API_URL}/api/tramites/${id}/estado`, {
    method: 'PATCH',
    headers: await headers(),
    body: JSON.stringify({ estado, observaciones })
  })
  return res.json()
}

export const getMetricas = async () => {
  const res = await fetch(`${API_URL}/api/tramites/metricas`, {
    headers: await headers()
  })
  return res.json()
}

// DOCUMENTOS
export const registrarDocumento = async (tramiteId, datos) => {
  const res = await fetch(`${API_URL}/api/documentos/${tramiteId}`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify(datos)
  })
  return res.json()
}

export const getDocumentos = async (tramiteId) => {
  const res = await fetch(`${API_URL}/api/documentos/${tramiteId}`, {
    headers: await headers()
  })
  return res.json()
}

// CATASTRO
export const buscarInmueble = async (numeroFinca) => {
  const res = await fetch(`${API_URL}/api/catastro/${numeroFinca}`, {
    headers: await headers()
  })
  return res.json()
}

export const getMapaCatastral = async () => {
  const res = await fetch(`${API_URL}/api/catastro/mapa`, {
    headers: await headers()
  })
  return res.json()
}