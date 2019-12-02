const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const sem_agua_canalizada = await db.query(escape`
    SELECT count(*)/(SELECT count(*) from domicilios) as percen
    FROM domicilios WHERE sem_agua_canalizada/(com_agua_canalizada+sem_agua_canalizada) < 0.05
  `)

  if ('error' in sem_agua_canalizada)
    return res.status(500).end(sem_agua_canalizada.error.message);

  var total = {"Municípios com mais de 5% dos domicílios sem água canalizada (%)": (1-sem_agua_canalizada[0].percen)*100,
               "Municípios com menos de 5% dos domicílios sem água canalizada (%)": (sem_agua_canalizada[0].percen)*100}
  res.status(200).json(total)
}