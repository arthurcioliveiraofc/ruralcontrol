import { useEffect, useState } from 'react'

import { supabase } from '../supabase'

const meses = [
  { numero: 1, nome: 'Janeiro' },
  { numero: 2, nome: 'Fevereiro' },
  { numero: 3, nome: 'Março' },
  { numero: 4, nome: 'Abril' },
  { numero: 5, nome: 'Maio' },
  { numero: 6, nome: 'Junho' },
  { numero: 7, nome: 'Julho' },
  { numero: 8, nome: 'Agosto' },
  { numero: 9, nome: 'Setembro' },
  { numero: 10, nome: 'Outubro' },
  { numero: 11, nome: 'Novembro' },
  { numero: 12, nome: 'Dezembro' }
]

function Admin() {
  const hoje = new Date()

  const [fazendas, setFazendas] = useState([])
  const [carregando, setCarregando] =
    useState(true)

  const [
    fazendaSelecionada,
    setFazendaSelecionada
  ] = useState(null)

  const [producoes, setProducoes] =
    useState([])

  const [vendas, setVendas] =
    useState([])

  const [despesas, setDespesas] =
    useState([])

  const [
    carregandoFazenda,
    setCarregandoFazenda
  ] = useState(false)

  const [
    mesSelecionado,
    setMesSelecionado
  ] = useState(
    hoje.getMonth() + 1
  )

  const [
    anoSelecionado,
    setAnoSelecionado
  ] = useState(
    hoje.getFullYear()
  )

  useEffect(() => {
    carregarFazendas()
  }, [])

  async function carregarFazendas() {
    setCarregando(true)

    const { data, error } =
      await supabase
        .from('fazendas')
        .select('*')
        .order(
          'id',
          { ascending: true }
        )

    if (error) {
      console.error(
        'Erro ao carregar fazendas:',
        error
      )

      alert(
        'Erro ao carregar as fazendas.'
      )

      setCarregando(false)

      return
    }

    setFazendas(data || [])

    setCarregando(false)
  }

  async function alterarStatusFazenda(
    fazenda
  ) {
    const novoStatus =
      !fazenda.ativo

    const acao =
      novoStatus
        ? 'ativar'
        : 'inativar'

    const confirmar =
      window.confirm(
        `Deseja realmente ${acao} "${fazenda.nome}"?`
      )

    if (!confirmar) {
      return
    }

    const {
      data,
      error
    } = await supabase
      .from('fazendas')
      .update({
        ativo: novoStatus
      })
      .eq(
        'id',
        fazenda.id
      )
      .select()
      .single()

    if (error) {
      console.error(
        'Erro ao alterar fazenda:',
        error
      )

      alert(
        'Erro ao alterar o status da fazenda.'
      )

      return
    }

    setFazendas(
      fazendas.map(
        (item) =>
          item.id ===
          fazenda.id
            ? data
            : item
      )
    )
  }

  async function visualizarFazenda(
    fazenda
  ) {
    setFazendaSelecionada(
      fazenda
    )

    setCarregandoFazenda(true)

    const [
      resultadoProducoes,
      resultadoVendas,
      resultadoDespesas
    ] = await Promise.all([
      supabase
        .from('producoes')
        .select('*')
        .eq(
          'fazenda_id',
          fazenda.id
        )
        .order(
          'data',
          {
            ascending: false
          }
        ),

      supabase
        .from('vendas')
        .select('*')
        .eq(
          'fazenda_id',
          fazenda.id
        )
        .order(
          'data',
          {
            ascending: false
          }
        ),

      supabase
        .from('despesas')
        .select('*')
        .eq(
          'fazenda_id',
          fazenda.id
        )
        .order(
          'data',
          {
            ascending: false
          }
        )
    ])

    setProducoes(
      (
        resultadoProducoes.data ||
        []
      ).map(
        (item) => ({
          ...item,
          quantidade:
            Number(
              item.quantidade || 0
            )
        })
      )
    )

    setVendas(
      (
        resultadoVendas.data ||
        []
      ).map(
        (item) => ({
          ...item,
          quantidade:
            Number(
              item.quantidade || 0
            ),
          valorTotal:
            Number(
              item.valorTotal || 0
            )
        })
      )
    )

    setDespesas(
      (
        resultadoDespesas.data ||
        []
      ).map(
        (item) => ({
          ...item,
          valor:
            Number(
              item.valor || 0
            )
        })
      )
    )

    setCarregandoFazenda(false)
  }

  function voltarParaLista() {
    setFazendaSelecionada(null)

    setProducoes([])
    setVendas([])
    setDespesas([])
  }

  function pertenceAoPeriodo(
    dataRegistro
  ) {
    if (!dataRegistro) {
      return false
    }

    const partes =
      dataRegistro.split('-')

    const ano =
      Number(partes[0])

    const mes =
      Number(partes[1])

    return (
      mes ===
        Number(mesSelecionado) &&
      ano ===
        Number(anoSelecionado)
    )
  }

  const totalFazendas =
    fazendas.length

  const fazendasAtivas =
    fazendas.filter(
      (fazenda) =>
        fazenda.ativo === true
    ).length

  const fazendasInativas =
    totalFazendas -
    fazendasAtivas

  const producoesDoMes =
    producoes.filter(
      (item) =>
        pertenceAoPeriodo(
          item.data
        )
    )

  const vendasDoMes =
    vendas.filter(
      (item) =>
        pertenceAoPeriodo(
          item.data
        )
    )

  const despesasDoMes =
    despesas.filter(
      (item) =>
        pertenceAoPeriodo(
          item.data
        )
    )

  const faturamentoDoMes =
    vendasDoMes.reduce(
      (total, venda) =>
        total +
        Number(
          venda.valorTotal || 0
        ),
      0
    )

  const despesasDoMesTotal =
    despesasDoMes.reduce(
      (total, despesa) =>
        total +
        Number(
          despesa.valor || 0
        ),
      0
    )

  const lucroDoMes =
    faturamentoDoMes -
    despesasDoMesTotal

  const produtosCadastrados = [
    ...new Map(
      producoes.map(
        (producao) => [
          producao.produto,
          {
            produto:
              producao.produto,

            unidade:
              producao.unidade
          }
        ]
      )
    ).values()
  ]

  function calcularProducaoTotal(
    produto
  ) {
    return producoes
      .filter(
        (item) =>
          item.produto ===
          produto
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.quantidade || 0
          ),
        0
      )
  }

  function calcularVendaTotal(
    produto
  ) {
    return vendas
      .filter(
        (item) =>
          item.produto ===
          produto
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.quantidade || 0
          ),
        0
      )
  }

  if (fazendaSelecionada) {
    return (
      <div>

        <button
          type="button"
          className="botao-voltar-admin"
          onClick={
            voltarParaLista
          }
        >
          ← Voltar para fazendas
        </button>

        <div className="admin-fazenda-topo">

          <div>

            <h1>
              {
                fazendaSelecionada.nome
              }
            </h1>

            <p className="pagina-subtitulo">
              Visão administrativa da propriedade
            </p>

          </div>

          <span
            className={
              fazendaSelecionada.ativo
                ? 'status-fazenda status-ativa'
                : 'status-fazenda status-inativa'
            }
          >
            {fazendaSelecionada.ativo
              ? 'ATIVA'
              : 'INATIVA'}
          </span>

        </div>

        <div className="painel">

          <span className="periodo-label">
            Período
          </span>

          <div className="periodo-controles">

            <select
              value={mesSelecionado}
              onChange={(event) =>
                setMesSelecionado(
                  Number(
                    event.target.value
                  )
                )
              }
            >
              {meses.map(
                (mes) => (
                  <option
                    key={
                      mes.numero
                    }
                    value={
                      mes.numero
                    }
                  >
                    {mes.nome}
                  </option>
                )
              )}
            </select>

            <select
              value={anoSelecionado}
              onChange={(event) =>
                setAnoSelecionado(
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value="2026">
                2026
              </option>

              <option value="2027">
                2027
              </option>

              <option value="2028">
                2028
              </option>

              <option value="2029">
                2029
              </option>

              <option value="2030">
                2030
              </option>

            </select>

          </div>

        </div>

        {carregandoFazenda ? (
          <div className="painel">
            Carregando...
          </div>
        ) : (
          <>

            <div className="cards-container">

              <div className="card-resumo">

                <p>
                  Faturamento
                </p>

                <h3>
                  R${' '}
                  {
                    faturamentoDoMes
                      .toFixed(2)
                  }
                </h3>

              </div>

              <div className="card-resumo">

                <p>
                  Despesas
                </p>

                <h3>
                  R${' '}
                  {
                    despesasDoMesTotal
                      .toFixed(2)
                  }
                </h3>

              </div>

              <div className="card-resumo">

                <p>
                  Lucro
                </p>

                <h3>
                  R${' '}
                  {
                    lucroDoMes
                      .toFixed(2)
                  }
                </h3>

              </div>

              <div className="card-resumo">

                <p>
                  Vendas
                </p>

                <h3>
                  {
                    vendasDoMes.length
                  }
                </h3>

              </div>

            </div>

            <div className="painel">

              <h2>
                Estoque atual
              </h2>

              {produtosCadastrados.length ===
              0 ? (
                <p>
                  Nenhum produto cadastrado.
                </p>
              ) : (
                <table>

                  <thead>
                    <tr>
                      <th>
                        Produto
                      </th>

                      <th>
                        Produção acumulada
                      </th>

                      <th>
                        Vendas acumuladas
                      </th>

                      <th>
                        Estoque
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {produtosCadastrados.map(
                      (item) => {
                        const produzido =
                          calcularProducaoTotal(
                            item.produto
                          )

                        const vendido =
                          calcularVendaTotal(
                            item.produto
                          )

                        return (
                          <tr
                            key={
                              item.produto
                            }
                          >

                            <td>
                              <strong>
                                {
                                  item.produto
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                produzido
                              }{' '}
                              {
                                item.unidade
                              }
                            </td>

                            <td>
                              {
                                vendido
                              }{' '}
                              {
                                item.unidade
                              }
                            </td>

                            <td>
                              <strong>
                                {
                                  produzido -
                                  vendido
                                }{' '}
                                {
                                  item.unidade
                                }
                              </strong>
                            </td>

                          </tr>
                        )
                      }
                    )}

                  </tbody>

                </table>
              )}

            </div>

            <div className="painel">

              <h2>
                Produções do mês
              </h2>

              <p>
                {
                  producoesDoMes.length
                } lançamento(s)
              </p>

            </div>

          </>
        )}

      </div>
    )
  }

  return (
    <div>

      <h1>
        Administração
      </h1>

      <p className="pagina-subtitulo">
        Gestão das propriedades cadastradas no RuralControl
      </p>

      <div className="cards-container">

        <div className="card-resumo">

          <p>
            Total de fazendas
          </p>

          <h3>
            {totalFazendas}
          </h3>

        </div>

        <div className="card-resumo">

          <p>
            Fazendas ativas
          </p>

          <h3>
            {fazendasAtivas}
          </h3>

        </div>

        <div className="card-resumo">

          <p>
            Fazendas inativas
          </p>

          <h3>
            {fazendasInativas}
          </h3>

        </div>

      </div>

      <div className="painel">

        <h2>
          Fazendas cadastradas
        </h2>

        {carregando ? (
          <p>
            Carregando fazendas...
          </p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Fazenda</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>

              {fazendas.map(
                (fazenda) => (
                  <tr
                    key={
                      fazenda.id
                    }
                  >

                    <td>
                      {fazenda.id}
                    </td>

                    <td>
                      <strong>
                        {
                          fazenda.nome
                        }
                      </strong>
                    </td>

                    <td>
                      <span
                        className={
                          fazenda.ativo
                            ? 'status-fazenda status-ativa'
                            : 'status-fazenda status-inativa'
                        }
                      >
                        {fazenda.ativo
                          ? 'ATIVA'
                          : 'INATIVA'}
                      </span>
                    </td>

                    <td>

                      <div className="acoes-tabela">

                        <button
                          type="button"
                          className="botao-visualizar"
                          onClick={() =>
                            visualizarFazenda(
                              fazenda
                            )
                          }
                        >
                          Visualizar
                        </button>

                        <button
                          type="button"
                          className={
                            fazenda.ativo
                              ? 'botao-inativar'
                              : 'botao-ativar'
                          }
                          onClick={() =>
                            alterarStatusFazenda(
                              fazenda
                            )
                          }
                        >
                          {fazenda.ativo
                            ? 'Inativar'
                            : 'Ativar'}
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>
        )}

      </div>

    </div>
  )
}

export default Admin