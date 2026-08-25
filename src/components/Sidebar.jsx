function Sidebar({ mudarPagina }) {
  return (
    <aside className="sidebar">
      <h2>RuralControl</h2>

      <nav>
        <button>Dashboard</button>
        <button onClick={() => mudarPagina('producao')}>Produção</button>
        <button>Vendas</button>
        <button>Despesas</button>
        <button>Estoque</button>
        <button>Financeiro</button>
        <button>Relatórios</button>
      </nav>
    </aside>
  )
}

export default Sidebar