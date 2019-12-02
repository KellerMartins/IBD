const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const media_pecuaria = await db.query(escape`
    SELECT AVG(num_habitantes_municipio) as avg
    FROM municipio m JOIN domicilios d ON m.cod_municipio = d.cod_municipio
        JOIN municipio_atividade ma on ma.cod_municipio = m.cod_municipio
        JOIN atividade a on a.id_atividade = ma.id_atividade
    WHERE rural > urbano AND a.nome_atividade like '%pecuária%'
  `)

  if ('error' in media_pecuaria)
    return res.status(500).end(media_pecuaria.error.message);

  var total = {"Média da população dos municípios rurais cuja atividade principal é pecuária":  Math.round(media_pecuaria[0].avg) }
  res.status(200).json(total)
}