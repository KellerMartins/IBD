const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const media_outros = await db.query(escape`
      SELECT AVG(num_habitantes_municipio) avg
      FROM municipio m JOIN coord c ON m.id_coord = c.id_coord
          JOIN domicilios d ON m.cod_municipio = d.cod_municipio
          JOIN municipio_atividade ma on ma.cod_municipio = m.cod_municipio
          JOIN atividade a on a.id_atividade = ma.id_atividade
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND 
            rural > urbano AND a.nome_atividade NOT LIKE '%pecuária%'
    `)

    if ('error' in media_outros)
      return res.status(500).end(media_outros.error.message);

    const media_pecuaria = await db.query(escape`
      SELECT AVG(num_habitantes_municipio) avg
      FROM municipio m JOIN coord c ON m.id_coord = c.id_coord
          JOIN domicilios d ON m.cod_municipio = d.cod_municipio
          JOIN municipio_atividade ma on ma.cod_municipio = m.cod_municipio
          JOIN atividade a on a.id_atividade = ma.id_atividade
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND 
            rural > urbano AND a.nome_atividade NOT LIKE '%pecuária%'
    `)

    if ('error' in media_pecuaria)
      return res.status(500).end(media_pecuaria.error.message);

    var total = { "Média da população dos municípios rurais cuja atividade principal é pecuária": media_pecuaria[0].avg? Math.round(media_pecuaria[0].avg) : 0,
                  "Média da população dos municípios rurais com outras atividades principais": media_outros[0].avg? Math.round(media_outros[0].avg) : 0 }
    res.status(200).json(total)
  }
}