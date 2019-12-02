const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

// Exemplo de api
// Acessada como api/profiles/NOME/ENDERECO
// Nesse exemplo, query.name e query.address vem do nome do arquivo e pasta [name] e [address]
// que fazem com que se possa formatar a query entre barras em vez de usar a query string
// A resposta dada aqui é um json com o profile encontrado ou um json vazio caso não exista

module.exports = async (req, res) => {
  // [profile] é um açucar sintático para pegar o primeiro elemento da lista retornada e atribuir a var profile
  const [profile] = await db.query(escape`
    SELECT *
    FROM profiles
    WHERE name = ${req.query.name} and address=${req.query.address}
  `)
  res.status(200).json({ profile })
}