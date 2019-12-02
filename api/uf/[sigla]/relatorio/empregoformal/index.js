const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  let sigla_uf = req.query.sigla.toUpperCase()
  const total_empregados_uf = await db.query(escape`
      SELECT SUM(empregados) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${sigla_uf}
    `)

  if ('error' in total_empregados_uf)
    return res.status(500).end(total_empregados_uf.error.message);

  const formal_uf = await db.query(escape`
    SELECT SUM(empregos_formais) as sum
    FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${sigla_uf}
  `)

  if ('error' in formal_uf)
    return res.status(500).end(formal_uf.error.message);

  var total = {}
  total["Pessoas com empregos informais ou não responderam em "+sigla_uf] = Math.floor(total_empregados_uf[0].sum - formal_uf[0].sum)
  total["Pessoas com empregos formais em "+sigla_uf] = Math.round(formal_uf[0].sum)
  res.status(200).json(total)
}