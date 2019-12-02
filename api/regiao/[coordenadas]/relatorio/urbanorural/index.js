const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;

    const urbano_rural = await db.query(escape`
      SELECT SUM(urbano) as urbano, SUM(rural) as rural
      FROM domicilios NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in urbano_rural)
      return res.status(500).end(urbano_rural.error.message);

    var total = {"Nº de domicílios urbanos": urbano_rural[0].urbano,
                 "Nº de domicílios rurais": urbano_rural[0].rural}
    res.status(200).json(total)
  }
}