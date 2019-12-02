const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const pais_pib_anos = await db.query(escape`
      SELECT ano as x, AVG(pib) as y
      FROM economia
      GROUP BY ano
    `)

    if ('error' in pais_pib_anos)
      return res.status(500).end(pais_pib_anos.error.message);

    const regiao_pib_anos = await db.query(escape`
      SELECT ano as x, AVG(pib) as y
      FROM economia NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      GROUP BY ano
    `)

    if ('error' in regiao_pib_anos)
      return res.status(500).end(regiao_pib_anos.error.message);
    
    var total = {}
    total["PIB: Média por município, Brasil"] = pais_pib_anos
    total["PIB: Média por município, região"] = regiao_pib_anos
    res.status(200).json(total)
  }
}