const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const classe = await db.query(escape`
      SELECT SUM(num_classe_A) as A, 
             SUM(num_classe_B) as B, 
             SUM(num_classe_C) as C, 
             SUM(num_classe_D) as D, 
             SUM(num_classe_E) as E
      FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in classe)
      return res.status(500).end(classe.error.message);

    var total = {}
    for (let [k, v] of Object.entries(classe[0]))
      total["Pessoas da classe "+k+" na região"] = Math.round(v)
    res.status(200).json(total)
  }
}