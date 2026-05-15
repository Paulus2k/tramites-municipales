export default function Confirmacion({ onVolver }) {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">

        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-2xl font-bold text-blue-800 mb-2">
          ¡Trámite enviado exitosamente!
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          Tu solicitud fue recibida y está siendo procesada. Podés seguir el estado desde tu dashboard.
        </p>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span>📋</span>
            <span>Tu trámite está en estado <strong>Pendiente</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span>📧</span>
            <span>Recibirás notificaciones por correo</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span>⏱️</span>
            <span>El tiempo de respuesta es de 5 a 10 días hábiles</span>
          </div>
        </div>

        <button
          onClick={onVolver}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
        >
          Ir a Mis Trámites
        </button>

      </div>
    </div>
  )
}