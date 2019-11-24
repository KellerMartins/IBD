const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const pais_pib_anos = await db.query(escape`
    SELECT ano as x, AVG(pib) as y
    FROM economia
    GROUP BY ano
  `)

  if ('error' in pais_pib_anos)
    return res.status(500).end(pais_pib_anos.error.message);

  const uf_pib_anos = await db.query(escape`
    SELECT ano as x, AVG(pib) as y
    FROM economia NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
    GROUP BY ano
  `)

  if ('error' in uf_pib_anos)
    return res.status(500).end(uf_pib_anos.error.message);

  var total = {}
  total["PIB: Média por município, Brasil"] = pais_pib_anos
  total["PIB: Média por município, "+req.query.sigla.toUpperCase()] = uf_pib_anos
  res.status(200).json(total)
}