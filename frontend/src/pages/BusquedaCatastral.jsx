import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { supabase } from '../supabase'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix icono de leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function BusquedaCatastral({ onVolver }) {
  const [busqueda, setBusqueda] = useState('')
  const [inmueble, setInmueble] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [buscado, setBuscado] = useState(false)

  const handleBuscar = async (e) => {
    e.preventDefault()
    if (!busqueda.trim()) return

    setCargando(true)
    setError('')
    setInmueble(null)
    setBuscado(false)

    const { data, error } = await supabase
      .from('inmuebles')
      .select('*')
      .eq('numero_finca', busqueda.trim())
      .single()

    if (error || !data) {
      setError('No se encontró ningún inmueble con ese número de finca.')
    } else {
      setInmueble(data)
    }

    setBuscado(true)
    setCargando(false)
  }

  const usoSueloTexto = (uso) => {
    const textos = {
      residencial: 'Residencial',
      comercial: 'Comercial',
      industrial: 'Industrial',
      agricola: 'Agrícola',
      mixto: 'Mixto',
    }
    return textos[uso] || uso
  }

  const usoSueloColor = (uso) => {
    const colores = {
      residencial: 'bg-blue-100 text-blue-800',
      comercial: 'bg-yellow-100 text-yellow-800',
      industrial: 'bg-gray-100 text-gray-800',
      agricola: 'bg-green-100 text-green-800',
      mixto: 'bg-purple-100 text-purple-800',
    }
    return colores[uso] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-6 py-4 flex items-center gap-4 shadow">
        <button onClick={onVolver} className="text-blue-200 hover:text-white transition text-sm">
          ← Volver
        </button>
        <span className="text-lg font-bold">🗺️ Búsqueda Catastral</span>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Buscador */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Consulta de Inmuebles</h1>
          <p className="text-sm text-gray-500 mb-4">Buscá por número de finca para ver la ficha catastral</p>

          <form onSubmit={handleBuscar} className="flex gap-3">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej: 1234"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={cargando}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {cargando ? 'Buscando...' : '🔍 Buscar'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mt-4 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Ficha catastral */}
        {inmueble && (
          <>
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Ficha Catastral — Finca No. {inmueble.numero_finca}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Última actualización: {new Date(inmueble.actualizado_en).toLocaleDateString('es-GT')}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${usoSueloColor(inmueble.uso_suelo)}`}>
                  {usoSueloTexto(inmueble.uso_suelo)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Propietario</p>
                  <p className="text-sm font-semibold text-gray-800">{inmueble.propietario_nombre}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">No. de Finca</p>
                  <p className="text-sm font-semibold text-gray-800">{inmueble.numero_finca}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Área del inmueble</p>
                  <p className="text-sm font-semibold text-gray-800">{inmueble.area_m2} m²</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Uso del suelo</p>
                  <p className="text-sm font-semibold text-gray-800">{usoSueloTexto(inmueble.uso_suelo)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Dirección</p>
                  <p className="text-sm font-semibold text-gray-800">{inmueble.direccion}</p>
                </div>
                {inmueble.latitud && inmueble.longitud && (
                  <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Coordenadas</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {inmueble.latitud}°N, {inmueble.longitud}°O
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mapa */}
            {inmueble.latitud && inmueble.longitud && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📍 Ubicación en el mapa</h3>
                <div className="rounded-xl overflow-hidden" style={{ height: '400px' }}>
                  <MapContainer
                    center={[inmueble.latitud, inmueble.longitud]}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[inmueble.latitud, inmueble.longitud]}>
                      <Popup>
                        <strong>Finca {inmueble.numero_finca}</strong><br />
                        {inmueble.propietario_nombre}<br />
                        {inmueble.direccion}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </>
        )}

        {/* Sin resultados */}
        {buscado && !inmueble && !error && (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">No se encontraron resultados.</p>
          </div>
        )}

      </div>
    </div>
  )
}