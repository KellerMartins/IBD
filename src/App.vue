<template>
  <v-app id="inspire">
    <!-- Drawer -->
    <Drawer ref="drawer"

      :enabled="drawer"
      v-on:changedQuery="onChangedQuery"
      v-on:returnedToMenu="onReturnToMenu"
      v-on:opened="drawer=true"
      v-on:closed="drawer=false"
    />

    <!-- Top bar -->
    <v-app-bar
      app
      color="cyan"
      dark
    >
      <img src="@/assets/ibge.png" style="height: inherit;">
      <v-spacer></v-spacer>
      <v-toolbar-title v-if="selectionMode" id="title">Selecione uma área</v-toolbar-title>
      <v-toolbar-title v-else-if="selectedQuery!=null && selectedQuery.id!=null" id="title">{{selectedQuery.title}}</v-toolbar-title>
      <v-toolbar-title v-else id="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <!-- Content -->
    <v-content>
      <v-card id="create"
        height=100%
        v-bind:loading="!loaded"
      >
        <!-- Map -->
        <Map ref="map" 
          :groupingLevel="dataGroupingLevel"
          :colormap="selectedQuery!=null && selectedQuery.id!=null? 'summer' : ''"
          v-on:loadedMap="loaded = true" 
          v-on:enabledSelectionMode="selectionMode = true"
          v-on:disabledSelectionMode="selectionMode = false"
          v-on:clearedSelection="hasSelection = false"
          v-on:selected="onSelect"
          v-on:moved="onMapMoved"
        />

        <!-- Data Card -->
        <v-card id="data"
          elevation=24
          v-if="hasSelection"
          :width=dataW
          :height=dataH
          v-bind:style="{
            top: dataScreenY-dataH + 'px', 
            left: dataScreenX-dataW/2 + 'px',
            }"
        />

        <!-- Data Grouping Selector -->
        <v-btn-toggle id="grouping"
          v-model="dataGroupingLevel"
          mandatory
          shaped
        >
          <v-btn>
            <v-icon>mdi-flag</v-icon>
            País
          </v-btn>
          <v-btn>
            <v-icon>mdi-terrain</v-icon>
            UF
          </v-btn>
          <v-btn>
            <v-icon>mdi-city</v-icon>
            Município
          </v-btn>
        </v-btn-toggle>
      </v-card>
    </v-content>
  </v-app>
</template>

<script>
  import isMobile from '@/plugins/isMobile.js'
  import Drawer from './components/Drawer';
  import Map from './components/Map';

  export default {
    components: {
      Map,
      Drawer,
    },
    props: {
      source: String,
    },
    data: () => ({
      drawer: false,
      loaded: false,
      selectionMode: false,
      hasSelection: false,
      selectedQuery: null,

      dataGroupingLevel: 2,
      dataWpos: null,
      dataScreenX: 0,
      dataScreenY: 0,
      dataW: 100,
      dataH: 100,
    }),
    watch: {
      dataGroupingLevel: function() {
        //this.$refs.map.clearSelection()
        //this.dataWpos = null
      },
    },
    methods: {
      onReturnToMenu: function() {
        this.$refs.map.clearSelection()
        this.dataWpos = null
        this.selectedQuery = null
      },

      onChangedQuery: function(query) {
        this.selectedQuery = query
        this.$refs.map.clearSelection()
        this.dataWpos = null
        if (isMobile()) {
          this.drawer = false
        }
      },

      onSelect: function(pos) {
        if (this.selectedQuery!=null) {
          this.dataScreenX = pos.x
          this.dataScreenY = pos.y
          this.hasSelection = true
        } else {
          this.$refs.map.clearSelection()
          this.hasSelection = false
        }
      },

      onMapMoved: function(pos) {
        this.dataScreenX = pos.x
        this.dataScreenY = pos.y
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

  #grouping {
    top: 8px;
    left: 2px;
    position: absolute;
  }

  .drawer_container {
    display:grid;
  }

  .drawer_container > *{
    grid-column: 1;
    grid-row: 1;
  }
</style>