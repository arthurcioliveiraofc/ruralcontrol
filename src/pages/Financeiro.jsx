function Financeiro({
  vendas = [],
  despesas = [],
  producoes = [],
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

  const vendasDoMes = vendas.filter((venda) =>
    pertenceAoPeriodo(venda.data)
  )

  const despesasDoMes = despesas.filter((despesa) =>
    pertenceAoPeriodo(despesa.data)
  )

  const produtosCadastrados = [
    ...new Set(
      producoes.map((producao) => producao.produto)
    )
  ]

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

  function calcularQuantidadeVendida(produtoSelecionado) {
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

  function descobrirUnidade(produtoSelecionado) {
    const registro = producoes.find(
      (producao) =>
        producao.produto === produtoSelecionado
    )

    return registro ? registro.unidade : ''
  }

  return (
    <div>
      <h1>Financeiro</h1>

      <p className="pagina-subtitulo">
        Resultado financeiro de {nomesMeses[mesSelecionado]} de{' '}
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
        <h2>Faturamento por produto</h2>

        {produtosCadastrados.length === 0 ? (
          <p>
            Nenhum produto cadastrado.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade vendida</th>
                <th>Faturamento</th>
              </tr>
            </thead>

            <tbody>
              {produtosCadastrados.map((produto) => (
                <tr key={produto}>
                  <td>
                    <strong>{produto}</strong>
                  </td>

                  <td>
                    {calcularQuantidadeVendida(produto)}{' '}
                    {descobrirUnidade(produto)}
                  </td>

                  <td>
                    R${' '}
                    {calcularFaturamentoProduto(produto).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="painel">
        <h2>Resumo financeiro do mês</h2>

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

export default Financeiro