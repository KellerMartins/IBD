const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  
  const coords = await db.query(escape`
      SELECT longitude_coord, latitude_coord, altitude_coord, tamanho_coord
      FROM municipio NATURAL JOIN coord
    `)

  var municipios = coords.map((o) => [o.longitude_coord, o.latitude_coord, o.altitude_coord, o.tamanho_coord])
  res.status(200).json({ municipios })
}