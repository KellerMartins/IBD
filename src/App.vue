<template>
  <v-app id="inspire">
    <!-- Drawer -->
    <Drawer ref="drawer"
      :enabled.sync="drawer"
      :queryGroups="queryGroups"
      :loading="!loaded"
      @changedQuery="onChangedQuery"
      @returnedToMenu="onReturnToMenu"
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
          @loadedMap="loaded = true" 
          @enabledSelectionMode="selectionMode = true"
          @disabledSelectionMode="selectionMode = false"
          @clearedSelection="hasSelection = false"
          @selectedUF="onSelectUF"
          @selectedRegion="onSelectRegion"
          @selectedCountry="onSelectCountry"
          @moved="onMapMoved"
        />

        <!-- Data Card -->
        <DataCard
          :show="hasSelection"
          :zoom="dataZoom"
          :queryList="queryList"
          :query="selectedQuery!=null? selectedQuery.id: null"
          :at="queryAt"
          :x="dataScreenX"
          :y="dataScreenY"
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
  import DataCard from './components/DataCard';
  import Drawer from './components/Drawer';
  import Map from './components/Map';

  export default {
    components: {
      Map,
      Drawer,
      DataCard,
    },
    props: {
      source: String,
    },
    data: () => ({
      drawer: null,
      loaded: false,
      queryGroups: null,
      selectedQuery: null,

      selectedUF: null,
      selectionMode: false,
      hasSelection: false,
      selectionMin: null,
      selectionMax: null,

      dataGroupingLevel: 2,
      dataWpos: null,
      dataScreenX: 0,
      dataScreenY: 0,
      dataZoom: 1,
    }),
    watch: {
      dataGroupingLevel() {
        this.$refs.map.clearSelection()
        this.dataWpos = null
      },
    },
    computed: {
      queryAt () {
        switch(this.dataGroupingLevel) {
          case 0:
            return "pais"
          case 1:
            if (this.hasSelection)
              return "uf/"+this.selectedUF
            else
              return null
          case 2:
            if (this.hasSelection)
              return "regiao/"+this.selectionMin.x+","+this.selectionMin.y+";"+this.selectionMax.x+","+this.selectionMax.y
            else
              return null
        }
        return null
      },
      queryList() {
        return Object.keys(this.queryGroups||{}).reduce((a, g) => a.concat(this.queryGroups[g].queries), [])
      }
    },
    methods: {
      onReturnToMenu() {
        this.$refs.map.clearSelection()
        this.dataWpos = null
        this.selectedQuery = null
      },

      onChangedQuery(query) {
        this.selectedQuery = query
        if (query === null) {
          this.$refs.map.clearSelection()
          this.dataWpos = null
        }
        if (this.dataGroupingLevel == 0)
          this.hasSelection = query !== null
        else
          this.hasSelection = this.hasSelection && query !== null
      },

      onSelectRegion(pos, min, max) {
        if (this.selectedQuery!=null) {
          this.dataScreenX = pos.x
          this.dataScreenY = pos.y

          this.hasSelection = true
          this.selectionMin = min
          this.selectionMax = max
        } else {
          this.$refs.map.clearSelection()
          this.hasSelection = false
          this.selectionMin = null
          this.selectionMax = null
        }
      },

      onSelectUF(cod, pos) {
        if (this.selectedQuery!=null) {
          this.dataScreenX = pos.x
          this.dataScreenY = pos.y

          this.hasSelection = true
          this.selectedUF = cod
        } else {
          this.hasSelection = false
        }
      },

      onSelectCountry(pos) {
          this.dataScreenX = pos.x
          this.dataScreenY = pos.y
          this.hasSelection = this.selectedQuery !== null
      },

      onMapMoved(pos, zoom) {
        this.dataScreenX = pos.x
        this.dataScreenY = pos.y
        this.dataZoom = zoom
      },
    },
    mounted() {
      this.$http.get('/api')
        .then(response => response.json())
        .then(groups =>{
          this.queryGroups = groups
        })
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