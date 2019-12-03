const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const doutores = await db.query(escape`
    SELECT SUM(doutorados) as sum
    FROM populacao
  `)

  if ('error' in doutores)
    return res.status(500).end(doutores.error.message);

  const brancos_doutores = await db.query(escape`
    SELECT SUM(brancos_doutores) as sum
    FROM populacao
  `)

  if ('error' in brancos_doutores)
    return res.status(500).end(brancos_doutores.error.message);

  var total = {"Total de doutores de outras cores no Brasil": Math.round(doutores[0].sum - brancos_doutores[0].sum),
               "Total de brancos com doutorado no Brasil": Math.round(brancos_doutores[0].sum)}
  res.status(200).json(total)
}