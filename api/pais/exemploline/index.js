const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const pib_anos = await db.query(escape`
    SELECT ano as x, SUM(pib) as y
    FROM economia
    GROUP BY ano
  `)

  if ('error' in pib_anos)
    return res.status(500).end(pib_anos.error.message);

  var result = {"PIB do país": pib_anos}
  res.status(200).json(result)
}