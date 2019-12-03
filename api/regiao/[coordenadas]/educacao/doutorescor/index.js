const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const doutores = await db.query(escape`
      SELECT SUM(doutorados) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in doutores)
      return res.status(500).end(doutores.error.message);

    const brancos_doutores = await db.query(escape`
      SELECT SUM(brancos_doutores) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in brancos_doutores)
      return res.status(500).end(brancos_doutores.error.message);

    var total = {"Doutores de outras cores na região": Math.round(doutores[0].sum - brancos_doutores[0].sum), 
                 "Brancos com doutorado na região": Math.round(brancos_doutores[0].sum)}
    res.status(200).json(total)
  }
}