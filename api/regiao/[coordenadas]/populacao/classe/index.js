const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')
const utils = require('../../../../../lib/utils.js')

module.exports = async (req, res) => {
  let coords = utils.parseCoords(req.query.coordenadas)
  if(coords == null) 
    res.status(400).end("Parametro 'coordenadas' mal formatado");
  
  else {
    let [min, max] = coords;
    const classe = await db.query(escape`
      SELECT SUM("num_classe_A") as A20_inf, 
             SUM("num_classe_B") as B10_20, 
             SUM("num_classe_C") as C4_10, 
             SUM("num_classe_D") as D2_4, 
             SUM("num_classe_E") as E0_2
      FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
      WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
            longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
    `)

    if ('error' in classe)
      return res.status(500).end(classe.error.message);

    var total = {}
    for (let [k, v] of Object.entries(classe[0])) {
      let numwages = k.substr(1).split('_')
      total["Classe "+k[0]+" ("+numwages[0]+"-"+numwages[1]+" salários mínimos)"] = Math.round(v)
    }
    res.status(200).json(total)
  }
}