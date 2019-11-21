const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  
  const ufs = await db.query(escape`
      SELECT AVG(longitude_coord) as longitude, 
             AVG(latitude_coord) as latitude, 
             AVG(altitude_coord) as altitude, 
             AVG(tamanho_coord) as tamanho,
             cod_uf as cod
      FROM municipio NATURAL JOIN coord
      GROUP BY cod_uf
      ORDER BY cod_uf
    `)

  res.status(200).json({ ufs })
}