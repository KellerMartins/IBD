const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const formais_por_uf = await db.query(escape`
    SELECT sigla_uf, SUM(empregos_formais) as sum
    FROM municipio NATURAL JOIN uf NATURAL JOIN populacao
    GROUP BY sigla_uf
  `)

  if ('error' in formais_por_uf)
    return res.status(500).end(formais_por_uf.error.message);

  var total = {}
  for (let i = 0; i < formais_por_uf.length; i++)
    total[formais_por_uf[i].sigla_uf] = Math.round(formais_por_uf[i].sum)
  res.status(200).json(total)
}