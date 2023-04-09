<template>
      <v-fade-transition>
        <v-card id="card"
          elevation=24
          v-if="show && !animShow"
          :width=width
          :height=height
          v-bind:style="{
            top: y-height/1.25 + 'px', 
            left: x-width/2 + 'px',
          }"
        > 
          <div v-if="!requestFailed">
            <div v-if="!loading">
              <h3 v-if="!smallTitle">{{title}}</h3>
              <h5 v-else class="my-1">{{title}}</h5>
              <apexchart 
                :type="chartType === 'pie' ? 'donut': (chartType === 'bar' ? 'bar' : 'line')"
                :height="(chartType === 'pie'? 270 : 225)+'px'" 
                :options="options" 
                :series="series">
              </apexchart>
            </div>
            <div v-else>
              <v-skeleton-loader type="heading" class="px-1 ma-2"/>
              <v-skeleton-loader type="image" class="px-1 ma-2"/>
            </div>
          </div>
          <v-container v-else class="ma-auto">
            <v-row align="center">
              <div class="text-center ma-auto">
                <h4 class="ma-2">{{errorMessage}}</h4>
                <v-btn 
                  class="ma-2"
                  outlined
                  @click="get_data"
                >
                Tentar novamente
                </v-btn>
              </div>
            </v-row>
          </v-container>
        </v-card>
      </v-fade-transition>
</template>

<script>
export default {
  name: 'DataCard',
  props: {
    title: String,
    smallTitle: Boolean,
    queryList: Array,
    query: String,
    at: String,
    show: Boolean,
    x: Number,
    y: Number,
    zoom: {
      type: Number,
      default: 1
    },
  },

  computed: {
    height(){
      return this.requestFailed? 140 : 270
    },
    width(){
      return this.chartType === 'pie'? 240 : (this.chartType === 'line' ? 340 : 240 + this.options.labels.length*15)
    }
  },

  data:  () => ({
    requestFailed: false,
    errorMessage: "ERROR",

    animShow: false,
    loading: false,
    
    chartType: "pie",
    series: [],
    options: {
      noData: { text: "Nenhum dado encontrado" },
      tooltip: { enabled: false },
      dataLabels: { style: { fontSize: '10px' } },
      legend: { position: 'bottom',horizontalAlign: 'center'},
      plotOptions: {
        pie: {
          expandOnClick: false,
          customScale: 1,
          offsetX: 0,
          offsetY: 0,
          donut: {
            size: '55%',
            labels: {
              show: true,
              name: { show: false},
              value: { fontSize: '14px', offsetY: 0, formatter: x => { return Number(x).toLocaleString() } },
              total: { show: true , formatter: w => 
                w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString() }
            }
          }
        },
      },
      yaxis: {
        labels: {
          formatter: x => x < 1000000 ? Number(x).toLocaleString() : 
                          x < 1000000000 ? Number(x/1000000).toLocaleString() + " mi" : 
                          x < 1000000000000 ? Number(x/1000000000).toLocaleString() + " bi" : 
                                                    Number(x/1000000000000).toLocaleString() + " tri"
        }
      },
      theme: {
        palette: 'palette2', 
      },
      labels: null,
    },
  }),
  methods:{
    get_data() {
      console.log('/api/dados/'+this.query+'?'+this.at)
      this.requestFailed = false
      this.loading = true
      this.$http.get('/api/dados/'+this.query+'?'+this.at)
        .then(response => response.json(),
              response => { throw response.status })
        .then(json =>{

          for (let i = 0; i < this.queryList.length; i++)
            if (this.queryList[i].id == this.query)
              this.chartType = this.queryList[i].chart
          
          let labels = Object.keys(json)
          if (labels.length > 0) {

            if (this.chartType === "pie") {
              this.options.labels = labels
              this.series = Object.values(json)
              this.options.dataLabels.enabled = true
            } 
            else if (this.chartType === "bar") {
              this.series = [{data:Object.values(json)}]
              this.options.labels = labels
              this.options.dataLabels.enabled = false
            }
            else if (this.chartType === "line") {
              var newLabels = []
              this.series = labels.map( l => {
                let data = [...json[l]];
                data.sort((a, b) => a.x - b.x);

                return {name:l, data:data.map(x => {
                  if (!newLabels.includes(x.x)) 
                    newLabels.push(x.x); return x.y
                  })} 
              })
              this.options.labels = newLabels
              this.options.dataLabels.enabled = false
            }
          } else {
            this.options.labels = []
            this.series = []
          }
          this.loading = false
        })
        .catch(e => { 
          this.requestFailed = true
          if (typeof e === 'number') {
            if (e == 404)
              this.errorMessage = "Consulta inexistente"
            else if (e == 500)
              this.errorMessage = "Erro na consulta"
            else
              this.errorMessage = "Falha na conexão com o servidor"
          } else {
            this.errorMessage = "Erro na aplicação"
            throw e
          }
        })
    },
  },
  watch: {
    query() {
      this.animShow = true
      if (this.queryList.map(q => q.id).includes(this.query) && this.at != null)
        this.get_data();
    },
    at() {
      this.animShow = true
      if (this.queryList.map(q => q.id).includes(this.query) && this.at != null)
        this.get_data();
    },
  },
  updated() {
    this.$nextTick(function () {
      this.animShow = false
    })
  }
}
</script>

<style scoped>
  #card {
    position: absolute;
    display: block;
    margin-left: auto;
    margin-right: auto;
    z-index: 1;
  }
  h3 {
    text-align: center;
  }
  h5 {
    text-align: center;
  }
</style>