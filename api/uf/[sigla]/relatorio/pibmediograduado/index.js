const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const uf_pib_medio = await db.query(escape`
    SELECT ano as x, AVG(pib) as y
    FROM economia NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
    GROUP BY ano
  `)

  if ('error' in uf_pib_medio)
    return res.status(500).end(uf_pib_medio.error.message);

  const uf_pib_grad = await db.query(escape`
    SELECT ano as x, AVG(pib) as y
    FROM municipio NATURAL JOIN uf NATURAL JOIN economia NATURAL JOIN populacao
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()} AND
          cod_municipio IN
            (SELECT cod_municipio 
            FROM populacao 
            WHERE graduados > (SELECT AVG(graduados)
                                FROM populacao))
    GROUP BY ano   
  `)

  if ('error' in uf_pib_grad)
    return res.status(500).end(uf_pib_grad.error.message);

  var total = {}
  total["PIB: Média por município, "+req.query.sigla.toUpperCase()] = uf_pib_medio
  total["PIB: média dos municípios de "+req.query.sigla.toUpperCase()+" que possuem número de pessoas graduadas acima da média"] = uf_pib_grad
  res.status(200).json(total)
}