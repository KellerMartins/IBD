const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const pais_imposto_anos = await db.query(escape`
    SELECT ano as x, AVG(impostos_produtos) as y
    FROM economia
    GROUP BY ano
  `)

  if ('error' in pais_imposto_anos)
    return res.status(500).end(pais_imposto_anos.error.message);

  const uf_imposto_anos = await db.query(escape`
    SELECT ano as x, AVG(impostos_produtos) as y
    FROM economia NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
    GROUP BY ano
  `)

  if ('error' in uf_imposto_anos)
    return res.status(500).end(uf_imposto_anos.error.message);

  var total = {}
  total["Imposto sob produtos: Arrecadação média por município, Brasil"] = pais_imposto_anos
  total["Imposto sob produtos: Arrecadação média por município, "+req.query.sigla.toUpperCase()] = uf_imposto_anos
  res.status(200).json(total)
}