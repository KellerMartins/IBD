const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const formais_por_uf = await db.query(escape`
      SELECT sigla_uf, SUM(empregos_formais) as sum
      FROM municipio NATURAL JOIN uf NATURAL JOIN populacao
      GROUP BY sigla_uf
    `);

    if ("error" in formais_por_uf) return res.status(500).end(formais_por_uf.error.message);

    var total = {};
    for (let i = 0; i < formais_por_uf.length; i++)
      total[formais_por_uf[i].sigla_uf] = Math.round(formais_por_uf[i].sum);
    res.status(200).json(total);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;
      const total_empregados = await db.query(escape`
        SELECT SUM(empregados) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN  coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in total_empregados) return res.status(500).end(total_empregados.error.message);

      const empregados_formais = await db.query(escape`
        SELECT SUM(empregos_formais) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN  coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in empregados_formais) return res.status(500).end(empregados_formais.error.message);

      var total = {
        "Informal ou n.r.": Math.round(total_empregados[0].sum - empregados_formais[0].sum),
        "c/emprego formal": Math.round(empregados_formais[0].sum),
      };
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    let sigla_uf = req.query.uf.toUpperCase();
    const total_empregados_uf = await db.query(escape`
        SELECT SUM(empregados) as sum
        FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
        WHERE sigla_uf = ${sigla_uf}
      `);

    if ("error" in total_empregados_uf) return res.status(500).end(total_empregados_uf.error.message);

    const formal_uf = await db.query(escape`
      SELECT SUM(empregos_formais) as sum
      FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${sigla_uf}
    `);

    if ("error" in formal_uf) return res.status(500).end(formal_uf.error.message);

    var total = {
      "Informal ou n.r.": Math.floor(total_empregados_uf[0].sum - formal_uf[0].sum),
      "c/emprego formal": Math.round(formal_uf[0].sum),
    };
    res.status(200).json(total);
  },
};
