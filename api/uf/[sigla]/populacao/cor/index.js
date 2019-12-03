const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const cores = await db.query(escape`
    SELECT SUM(brancos) as brancos, 
           SUM(pretos) as pretos, 
           SUM(amarelos) as amarelos, 
           SUM(pardos) as pardos, 
           SUM(indigenas) as indigenas
    FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  if ('error' in cores)
    return res.status(500).end(cores.error.message);

  var total = {}
  for (let [k, v] of Object.entries(cores[0]))
    total["Total de "+k] = Math.round(v)
  res.status(200).json(total)
}