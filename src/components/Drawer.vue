<template>
  <v-navigation-drawer
      :value="enabled"
      @input="v => $emit('update:enabled', v)"
      app
      right
      touchless
    >
    <div v-if="queryGroups != null" class="drawer_container">
      <!-- Main menu -->
      <v-fade-transition>
        <v-sheet  v-show="drawerScreen == ''">
          <div class="pa-2">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="title">
                  Visualizador IBGE
                </v-list-item-title>
                <v-list-item-subtitle>
                  Trabalho final - IBD - 2019/2
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </div>

          <v-divider></v-divider>
          
          <v-subheader>Categorias</v-subheader>
          <v-list dense>
            <v-list-item 
              v-bind:key="item"
              v-for="item in Object.keys(queryGroups)"
              link @click.stop="drawerScreen = item"
            >
              <v-list-item-action>
                <v-icon x-large>{{queryGroups[item].icon}}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{queryGroups[item].title}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>
          <v-list dense>
            <v-list-item link @click.stop="drawerScreen = 'about'">
              <v-list-item-action>
                <v-icon x-large>mdi-information</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Sobre</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-fade-transition>

      <!-- Queries submenu -->
      <v-slide-x-transition >
        <v-sheet v-if="Object.keys(queryGroups).includes(drawerScreen)">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title">
                <v-btn text icon @click.stop="onReturnToMenu">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>

              {{queryGroups[drawerScreen].title}}

              </v-list-item-title>
              
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item-group
            v-model="selectedQuery"
            @change="onChangedQuery"
            v-if="!loading"
          >
            <v-list-item 
              link 
              v-for="(item, i) in queryGroups[drawerScreen].queries"  
              v-bind:key="item.title"
              :style="selectedQuery==String(i) ?  { 'background': '#00bcd4', 'color':'white' } : { 'background': '', 'color':'' }"
            >
                <v-icon :dark="selectedQuery==String(i)" class="mr-3">{{item.icon}}</v-icon>
                <v-list-item-title v-text="item.title"></v-list-item-title>
                
            </v-list-item>
          </v-list-item-group>

          <v-list v-if="loading">
            <v-skeleton-loader
              height="44.5px"
              type="list-item-avatar"
              v-bind:key="item.title"
              v-for="item in queryGroups[drawerScreen].queries" 
            ></v-skeleton-loader>
          </v-list>
            
          <v-divider></v-divider>
        </v-sheet>
      </v-slide-x-transition>

      <!-- About submenu -->
      <v-slide-x-transition >
        <v-sheet v-if="drawerScreen === 'about'">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title">
                <v-btn text icon @click.stop="onReturnToMenu">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              Sobre
              </v-list-item-title>
              
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>
          <p class="ma-4 text-center font-weight-light"> Trabalho final da disciplina Introdução a Banco de Dados UFMG 2019/2 </p>
          <p class="mx-3 mt-3 mb-0 font-weight-light"> Autores: </p>
          <v-list>
            <v-list-item @click="openNewTab('https://kellermartins.github.io');">
              <v-list-item-content>
                <v-list-item-title>Keller Clayderman M. de Oliveira</v-list-item-title>
                <v-list-item-subtitle>Interface, tratamento inicial dos</v-list-item-subtitle>
                <v-list-item-subtitle>dados, criação do banco de dados</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click=";">
              <v-list-item-content>
                <v-list-item-title>Rafael Castro Araújo Beirão</v-list-item-title>
                <v-list-item-subtitle>Tratamento dos dados sobre</v-list-item-subtitle>
                <v-list-item-subtitle>a população</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item @click=";">
              <v-list-item-content>
                <v-list-item-title>Jackson Nunes Silva</v-list-item-title>
                <v-list-item-subtitle>Tratamento dos dados sobre a</v-list-item-subtitle>
                <v-list-item-subtitle>população e domicílios, consultas</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click=";">
              <v-list-item-content>
                <v-list-item-title>Rafael Fonseca de Mendonça</v-list-item-title>
                <v-list-item-subtitle>Tratamento dos dados sobre</v-list-item-subtitle>
                <v-list-item-subtitle>atividades econômicas, consultas</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <p class="mx-3 mt-3 mb-0 font-weight-light"> Desenvolvido em: </p>
          <v-list-item>
            <v-tooltip bottom 
              v-bind:key="item.t"
              v-for="item in [{i:'mdi-language-javascript', t:'JavaScript'},
                              {i:'mdi-vuejs',   t:'Vue.js'},
                              {i:'mdi-vuetify', t:'Vuetify'},
                              {i:'mdi-nodejs',  t:'Node.js'},
                              {i:'mdi-language-python', t:'Python'}]" >
              <template v-slot:activator="{ on }">
                <v-icon class="mr-3" v-on="on">{{item.i}}</v-icon>
              </template>
              <span>{{item.t}}</span>
            </v-tooltip>
          </v-list-item>
          <p class="mx-3 mt-3 mb-0 font-weight-light"> Links: </p>
          <v-list>
            <v-list-item @click="openNewTab('ftp://ftp.ibge.gov.br/Censos/Censo_Demografico_2010/Resultados_Gerais_da_Amostra/Microdados');">
              <v-icon class="mr-3">mdi-web</v-icon>
              <v-list-item-title>Microdados Censo 2010</v-list-item-title>
            </v-list-item>

            <v-list-item @click="openNewTab('ftp://ftp.ibge.gov.br/Pib_Municipios/2016');">
              <v-icon class="mr-3">mdi-web</v-icon>
              <v-list-item-title>PIB Municípios 2016</v-list-item-title>
            </v-list-item>

            <v-list-item @click="openNewTab('ftp://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/localidades');">
              <v-icon class="mr-3">mdi-web</v-icon>
              <v-list-item-title>Localidades</v-list-item-title>
            </v-list-item>

            <v-list-item @click="openNewTab('https://github.com/KellerMartins/IBD');" >
              <v-icon class="mr-3">mdi-github-circle</v-icon>
              <v-list-item-title>Código fonte</v-list-item-title>
            </v-list-item>
          </v-list>
            
          <v-divider></v-divider>
        </v-sheet>
      </v-slide-x-transition>
    </div>
    </v-navigation-drawer>
</template>

<script>
export default {
  name: 'QueryDrawer',
  props: {
    loading: Boolean,
    enabled: Boolean,
    queryGroups: Object,
  },
  data: () => ({
    drawerScreen: '',
    selectedQuery: null,
  }),
  methods: {
    onChangedQuery() {
      if (typeof this.selectedQuery !== 'undefined') {
        let query = this.queryGroups[this.drawerScreen].queries[this.selectedQuery]
        this.$emit('changedQuery', {title:query.title, id:query.id, group:this.drawerScreen})
        this.$emit('update:enabled', null);
      } else {
        this.$emit('changedQuery', null)
      }
    },
    onReturnToMenu() {
      this.drawerScreen=''
      this.selectedQuery=null
      this.$emit('returnedToMenu')
    },
    openNewTab(link) {
      window.open(link, '_blank');
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
