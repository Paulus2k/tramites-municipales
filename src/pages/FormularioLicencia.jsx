import { useState } from 'react'
import { supabase } from '../supabase'

export default function FormularioLicencia({ usuario, onVolver, onExito }) {
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nombre_negocio: '',
    tipo_negocio: '',
    direccion: '',
    zona: '',
    telefono: '',
    nit: '',
    nombre_propietario: '',
    dpi_propietario: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const generarExpediente = () => {
    const año = new Date().getFullYear()
    const timestamp = Date.now()
    return `LC-${año}-${timestamp}`
  }

  const handleEnviar = async () => {
    if (cargando) return
    setCargando(true)
    setError('')

    const expediente = generarExpediente()

    const { error } = await supabase.from('tramites').insert({
      numero_expediente: expediente,
      tipo: 'licencia_comercial',
      estado: 'pendiente',
      solicitante_id: usuario.id,
      datos_formulario: form,
    })

    if (error) {
      setError(`No se pudo enviar el trámite. Error: ${error.message}`)
      setCargando(false)
      return
    }

    const { data: tramiteData } = await supabase
      .from('tramites')
      .select('id')
      .eq('numero_expediente', expediente)
      .single()

    onExito(tramiteData?.id)
  }

  const camposCompletos = () => {
    if (paso === 1) {
      return form.nombre_negocio && form.tipo_negocio && form.direccion && form.zona
    }
    return form.telefono && form.nit && form.nombre_propietario && form.dpi_propietario
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-6 py-4 flex items-center gap-4 shadow">
        <button
          onClick={onVolver}
          className="text-blue-200 hover:text-white transition text-sm"
        >
          ← Volver
        </button>
        <span className="text-lg font-bold">📋 Licencia Comercial</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Indicador de pasos */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center gap-2 ${paso >= 1 ? 'text-blue-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso >= 1 ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm font-medium">Datos del negocio</span>
          </div>
          <div className={`flex-1 h-1 mx-3 rounded ${paso >= 2 ? 'bg-blue-700' : 'bg-gray-200'}`} />
          <div className={`flex items-center gap-2 ${paso >= 2 ? 'text-blue-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso >= 2 ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm font-medium">Datos del propietario</span>
          </div>
          <div className={`flex-1 h-1 mx-3 rounded ${paso >= 3 ? 'bg-blue-700' : 'bg-gray-200'}`} />
          <div className={`flex items-center gap-2 ${paso >= 3 ? 'text-blue-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso >= 3 ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm font-medium">Confirmar</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Paso 1 */}
          {paso === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Datos del negocio
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del negocio *
                </label>
                <input
                  type="text"
                  name="nombre_negocio"
                  value={form.nombre_negocio}
                  onChange={handleChange}
                  placeholder="Ej: Tienda La Esperanza"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de negocio *
                </label>
                <select
                  name="tipo_negocio"
                  value={form.tipo_negocio}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccioná una opción</option>
                  <option value="comercio">Comercio general</option>
                  <option value="restaurante">Restaurante / Cafetería</option>
                  <option value="farmacia">Farmacia</option>
                  <option value="taller">Taller / Servicio técnico</option>
                  <option value="profesional">Servicios profesionales</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección del negocio *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Ej: 5a Avenida 12-34"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona *
                </label>
                <select
                  name="zona"
                  value={form.zona}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccioná una zona</option>
                  {[...Array(25)].map((_, i) => (
                    <option key={i + 1} value={`zona_${i + 1}`}>
                      Zona {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Paso 2 */}
          {paso === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Datos del propietario
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo del propietario *
                </label>
                <input
                  type="text"
                  name="nombre_propietario"
                  value={form.nombre_propietario}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos Pérez López"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DPI del propietario *
                </label>
                <input
                  type="text"
                  name="dpi_propietario"
                  value={form.dpi_propietario}
                  onChange={handleChange}
                  placeholder="Ej: 1234 56789 0101"
                  maxLength={15}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIT *
                </label>
                <input
                  type="text"
                  name="nit"
                  value={form.nit}
                  onChange={handleChange}
                  placeholder="Ej: 1234567-8"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de contacto *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 5555-1234"
                  maxLength={9}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {paso === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Confirmá tu solicitud
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Negocio:</span>
                  <span className="font-medium">{form.nombre_negocio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-medium">{form.tipo_negocio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dirección:</span>
                  <span className="font-medium">{form.direccion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Zona:</span>
                  <span className="font-medium">{form.zona}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Propietario:</span>
                  <span className="font-medium">{form.nombre_propietario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NIT:</span>
                  <span className="font-medium">{form.nit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DPI:</span>
                  <span className="font-medium">{form.dpi_propietario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="font-medium">{form.telefono}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Al enviar, tu solicitud quedará en estado <strong>Pendiente</strong> y será revisada por un funcionario municipal.
              </p>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between mt-6">
            {paso > 1 ? (
              <button
                onClick={() => setPaso(paso - 1)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                ← Anterior
              </button>
            ) : <div />}

            {paso < 3 ? (
              <button
                onClick={() => setPaso(paso + 1)}
                disabled={!camposCompletos()}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleEnviar}
                disabled={cargando}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {cargando ? 'Enviando...' : '✅ Enviar solicitud'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}