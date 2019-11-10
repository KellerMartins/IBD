<template>
  <v-navigation-drawer
      v-model="enabled"
      app
      right
      touchless
    >
    <div class="drawer_container">
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
            <v-list-item link @click.stop="drawerScreen = 'population'">
              <v-list-item-action>
                <v-icon x-large>mdi-account-group</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>População</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item link @click.stop="drawerScreen = 'economy'">
              <v-list-item-action>
                <v-icon x-large>mdi-currency-usd</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Economia</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item link @click.stop="drawerScreen = 'country'">
              <v-list-item-action>
                <v-icon x-large>mdi-flag</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>País</v-list-item-title>
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
            v-on:change="onChangedQuery"
          >
            <v-list-item 
              link 
              v-for="(item, i) in queryGroups[drawerScreen].queries"  
              v-bind:key="item.title" 
              :style="selectedQuery==String(i) ?  { 'background': '#00bcd4', 'color':'white' } : { 'background': '', 'color':'' }"
            >
              <v-list-item-action>
                <v-icon :dark="selectedQuery==String(i)">{{item.icon}}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{item.title}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
            
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
    enabled: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    drawerScreen: '',
    selectedQuery: null,
    queryGroups: {
      "population": {
        title: "População",
        queries: [
        {title: "Gênero",       icon: "mdi-gender-male-female"},
        {title: "Renda",        icon: "mdi-cash-multiple"},
        {title: "Emprego",      icon: "mdi-worker"},
        {title: "Moradia",      icon: "mdi-home"},
        {title: "Saneamento Básico",icon: "mdi-paper-roll"},
        {title: "Escolaridade", icon: "mdi-school"},
        {title: "Natalidade",   icon: "mdi-baby-carriage"},
        ],
      },

      "economy": {
        title: "Economia",
        queries: [
        {title: "Gênero",       icon: "mdi-gender-male-female"},
        {title: "Renda",        icon: "mdi-cash-multiple"},
        {title: "Emprego",      icon: "mdi-worker"},
        {title: "Moradia",      icon: "mdi-home"},
        {title: "Saneamento Básico",icon: "mdi-paper-roll"},
        {title: "Escolaridade", icon: "mdi-school"},
        {title: "Natalidade",   icon: "mdi-baby-carriage"},
        ],
      },

      "country": {
        title: "País",
        queries: [
        {title: "Gênero",       icon: "mdi-gender-male-female"},
        {title: "Renda",        icon: "mdi-cash-multiple"},
        {title: "Emprego",      icon: "mdi-worker"},
        {title: "Moradia",      icon: "mdi-home"},
        {title: "Saneamento Básico",icon: "mdi-paper-roll"},
        {title: "Escolaridade", icon: "mdi-school"},
        {title: "Natalidade",   icon: "mdi-baby-carriage"},
        ],
      }
    }
  }),
  methods: {
    onChangedQuery: function() {
      if (typeof this.selectedQuery !== 'undefined') {
        let queryTitle = this.queryGroups[this.drawerScreen].queries[this.selectedQuery].title
        this.$emit('changedQuery', {title:queryTitle, id:this.selectedQuery, group:this.drawerScreen})
      } else {
        this.$emit('changedQuery', {title:null, id:null, group:null})
      }
    },
    onReturnToMenu: function() {
      this.drawerScreen=''
      this.selectedQuery=null
      this.$emit('returnedToMenu')
    },
  },
  watch: {
    enabled: function(val) {
      this.$emit(val? 'opened' : 'closed')
    }
  }
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
