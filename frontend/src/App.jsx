import { useState } from 'react'
import Login from './pages/Login'
import Registro from './pages/Registro'
import DashboardCiudadano from './pages/DashboardCiudadano'
import FormularioLicencia from './pages/FormularioLicencia'
import FormularioConstruccion from './pages/FormularioConstruccion'
import FormularioCatastral from './pages/FormularioCatastral'
import RecuperarContrasena from './pages/RecuperarContrasena'
import CargaDocumentos from './pages/CargaDocumentos'
import Confirmacion from './pages/Confirmacion'
import BandejaFuncionario from './pages/BandejaFuncionario'
import DetalleExpediente from './pages/DetalleExpediente'
import DashboardJefe from './pages/DashboardJefe'
import BusquedaCatastral from './pages/BusquedaCatastral'


function App() {
  const [usuario, setUsuario] = useState(null)
  const [rolUsuario, setRolUsuario] = useState(null)
  const [pantalla, setPantalla] = useState('login')
  const [tramiteActual, setTramiteActual] = useState(null)

  const handleLogin = async (data) => {
    if (data === 'ir_registro') { setPantalla('registro'); return }
    if (data === 'ir_recuperar') { setPantalla('recuperar'); return }

    const { supabase } = await import('./supabase')
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', data.id)
      .single()

    setUsuario(data)
    setRolUsuario(perfil?.rol || 'ciudadano')
    setPantalla('dashboard')
  }

  const handleExitoFormulario = (tramiteId) => {
    setTramiteActual(tramiteId)
    setPantalla('documentos')
  }

  const handleCerrarSesion = () => {
    setUsuario(null)
    setRolUsuario(null)
    setPantalla('login')
  }

  if (!usuario) {
    if (pantalla === 'registro') return <Registro onVolver={() => setPantalla('login')} />
    if (pantalla === 'recuperar') return <RecuperarContrasena onVolver={() => setPantalla('login')} />
    return <Login onLogin={handleLogin} />
  }

  // Vistas funcionario/jefe/admin
 if (rolUsuario === 'funcionario' || rolUsuario === 'jefe' || rolUsuario === 'admin') {
  if (pantalla === 'expediente') {
    return (
      <DetalleExpediente
        usuario={usuario}
        tramite={tramiteActual}
        onVolver={() => setPantalla('dashboard')}
      />
    )
  }
  if (rolUsuario === 'jefe' || rolUsuario === 'admin') {
    return (
      <DashboardJefe
        usuario={usuario}
        onCerrarSesion={handleCerrarSesion}
      />
    )
  }
  return (
    <BandejaFuncionario
      usuario={usuario}
      onCerrarSesion={handleCerrarSesion}
      onVerExpediente={(t) => { setTramiteActual(t); setPantalla('expediente') }}
    />
  )
}
if (pantalla === 'busqueda_catastral') return <BusquedaCatastral onVolver={() => setPantalla('dashboard')} />

  // Vistas ciudadano
  if (pantalla === 'licencia') return <FormularioLicencia usuario={usuario} onVolver={() => setPantalla('dashboard')} onExito={handleExitoFormulario} />
  if (pantalla === 'construccion') return <FormularioConstruccion usuario={usuario} onVolver={() => setPantalla('dashboard')} onExito={handleExitoFormulario} />
  if (pantalla === 'catastral') return <FormularioCatastral usuario={usuario} onVolver={() => setPantalla('dashboard')} onExito={handleExitoFormulario} />
  if (pantalla === 'documentos') return <CargaDocumentos usuario={usuario} tramiteId={tramiteActual} onVolver={() => setPantalla('dashboard')} onExito={() => setPantalla('confirmacion')} />
  if (pantalla === 'confirmacion') return <Confirmacion onVolver={() => setPantalla('dashboard')} />

  return (
    <DashboardCiudadano
      usuario={usuario}
      onCerrarSesion={handleCerrarSesion}
      onNuevoTramite={(tipo) => setPantalla(tipo)}
    />
  )
}

export default App