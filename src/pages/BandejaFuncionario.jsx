import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function BandejaFuncionario({ usuario, onCerrarSesion, onVerExpediente }) {
  const [tramites, setTramites] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    cargarTramites()
  }, [])

  const cargarTramites = async () => {
    const { data } = await supabase
      .from('tramites')
      .select(`
        *,
        usuarios!tramites_solicitante_id_fkey (nombre, correo)
      `)
      .order('creado_en', { ascending: false })
    setTramites(data || [])
    setCargando(false)
  }

  const tramitesFiltrados = tramites.filter(t => {
    if (filtro === 'todos') return true
    return t.estado === filtro
  })

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

  const contarPorEstado = (estado) => tramites.filter(t => t.estado === estado).length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <span className="font-bold text-lg">Trámites Municipales</span>
            <span className="ml-3 text-xs bg-blue-700 px-2 py-1 rounded-full">Funcionario</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">{usuario.email}</span>
          <button
            onClick={onCerrarSesion}
            className="bg-blue-800 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Bandeja de Expedientes</h1>
          <p className="text-gray-500 mt-1">Revisá y resolvé los trámites ciudadanos</p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">{tramites.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-yellow-700">{contarPorEstado('pendiente')}</p>
            <p className="text-sm text-yellow-600 mt-1">Pendientes</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{contarPorEstado('en_revision')}</p>
            <p className="text-sm text-blue-600 mt-1">En revisión</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{contarPorEstado('aprobado')}</p>
            <p className="text-sm text-green-600 mt-1">Aprobados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['todos', 'pendiente', 'en_revision', 'aprobado', 'rechazado', 'trasladado'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filtro === f
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f === 'todos' ? 'Todos' : estadoTexto(f)}
            </button>
          ))}
        </div>

        {/* Lista de expedientes */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {cargando ? (
            <p className="text-center text-gray-400 py-12">Cargando expedientes...</p>
          ) : tramitesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500">No hay expedientes con ese filtro.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Expediente</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Tipo</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Ciudadano</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Fecha</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Estado</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tramitesFiltrados.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{t.numero_expediente}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{tipoTexto(t.tipo)}</td>
                    <td className="px-6 py-4 text-gray-600">{t.usuarios?.nombre || t.usuarios?.correo || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(t.creado_en).toLocaleDateString('es-GT')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoColor(t.estado)}`}>
                        {estadoTexto(t.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onVerExpediente(t)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}