const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const [total_hab] = await db.query(escape`
    SELECT SUM(num_habitantes_municipio) as sum
    FROM municipio
  `)

  var total = {"Total de habitantes": total_hab.sum}
  res.status(200).json(total)
}