const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const media_pecuaria = await db.query(escape`
      SELECT AVG(num_habitantes_municipio) as avg
      FROM municipio m JOIN domicilios d ON m.cod_municipio = d.cod_municipio
          JOIN municipio_atividade ma on ma.cod_municipio = m.cod_municipio
          JOIN atividade a on a.id_atividade = ma.id_atividade
      WHERE rural > urbano AND a.nome_atividade like '%pecuária%'
    `);

    if ("error" in media_pecuaria) return res.status(500).end(media_pecuaria.error.message);

    var total = {
      "Média da população dos municípios rurais cuja atividade principal é pecuária": Math.round(media_pecuaria[0].avg),
    };
    res.status(200).json(total);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;
      const media_outros = await db.query(escape`
        SELECT AVG(num_habitantes_municipio) avg
        FROM municipio m JOIN coord c ON m.id_coord = c.id_coord
            JOIN domicilios d ON m.cod_municipio = d.cod_municipio
            JOIN municipio_atividade ma on ma.cod_municipio = m.cod_municipio
            JOIN atividade a on a.id_atividade = ma.id_atividade
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND 
              rural > urbano AND a.nome_atividade NOT LIKE '%pecuária%'
      `);

      if ("error" in media_outros) return res.status(500).end(media_outros.error.message);

      const media_pecuaria = await db.query(escape`
        SELECT AVG(num_habitantes_municipio) avg
        FROM municipio m JOIN coord c ON m.id_coord = c.id_coord
            JOIN domicilios d ON m.cod_municipio = d.cod_municipio
            JOIN municipio_atividade ma on ma.cod_municipio = m.cod_municipio
            JOIN atividade a on a.id_atividade = ma.id_atividade
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND 
              rural > urbano AND a.nome_atividade NOT LIKE '%pecuária%'
      `);

      if ("error" in media_pecuaria) return res.status(500).end(media_pecuaria.error.message);

      var total = {
        "Média da população dos municípios rurais cuja atividade principal é pecuária": media_pecuaria[0].avg
          ? Math.round(media_pecuaria[0].avg)
          : 0,
        "Média da população dos municípios rurais com outras atividades principais": media_outros[0].avg
          ? Math.round(media_outros[0].avg)
          : 0,
      };
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    const media_outros = await db.query(escape`
      SELECT AVG(num_habitantes_municipio) avg
      FROM municipio m JOIN uf u ON m.cod_uf = u.cod_uf  
          JOIN domicilios d ON m.cod_municipio = d.cod_municipio
          JOIN municipio_atividade ma on ma.cod_municipio = m.cod_municipio
          JOIN atividade a on a.id_atividade = ma.id_atividade
      WHERE sigla_uf = ${req.query.uf.toUpperCase()} AND 
            rural > urbano AND a.nome_atividade NOT LIKE '%pecuária%'
    `);

    if ("error" in media_outros) return res.status(500).end(media_outros.error.message);

    const media_pecuaria = await db.query(escape`
      SELECT AVG(num_habitantes_municipio) avg
      FROM municipio m JOIN uf u ON m.cod_uf = u.cod_uf  
          JOIN domicilios d ON m.cod_municipio = d.cod_municipio
          JOIN municipio_atividade ma on ma.cod_municipio = m.cod_municipio
          JOIN atividade a on a.id_atividade = ma.id_atividade
      WHERE sigla_uf = ${req.query.uf.toUpperCase()} AND 
            rural > urbano AND a.nome_atividade like '%pecuária%'
    `);

    if ("error" in media_pecuaria) return res.status(500).end(media_pecuaria.error.message);

    var total = {};
    total["Média da população dos municípios rurais cuja atividade principal é pecuária"] = media_pecuaria[0].avg
      ? Math.round(media_pecuaria[0].avg)
      : 0;
    total["Média da população dos municípios rurais com outras atividades principais"] = media_outros[0].avg
      ? Math.round(media_outros[0].avg)
      : 0;
    res.status(200).json(total);
  },
};
