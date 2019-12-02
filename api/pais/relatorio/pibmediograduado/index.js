const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const pib_medio = await db.query(escape`
    SELECT ano as x, AVG(pib) as y
    FROM economia
    GROUP BY ano
  `)

  if ('error' in pib_medio)
    return res.status(500).end(pib_medio.error.message);

  const pib_medio_grad = await db.query(escape`
    SELECT ano as x, AVG(pib) as y
    FROM municipio NATURAL JOIN economia NATURAL JOIN populacao
    WHERE cod_municipio IN
      (SELECT cod_municipio 
       FROM populacao 
       WHERE graduados > (SELECT AVG(graduados)
                          FROM populacao))
    GROUP BY ano        
  `)

  if ('error' in pib_medio_grad)
    return res.status(500).end(pib_medio_grad.error.message);

  var result = {"PIB: Média por município": pib_medio,
                "PIB: Média dos municípios que possuem número de pessoas graduadas acima da média": pib_medio_grad}
  res.status(200).json(result)
}