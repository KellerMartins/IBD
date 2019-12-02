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

    "report": {
      title: "Relatório",
      icon: "mdi-file-chart",
      queries: [
        {id:"relatorio/numhabitantes", title: "Nº de habitantes", icon: "mdi-account-group", chart:"pie"},
        {id:"saneamento/porcentsemagua", title: "Munic. sem água encanada", icon: "mdi-water-pump", chart:"pie"},
        {id:"relatorio/urbanorural", title: "Domicílios urbanos/rurais", icon: "mdi-home-city", chart:"pie"},
        {id:"relatorio/mulheresdoutoras", title: "Mulheres com doutorado", icon: "mdi-face-woman", chart:"pie"},
        {id:"educacao/alfabetizacao", title: "Alfabetização", icon: "mdi-alphabetical", chart:"pie"},
        {id:"relatorio/pibmedio", title: "PIB médio por município", icon: "mdi-currency-usd", chart:"line"},
        {id:"relatorio/pibmedioprimaria", title: "PIB médio X setor primario", icon: "mdi-sprout", chart:"pie"},
        {id:"relatorio/pibmediograduado", title: "PIB médio X graduação", icon: "mdi-school", chart:"line"},
        {id:"relatorio/popruralpecuaria", title: "População X pecuária", icon: "mdi-barn", chart:"pie"},
        {id:"relatorio/empregoformal", title: "Emprego formal", icon: "mdi-worker", chart:"bar"},
      ],
    }
  }

  res.status(200).json(queryGroups)
}