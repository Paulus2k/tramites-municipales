import { useState } from 'react'
import { supabase } from '../supabase'

export default function Registro({ onVolver }) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleRegistro = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setCargando(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        data: { nombre: nombre }
      }
    })

    if (error) {
      setError('No se pudo crear la cuenta. Intentá con otro correo.')
    } else {
      // Insertar en tabla usuarios
      await supabase.from('usuarios').insert({
        id: data.user.id,
        nombre: nombre,
        correo: correo,
        rol: 'ciudadano'
      })
      setExito(true)
    }

    setCargando(false)
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <span className="text-5xl">✅</span>
          <h2 className="text-2xl font-bold text-blue-800 mt-4">
            ¡Cuenta creada!
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Revisá tu correo para confirmar tu cuenta y luego iniciá sesión.
          </p>
          <button
            onClick={onVolver}
            className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition"
          >
            Ir al Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <span className="text-5xl">🏛️</span>
          <h1 className="text-2xl font-bold text-blue-800 mt-2">
            Crear cuenta
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Municipalidad de Guatemala
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <button
            onClick={onVolver}
            className="text-blue-600 hover:underline font-medium"
          >
            Iniciá sesión
          </button>
        </p>

      </div>
    </div>
  )
}