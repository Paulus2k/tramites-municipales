import { useState } from 'react'
import { supabase } from '../supabase'

export default function RecuperarContrasena({ onVolver }) {
  const [correo, setCorreo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const handleEnviar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: 'https://tramites-municipales-fwh8.vercel.app',
    })

    if (error) {
      setError('No se pudo enviar el correo. Verificá la dirección.')
    } else {
      setEnviado(true)
    }

    setCargando(false)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <span className="text-5xl">📧</span>
          <h2 className="text-2xl font-bold text-blue-800 mt-4">
            ¡Correo enviado!
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Revisá tu bandeja de entrada y seguí las instrucciones para restablecer tu contraseña.
          </p>
          <button
            onClick={onVolver}
            className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition"
          >
            Volver al Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <span className="text-5xl">🔑</span>
          <h1 className="text-2xl font-bold text-blue-800 mt-2">
            Recuperar contraseña
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Te enviaremos un enlace a tu correo
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleEnviar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <button
            onClick={onVolver}
            className="text-blue-600 hover:underline font-medium"
          >
            ← Volver al Login
          </button>
        </p>

      </div>
    </div>
  )
}