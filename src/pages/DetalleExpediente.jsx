import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function DetalleExpediente({ usuario, tramite, onVolver }) {
  const [documentos, setDocumentos] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [resolviendo, setResolviendo] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const [{ data: docs }, { data: hist }] = await Promise.all([
      supabase.from('documentos').select('*').eq('tramite_id', tramite.id),
      supabase.from('historial_tramites')
        .select(`*, usuarios!historial_tramites_usuario_id_fkey(nombre, correo)`)
        .eq('tramite_id', tramite.id)
        .order('registrado_en', { ascending: false })
    ])
    setDocumentos(docs || [])
    setHistorial(hist || [])
    setCargando(false)
  }

  const handleResolucion = async (nuevaAccion, nuevoEstado) => {
    if (!observaciones.trim() && nuevaAccion !== 'en_revision') {
      setError('Debés escribir una observación antes de resolver.')
      return
    }
    setResolviendo(true)
    setError('')

    const { error: errorTramite } = await supabase
      .from('tramites')
      .update({ estado: nuevoEstado, resuelto_en: nuevoEstado === 'aprobado' || nuevoEstado === 'rechazado' ? new Date().toISOString() : null })
      .eq('id', tramite.id)

    if (errorTramite) {
      setError('No se pudo actualizar el trámite.')
      setResolviendo(false)
      return
    }

    await supabase.from('historial_tramites').insert({
      tramite_id: tramite.id,
      usuario_id: usuario.id,
      accion: nuevaAccion,
      estado_anterior: tramite.estado,
      estado_nuevo: nuevoEstado,
      observaciones: observaciones,
    })

    setExito(`Trámite ${nuevaAccion === 'aprobar' ? 'aprobado' : nuevaAccion === 'rechazar' ? 'rechazado' : 'trasladado'} exitosamente.`)
    setResolviendo(false)
    setTimeout(() => onVolver(), 2000)
  }

  const tipoTexto = (tipo) => {
    const textos = {
      licencia_comercial: 'Licencia Comercial',
      permiso_construccion: 'Permiso de Construcción',
      actualizacion_catastral: 'Actualización Catastral',
    }
    return textos[tipo] || tipo
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center gap-4 shadow">
        <button onClick={onVolver} className="text-blue-200 hover:text-white transition text-sm">
          ← Volver a bandeja
        </button>
        <span className="text-lg font-bold">📋 Detalle de Expediente</span>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Encabezado */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{tipoTexto(tramite.tipo)}</h1>
              <p className="text-sm font-mono text-gray-400 mt-1">{tramite.numero_expediente}</p>
              <p className="text-sm text-gray-500 mt-1">
                Recibido el {new Date(tramite.creado_en).toLocaleDateString('es-GT')}
              </p>
            </div>
            <span className={`text-sm font-semibold px-4 py-2 rounded-full ${estadoColor(tramite.estado)}`}>
              {estadoTexto(tramite.estado)}
            </span>
          </div>
        </div>

        {/* Datos del formulario */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Datos del trámite</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(tramite.datos_formulario || {}).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm font-medium text-gray-800 mt-1">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos adjuntos */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📎 Documentos adjuntos</h2>
          {cargando ? (
            <p className="text-gray-400 text-sm">Cargando documentos...</p>
          ) : documentos.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay documentos adjuntos.</p>
          ) : (
            <div className="space-y-2">
              {documentos.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url_storage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 hover:bg-blue-50 transition"
                >
                  <span className="text-xl">
                    {doc.tipo_documento === 'application/pdf' ? '📄' : '🖼️'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-blue-600">{doc.nombre_archivo}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.subido_en).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <span className="ml-auto text-blue-400 text-sm">↗</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Historial */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🕐 Historial de acciones</h2>
          {historial.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin historial aún.</p>
          ) : (
            <div className="space-y-3">
              {historial.map((h) => (
                <div key={h.id} className="flex gap-4 border-l-2 border-blue-200 pl-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{h.accion}</p>
                    {h.observaciones && (
                      <p className="text-sm text-gray-500 mt-1">"{h.observaciones}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {h.usuarios?.nombre || h.usuarios?.correo} — {new Date(h.registrado_en).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${estadoColor(h.estado_nuevo)}`}>
                      {estadoTexto(h.estado_nuevo)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de resolución */}
        {tramite.estado !== 'aprobado' && tramite.estado !== 'rechazado' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">⚖️ Panel de resolución</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                ⚠️ {error}
              </div>
            )}

            {exito && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
                ✅ {exito}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones *
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Escribí las observaciones o justificación de la resolución..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleResolucion('en_revision', 'en_revision')}
                disabled={resolviendo}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                🔍 Poner en revisión
              </button>
              <button
                onClick={() => handleResolucion('trasladar', 'trasladado')}
                disabled={resolviendo}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                📤 Trasladar
              </button>
              <button
                onClick={() => handleResolucion('rechazar', 'rechazado')}
                disabled={resolviendo}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                ✖ Rechazar
              </button>
              <button
                onClick={() => handleResolucion('aprobar', 'aprobado')}
                disabled={resolviendo}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                ✔ Aprobar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}