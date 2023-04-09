module.exports = async (req, res) => {
  const queryGroups = {
    population: {
      title: "População",
      icon: "mdi-account-group",
      queries: [
        { id: "populacao/numhabitantes", title: "Nº de habitantes", icon: "mdi-account-group", chart: "pie" },
        { id: "populacao/cor", title: "Cor", icon: "mdi-account-multiple-outline", chart: "pie" },
        { id: "populacao/classe", title: "Classe social", icon: "mdi-currency-usd", chart: "pie" },
        { id: "populacao/estadocivil", title: "Estado civil", icon: "mdi-ring", chart: "pie" },
        { id: "populacao/popruralpecuaria", title: "População X pecuária", icon: "mdi-barn", chart: "pie" },
        { id: "populacao/empregoformal", title: "Emprego formal", icon: "mdi-worker", chart: "bar" },
      ],
    },

    education: {
      title: "Educação",
      icon: "mdi-school",
      queries: [
        { id: "educacao/alfabetizacao", title: "Alfabetização", icon: "mdi-alphabetical", chart: "pie" },
        { id: "educacao/mulheresdoutoras", title: "Mulheres com doutorado", icon: "mdi-face-woman", chart: "pie" },
        { id: "educacao/doutoressexo", title: "Doutorado X Sexo", icon: "mdi-gender-male-female", chart: "pie" },
        { id: "educacao/doutorescor", title: "Doutorado X Cor", icon: "mdi-account-multiple-outline", chart: "pie" },
      ],
    },

    households: {
      title: "Domicílios",
      icon: "mdi-home",
      queries: [
        { id: "domicilios/porcentsemagua", title: "Munic. sem água encanada", icon: "mdi-water-pump", chart: "pie" },
        { id: "domicilios/urbanorural", title: "Domicílios urbanos/rurais", icon: "mdi-home-city", chart: "pie" },
      ],
    },

    economy: {
      title: "Economia",
      icon: "mdi-currency-usd",
      queries: [
        { id: "economia/pibmedio", title: "PIB médio por município", icon: "mdi-currency-usd", chart: "line" },
        { id: "economia/pibmedioprimaria", title: "PIB médio X setor primario", icon: "mdi-sprout", chart: "pie" },
        { id: "economia/pibmediograduado", title: "PIB médio X graduação", icon: "mdi-school", chart: "line" },
        { id: "economia/impostoprodutos", title: "Imposto sob produtos", icon: "mdi-account-cash", chart: "line" },
      ],
    },
  };

  res.status(200).json(queryGroups);
};
