const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const [total_hab] = await db.query(escape`
    SELECT SUM(num_habitantes_municipio) as sum
    FROM municipio
  `)

  const [hab_uf] = await db.query(escape`
    SELECT SUM(num_habitantes_municipio) as sum
    FROM municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  var total = {"Outras UFs": (total_hab.sum - hab_uf.sum), "Habitantes na UF": hab_uf.sum}
  res.status(200).json({ total })
}