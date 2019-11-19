const db = require('../../../lib/db')
const escape = require('sql-template-strings')

// Exemplo de api
// acessada como /api/profiles?page=NUMPAGINA&limit=NUMPORPAGINA
// Aqui, page e limit são opcionais
// Nesse exemplo, query.page e query.limit vem da query string '?page=...&limit=...'
// A resposta dada aqui é um json da lista retornada pelo banco e as informacoes da pagina acessada

module.exports = async (req, res) => {
  let page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 9
  if (page < 1) page = 1
  const profiles = await db.query(escape`
      SELECT *
      FROM profiles
      ORDER BY id
      LIMIT ${(page - 1) * limit}, ${limit}
    `)
  const count = await db.query(escape`
      SELECT COUNT(*)
      AS profilesCount
      FROM profiles
    `)

  const profilesCount  = count[0].profilesCount
  const pageCount = Math.ceil(profilesCount / limit)
  res.status(200).json({ profiles, pageCount, page})
}