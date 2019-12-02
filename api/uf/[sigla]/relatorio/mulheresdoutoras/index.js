const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const total_doutoras = await db.query(escape`
      SELECT SUM(mulheres_doutoras) as sum
      FROM populacao
    `)

  if ('error' in total_doutoras)
    return res.status(500).end(total_doutoras.error.message);

  const doutoras_uf = await db.query(escape`
    SELECT SUM(mulheres_doutoras) as sum
    FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  if ('error' in doutoras_uf)
    return res.status(500).end(doutoras_uf.error.message);

  var total = {}
  total["Doutoras em outras UFs"] = Math.floor(total_doutoras[0].sum - doutoras_uf[0].sum)
  total["Doutoras em "+req.query.sigla.toUpperCase()] = Math.ceil(doutoras_uf[0].sum)
  res.status(200).json(total)
}