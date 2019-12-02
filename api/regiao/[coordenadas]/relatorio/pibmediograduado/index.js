const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const regiao_pib_medio = await db.query(escape`
      SELECT ano as x, AVG(pib) as y
      FROM economia NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      GROUP BY ano
    `)

    if ('error' in regiao_pib_medio)
      return res.status(500).end(regiao_pib_medio.error.message);

    const regiao_pib_grad = await db.query(escape`
      SELECT ano as x, AVG(pib) as y
      FROM municipio NATURAL JOIN coord NATURAL JOIN economia NATURAL JOIN populacao
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND
            cod_municipio IN
              (SELECT cod_municipio 
               FROM populacao 
               WHERE graduados > (SELECT AVG(graduados)
                                  FROM populacao))
      GROUP BY ano    
    `)

    if ('error' in regiao_pib_grad)
      return res.status(500).end(regiao_pib_grad.error.message);
    
    var total = {}
    total["PIB: Média por município, região"] = regiao_pib_medio
    total["PIB: média dos municípios da região que possuem número de pessoas graduadas acima da média"] = regiao_pib_grad
    res.status(200).json(total)
  }
}