import { useState } from 'react'
import { supabase } from '../supabase'

export default function CargaDocumentos({ usuario, tramiteId, onVolver, onExito }) {
  const [archivos, setArchivos] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [subidos, setSubidos] = useState([])

  const handleArchivos = (e) => {
    const nuevos = Array.from(e.target.files)
    const validos = nuevos.filter(f => {
      const tipoValido = ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)
      const tamañoValido = f.size <= 10 * 1024 * 1024
      return tipoValido && tamañoValido
    })

    if (validos.length !== nuevos.length) {
      setError('Algunos archivos fueron rechazados. Solo se permiten PDF, JPG y PNG de hasta 10 MB.')
    } else {
      setError('')
    }

    setArchivos(prev => [...prev, ...validos])
  }

  const eliminarArchivo = (index) => {
    setArchivos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubir = async () => {
    if (archivos.length === 0) {
      setError('Agregá al menos un archivo antes de continuar.')
      return
    }

    setSubiendo(true)
    setError('')

    for (const archivo of archivos) {
      const extension = archivo.name.split('.').pop()
      const nombreUnico = `${usuario.id}/${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${extension}`

      const { data, error: errorStorage } = await supabase.storage
        .from('documentos')
        .upload(nombreUnico, archivo)

      if (errorStorage) {
        setError(`Error al subir ${archivo.name}: ${errorStorage.message}`)
        setSubiendo(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(nombreUnico)

      await supabase.from('documentos').insert({
        tramite_id: tramiteId,
        nombre_archivo: archivo.name,
        url_storage: urlData.publicUrl,
        tipo_documento: archivo.type,
      })

      setSubidos(prev => [...prev, archivo.name])
    }

    setSubiendo(false)
    onExito()
  }

  const formatearTamaño = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const iconoArchivo = (tipo) => {
    if (tipo === 'application/pdf') return '📄'
    if (tipo.startsWith('image/')) return '🖼️'
    return '📎'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-6 py-4 flex items-center gap-4 shadow">
        <button onClick={onVolver} className="text-blue-200 hover:text-white transition text-sm">
          ← Volver
        </button>
        <span className="text-lg font-bold">📎 Carga de Documentos</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Adjuntá tus documentos
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Formatos aceptados: PDF, JPG, PNG — Máximo 10 MB por archivo
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Zona de carga */}
          <label className="block border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition mb-4">
            <div className="text-4xl mb-2">☁️</div>
            <p className="text-blue-700 font-semibold">Hacé clic para seleccionar archivos</p>
            <p className="text-gray-400 text-sm mt-1">o arrastrá y soltá aquí</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleArchivos}
              className="hidden"
            />
          </label>

          {/* Lista de archivos */}
          {archivos.length > 0 && (
            <div className="space-y-2 mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Archivos seleccionados ({archivos.length}):
              </p>
              {archivos.map((archivo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{iconoArchivo(archivo.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{archivo.name}</p>
                      <p className="text-xs text-gray-400">{formatearTamaño(archivo.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarArchivo(index)}
                    className="text-red-400 hover:text-red-600 text-sm transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progreso de subida */}
          {subiendo && (
            <div className="mb-4">
              <p className="text-sm text-blue-700 font-medium mb-2">
                Subiendo archivos... ({subidos.length}/{archivos.length})
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(subidos.length / archivos.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-between mt-4">
            <button
              onClick={onVolver}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Omitir por ahora
            </button>
            <button
              onClick={handleSubir}
              disabled={subiendo || archivos.length === 0}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {subiendo ? 'Subiendo...' : `📤 Subir ${archivos.length} archivo${archivos.length !== 1 ? 's' : ''}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}