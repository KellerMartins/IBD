<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
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

      <!-- Population menu -->
      <v-slide-x-transition>
        <v-sheet v-show="drawerScreen == 'population'">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title">
                <v-btn text icon @click.stop="drawerScreen = ''">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>

              População

              </v-list-item-title>
              
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>
      
          <v-list dense>
            <v-list-item link v-for="item in populationQueries"  v-bind:key="item.title">
              <v-list-item-action>
                <v-icon>{{item.icon}}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{item.title}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
            
          <v-divider></v-divider>
        </v-sheet>
      </v-slide-x-transition>
    </div>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="cyan"
      dark
    >
      

      <img src="@/assets/ibge.png" style="height: inherit;">
      <v-spacer></v-spacer>
      <v-toolbar-title id="title">Dados da população</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    
    <v-content>
      <v-card id="create"
        height=100%
        v-bind:loading="!loaded"
      >
        <Map ref="map" 
          v-on:loadedMap="loaded = true" 
          v-on:enabledSelection="selectionMode = true"
          v-on:disabledSelection="selectionMode = false"
        />
        
        <v-btn
          dark
          fab
          left
          fixed
          bottom
          v-bind:loading="!loaded"
          v-on:click="toggleSelect"
          v-bind:color="selectionMode? 'yellow':'cyan'"
        >
          <v-icon >mdi-selection</v-icon>
        </v-btn>
      </v-card>
    </v-content>

  </v-app>
</template>

<script>
  import Map from './components/Map';
  export default {
    components: {
      Map,
    },
    props: {
      source: String,
    },
    data: () => ({
      drawer: null,
      loaded: false,
      selectionMode: false,
      drawerScreen: '',

      populationQueries: [
        {title: "Gênero",       icon: "mdi-gender-male-female"},
        {title: "Renda",        icon: "mdi-cash-multiple"},
        {title: "Emprego",      icon: "mdi-worker"},
        {title: "Moradia",      icon: "mdi-home"},
        {title: "Saneamento Básico",icon: "mdi-paper-roll"},
        {title: "Escolaridade", icon: "mdi-school"},
        {title: "Natalidade",   icon: "mdi-baby-carriage"},
      ],
    }),
    methods: {
      toggleSelect: function() {
        if (this.$refs.map) {
          this.$refs.map.toggleSelectionMode()
        }
      },
    },
  }
</script>

<style>
  html, body {
    /* Disables address bar hiding*/
    margin: 0; height: 100%; overflow: hidden
  }
  * {
    /* Disables pull-to-refresh*/
    overscroll-behavior: none;
  }
  #title {font-weight:bold;}
  .drawer_container {
    display:grid;
  }
  .drawer_container > *{
    grid-column: 1;
    grid-row: 1;
  }
</style>