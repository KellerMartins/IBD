const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const alfabetizacao = await db.query(escape`
    SELECT SUM(alfabetizados) as alfabetizados, SUM(analfabetos) as analfabetos
    FROM populacao
  `)

  if ('error' in alfabetizacao)
    return res.status(500).end(alfabetizacao.error.message);

  var total = {"Nº de pessoas alfabetizadas": Math.round(alfabetizacao[0].alfabetizados),
               "Nº de pessoas analfabetas": Math.round(alfabetizacao[0].analfabetos)}
  res.status(200).json(total)
}