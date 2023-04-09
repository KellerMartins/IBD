const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const imposto_anos = await db.query(escape`
      SELECT ano as x, SUM(impostos_produtos) as y
      FROM economia
      GROUP BY ano
    `);

    if ("error" in imposto_anos) return res.status(500).end(imposto_anos.error.message);

    var result = { "Imposto sob produtos: Arrecadação total": imposto_anos };
    res.status(200).json(result);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;
      const pais_imposto_anos = await db.query(escape`
        SELECT ano as x, AVG(impostos_produtos) as y
        FROM economia
        GROUP BY ano
      `);

      if ("error" in pais_imposto_anos) return res.status(500).end(pais_imposto_anos.error.message);

      const regiao_imposto_anos = await db.query(escape`
        SELECT ano as x, AVG(impostos_produtos) as y
        FROM economia NATURAL JOIN municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
        GROUP BY ano
      `);

      if ("error" in regiao_imposto_anos) return res.status(500).end(regiao_imposto_anos.error.message);

      var total = {};
      total["Imposto sob produtos: Arrecadação média por município, Brasil"] = pais_imposto_anos;
      total["Imposto sob produtos: Arrecadação média por município, região"] = regiao_imposto_anos;
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    const pais_imposto_anos = await db.query(escape`
      SELECT ano as x, AVG(impostos_produtos) as y
      FROM economia
      GROUP BY ano
    `);

    if ("error" in pais_imposto_anos) return res.status(500).end(pais_imposto_anos.error.message);

    const uf_imposto_anos = await db.query(escape`
      SELECT ano as x, AVG(impostos_produtos) as y
      FROM economia NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${req.query.uf.toUpperCase()}
      GROUP BY ano
    `);

    if ("error" in uf_imposto_anos) return res.status(500).end(uf_imposto_anos.error.message);

    var total = {};
    total["Imposto sob produtos: Arrecadação média por município, Brasil"] = pais_imposto_anos;
    total["Imposto sob produtos: Arrecadação média por município, " + req.query.uf.toUpperCase()] = uf_imposto_anos;
    res.status(200).json(total);
  },
};
