module.exports = async (req, res) => {
  
  const queryGroups = {
    "population": {
      title: "População",
      icon: "mdi-account-group",
      queries: [
        {id:"relatorio/numhabitantes", title: "Nº de habitantes", icon: "mdi-account-group", chart:"pie"},
        {id:"relatorio/popruralpecuaria", title: "População X pecuária", icon: "mdi-barn", chart:"pie"},
        {id:"relatorio/empregoformal", title: "Emprego formal", icon: "mdi-worker", chart:"bar"},
      ],
    },

    "education": {
      title: "Educação",
      icon: "mdi-school",
      queries: [
        {id:"relatorio/alfabetizacao", title: "Alfabetização", icon: "mdi-alphabetical", chart:"pie"},
        {id:"relatorio/mulheresdoutoras", title: "Mulheres com doutorado", icon: "mdi-face-woman", chart:"pie"},
      ],
    },

    "households": {
      title: "Domicílios",
      icon: "mdi-home",
      queries: [
        {id:"relatorio/porcentsemagua", title: "Munic. sem água encanada", icon: "mdi-water-pump", chart:"pie"},
        {id:"relatorio/urbanorural", title: "Domicílios urbanos/rurais", icon: "mdi-home-city", chart:"pie"},
      ],
    },

    "economy": {
      title: "Economia",
      icon: "mdi-currency-usd",
      queries: [
        {id:"relatorio/pibmedio", title: "PIB médio por município", icon: "mdi-currency-usd", chart:"line"},
        {id:"relatorio/pibmedioprimaria", title: "PIB médio X setor primario", icon: "mdi-sprout", chart:"pie"},
        {id:"relatorio/pibmediograduado", title: "PIB médio X graduação", icon: "mdi-school", chart:"line"},
      ],
    },

    "report": {
      title: "Relatório",
      icon: "mdi-file-chart",
      queries: [
        {id:"relatorio/numhabitantes", title: "Nº de habitantes", icon: "mdi-account-group", chart:"pie"},
        {id:"relatorio/porcentsemagua", title: "Munic. sem água encanada", icon: "mdi-water-pump", chart:"pie"},
        {id:"relatorio/urbanorural", title: "Domicílios urbanos/rurais", icon: "mdi-home-city", chart:"pie"},
        {id:"relatorio/mulheresdoutoras", title: "Mulheres com doutorado", icon: "mdi-face-woman", chart:"pie"},
        {id:"relatorio/alfabetizacao", title: "Alfabetização", icon: "mdi-alphabetical", chart:"pie"},
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