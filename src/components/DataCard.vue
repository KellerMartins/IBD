<template>
      <v-fade-transition>
        <v-card id="card"
            elevation=24
            v-if="show"
            :width=width
            :height=height
            v-bind:style="{
            top: y-height + 'px', 
            left: x-width/2 + 'px',
            }"
        >
          <h3>{{title}}</h3>
          <apexchart :height="270+'px'" type="donut" :options="options" :series="series"></apexchart>
        </v-card>
      </v-fade-transition>
</template>

<script>
export default {
  name: 'DataCard',
  props: {
    queryList: Array,
    query: String,
    at: String,
    show: Boolean,
    x: Number,
    y: Number,
    width: {
      type: Number,
      default: 240
    },
    height: {
      type: Number,
      default: 252
    },
    zoom: {
      type: Number,
      default: 1
    },
  },
  data:  () => ({
    title: "Some long title to test",
    options: {
      tooltip: { enabled: false },
      dataLabels: { style: { fontSize: '10px' } },
      legend: { position: 'bottom',horizontalAlign: 'center'},
      plotOptions: {
        pie: {
          customScale: 1,
          offsetX: 0,
          offsetY: 0,
          donut: {
            size: '55%',
            labels: {
              show: true,
              name: { fontSize: '16px', offsetY: -11 },
              value: { fontSize: '12px', offsetY: -5 },
              total: { show: true }
            }
          }
        }  
      },
      theme: {
        palette: 'palette2', 
      },
      labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    series: [44000, 55000, 41000, 17000, 15000, 12000]
  }),
  methods:{
    get_data() {
      console.log('/api/'+this.at+'/'+this.query)
      /*this.$http.get('/api/'+at+'/'+this.query)
        .then(response => response.json())
        .then(json =>{
          
        })*/
    }
  },
  watch: {
    query() {
      if (this.queryList.map(q => q.id).includes(this.query) && this.at != null)
        this.get_data();
    },
    at() {
      if (this.queryList.map(q => q.id).includes(this.query) && this.at != null)
        this.get_data();
    },
  },
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
</style>