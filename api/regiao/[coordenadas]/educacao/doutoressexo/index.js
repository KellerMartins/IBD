const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const homens_doutores = await db.query(escape`
      SELECT SUM(homens_doutores) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in homens_doutores)
      return res.status(500).end(homens_doutores.error.message);

    const mulheres_doutoras = await db.query(escape`
      SELECT SUM(mulheres_doutoras) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in mulheres_doutoras)
      return res.status(500).end(mulheres_doutoras.error.message);

    var total = {"Homens com doutorado na região": Math.round(homens_doutores[0].sum), 
                 "Mulheres com doutorado na região": Math.round(mulheres_doutoras[0].sum)}
    res.status(200).json(total)
  }
}