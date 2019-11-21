const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  let minmax = decodeURIComponent(req.query.coordenadas).split(';')
  let [min, max] = minmax.map(s => s.split(',')).map(a => {return {lat:Number(a[0]), lon:Number(a[1])}})

  const [total_hab] = await db.query(escape`
    SELECT SUM(num_habitantes_municipio) as sum
    FROM municipio
  `)

  const [hab_regiao] = await db.query(escape`
    SELECT SUM(num_habitantes_municipio) as sum
    FROM municipio NATURAL JOIN coord
    WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
          longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
  `)

  var total = {"Outras regiões": (total_hab.sum - hab_regiao.sum), "Habitantes na região": hab_regiao.sum}
  res.status(200).json({ total })
}