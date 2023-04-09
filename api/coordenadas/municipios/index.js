const db = require("../../../lib/db");
const escape = require("sql-template-strings");

module.exports = async (req, res) => {
  const municipios = await db.query(escape`
      SELECT longitude_coord as longitude, 
             latitude_coord as latitude, 
             altitude_coord as altitude, 
             tamanho_coord as tamanho,
             cod_municipio as cod
      FROM municipio NATURAL JOIN coord
    `);

  if ("error" in municipios) res.status(500).end(municipios.error.message);
  else res.status(200).json({ municipios });
};
