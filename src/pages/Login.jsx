import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    })

    if (error) {
      setError('Correo o contraseña incorrectos. Intentá de nuevo.')
    } else {
      onLogin(data.user)
    }

    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo y título */}
        <div className="text-center mb-8">
          <span className="text-5xl">🏛️</span>
          <h1 className="text-2xl font-bold text-blue-800 mt-2">
            Trámites Municipales
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Municipalidad de Guatemala
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

       {/* Link a registro */}
<p className="text-center text-sm text-gray-500 mt-6">
  ¿No tenés cuenta?{' '}
  <button
    onClick={() => onLogin('ir_registro')}
    className="text-blue-600 hover:underline font-medium"
  >
    Registrate aquí
  </button>
</p>

<p className="text-center text-sm text-gray-500 mt-2">
  <button
    onClick={() => onLogin('ir_recuperar')}
    className="text-gray-400 hover:underline text-xs"
  >
    ¿Olvidaste tu contraseña?
  </button>
</p>

      </div>
    </div>
  )
}