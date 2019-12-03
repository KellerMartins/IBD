const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const estado_civil = await db.query(escape`
      SELECT SUM(casados) as casados, 
             SUM(separados) as separados, 
             SUM(divorciados) as divorciados, 
             SUM(viuvos) as viuvos, 
             SUM(solteiros) as solteiros
      FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in estado_civil)
      return res.status(500).end(estado_civil.error.message);

    var total = {}
    for (let [k, v] of Object.entries(estado_civil[0]))
      total[k+" na região"] = Math.round(v)
    res.status(200).json(total)
  }
}