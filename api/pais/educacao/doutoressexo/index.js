const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const total_doutoras = await db.query(escape`
    SELECT SUM(mulheres_doutoras) as sum
    FROM populacao
  `)

  if ('error' in total_doutoras)
    return res.status(500).end(total_doutoras.error.message);

  const total_doutores = await db.query(escape`
    SELECT SUM(homens_doutores) as sum
    FROM populacao
  `)

  if ('error' in total_doutores)
    return res.status(500).end(total_doutores.error.message);

  var total = {"Total de mulheres com doutorado no Brasil": Math.round(total_doutoras[0].sum),
               "Total de homens com doutorado no Brasil": Math.round(total_doutores[0].sum)}
  res.status(200).json(total)
}