import { useEffect, useState } from 'react'

import {
  LayoutDashboard,
  Sprout,
  ShoppingCart,
  ReceiptText,
  Package,
  WalletCards,
  BarChart3,
  ShieldCheck,
  LogOut
} from 'lucide-react'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import loginRural from '../assets/login-rural.jpg'
import logoRuralControl from '../assets/RuralControl.png'

import {
  buscarPerfilUsuario
} from '../supabase'

import Producao from './Producao'
import Vendas from './Vendas'
import Despesas from './Despesas'
import Estoque from './Estoque'
import Financeiro from './Financeiro'
import Relatorios from './Relatorios'
import Admin from './Admin'

const meses = [
  { numero: 1, nome: 'Janeiro', curto: 'Jan' },
  { numero: 2, nome: 'Fevereiro', curto: 'Fev' },
  { numero: 3, nome: 'Março', curto: 'Mar' },
  { numero: 4, nome: 'Abril', curto: 'Abr' },
  { numero: 5, nome: 'Maio', curto: 'Mai' },
  { numero: 6, nome: 'Junho', curto: 'Jun' },
  { numero: 7, nome: 'Julho', curto: 'Jul' },
  { numero: 8, nome: 'Agosto', curto: 'Ago' },
  { numero: 9, nome: 'Setembro', curto: 'Set' },
  { numero: 10, nome: 'Outubro', curto: 'Out' },
  { numero: 11, nome: 'Novembro', curto: 'Nov' },
  { numero: 12, nome: 'Dezembro', curto: 'Dez' }
]

function Dashboard({ aoSair }) {
  const hoje = new Date()

  const [pagina, setPagina] = useState('dashboard')

  const [mesSelecionado, setMesSelecionado] = useState(
    hoje.getMonth() + 1
  )

  const [anoSelecionado, setAnoSelecionado] = useState(
    hoje.getFullYear()
  )

  const [producoes, setProducoes] = useState([])
  const [vendas, setVendas] = useState([])
  const [despesas, setDespesas] = useState([])

  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    carregarPerfil()
  }, [])

  async function carregarPerfil() {
    const perfilEncontrado =
      await buscarPerfilUsuario()

    setPerfil(perfilEncontrado)
  }

  function pegarMes(data) {
    if (!data) return 0

    const partes = data.split('-')

    return Number(partes[1])
  }

  function pegarAno(data) {
    if (!data) return 0

    const partes = data.split('-')

    return Number(partes[0])
  }

  function pertenceAoPeriodo(data) {
    return (
      pegarMes(data) === Number(mesSelecionado) &&
      pegarAno(data) === Number(anoSelecionado)
    )
  }

  const producoesDoMes = producoes.filter(
    (producao) =>
      pertenceAoPeriodo(producao.data)
  )

  const vendasDoMes = vendas.filter(
    (venda) =>
      pertenceAoPeriodo(venda.data)
  )

  const despesasDoMes = despesas.filter(
    (despesa) =>
      pertenceAoPeriodo(despesa.data)
  )

  const faturamentoDoMes = vendasDoMes.reduce(
    (total, venda) =>
      total + Number(venda.valorTotal || 0),
    0
  )

  const despesasDoMesTotal =
    despesasDoMes.reduce(
      (total, despesa) =>
        total + Number(despesa.valor || 0),
      0
    )

  const lucroDoMes =
    faturamentoDoMes - despesasDoMesTotal

  const dadosGrafico = meses.map((mes) => {
    const vendasDaqueleMes = vendas.filter(
      (venda) => {
        return (
          pegarMes(venda.data) === mes.numero &&
          pegarAno(venda.data) ===
            Number(anoSelecionado)
        )
      }
    )

    const faturamento =
      vendasDaqueleMes.reduce(
        (total, venda) =>
          total +
          Number(venda.valorTotal || 0),
        0
      )

    return {
      mes: mes.curto,
      faturamento
    }
  })

  function nomePapel() {
    if (!perfil) return ''

    if (perfil.papel === 'admin') {
      return 'Administrador'
    }

    if (perfil.papel === 'funcionario') {
      return 'Funcionário'
    }

    return 'Cliente'
  }

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">

        <div className="sidebar-logo">
          <img
            src={logoRuralControl}
            alt="RuralControl"
          />
        </div>

        <nav>

          <button
            type="button"
            className={
              pagina === 'dashboard'
                ? 'menu-ativo'
                : ''
            }
            onClick={() =>
              setPagina('dashboard')
            }
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={
              pagina === 'producao'
                ? 'menu-ativo'
                : ''
            }
            onClick={() =>
              setPagina('producao')
            }
          >
            <Sprout size={19} />
            <span>Produção</span>
          </button>

          <button
            type="button"
            className={
              pagina === 'vendas'
                ? 'menu-ativo'
                : ''
            }
            onClick={() =>
              setPagina('vendas')
            }
          >
            <ShoppingCart size={19} />
            <span>Vendas</span>
          </button>

          <button
            type="button"
            className={
              pagina === 'despesas'
                ? 'menu-ativo'
                : ''
            }
            onClick={() =>
              setPagina('despesas')
            }
          >
            <ReceiptText size={19} />
            <span>Despesas</span>
          </button>

          <button
            type="button"
            className={
              pagina === 'estoque'
                ? 'menu-ativo'
                : ''
            }
            onClick={() =>
              setPagina('estoque')
            }
          >
            <Package size={19} />
            <span>Estoque</span>
          </button>

          <button
            type="button"
            className={
              pagina === 'financeiro'
                ? 'menu-ativo'
                : ''
            }
            onClick={() =>
              setPagina('financeiro')
            }
          >
            <WalletCards size={19} />
            <span>Financeiro</span>
          </button>

          <button
            type="button"
            className={
              pagina === 'relatorios'
                ? 'menu-ativo'
                : ''
            }
            onClick={() =>
              setPagina('relatorios')
            }
          >
            <BarChart3 size={19} />
            <span>Relatórios</span>
          </button>

          {perfil?.papel === 'admin' && (
            <button
              type="button"
              className={
                pagina === 'admin'
                  ? 'menu-ativo'
                  : ''
              }
              onClick={() =>
                setPagina('admin')
              }
            >
              <ShieldCheck size={19} />
              <span>Administração</span>
            </button>
          )}

        </nav>

        <div className="sidebar-sair">
          <button
            type="button"
            onClick={aoSair}
          >
            <LogOut size={19} />
            <span>Sair</span>
          </button>
        </div>

      </aside>

      <main className="dashboard-content">

        <div className="topo-sistema">

          <div className="identidade-fazenda">
            <strong>
              {perfil?.fazendas?.nome ||
                'Carregando propriedade...'}
            </strong>

            <span>
              {nomePapel()}
            </span>
          </div>

          <div className="barra-superior">

            <div>
              <span className="periodo-label">
                Período
              </span>

              <div className="periodo-controles">

                <select
                  value={mesSelecionado}
                  onChange={(event) =>
                    setMesSelecionado(
                      Number(event.target.value)
                    )
                  }
                >
                  {meses.map((mes) => (
                    <option
                      key={mes.numero}
                      value={mes.numero}
                    >
                      {mes.nome}
                    </option>
                  ))}
                </select>

                <select
                  value={anoSelecionado}
                  onChange={(event) =>
                    setAnoSelecionado(
                      Number(event.target.value)
                    )
                  }
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                  <option value="2031">2031</option>
                  <option value="2032">2032</option>
                  <option value="2033">2033</option>
                  <option value="2034">2034</option>
                  <option value="2035">2035</option>
                </select>

              </div>
            </div>

          </div>

        </div>

        {pagina === 'dashboard' && (
          <div>

            <div
              className="dashboard-banner"
              style={{
                backgroundImage:
                  `url(${loginRural})`
              }}
            >
              <div className="dashboard-banner-overlay">

                <div>
                  <span className="dashboard-banner-marca">
                    RURALCONTROL
                  </span>

                  <h2>
                    Gestão inteligente da sua propriedade
                  </h2>

                  <p>
                    Acompanhe produção, vendas,
                    estoque e resultado financeiro.
                  </p>
                </div>

              </div>
            </div>

            <h1>Dashboard</h1>

            <p className="dashboard-subtitle">
              Visão geral da propriedade
            </p>

            <div className="cards-container">

              <div className="card-resumo">
                <p>Faturamento do mês</p>

                <h3>
                  R$ {faturamentoDoMes.toFixed(2)}
                </h3>
              </div>

              <div className="card-resumo">
                <p>Despesas do mês</p>

                <h3>
                  R$ {despesasDoMesTotal.toFixed(2)}
                </h3>
              </div>

              <div className="card-resumo">
                <p>Lucro do mês</p>

                <h3>
                  R$ {lucroDoMes.toFixed(2)}
                </h3>
              </div>

              <div className="card-resumo">
                <p>Vendas do mês</p>

                <h3>
                  {vendasDoMes.length}
                </h3>
              </div>

            </div>

            <div className="painel">

              <h2>
                Faturamento mensal —{' '}
                {anoSelecionado}
              </h2>

              <div
                style={{
                  width: '100%',
                  height: 320
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={dadosGrafico}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis dataKey="mes" />

                    <YAxis />

                    <Tooltip
                      formatter={(valor) =>
                        `R$ ${Number(valor).toFixed(2)}`
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="faturamento"
                      stroke="#245c3a"
                      strokeWidth={3}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>

            <div className="painel">

              <h2>Resumo do mês</h2>

              <p>
                Produções cadastradas:{' '}
                <strong>
                  {producoesDoMes.length}
                </strong>
              </p>

              <p>
                Vendas registradas:{' '}
                <strong>
                  {vendasDoMes.length}
                </strong>
              </p>

              <p>
                Despesas registradas:{' '}
                <strong>
                  {despesasDoMes.length}
                </strong>
              </p>

            </div>

          </div>
        )}

        {pagina === 'producao' && (
          <Producao
            producoes={producoes}
            setProducoes={setProducoes}
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            fazendaId={perfil?.fazenda_id}
          />
        )}

        {pagina === 'vendas' && (
          <Vendas
            vendas={vendas}
            setVendas={setVendas}
            producoes={producoes}
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            fazendaId={perfil?.fazenda_id}
          />
        )}

        {pagina === 'despesas' && (
          <Despesas
            despesas={despesas}
            setDespesas={setDespesas}
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            fazendaId={perfil?.fazenda_id}
          />
        )}

        {pagina === 'estoque' && (
          <Estoque
            producoes={producoes}
            vendas={vendas}
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
          />
        )}

        {pagina === 'financeiro' && (
          <Financeiro
            vendas={vendas}
            despesas={despesas}
            producoes={producoes}
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
          />
        )}

        {pagina === 'relatorios' && (
          <Relatorios
            producoes={producoes}
            vendas={vendas}
            despesas={despesas}
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
          />
        )}

        {pagina === 'admin' &&
          perfil?.papel === 'admin' && (
            <Admin />
          )}

      </main>

    </div>
  )
}

export default Dashboard