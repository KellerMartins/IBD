const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const total_hab = await db.query(escape`
      SELECT SUM(num_habitantes_municipio) as sum
      FROM municipio
    `);

    if ("error" in total_hab) return res.status(500).end(total_hab.error.message);

    var total = { "Total de habitantes": Math.round(total_hab[0].sum) };
    res.status(200).json(total);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;
      const total_hab = await db.query(escape`
        SELECT SUM(num_habitantes_municipio) as sum
        FROM municipio
      `);

      if ("error" in total_hab) return res.status(500).end(total_hab.error.message);

      const hab_regiao = await db.query(escape`
        SELECT SUM(num_habitantes_municipio) as sum
        FROM municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in hab_regiao) return res.status(500).end(hab_regiao.error.message);

      var total = {
        "Outras regiões": Math.round(total_hab[0].sum - hab_regiao[0].sum),
        "Habitantes na região": Math.round(hab_regiao[0].sum),
      };
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    const total_hab = await db.query(escape`
      SELECT SUM(num_habitantes_municipio) as sum
      FROM municipio
    `);

    if ("error" in total_hab) return res.status(500).end(total_hab.error.message);

    const hab_uf = await db.query(escape`
      SELECT SUM(num_habitantes_municipio) as sum
      FROM municipio NATURAL JOIN uf
      WHERE sigla_uf = ${req.query.uf.toUpperCase()}
    `);

    if ("error" in hab_uf) return res.status(500).end(hab_uf.error.message);

    var total = { "Outras UFs": total_hab[0].sum - hab_uf[0].sum, "Habitantes na UF": +hab_uf[0].sum };
    res.status(200).json(total);
  },
};
