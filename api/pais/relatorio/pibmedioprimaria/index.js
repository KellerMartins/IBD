const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const pib_secterc = await db.query(escape`
    SELECT AVG(pib) as avg
    FROM municipio NATURAL JOIN economia NATURAL JOIN municipio_atividade NATURAL JOIN atividade
    WHERE ano = 2016 AND 
          setor_atividade != "primário" AND
          pos_atividade = 1   
  `)

  if ('error' in pib_secterc)
    return res.status(500).end(pib_secterc.error.message);

  const pib_medio_primario = await db.query(escape`
    SELECT AVG(pib) as avg
    FROM municipio NATURAL JOIN economia NATURAL JOIN municipio_atividade NATURAL JOIN atividade
    WHERE ano = 2016 AND 
          setor_atividade = "primário" AND
          pos_atividade = 1   
  `)

  if ('error' in pib_medio_primario)
    return res.status(500).end(pib_medio_primario.error.message);

  var result = {"PIB 2016: Média por município cujo setor 1º é o mais relevante": Math.round(pib_medio_primario[0].avg),
                "PIB 2016: Média por município cujos setores 2º e 3º são os mais relevantes": Math.round(pib_secterc[0].avg)}
  res.status(200).json(result)
}