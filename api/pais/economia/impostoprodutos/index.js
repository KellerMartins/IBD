const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const imposto_anos = await db.query(escape`
    SELECT ano as x, SUM(impostos_produtos) as y
    FROM economia
    GROUP BY ano
  `)

  if ('error' in imposto_anos)
    return res.status(500).end(imposto_anos.error.message);

  var result = {"Imposto sob produtos: Arrecadação total": imposto_anos}
  res.status(200).json(result)
}