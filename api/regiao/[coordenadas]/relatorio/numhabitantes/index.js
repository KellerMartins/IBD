const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const total_hab = await db.query(escape`
      SELECT SUM(num_habitantes_municipio) as sum
      FROM municipio
    `)

    if ('error' in total_hab)
      return res.status(500).end(total_hab.error.message);

    const hab_regiao = await db.query(escape`
      SELECT SUM(num_habitantes_municipio) as sum
      FROM municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in hab_regiao)
      return res.status(500).end(hab_regiao.error.message);

    var total = {"Outras regiões": Math.round(total_hab[0].sum - hab_regiao[0].sum), "Habitantes na região": Math.round(hab_regiao[0].sum)}
    res.status(200).json(total)
  }
}