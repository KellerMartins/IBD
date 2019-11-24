const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const total_hab = await db.query(escape`
    SELECT SUM(num_habitantes_municipio) as sum
    FROM municipio
  `)

  if ('error' in total_hab)
    return res.status(500).end(total_hab.error.message);

  const hab_uf = await db.query(escape`
    SELECT SUM(num_habitantes_municipio) as sum
    FROM municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  if ('error' in hab_uf)
    return res.status(500).end(hab_uf.error.message);

  var total = {"Outras UFs": (total_hab[0].sum - hab_uf[0].sum), "Habitantes na UF": hab_uf[0].sum}
  res.status(200).json(total)
}