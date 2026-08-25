function Relatorios({
  producoes = [],
  vendas = [],
  despesas = [],
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

  const producoesDoMes = producoes.filter((producao) =>
    pertenceAoPeriodo(producao.data)
  )

  const vendasDoMes = vendas.filter((venda) =>
    pertenceAoPeriodo(venda.data)
  )

  const despesasDoMes = despesas.filter((despesa) =>
    pertenceAoPeriodo(despesa.data)
  )

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

  function calcularProducaoProduto(produtoSelecionado) {
    return producoesDoMes
      .filter(
        (producao) =>
          producao.produto === produtoSelecionado
      )
      .reduce(
        (total, producao) =>
          total + Number(producao.quantidade || 0),
        0
      )
  }

  function calcularVendaProduto(produtoSelecionado) {
    return vendasDoMes
      .filter(
        (venda) =>
          venda.produto === produtoSelecionado
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.quantidade || 0),
        0
      )
  }

  function calcularFaturamentoProduto(produtoSelecionado) {
    return vendasDoMes
      .filter(
        (venda) =>
          venda.produto === produtoSelecionado
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.valorTotal || 0),
        0
      )
  }

  const faturamentoTotal = vendasDoMes.reduce(
    (total, venda) =>
      total + Number(venda.valorTotal || 0),
    0
  )

  const despesasTotal = despesasDoMes.reduce(
    (total, despesa) =>
      total + Number(despesa.valor || 0),
    0
  )

  const lucro = faturamentoTotal - despesasTotal

  return (
    <div>
      <h1>Relatórios</h1>

      <p className="pagina-subtitulo">
        Relatório de {nomesMeses[mesSelecionado]} de{' '}
        {anoSelecionado}
      </p>

      <div className="cards-container">
        <div className="card-resumo">
          <p>Faturamento</p>

          <h3>
            R$ {faturamentoTotal.toFixed(2)}
          </h3>
        </div>

        <div className="card-resumo">
          <p>Despesas</p>

          <h3>
            R$ {despesasTotal.toFixed(2)}
          </h3>
        </div>

        <div className="card-resumo">
          <p>Lucro</p>

          <h3>
            R$ {lucro.toFixed(2)}
          </h3>
        </div>

        <div className="card-resumo">
          <p>Vendas</p>

          <h3>
            {vendasDoMes.length}
          </h3>
        </div>
      </div>

      <div className="painel">
        <h2>Relatório por produto</h2>

        {produtosCadastrados.length === 0 ? (
          <p>
            Nenhum produto cadastrado.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Produção</th>
                <th>Vendas</th>
                <th>Faturamento</th>
              </tr>
            </thead>

            <tbody>
              {produtosCadastrados.map((item) => (
                <tr key={item.produto}>
                  <td>
                    <strong>
                      {item.produto}
                    </strong>
                  </td>

                  <td>
                    {calcularProducaoProduto(item.produto)}{' '}
                    {item.unidade}
                  </td>

                  <td>
                    {calcularVendaProduto(item.produto)}{' '}
                    {item.unidade}
                  </td>

                  <td>
                    R${' '}
                    {calcularFaturamentoProduto(
                      item.produto
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="painel">
        <h2>Despesas do mês</h2>

        {despesasDoMes.length === 0 ? (
          <p>
            Nenhuma despesa registrada neste período.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Despesa</th>
                <th>Valor</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {despesasDoMes.map((despesa) => (
                <tr key={despesa.id}>
                  <td>
                    {despesa.descricao}
                  </td>

                  <td>
                    R$ {despesa.valor.toFixed(2)}
                  </td>

                  <td>
                    {despesa.data}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="painel">
        <h2>Resultado do mês</h2>

        <p>
          Faturamento:
          <strong>
            {' '}R$ {faturamentoTotal.toFixed(2)}
          </strong>
        </p>

        <p>
          Despesas:
          <strong>
            {' '}R$ {despesasTotal.toFixed(2)}
          </strong>
        </p>

        <hr />

        <p>
          Lucro:
          <strong>
            {' '}R$ {lucro.toFixed(2)}
          </strong>
        </p>
      </div>
    </div>
  )
}

export default Relatorios