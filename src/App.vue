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

      <!-- Queries submenu -->
      <v-slide-x-transition >
        <v-sheet v-if="Object.keys(queryGroups).includes(drawerScreen)">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title">
                <v-btn text icon @click.stop="returnToMenu">
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

    <v-app-bar
      app
      color="cyan"
      dark
    >
      

      <img src="@/assets/ibge.png" style="height: inherit;">
      <v-spacer></v-spacer>
      <v-toolbar-title v-if="selectionMode" id="title">Selecione uma área</v-toolbar-title>
      <v-toolbar-title v-else-if="selectedQuery!=null" id="title">{{queryGroups[drawerScreen].queries[selectedQuery].title}}</v-toolbar-title>
      <v-toolbar-title v-else id="title"></v-toolbar-title>
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
          v-on:enabledSelectionMode="selectionMode = true"
          v-on:disabledSelectionMode="selectionMode = false"
          v-on:selected="onSelect"
          v-on:moved="onMapMoved"
        />

        <v-card id="data"
          elevation=24
          v-if="dataWpos!=null"
          :width=dataW
          :height=dataH
          v-bind:style="{
            top: dataScreenY-dataH + 'px', 
            left: dataScreenX-dataW/2 + 'px',
            }"
        />
        
        <v-btn
          fab
          left
          fixed
          bottom
          :dark="!selectionMode && dataWpos == null"
          :loading="!loaded"
          :color="selectionMode || dataWpos != null ? 'yellow':'cyan'"
          v-if="selectedQuery != null || !loaded"
          v-on:click="pressedSelect"
        >
          <v-icon v-if="dataWpos == null">mdi-selection</v-icon>
          <v-icon v-else>mdi-close</v-icon>
        </v-btn>
      </v-card>
    </v-content>

  </v-app>
</template>

<script>
  import isMobile from '@/plugins/isMobile.js'
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

      dataWpos: null,
      dataScreenX: 0,
      dataScreenY: 0,
      dataW: 100,
      dataH: 100,

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

      },
    }),
    methods: {
      returnToMenu: function() {
        this.drawerScreen=''
        this.selectedQuery=null
        this.$refs.map.clearSelection()
        this.dataWpos = null
      },
      
      pressedSelect: function() {
        if (this.$refs.map) {
          if (this.dataWpos == null) {
            this.$refs.map.toggleSelectionMode()
          } else {
            this.$refs.map.clearSelection()
          }
          this.dataWpos = null
        }
      },

      onChangedQuery: function() {
        this.$refs.map.clearSelection()
        this.dataWpos = null
        if (isMobile()) {
          this.drawer = false;
        }
      },

      onSelect: function(start, end) {
        if (this.selectedQuery!=null) {
          var center = start.add(end).divideScalar(2)
          var wpos = this.$refs.map.sphericalToCartesian({x:center.x, y:center.y, z:105})
          this.dataWpos = wpos
          this.onMapMoved()
        } else {
          this.$refs.map.clearSelection()
        }
      },

      onMapMoved: function(){
        if (this.dataWpos != null) {
          var spos = this.$refs.map.cartesianToScreen(this.dataWpos)
          this.dataScreenX = spos.x
          this.dataScreenY = spos.y
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

  #title {
    font-weight:bold;
  }

  #data {
    position: absolute;
    z-index: 1;
  }

  .drawer_container {
    display:grid;
  }

  .drawer_container > *{
    grid-column: 1;
    grid-row: 1;
  }
</style>