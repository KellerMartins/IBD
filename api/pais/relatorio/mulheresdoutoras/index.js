const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const total_doutoras = await db.query(escape`
    SELECT SUM(mulheres_doutoras) as sum
    FROM populacao
  `)

  if ('error' in total_doutoras)
    return res.status(500).end(total_doutoras.error.message);

  var total = {"Total de doutoras no Brasil": Math.round(total_doutoras[0].sum)}
  res.status(200).json(total)
}