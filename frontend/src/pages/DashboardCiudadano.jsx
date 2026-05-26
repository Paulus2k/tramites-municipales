import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function DashboardCiudadano({ usuario, onCerrarSesion, onNuevoTramite }) {
  const [tramites, setTramites] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarTramites()
  }, [])

  const cargarTramites = async () => {
    const { data } = await supabase
      .from('tramites')
      .select('*')
      .eq('solicitante_id', usuario.id)
      .order('creado_en', { ascending: false })
    setTramites(data || [])
    setCargando(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    onCerrarSesion()
  }

  const estadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_revision: 'bg-blue-100 text-blue-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800',
      trasladado: 'bg-purple-100 text-purple-800',
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const estadoTexto = (estado) => {
    const textos = {
      pendiente: 'Pendiente',
      en_revision: 'En revisión',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      trasladado: 'Trasladado',
    }
    return textos[estado] || estado
  }

  const tipoTexto = (tipo) => {
    const textos = {
      licencia_comercial: 'Licencia Comercial',
      permiso_construccion: 'Permiso de Construcción',
      actualizacion_catastral: 'Actualización Catastral',
    }
    return textos[tipo] || tipo
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <span className="font-bold text-lg">Trámites Municipales</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">{usuario.email}</span>
          <button
            onClick={cerrarSesion}
            className="bg-blue-700 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Mis Trámites</h1>
          <p className="text-gray-500 mt-1">Seguí el estado de tus solicitudes municipales</p>
        </div>

        {/* Botones de nuevo trámite */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => onNuevoTramite('licencia')}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl p-5 text-left transition shadow"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="font-semibold">Licencia Comercial</div>
            <div className="text-blue-200 text-sm mt-1">Nuevo trámite</div>
          </button>
          <button
            onClick={() => onNuevoTramite('construccion')}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl p-5 text-left transition shadow"
          >
            <div className="text-3xl mb-2">🏗️</div>
            <div className="font-semibold">Permiso de Construcción</div>
            <div className="text-blue-200 text-sm mt-1">Nuevo trámite</div>
          </button>
          <button
            onClick={() => onNuevoTramite('catastral')}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl p-5 text-left transition shadow"
          >
            <div className="text-3xl mb-2">🗺️</div>
            <div className="font-semibold">Actualización Catastral</div>
            <div className="text-blue-200 text-sm mt-1">Nuevo trámite</div>
          </button>
        </div>

        {/* Botón búsqueda catastral */}
        <div className="mb-8">
          <button
            onClick={() => onNuevoTramite('busqueda_catastral')}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white rounded-xl p-4 text-left transition shadow flex items-center gap-3"
          >
            <span className="text-2xl">🗺️</span>
            <div>
              <div className="font-semibold">Consulta Catastral</div>
              <div className="text-gray-300 text-sm">Buscá información de inmuebles</div>
            </div>
          </button>
        </div>

        {/* Lista de trámites */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Historial de trámites</h2>

          {cargando ? (
            <p className="text-gray-400 text-center py-8">Cargando...</p>
          ) : tramites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500">No tenés trámites aún.</p>
              <p className="text-gray-400 text-sm mt-1">Usá los botones de arriba para iniciar uno.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tramites.map((t) => (
                <div
                  key={t.id}
                  className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{tipoTexto(t.tipo)}</p>
                    <p className="text-sm text-gray-400 mt-1">Expediente: {t.numero_expediente}</p>
                    <p className="text-xs text-gray-400">{new Date(t.creado_en).toLocaleDateString('es-GT')}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoColor(t.estado)}`}>
                    {estadoTexto(t.estado)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}