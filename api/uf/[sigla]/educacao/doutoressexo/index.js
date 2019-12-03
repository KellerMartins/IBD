const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const doutores_uf = await db.query(escape`
      SELECT SUM(homens_doutores) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
    `)

  if ('error' in doutores_uf)
    return res.status(500).end(doutores_uf.error.message);

  const doutoras_uf = await db.query(escape`
    SELECT SUM(mulheres_doutoras) as sum
    FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  if ('error' in doutoras_uf)
    return res.status(500).end(doutoras_uf.error.message);

  var total = {}
  total["Homens com doutorado em "+req.query.sigla.toUpperCase()] = Math.round(doutores_uf[0].sum)
  total["Mulheres com doutorado em "+req.query.sigla.toUpperCase()] = Math.round(doutoras_uf[0].sum)
  res.status(200).json(total)
}