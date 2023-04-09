const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const alfabetizacao = await db.query(escape`
      SELECT SUM(alfabetizados) as alfabetizados, SUM(analfabetos) as analfabetos
      FROM populacao
    `);

    if ("error" in alfabetizacao) return res.status(500).end(alfabetizacao.error.message);

    var total = {
      "Nº de pessoas alfabetizadas": Math.round(alfabetizacao[0].alfabetizados),
      "Nº de pessoas analfabetas": Math.round(alfabetizacao[0].analfabetos),
    };
    res.status(200).json(total);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;

      const alfabetizacao = await db.query(escape`
        SELECT SUM(alfabetizados) as alfabetizados, SUM(analfabetos) as analfabetos
        FROM populacao NATURAL JOIN municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
      `);

      if ("error" in alfabetizacao) return res.status(500).end(alfabetizacao.error.message);

      var total = {
        "Nº de pessoas alfabetizadas na região": Math.round(alfabetizacao[0].alfabetizados),
        "Nº de pessoas analfabetas na região": Math.round(alfabetizacao[0].analfabetos),
      };
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    const alfabetizacao = await db.query(escape`
      SELECT SUM(alfabetizados) as alfabetizados, SUM(analfabetos) as analfabetos
      FROM populacao NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${req.query.uf.toUpperCase()}
    `);

    if ("error" in alfabetizacao) return res.status(500).end(alfabetizacao.error.message);

    var total = {
      "Nº de pessoas alfabetizadas na UF": alfabetizacao[0].alfabetizados,
      "Nº de pessoas analfabetas na UF": alfabetizacao[0].analfabetos,
    };
    res.status(200).json(total);
  },
};
