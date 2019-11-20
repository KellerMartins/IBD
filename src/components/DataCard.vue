<template>
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
      <apexchart :width="width" type="donut" :options="options" :series="series"></apexchart>
    </v-card>
</template>

<script>
export default {
  name: 'DataCard',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    x: {
      type: Number,
      default: null
    },
    y: {
      type: Number,
      default: null
    },
    width: {
      type: Number,
      default: 275
    },
    height: {
      type: Number,
      default: 170
    },
    zoom: {
      type: Number,
      default: 1
    },
  },
  data:  () => ({
    options: {
      tooltip: { enabled: false },
      dataLabels: { style: { fontSize: '10px' } },
      plotOptions: {
        pie: {
          size: 70,
          customScale: 1,
          offsetX: 5,
          offsetY: 20,
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
</style>