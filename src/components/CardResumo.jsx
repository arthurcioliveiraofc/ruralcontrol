function CardResumo({ titulo, valor }) {
  return (
    <div className="card-resumo">
      <p>{titulo}</p>
      <h3>{valor}</h3>
    </div>
  )
}

export default CardResumo