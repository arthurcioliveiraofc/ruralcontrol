import { useState } from 'react'

import { supabase } from '../supabase'

import loginRural from '../assets/login-rural.jpg'

function Login({
  mensagemSistema = ''
}) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [entrando, setEntrando] = useState(false)

  async function fazerLogin(event) {
    event.preventDefault()

    setEntrando(true)

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha
      })

    if (error) {
      console.error(
        'Erro no login:',
        error
      )

      alert('E-mail ou senha incorretos.')

      setEntrando(false)
      return
    }

    setEntrando(false)
  }

  return (
    <div className="login-page">

      <div className="login-split">

        <div
          className="login-imagem"
          style={{
            backgroundImage:
              `url(${loginRural})`
          }}
        >
          <div className="login-imagem-overlay">

            <div className="login-imagem-marca">

              <h2>
                RuralControl
              </h2>

              <span>
                GESTÃO RURAL
              </span>

            </div>

            <div className="login-beneficios">

              <div className="login-beneficio">

                <strong>
                  SEGURANÇA
                </strong>

                <p>
                  Seus dados organizados e protegidos.
                </p>

              </div>

              <div className="login-beneficio">

                <strong>
                  CONTROLE
                </strong>

                <p>
                  Produção, vendas, estoque e financeiro em um só lugar.
                </p>

              </div>

              <div className="login-beneficio">

                <strong>
                  PRODUTIVIDADE
                </strong>

                <p>
                  Mais organização para tomar decisões melhores.
                </p>

              </div>

            </div>

          </div>
        </div>

        <div className="login-area">

          <div className="login-card-novo">

            <div className="login-logo-texto">

              <h1>
                RuralControl
              </h1>

              <span>
                GESTÃO RURAL
              </span>

            </div>

            <div className="login-boas-vindas">

              <h2>
                Bem-vindo de volta
              </h2>

              <p>
                Acesse sua conta para gerenciar sua propriedade.
              </p>

            </div>

            {mensagemSistema && (
              <div className="login-aviso">
                {mensagemSistema}
              </div>
            )}

            <form onSubmit={fazerLogin}>

              <label>
                E-mail
              </label>

              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
              />

              <label>
                Senha
              </label>

              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) =>
                  setSenha(
                    event.target.value
                  )
                }
                required
              />

              <button
                type="submit"
                disabled={entrando}
              >
                {entrando
                  ? 'Entrando...'
                  : 'Entrar'}
              </button>

            </form>

            <div className="login-rodape">
              RuralControl • Gestão Rural
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login