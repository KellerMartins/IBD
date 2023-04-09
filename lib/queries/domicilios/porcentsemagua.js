const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const sem_agua_canalizada = await db.query(escape`
      SELECT count(*)/(SELECT count(*) from domicilios) as percen
      FROM domicilios WHERE sem_agua_canalizada/(com_agua_canalizada+sem_agua_canalizada) < 0.05
    `);

    if ("error" in sem_agua_canalizada) return res.status(500).end(sem_agua_canalizada.error.message);

    var total = {
      "Municípios com mais de 5% dos domicílios sem água canalizada (%)": (1 - sem_agua_canalizada[0].percen) * 100,
      "Municípios com menos de 5% dos domicílios sem água canalizada (%)": sem_agua_canalizada[0].percen * 100,
    };
    res.status(200).json(total);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;

      const total_municipios = await db.query(escape`
        SELECT count(*) as count
        FROM municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in total_municipios) return res.status(500).end(total_municipios.error.message);

      const sem_agua_canalizada = await db.query(escape`
        SELECT count(*) as count
        FROM domicilios NATURAL JOIN municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND
              sem_agua_canalizada/(com_agua_canalizada+sem_agua_canalizada) < 0.05
      `);

      if ("error" in sem_agua_canalizada) return res.status(500).end(sem_agua_canalizada.error.message);

      let percen = sem_agua_canalizada[0].count / total_municipios[0].count;
      var total = {
        "Municípios com mais de 5% dos domicílios sem água canalizada (%)": (1 - percen) * 100,
        "Municípios com menos de 5% dos domicílios sem água canalizada (%)": percen * 100,
      };
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    const total_municipios = await db.query(escape`
        SELECT count(*) as count
        FROM municipio NATURAL JOIN uf
        WHERE sigla_uf = ${req.query.uf.toUpperCase()}
      `);

    if ("error" in total_municipios) return res.status(500).end(total_municipios.error.message);

    const sem_agua_canalizada = await db.query(escape`
        SELECT count(*) as count
        FROM domicilios NATURAL JOIN municipio NATURAL JOIN uf
        WHERE sigla_uf = ${req.query.uf.toUpperCase()} AND
              sem_agua_canalizada/(com_agua_canalizada+sem_agua_canalizada) < 0.05
      `);

    if ("error" in sem_agua_canalizada) return res.status(500).end(sem_agua_canalizada.error.message);

    let percen = sem_agua_canalizada[0].count / total_municipios[0].count;
    var total = {
      "Municípios com mais de 5% dos domicílios sem água canalizada (%)": (1 - percen) * 100,
      "Municípios com menos de 5% dos domicílios sem água canalizada (%)": percen * 100,
    };
    res.status(200).json(total);
  },
};
