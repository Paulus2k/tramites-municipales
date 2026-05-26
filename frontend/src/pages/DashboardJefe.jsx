import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function DashboardJefe({ usuario, onCerrarSesion }) {
  const [metricas, setMetricas] = useState({
    total: 0,
    pendientes: 0,
    en_revision: 0,
    aprobados: 0,
    rechazados: 0,
    trasladados: 0,
  })
  const [porTipo, setPorTipo] = useState([])
  const [recientes, setRecientes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarMetricas()
  }, [])

  const cargarMetricas = async () => {
    const { data: tramites } = await supabase
      .from('tramites')
      .select('*')
      .order('creado_en', { ascending: false })

    if (!tramites) return

    // Métricas generales
    setMetricas({
      total: tramites.length,
      pendientes: tramites.filter(t => t.estado === 'pendiente').length,
      en_revision: tramites.filter(t => t.estado === 'en_revision').length,
      aprobados: tramites.filter(t => t.estado === 'aprobado').length,
      rechazados: tramites.filter(t => t.estado === 'rechazado').length,
      trasladados: tramites.filter(t => t.estado === 'trasladado').length,
    })

    // Por tipo
    const tipos = ['licencia_comercial', 'permiso_construccion', 'actualizacion_catastral']
    const tipoTextos = {
      licencia_comercial: 'Licencia Comercial',
      permiso_construccion: 'Permiso de Construcción',
      actualizacion_catastral: 'Actualización Catastral',
    }
    setPorTipo(tipos.map(tipo => ({
      tipo: tipoTextos[tipo],
      total: tramites.filter(t => t.tipo === tipo).length,
      aprobados: tramites.filter(t => t.tipo === tipo && t.estado === 'aprobado').length,
      pendientes: tramites.filter(t => t.tipo === tipo && t.estado === 'pendiente').length,
    })))

    // Últimos 5 recientes
    setRecientes(tramites.slice(0, 5))
    setCargando(false)
  }

  const porcentaje = (valor) => {
    if (metricas.total === 0) return 0
    return Math.round((valor / metricas.total) * 100)
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

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando métricas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <span className="font-bold text-lg">Trámites Municipales</span>
            <span className="ml-3 text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full font-semibold">Jefe</span>
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

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Métricas</h1>
          <p className="text-gray-500 mt-1">Resumen general del sistema de trámites</p>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', valor: metricas.total, color: 'bg-gray-800', texto: 'text-white' },
            { label: 'Pendientes', valor: metricas.pendientes, color: 'bg-yellow-400', texto: 'text-yellow-900' },
            { label: 'En revisión', valor: metricas.en_revision, color: 'bg-blue-500', texto: 'text-white' },
            { label: 'Aprobados', valor: metricas.aprobados, color: 'bg-green-500', texto: 'text-white' },
            { label: 'Rechazados', valor: metricas.rechazados, color: 'bg-red-500', texto: 'text-white' },
            { label: 'Trasladados', valor: metricas.trasladados, color: 'bg-purple-500', texto: 'text-white' },
          ].map((kpi) => (
            <div key={kpi.label} className={`${kpi.color} rounded-2xl p-5 text-center shadow`}>
              <p className={`text-4xl font-bold ${kpi.texto}`}>{kpi.valor}</p>
              <p className={`text-sm mt-1 ${kpi.texto} opacity-80`}>{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Barra de progreso general */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Distribución por estado</h2>
            <div className="space-y-4">
              {[
                { label: 'Pendientes', valor: metricas.pendientes, color: 'bg-yellow-400' },
                { label: 'En revisión', valor: metricas.en_revision, color: 'bg-blue-500' },
                { label: 'Aprobados', valor: metricas.aprobados, color: 'bg-green-500' },
                { label: 'Rechazados', valor: metricas.rechazados, color: 'bg-red-500' },
                { label: 'Trasladados', valor: metricas.trasladados, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.valor} ({porcentaje(item.valor)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all`}
                      style={{ width: `${porcentaje(item.valor)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Por tipo de trámite */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Trámites por tipo</h2>
            <div className="space-y-4">
              {porTipo.map((t) => (
                <div key={t.tipo} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{t.tipo}</span>
                    <span className="text-lg font-bold text-gray-800">{t.total}</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {t.pendientes} pendientes
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {t.aprobados} aprobados
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: metricas.total > 0 ? `${(t.total / metricas.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Trámites recientes */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🕐 Trámites más recientes</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Expediente</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recientes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{t.numero_expediente}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {t.tipo === 'licencia_comercial' ? 'Licencia Comercial' :
                     t.tipo === 'permiso_construccion' ? 'Permiso de Construcción' :
                     'Actualización Catastral'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(t.creado_en).toLocaleDateString('es-GT')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoColor(t.estado)}`}>
                      {estadoTexto(t.estado)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}