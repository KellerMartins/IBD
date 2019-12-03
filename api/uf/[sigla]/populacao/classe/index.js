const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const classe = await db.query(escape`
    SELECT SUM(num_classe_A) as A, 
           SUM(num_classe_B) as B, 
           SUM(num_classe_C) as C, 
           SUM(num_classe_D) as D, 
           SUM(num_classe_E) as E
    FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  if ('error' in classe)
    return res.status(500).end(classe.error.message);

  var total = {}
  for (let [k, v] of Object.entries(classe[0]))
    total["Pessoas na classe "+k] = Math.round(v)
  res.status(200).json(total)
}