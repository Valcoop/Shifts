<template>
  <q-card class='q-mt-sm'>
    <q-card-section class='text-h6 q-pb-none'>
      <q-item>
        <q-item-section>
          <q-item-label>
            <div class='text-h6'>Horaires effectués du xx/xx:xxxx au xx/xx/xxxx</div>
          </q-item-label>
          <q-item-label caption class='text-black'>
            Vite reservez vos 1h manquant(s)!
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section>
      <canvas id="doughnut-chart"></canvas>
    </q-card-section>
  </q-card>
</template>

<script>
import Chart from 'chart.js'
export default {
  data () {
    return {
    }
  },
  mounted () {
    this.createChart('doughnut-chart')
  },
  methods: {
    createChart (chartId) {
      const ctx = document.getElementById(chartId)
      const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Horaires effectués', 'Horaires à faire'],
          datasets: [{
            backgroundColor: ['#3cba9f', '#c45850'],
            data: [3, 1]
          }]
        }
      })
      return myChart
    }
  }
}
</script>

<style>
</style>
