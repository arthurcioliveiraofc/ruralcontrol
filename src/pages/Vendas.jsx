import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Vendas({
  vendas = [],
  setVendas,
  producoes = [],
  mesSelecionado,
  anoSelecionado,
  fazendaId
}) {
  const [produto, setProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [preco, setPreco] = useState('')
  const [comprador, setComprador] = useState('')
  const [data, setData] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  useEffect(() => {
    if (fazendaId) {
      carregarVendas()
    }
  }, [fazendaId])

  async function carregarVendas() {
    const { data: dados, error } = await supabase
      .from('vendas')
      .select('*')
      .eq('fazenda_id', fazendaId)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar vendas:', error)
      return
    }

    const vendasFormatadas = (dados || []).map((venda) => ({
      id: venda.id,
      produto: venda.produto,
      quantidade: Number(venda.quantidade),
      unidade: venda.unidade,
      preco: Number(venda.valorUnitario),
      valorTotal: Number(venda.valorTotal),
      comprador: venda.comprador,
      data: venda.data,
      fazenda_id: venda.fazenda_id
    }))

    setVendas(vendasFormatadas)
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

  function descobrirUnidade(produtoSelecionado) {
    const encontrado = produtosCadastrados.find(
      (item) => item.produto === produtoSelecionado
    )

    return encontrado ? encontrado.unidade : ''
  }

  async function cadastrarVenda(event) {
    event.preventDefault()

    if (!fazendaId) {
      alert('Fazenda não identificada.')
      return
    }

    setSalvando(true)

    const unidade = descobrirUnidade(produto)

    const valorTotal =
      Number(quantidade) * Number(preco)

    const dadosVenda = {
      produto,
      quantidade: Number(quantidade),
      unidade,
      valorUnitario: Number(preco),
      valorTotal,
      comprador: comprador.trim(),
      data,
      fazenda_id: fazendaId
    }

    if (editandoId) {
      const { data: registroAtualizado, error } =
        await supabase
          .from('vendas')
          .update(dadosVenda)
          .eq('id', editandoId)
          .eq('fazenda_id', fazendaId)
          .select()
          .single()

      if (error) {
        console.error('Erro ao atualizar venda:', error)
        alert('Erro ao atualizar a venda.')
        setSalvando(false)
        return
      }

      const vendaFormatada = {
        id: registroAtualizado.id,
        produto: registroAtualizado.produto,
        quantidade: Number(registroAtualizado.quantidade),
        unidade: registroAtualizado.unidade,
        preco: Number(registroAtualizado.valorUnitario),
        valorTotal: Number(registroAtualizado.valorTotal),
        comprador: registroAtualizado.comprador,
        data: registroAtualizado.data,
        fazenda_id: registroAtualizado.fazenda_id
      }

      setVendas(
        vendas.map((venda) =>
          venda.id === editandoId
            ? vendaFormatada
            : venda
        )
      )

      cancelarEdicao()
      setSalvando(false)
      return
    }

    const { data: registroSalvo, error } = await supabase
      .from('vendas')
      .insert([dadosVenda])
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar venda:', error)
      alert('Erro ao salvar a venda.')
      setSalvando(false)
      return
    }

    const vendaFormatada = {
      id: registroSalvo.id,
      produto: registroSalvo.produto,
      quantidade: Number(registroSalvo.quantidade),
      unidade: registroSalvo.unidade,
      preco: Number(registroSalvo.valorUnitario),
      valorTotal: Number(registroSalvo.valorTotal),
      comprador: registroSalvo.comprador,
      data: registroSalvo.data,
      fazenda_id: registroSalvo.fazenda_id
    }

    setVendas([
      vendaFormatada,
      ...vendas
    ])

    limparFormulario()
    setSalvando(false)
  }

  function editarVenda(venda) {
    setEditandoId(venda.id)

    setProduto(venda.produto)
    setQuantidade(venda.quantidade)
    setPreco(venda.preco)
    setComprador(venda.comprador)
    setData(venda.data)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    limparFormulario()
  }

  function limparFormulario() {
    setProduto('')
    setQuantidade('')
    setPreco('')
    setComprador('')
    setData('')
  }

  async function excluirVenda(venda) {
    const confirmar = window.confirm(
      `Deseja realmente excluir esta venda de "${venda.produto}"?`
    )

    if (!confirmar) {
      return
    }

    const { error } = await supabase
      .from('vendas')
      .delete()
      .eq('id', venda.id)
      .eq('fazenda_id', fazendaId)

    if (error) {
      console.error('Erro ao excluir venda:', error)
      alert('Erro ao excluir a venda.')
      return
    }

    setVendas(
      vendas.filter(
        (item) => item.id !== venda.id
      )
    )

    if (editandoId === venda.id) {
      cancelarEdicao()
    }
  }

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

  function calcularFaturamento(produtoSelecionado) {
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

  return (
    <div>
      <h1>Vendas</h1>

      <p className="pagina-subtitulo">
        Vendas de {nomesMeses[mesSelecionado]} de{' '}
        {anoSelecionado}
      </p>

      <div className="cards-container">

        <div className="card-resumo">
          <p>Faturamento do mês</p>
          <h3>R$ {faturamentoTotal.toFixed(2)}</h3>
        </div>

        <div className="card-resumo">
          <p>Vendas realizadas</p>
          <h3>{vendasDoMes.length}</h3>
        </div>

      </div>

      <div className="painel">
        <h2>Resumo por produto</h2>

        {produtosCadastrados.length === 0 ? (
          <p>Nenhum produto cadastrado na produção.</p>
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
              {produtosCadastrados.map((item) => (
                <tr key={item.produto}>
                  <td>
                    <strong>{item.produto}</strong>
                  </td>

                  <td>
                    {calcularQuantidadeVendida(item.produto)}{' '}
                    {item.unidade}
                  </td>

                  <td>
                    R$ {calcularFaturamento(item.produto).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="painel">
        <h2>
          {editandoId
            ? 'Editar venda'
            : 'Nova venda'}
        </h2>

        {produtosCadastrados.length === 0 ? (
          <p>
            Cadastre primeiro um produto em Produção.
          </p>
        ) : (
          <form
            className="formulario"
            onSubmit={cadastrarVenda}
          >
            <label>Produto</label>

            <select
              value={produto}
              onChange={(event) =>
                setProduto(event.target.value)
              }
              required
            >
              <option value="">
                Selecione
              </option>

              {produtosCadastrados.map((item) => (
                <option
                  key={item.produto}
                  value={item.produto}
                >
                  {item.produto}
                </option>
              ))}
            </select>

            <label>Quantidade</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={quantidade}
              onChange={(event) =>
                setQuantidade(event.target.value)
              }
              required
            />

            {produto && (
              <p>
                Unidade:{' '}
                <strong>
                  {descobrirUnidade(produto)}
                </strong>
              </p>
            )}

            <label>Preço por unidade</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={preco}
              onChange={(event) =>
                setPreco(event.target.value)
              }
              required
            />

            {quantidade && preco && (
              <p className="valor-destaque">
                Valor da venda: R${' '}
                {(
                  Number(quantidade) *
                  Number(preco)
                ).toFixed(2)}
              </p>
            )}

            <label>Vendido para</label>

            <input
              type="text"
              value={comprador}
              onChange={(event) =>
                setComprador(event.target.value)
              }
              placeholder="Ex: Mercadinho São José"
              required
            />

            <label>Data</label>

            <input
              type="date"
              value={data}
              onChange={(event) =>
                setData(event.target.value)
              }
              required
            />

            <button
              type="submit"
              className="botao-principal"
              disabled={salvando}
            >
              {salvando
                ? 'Salvando...'
                : editandoId
                  ? 'Salvar alterações'
                  : 'Registrar venda'}
            </button>

            {editandoId && (
              <button
                type="button"
                className="botao-cancelar"
                onClick={cancelarEdicao}
              >
                Cancelar edição
              </button>
            )}
          </form>
        )}
      </div>

      <div className="painel">
        <h2>Vendas do mês</h2>

        {vendasDoMes.length === 0 ? (
          <p>
            Nenhuma venda registrada neste período.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Comprador</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {vendasDoMes.map((venda) => (
                <tr key={venda.id}>
                  <td>{venda.produto}</td>

                  <td>
                    {venda.quantidade}{' '}
                    {venda.unidade}
                  </td>

                  <td>{venda.comprador}</td>

                  <td>
                    R$ {Number(venda.valorTotal).toFixed(2)}
                  </td>

                  <td>{venda.data}</td>

                  <td>
                    <div className="acoes-tabela">

                      <button
                        type="button"
                        className="botao-editar"
                        onClick={() =>
                          editarVenda(venda)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="botao-excluir"
                        onClick={() =>
                          excluirVenda(venda)
                        }
                      >
                        Excluir
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Vendas