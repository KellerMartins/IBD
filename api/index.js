module.exports = async (req, res) => {
  
  const queryGroups = {
    "population": {
      title: "População",
      icon: "mdi-account-group",
      queries: [
        {id:"genero", title: "Gênero", icon: "mdi-gender-male-female", chart:"pie"},
        {id:"renda", title: "Renda", icon: "mdi-cash-multiple", chart:"pie"},
        {id:"emprego", title: "Emprego", icon: "mdi-worker", chart:"pie"},
        {id:"moradia", title: "Moradia", icon: "mdi-home", chart:"pie"},
        {id:"saneamento", title: "Saneamento Básico",icon: "mdi-paper-roll", chart:"pie"},
        {id:"escolaridade", title: "Escolaridade", icon: "mdi-school", chart:"pie"},
        {id:"natalidade", title: "Natalidade", icon: "mdi-baby-carriage", chart:"pie"},
      ],
    },

    "economy": {
      title: "Economia",
      icon: "mdi-currency-usd",
      queries: [
        {id:"teste", title: "Teste", icon: "mdi-cash-multiple", chart:"pie"},
      ],
    },

    "tests": {
      title: "Testes",
      icon: "mdi-flag",
      queries: [
        {id:"exemplo", title: "Teste Request", icon: "mdi-flag", chart:"pie"},
      ],
    }
  }

  res.status(200).json(queryGroups)
}