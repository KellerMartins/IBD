const queries = require("../../../../lib/queries");

module.exports = async (req, res) => {
  let category = req.query.category;
  let type = req.query.type;
  let location = "regiao" in req.query ? "regiao" : "uf" in req.query ? "uf" : "pais";

  return queries[category][type][location](req, res);
};
