import { useEffect, useState } from 'react'

import { supabase } from './supabase'
import { buscarPerfilUsuario } from './supabase'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const [mensagemLogin, setMensagemLogin] =
    useState('')

  useEffect(() => {
    carregarSessao()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setSessao(null)
          setCarregando(false)
          return
        }

        await validarUsuario(session)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function carregarSessao() {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      setSessao(null)
      setCarregando(false)
      return
    }

    await validarUsuario(session)
  }

  async function validarUsuario(session) {
    const perfil =
      await buscarPerfilUsuario()

    if (!perfil) {
      setMensagemLogin(
        'Não foi possível identificar o perfil deste usuário.'
      )

      await supabase.auth.signOut()

      setSessao(null)
      setCarregando(false)

      return
    }

    if (
      perfil.fazendas &&
      perfil.fazendas.ativo === false
    ) {
      setMensagemLogin(
        'Esta propriedade está inativa. Entre em contato com o administrador do RuralControl.'
      )

      await supabase.auth.signOut()

      setSessao(null)
      setCarregando(false)

      return
    }

    setMensagemLogin('')
    setSessao(session)
    setCarregando(false)
  }

  async function sair() {
    await supabase.auth.signOut()

    setSessao(null)
  }

  if (carregando) {
    return (
      <div className="login-page">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!sessao) {
    return (
      <Login
        mensagemSistema={mensagemLogin}
      />
    )
  }

  return (
    <Dashboard
      aoSair={sair}
      usuario={sessao.user}
    />
  )
}

export default App