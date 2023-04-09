const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const doutores = await db.query(escape`
      SELECT SUM(doutorados) as sum
      FROM populacao
    `);

    if ("error" in doutores) return res.status(500).end(doutores.error.message);

    const brancos_doutores = await db.query(escape`
      SELECT SUM(brancos_doutores) as sum
      FROM populacao
    `);

    if ("error" in brancos_doutores) return res.status(500).end(brancos_doutores.error.message);

    var total = {
      "Total de doutores de outras cores no Brasil": Math.round(doutores[0].sum - brancos_doutores[0].sum),
      "Total de brancos com doutorado no Brasil": Math.round(brancos_doutores[0].sum),
    };
    res.status(200).json(total);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;
      const doutores = await db.query(escape`
        SELECT SUM(doutorados) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in doutores) return res.status(500).end(doutores.error.message);

      const brancos_doutores = await db.query(escape`
        SELECT SUM(brancos_doutores) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in brancos_doutores) return res.status(500).end(brancos_doutores.error.message);

      var total = {
        "Doutores de outras cores na região": Math.round(doutores[0].sum - brancos_doutores[0].sum),
        "Brancos com doutorado na região": Math.round(brancos_doutores[0].sum),
      };
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    const doutores_uf = await db.query(escape`
        SELECT SUM(doutorados) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
        WHERE sigla_uf = ${req.query.uf.toUpperCase()}
      `);

    if ("error" in doutores_uf) return res.status(500).end(doutores_uf.error.message);

    const brancos_uf = await db.query(escape`
      SELECT SUM(brancos_doutores) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${req.query.uf.toUpperCase()}
    `);

    if ("error" in brancos_uf) return res.status(500).end(brancos_uf.error.message);

    var total = {};
    total["Doutores de outras cores em " + req.query.uf.toUpperCase()] = Math.round(
      doutores_uf[0].sum - brancos_uf[0].sum
    );
    total["Brancos com doutorado em " + req.query.uf.toUpperCase()] = Math.round(brancos_uf[0].sum);
    res.status(200).json(total);
  },
};
