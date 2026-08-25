function Estoque({
  producoes = [],
  vendas = [],
  mesSelecionado,
  anoSelecionado
}) {
  const nomesMeses = [
    '',
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ]

  function pertenceAoPeriodo(dataRegistro) {
    if (!dataRegistro) return false

    const partes = dataRegistro.split('-')

    const ano = Number(partes[0])
    const mes = Number(partes[1])

    return (
      mes === Number(mesSelecionado) &&
      ano === Number(anoSelecionado)
    )
  }

  const produtosCadastrados = [
    ...new Map(
      producoes.map((producao) => [
        producao.produto,
        {
          produto: producao.produto,
          unidade: producao.unidade
        }
      ])
    ).values()
  ]

  function calcularProducaoTotal(produto) {
    return producoes
      .filter((item) => item.produto === produto)
      .reduce(
        (total, item) =>
          total + Number(item.quantidade),
        0
      )
  }

  function calcularVendaTotal(produto) {
    return vendas
      .filter((item) => item.produto === produto)
      .reduce(
        (total, item) =>
          total + Number(item.quantidade),
        0
      )
  }

  function calcularProducaoMes(produto) {
    return producoes
      .filter(
        (item) =>
          item.produto === produto &&
          pertenceAoPeriodo(item.data)
      )
      .reduce(
        (total, item) =>
          total + Number(item.quantidade),
        0
      )
  }

  function calcularVendaMes(produto) {
    return vendas
      .filter(
        (item) =>
          item.produto === produto &&
          pertenceAoPeriodo(item.data)
      )
      .reduce(
        (total, item) =>
          total + Number(item.quantidade),
        0
      )
  }

  return (
    <div>
      <h1>Estoque</h1>

      <p className="pagina-subtitulo">
        Estoque atual e movimentação de{' '}
        {nomesMeses[mesSelecionado]} de {anoSelecionado}
      </p>

      <div className="painel">
        <h2>Estoque atual</h2>

        {produtosCadastrados.length === 0 ? (
          <p>
            Nenhum produto cadastrado na produção.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Produção acumulada</th>
                <th>Vendas acumuladas</th>
                <th>Estoque atual</th>
              </tr>
            </thead>

            <tbody>
              {produtosCadastrados.map((item) => {
                const produzido =
                  calcularProducaoTotal(item.produto)

                const vendido =
                  calcularVendaTotal(item.produto)

                const estoque =
                  produzido - vendido

                return (
                  <tr key={item.produto}>
                    <td>
                      <strong>
                        {item.produto}
                      </strong>
                    </td>

                    <td>
                      {produzido} {item.unidade}
                    </td>

                    <td>
                      {vendido} {item.unidade}
                    </td>

                    <td>
                      <strong>
                        {estoque} {item.unidade}
                      </strong>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="painel">
        <h2>
          Movimentação de {nomesMeses[mesSelecionado]}
        </h2>

        {produtosCadastrados.length === 0 ? (
          <p>
            Nenhuma movimentação cadastrada.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Produzido no mês</th>
                <th>Vendido no mês</th>
                <th>Saldo do mês</th>
              </tr>
            </thead>

            <tbody>
              {produtosCadastrados.map((item) => {
                const produzidoMes =
                  calcularProducaoMes(item.produto)

                const vendidoMes =
                  calcularVendaMes(item.produto)

                const saldoMes =
                  produzidoMes - vendidoMes

                return (
                  <tr key={item.produto}>
                    <td>
                      <strong>
                        {item.produto}
                      </strong>
                    </td>

                    <td>
                      {produzidoMes} {item.unidade}
                    </td>

                    <td>
                      {vendidoMes} {item.unidade}
                    </td>

                    <td>
                      <strong>
                        {saldoMes} {item.unidade}
                      </strong>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Estoque