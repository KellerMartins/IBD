const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const pib_anos = await db.query(escape`
    SELECT ano as x, SUM(pib) as y
    FROM economia
    GROUP BY ano
  `)

  var result = {"PIB do país": pib_anos}
  res.status(200).json(result)
}