const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const pais_imposto_anos = await db.query(escape`
      SELECT ano as x, AVG(impostos_produtos) as y
      FROM economia
      GROUP BY ano
    `)

    if ('error' in pais_imposto_anos)
      return res.status(500).end(pais_imposto_anos.error.message);

    const regiao_imposto_anos = await db.query(escape`
      SELECT ano as x, AVG(impostos_produtos) as y
      FROM economia NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      GROUP BY ano
    `)

    if ('error' in regiao_imposto_anos)
      return res.status(500).end(regiao_imposto_anos.error.message);
    
    var total = {}
    total["Imposto sob produtos: Arrecadação média por município, Brasil"] = pais_imposto_anos
    total["Imposto sob produtos: Arrecadação média por município, região"] = regiao_imposto_anos
    res.status(200).json(total)
  }
}