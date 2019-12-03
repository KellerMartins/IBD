const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const estado_civil = await db.query(escape`
    SELECT SUM(casados) as casados, 
           SUM(separados) as separados, 
           SUM(divorciados) as divorciados, 
           SUM(viuvos) as viuvos, 
           SUM(solteiros) as solteiros
    FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  if ('error' in estado_civil)
    return res.status(500).end(estado_civil.error.message);

  var total = {}
  for (let [k, v] of Object.entries(estado_civil[0]))
    total["Total de "+k] = Math.round(v)
  res.status(200).json(total)
}