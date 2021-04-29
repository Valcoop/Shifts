<template>
  <q-page class='q-pa-sm'>
    <div class="row q-col-gutter-sm">
        <div class="col-md-4 col-sm-12 col-xs-12"><time-slots-made/></div>
        <div class="col-md-8 col-sm-12 col-xs-12"><reserved-time-slots ref="reservedTimeSlots" @update="onChildUpdate"/></div>
    </div>
    <div>
        <next-time-slots ref="nextTimeSlots" @update="onChildUpdate"/>
    </div>
  </q-page>
</template>

<script>
import NextTimeSlots from '../components/NextTimeSlots.vue'
import ReservedTimeSlots from '../components/ReservedTimeSlots.vue'
import TimeSlotsMade from '../components/TimeSlotsMade.vue'

export default {
  name: 'Home',
  components: { NextTimeSlots, ReservedTimeSlots, TimeSlotsMade },
  methods: {
    onChildUpdate () {
      this.$refs.nextTimeSlots.$apollo.queries.nextTimeSlots.refetch()
      this.$refs.reservedTimeSlots.$apollo.queries.reservedtimeSlots.refetch()
    }
  }
}
</script>
