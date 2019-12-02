const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const regiao_pib_secterc = await db.query(escape`
      SELECT AVG(pib) as avg
      FROM municipio NATURAL JOIN coord NATURAL JOIN economia NATURAL JOIN municipio_atividade NATURAL JOIN atividade
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND
            ano = 2016 AND 
            setor_atividade != "primário" AND
            pos_atividade = 1
    `)

    if ('error' in regiao_pib_secterc)
      return res.status(500).end(regiao_pib_secterc.error.message);

    const regiao_pib_primario = await db.query(escape`
      SELECT AVG(pib) as avg
      FROM municipio NATURAL JOIN coord NATURAL JOIN economia NATURAL JOIN municipio_atividade NATURAL JOIN atividade
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND
            ano = 2016 AND 
            setor_atividade = "primário" AND
            pos_atividade = 1
    `)

    if ('error' in regiao_pib_primario)
      return res.status(500).end(regiao_pib_primario.error.message);
    
    var result = {"PIB 2016: Média por município cujo setor 1º é o mais relevante": Math.round(regiao_pib_primario[0].avg),
                  "PIB 2016: Média por município cujos setores 2º e 3º são os mais relevantes": Math.round(regiao_pib_secterc[0].avg)}
    res.status(200).json(result)
  }
}