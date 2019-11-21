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
              <v-list-item-action>
                <v-icon :dark="selectedQuery==String(i)">{{item.icon}}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{item.title}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>

          <v-list v-if="loading">
            <v-skeleton-loader
              height="46px"
              type="list-item-avatar"
              v-bind:key="item.title"
              v-for="item in queryGroups[drawerScreen].queries" 
            ></v-skeleton-loader>
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
