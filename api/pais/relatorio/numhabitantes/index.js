const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const total_hab = await db.query(escape`
    SELECT SUM(num_habitantes_municipio) as sum
    FROM municipio
  `)

  if ('error' in total_hab)
    return res.status(500).end(total_hab.error.message);

  var total = {"Total de habitantes": total_hab[0].sum}
  res.status(200).json(total)
}