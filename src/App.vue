<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      right
      touchless
    >
      <v-list dense>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-contact-mail</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Contact</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
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
        :loading="$refs.map && $refs.map.loaded == false"
      >
        <Map ref="map"/>
          <v-btn
            color="cyan"
            dark
            fab
            left
            fixed
            bottom
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
      loadedMap: Map.loaded,
    }),
    created(){
    }
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
</style>