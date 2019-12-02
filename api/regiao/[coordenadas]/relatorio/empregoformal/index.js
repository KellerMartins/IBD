const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const total_empregados = await db.query(escape`
      SELECT SUM(empregados) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN  coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in total_empregados)
      return res.status(500).end(total_empregados.error.message);

    const empregados_formais = await db.query(escape`
      SELECT SUM(empregos_formais) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN  coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in empregados_formais)
      return res.status(500).end(empregados_formais.error.message);

    var total = {"Informal ou n.r.": Math.round(total_empregados[0].sum - empregados_formais[0].sum), 
                 "c/emprego formal": Math.round(empregados_formais[0].sum)}
    res.status(200).json(total)
  }
}