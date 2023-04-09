const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const total_doutoras = await db.query(escape`
      SELECT SUM(mulheres_doutoras) as sum
      FROM populacao
    `);

    if ("error" in total_doutoras) return res.status(500).end(total_doutoras.error.message);

    const total_doutores = await db.query(escape`
      SELECT SUM(homens_doutores) as sum
      FROM populacao
    `);

    if ("error" in total_doutores) return res.status(500).end(total_doutores.error.message);

    var total = {
      "Total de mulheres com doutorado no Brasil": Math.round(total_doutoras[0].sum),
      "Total de homens com doutorado no Brasil": Math.round(total_doutores[0].sum),
    };
    res.status(200).json(total);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;
      const homens_doutores = await db.query(escape`
        SELECT SUM(homens_doutores) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in homens_doutores) return res.status(500).end(homens_doutores.error.message);

      const mulheres_doutoras = await db.query(escape`
        SELECT SUM(mulheres_doutoras) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in mulheres_doutoras) return res.status(500).end(mulheres_doutoras.error.message);

      var total = {
        "Homens com doutorado na região": Math.round(homens_doutores[0].sum),
        "Mulheres com doutorado na região": Math.round(mulheres_doutoras[0].sum),
      };
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    const doutores_uf = await db.query(escape`
        SELECT SUM(homens_doutores) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
        WHERE sigla_uf = ${req.query.uf.toUpperCase()}
      `);

    if ("error" in doutores_uf) return res.status(500).end(doutores_uf.error.message);

    const doutoras_uf = await db.query(escape`
      SELECT SUM(mulheres_doutoras) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${req.query.uf.toUpperCase()}
    `);

    if ("error" in doutoras_uf) return res.status(500).end(doutoras_uf.error.message);

    var total = {};
    total["Homens com doutorado em " + req.query.uf.toUpperCase()] = Math.round(doutores_uf[0].sum);
    total["Mulheres com doutorado em " + req.query.uf.toUpperCase()] = Math.round(doutoras_uf[0].sum);
    res.status(200).json(total);
  },
};
