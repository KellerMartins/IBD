const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const total_municipios = await db.query(escape`
    SELECT count(*) as count
    FROM municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()}
  `)

  if ('error' in total_municipios)
    return res.status(500).end(total_municipios.error.message);

  const sem_agua_canalizada = await db.query(escape`
    SELECT count(*) as count
    FROM domicilios NATURAL JOIN municipio NATURAL JOIN uf
    WHERE sigla_uf = ${req.query.sigla.toUpperCase()} AND
          sem_agua_canalizada/(com_agua_canalizada+sem_agua_canalizada) < 0.05
  `)

  if ('error' in sem_agua_canalizada)
    return res.status(500).end(sem_agua_canalizada.error.message);

  let percen = sem_agua_canalizada[0].count/total_municipios[0].count
  var total = {"Municípios com mais de 5% dos domicílios sem água canalizada (%)": (1-percen)*100,
               "Municípios com menos de 5% dos domicílios sem água canalizada (%)": (percen)*100}
  res.status(200).json(total)
}