const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const [profile] = await db.query(escape`
    SELECT *
    FROM profiles
    WHERE name = ${req.query.name} and address=${req.query.address}
  `)
  res.status(200).json({ profile })
}