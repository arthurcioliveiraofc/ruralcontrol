import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Despesas({
  despesas = [],
  setDespesas,
  mesSelecionado,
  anoSelecionado,
  fazendaId
}) {
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  useEffect(() => {
    if (fazendaId) {
      carregarDespesas()
    }
  }, [fazendaId])

  async function carregarDespesas() {
    const { data: dados, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('fazenda_id', fazendaId)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar despesas:', error)
      return
    }

    const despesasFormatadas = (dados || []).map((despesa) => ({
      id: despesa.id,
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      valor: Number(despesa.valor),
      data: despesa.data,
      fazenda_id: despesa.fazenda_id
    }))

    setDespesas(despesasFormatadas)
  }

  async function cadastrarDespesa(event) {
    event.preventDefault()

    if (!fazendaId) {
      alert('Fazenda não identificada.')
      return
    }

    setSalvando(true)

    const dadosDespesa = {
      descricao: descricao.trim(),
      categoria: categoria.trim(),
      valor: Number(valor),
      data,
      fazenda_id: fazendaId
    }

    if (editandoId) {
      const { data: registroAtualizado, error } =
        await supabase
          .from('despesas')
          .update(dadosDespesa)
          .eq('id', editandoId)
          .eq('fazenda_id', fazendaId)
          .select()
          .single()

      if (error) {
        console.error('Erro ao atualizar despesa:', error)
        alert('Erro ao atualizar a despesa.')
        setSalvando(false)
        return
      }

      const despesaFormatada = {
        id: registroAtualizado.id,
        descricao: registroAtualizado.descricao,
        categoria: registroAtualizado.categoria,
        valor: Number(registroAtualizado.valor),
        data: registroAtualizado.data,
        fazenda_id: registroAtualizado.fazenda_id
      }

      setDespesas(
        despesas.map((despesa) =>
          despesa.id === editandoId
            ? despesaFormatada
            : despesa
        )
      )

      cancelarEdicao()
      setSalvando(false)
      return
    }

    const { data: registroSalvo, error } = await supabase
      .from('despesas')
      .insert([dadosDespesa])
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar despesa:', error)
      alert('Erro ao salvar a despesa.')
      setSalvando(false)
      return
    }

    const despesaFormatada = {
      id: registroSalvo.id,
      descricao: registroSalvo.descricao,
      categoria: registroSalvo.categoria,
      valor: Number(registroSalvo.valor),
      data: registroSalvo.data,
      fazenda_id: registroSalvo.fazenda_id
    }

    setDespesas([
      despesaFormatada,
      ...despesas
    ])

    limparFormulario()
    setSalvando(false)
  }

  function editarDespesa(despesa) {
    setEditandoId(despesa.id)

    setDescricao(despesa.descricao)
    setCategoria(despesa.categoria)
    setValor(despesa.valor)
    setData(despesa.data)

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
    setDescricao('')
    setCategoria('')
    setValor('')
    setData('')
  }

  async function excluirDespesa(despesa) {
    const confirmar = window.confirm(
      `Deseja realmente excluir a despesa "${despesa.descricao}"?`
    )

    if (!confirmar) {
      return
    }

    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', despesa.id)
      .eq('fazenda_id', fazendaId)

    if (error) {
      console.error('Erro ao excluir despesa:', error)
      alert('Erro ao excluir a despesa.')
      return
    }

    setDespesas(
      despesas.filter(
        (item) => item.id !== despesa.id
      )
    )

    if (editandoId === despesa.id) {
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

  const despesasDoMes = despesas.filter((despesa) =>
    pertenceAoPeriodo(despesa.data)
  )

  const totalDespesas = despesasDoMes.reduce(
    (total, despesa) =>
      total + Number(despesa.valor || 0),
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
      <h1>Despesas</h1>

      <p className="pagina-subtitulo">
        Despesas de {nomesMeses[mesSelecionado]} de{' '}
        {anoSelecionado}
      </p>

      <div className="cards-container">

        <div className="card-resumo">
          <p>Despesas do mês</p>

          <h3>
            R$ {totalDespesas.toFixed(2)}
          </h3>
        </div>

        <div className="card-resumo">
          <p>Lançamentos</p>

          <h3>
            {despesasDoMes.length}
          </h3>
        </div>

      </div>

      <div className="painel">
        <h2>
          {editandoId
            ? 'Editar despesa'
            : 'Nova despesa'}
        </h2>

        <form
          className="formulario"
          onSubmit={cadastrarDespesa}
        >
          <label>Descrição</label>

          <input
            type="text"
            value={descricao}
            onChange={(event) =>
              setDescricao(event.target.value)
            }
            placeholder="Ex: Energia"
            required
          />

          <label>Categoria</label>

          <input
            type="text"
            value={categoria}
            onChange={(event) =>
              setCategoria(event.target.value)
            }
            placeholder="Ex: Custos fixos"
            required
          />

          <label>Valor</label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={valor}
            onChange={(event) =>
              setValor(event.target.value)
            }
            placeholder="Ex: 450"
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
                : 'Registrar despesa'}
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
        <h2>Despesas do mês</h2>

        {despesasDoMes.length === 0 ? (
          <p>
            Nenhuma despesa registrada neste período.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {despesasDoMes.map((despesa) => (
                <tr key={despesa.id}>
                  <td>
                    {despesa.descricao}
                  </td>

                  <td>
                    {despesa.categoria}
                  </td>

                  <td>
                    R$ {Number(
                      despesa.valor
                    ).toFixed(2)}
                  </td>

                  <td>
                    {despesa.data}
                  </td>

                  <td>
                    <div className="acoes-tabela">

                      <button
                        type="button"
                        className="botao-editar"
                        onClick={() =>
                          editarDespesa(despesa)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="botao-excluir"
                        onClick={() =>
                          excluirDespesa(despesa)
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

export default Despesas