const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const cores = await db.query(escape`
      SELECT SUM(brancos) as brancos, 
             SUM(pretos) as pretos, 
             SUM(amarelos) as amarelos, 
             SUM(pardos) as pardos, 
             SUM(indigenas) as indigenas
      FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in cores)
      return res.status(500).end(cores.error.message);

    var total = {}
    for (let [k, v] of Object.entries(cores[0]))
      total[k+" na região"] = Math.round(v)
    res.status(200).json(total)
  }
}