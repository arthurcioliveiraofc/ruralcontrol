import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Producao({
  producoes = [],
  setProducoes,
  mesSelecionado,
  anoSelecionado,
  fazendaId
}) {
  const [produto, setProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('')
  const [data, setData] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  useEffect(() => {
    if (fazendaId) {
      carregarProducoes()
    }
  }, [fazendaId])

  async function carregarProducoes() {
    const { data: dados, error } = await supabase
      .from('producoes')
      .select('*')
      .eq('fazenda_id', fazendaId)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar produções:', error)
      return
    }

    const dadosFormatados = (dados || []).map((registro) => ({
      ...registro,
      quantidade: Number(registro.quantidade)
    }))

    setProducoes(dadosFormatados)
  }

  function formatarNomeProduto(nome) {
    const nomeLimpo = nome
      .trim()
      .replace(/\s+/g, ' ')

    const produtoExistente = producoes.find(
      (producao) =>
        producao.produto.toLowerCase() ===
        nomeLimpo.toLowerCase()
    )

    if (produtoExistente) {
      return produtoExistente.produto
    }

    return nomeLimpo
      .toLowerCase()
      .replace(
        /(^|\s)\S/g,
        (letra) => letra.toUpperCase()
      )
  }

  async function cadastrarProducao(event) {
    event.preventDefault()

    if (!fazendaId) {
      alert('Fazenda não identificada.')
      return
    }

    setSalvando(true)

    const nomeProduto = formatarNomeProduto(produto)

    const dadosProducao = {
      produto: nomeProduto,
      quantidade: Number(quantidade),
      unidade,
      data,
      observacao: null,
      fazenda_id: fazendaId
    }

    if (editandoId) {
      const { data: registroAtualizado, error } =
        await supabase
          .from('producoes')
          .update(dadosProducao)
          .eq('id', editandoId)
          .eq('fazenda_id', fazendaId)
          .select()
          .single()

      if (error) {
        console.error(
          'Erro ao atualizar produção:',
          error
        )

        alert('Erro ao atualizar a produção.')

        setSalvando(false)
        return
      }

      const producoesAtualizadas = producoes.map(
        (producao) =>
          producao.id === editandoId
            ? {
                ...registroAtualizado,
                quantidade: Number(
                  registroAtualizado.quantidade
                )
              }
            : producao
      )

      setProducoes(producoesAtualizadas)

      cancelarEdicao()
      setSalvando(false)
      return
    }

    const { data: registroSalvo, error } = await supabase
      .from('producoes')
      .insert([dadosProducao])
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar produção:', error)

      alert('Erro ao salvar a produção.')

      setSalvando(false)
      return
    }

    const novaProducao = {
      ...registroSalvo,
      quantidade: Number(registroSalvo.quantidade)
    }

    setProducoes([
      novaProducao,
      ...producoes
    ])

    limparFormulario()

    setSalvando(false)
  }

  function editarProducao(producao) {
    setEditandoId(producao.id)

    setProduto(producao.produto)
    setQuantidade(producao.quantidade)
    setUnidade(producao.unidade)
    setData(producao.data)

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
    setUnidade('')
    setData('')
  }

  async function excluirProducao(producao) {
    const confirmar = window.confirm(
      `Deseja realmente excluir "${producao.produto}"?`
    )

    if (!confirmar) {
      return
    }

    const { error } = await supabase
      .from('producoes')
      .delete()
      .eq('id', producao.id)
      .eq('fazenda_id', fazendaId)

    if (error) {
      console.error('Erro ao excluir produção:', error)

      alert('Erro ao excluir a produção.')

      return
    }

    setProducoes(
      producoes.filter(
        (item) => item.id !== producao.id
      )
    )

    if (editandoId === producao.id) {
      cancelarEdicao()
    }
  }

  function pertenceAoPeriodo(dataRegistro) {
    if (!dataRegistro) {
      return false
    }

    const partes = dataRegistro.split('-')

    const ano = Number(partes[0])
    const mes = Number(partes[1])

    return (
      mes === Number(mesSelecionado) &&
      ano === Number(anoSelecionado)
    )
  }

  const producoesDoMes = producoes.filter(
    (producao) =>
      pertenceAoPeriodo(producao.data)
  )

  const produtosDoMes = [
    ...new Set(
      producoesDoMes.map(
        (producao) => producao.produto
      )
    )
  ]

  function calcularTotal(produtoSelecionado) {
    return producoesDoMes
      .filter(
        (producao) =>
          producao.produto === produtoSelecionado
      )
      .reduce(
        (total, producao) =>
          total +
          Number(producao.quantidade || 0),
        0
      )
  }

  function descobrirUnidade(produtoSelecionado) {
    const registro = producoesDoMes.find(
      (producao) =>
        producao.produto === produtoSelecionado
    )

    return registro
      ? registro.unidade
      : ''
  }

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
      <h1>Produção</h1>

      <p className="pagina-subtitulo">
        Produção de {nomesMeses[mesSelecionado]} de{' '}
        {anoSelecionado}
      </p>

      {produtosDoMes.length > 0 && (
        <div className="cards-container">
          {produtosDoMes.map((nomeProduto) => (
            <div
              className="card-resumo"
              key={nomeProduto}
            >
              <p>{nomeProduto}</p>

              <h3>
                {calcularTotal(nomeProduto)}{' '}
                {descobrirUnidade(nomeProduto)}
              </h3>
            </div>
          ))}
        </div>
      )}

      <div className="painel">
        <h2>
          {editandoId
            ? 'Editar produção'
            : 'Nova produção'}
        </h2>

        <form
          className="formulario"
          onSubmit={cadastrarProducao}
        >
          <label>Produto</label>

          <input
            type="text"
            value={produto}
            onChange={(event) =>
              setProduto(event.target.value)
            }
            placeholder="Ex: Ovos, Gelo, Pimentão..."
            required
          />

          <label>Quantidade</label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={quantidade}
            onChange={(event) =>
              setQuantidade(event.target.value)
            }
            placeholder="Digite a quantidade"
            required
          />

          <label>Unidade</label>

          <select
            value={unidade}
            onChange={(event) =>
              setUnidade(event.target.value)
            }
            required
          >
            <option value="">
              Selecione
            </option>

            <option value="kg">kg</option>
            <option value="unidades">Unidades</option>
            <option value="bandejas">Bandejas</option>
            <option value="caixas">Caixas</option>
            <option value="sacos">Sacos</option>
            <option value="litros">Litros</option>
            <option value="toneladas">Toneladas</option>
          </select>

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
                : 'Cadastrar produção'}
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
      </div>

      <div className="painel">
        <h2>Produções do mês</h2>

        {producoesDoMes.length === 0 ? (
          <p>
            Nenhuma produção registrada neste período.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {producoesDoMes.map((producao) => (
                <tr key={producao.id}>
                  <td>{producao.produto}</td>

                  <td>
                    {producao.quantidade}{' '}
                    {producao.unidade}
                  </td>

                  <td>{producao.data}</td>

                  <td>
                    <div className="acoes-tabela">

                      <button
                        type="button"
                        className="botao-editar"
                        onClick={() =>
                          editarProducao(producao)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="botao-excluir"
                        onClick={() =>
                          excluirProducao(producao)
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

export default Producao