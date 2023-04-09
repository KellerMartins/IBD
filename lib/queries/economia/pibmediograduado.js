const db = require("../../db");
const escape = require("sql-template-strings");
const utils = require("../../utils");

module.exports = {
  pais: async (req, res) => {
    const pib_medio = await db.query(escape`
      SELECT ano as x, AVG(pib) as y
      FROM economia
      GROUP BY ano
    `);

    if ("error" in pib_medio) return res.status(500).end(pib_medio.error.message);

    const pib_medio_grad = await db.query(escape`
      SELECT ano as x, AVG(pib) as y
      FROM municipio NATURAL JOIN economia NATURAL JOIN populacao
      WHERE cod_municipio IN
        (SELECT cod_municipio 
         FROM populacao 
         WHERE graduados > (SELECT AVG(graduados)
                            FROM populacao))
      GROUP BY ano        
    `);

    if ("error" in pib_medio_grad) return res.status(500).end(pib_medio_grad.error.message);

    var result = {
      "PIB: Média por município": pib_medio,
      "PIB: Média dos municípios que possuem número de pessoas graduadas acima da média": pib_medio_grad,
    };
    res.status(200).json(result);
  },

  regiao: async (req, res) => {
    let coords = utils.parseCoords(req.query.regiao);
    if (coords == null) res.status(400).end("Parametro 'coordenadas' mal formatado");
    else {
      let [min, max] = coords;
      const regiao_pib_medio = await db.query(escape`
        SELECT ano as x, AVG(pib) as y
        FROM economia NATURAL JOIN municipio NATURAL JOIN coord
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon}
        GROUP BY ano
      `);

      if ("error" in regiao_pib_medio) return res.status(500).end(regiao_pib_medio.error.message);

      const regiao_pib_grad = await db.query(escape`
        SELECT ano as x, AVG(pib) as y
        FROM municipio NATURAL JOIN coord NATURAL JOIN economia NATURAL JOIN populacao
        WHERE latitude_coord  > ${min.lat} AND latitude_coord  < ${max.lat} AND
              longitude_coord > ${min.lon} AND longitude_coord < ${max.lon} AND
              cod_municipio IN
                (SELECT cod_municipio 
                 FROM populacao 
                 WHERE graduados > (SELECT AVG(graduados)
                                    FROM populacao))
        GROUP BY ano    
      `);

      if ("error" in regiao_pib_grad) return res.status(500).end(regiao_pib_grad.error.message);

      var total = {};
      total["PIB: Média por município, região"] = regiao_pib_medio;
      total["PIB: média dos municípios da região que possuem número de pessoas graduadas acima da média"] =
        regiao_pib_grad;
      res.status(200).json(total);
    }
  },

  uf: async (req, res) => {
    const uf_pib_medio = await db.query(escape`
      SELECT ano as x, AVG(pib) as y
      FROM economia NATURAL JOIN municipio NATURAL JOIN uf
      WHERE sigla_uf = ${req.query.uf.toUpperCase()}
      GROUP BY ano
    `);

    if ("error" in uf_pib_medio) return res.status(500).end(uf_pib_medio.error.message);

    const uf_pib_grad = await db.query(escape`
      SELECT ano as x, AVG(pib) as y
      FROM municipio NATURAL JOIN uf NATURAL JOIN economia NATURAL JOIN populacao
      WHERE sigla_uf = ${req.query.uf.toUpperCase()} AND
            cod_municipio IN
              (SELECT cod_municipio 
              FROM populacao 
              WHERE graduados > (SELECT AVG(graduados)
                                  FROM populacao))
      GROUP BY ano   
    `);

    if ("error" in uf_pib_grad) return res.status(500).end(uf_pib_grad.error.message);

    var total = {};
    total["PIB: Média por município, " + req.query.uf.toUpperCase()] = uf_pib_medio;
    total[
      "PIB: média dos municípios de " +
        req.query.uf.toUpperCase() +
        " que possuem número de pessoas graduadas acima da média"
    ] = uf_pib_grad;
    res.status(200).json(total);
  },
};
