const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const doutores_uf = await db.query(escape`
      SELECT SUM(doutorados) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
    `)

  if ('error' in doutores_uf)
    return res.status(500).end(doutores_uf.error.message);

  const brancos_uf = await db.query(escape`
    SELECT SUM(brancos_doutores) as sum
    FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  if ('error' in brancos_uf)
    return res.status(500).end(brancos_uf.error.message);

  var total = {}
  total["Doutores de outras cores em "+req.query.sigla.toUpperCase()] = Math.round(doutores_uf[0].sum - brancos_uf[0].sum)
  total["Brancos com doutorado em "+req.query.sigla.toUpperCase()] = Math.round(brancos_uf[0].sum)
  res.status(200).json(total)
}