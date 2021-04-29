<template>
  <div class="q-pa-md">
    <week v-bind:active="active" type="shift" />
  </div>
</template>

<script>
import Week from 'components/Week.vue'

export default {
  name: 'Shift',
  components: { Week },
  data () {
    return {
      active: true
    }
  }
}
</script>
