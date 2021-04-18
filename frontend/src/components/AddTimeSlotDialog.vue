<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-card-actions align="right">
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-actions>
      <q-card-section horizontal>
        <q-card-section>
          <h6 class="q-ma-xs">Ajouter un nouveau créneau</h6>
          <time-slot-form v-bind:timeSlot="timeSlot" v-bind:date="date" v-bind:time="time"/>
          <q-card-actions align="right">
            <q-btn color="primary" label="Ajouter" @click="onAddClick" />
          </q-card-actions>
        </q-card-section>
        <q-separator v-if="timeSlots && timeSlots.length > 0" vertical/>
        <q-card-section v-if="timeSlots && timeSlots.length > 0">
          <h6 class="q-ma-xs">Modifier les créneaux existants</h6>
          <template v-for="(slot, index) in copyTimeSlots">
            <div :key="index" class="q-pa-xs">
              <q-separator/>
              <time-slot-form class="q-pa-md" v-bind:timeSlot="slot" v-bind:date="slot.date" v-bind:time="slot.time"/>
              <q-card-actions align="right">
                <q-btn color="primary" label="Modifier" @click="onModifyClick(slot.title, slot.date, slot.time, slot.duration, slot.number, slot.active)" />
              </q-card-actions>
            </div>
          </template>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import gql from 'graphql-tag'

import TimeSlotForm from './TimeSlotForm.vue'

export default {
  components: { TimeSlotForm },
  props: {
    date: String,
    time: String,
    timeSlots: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      timeSlot: {
        title: null,
        duration: 30,
        number: 1,
        active: false
      },
      copyTimeSlots: { ...this.timeSlots }
    }
  },
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show () {
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide () {
      this.$refs.dialog.hide()
    },

    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onModifyClick (title, date, time, visible, number, active) {
      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le créneau a été modifié'
      })
    },

    async onAddClick () {
      const result = await this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($startDate: Date!, $duration: Int!, $jobID: String!, $totalPlace: Int!, $active: Boolean!) {
          addSlot(input: { startDate: $startDate, duration: $duration, jobID: $jobID, totalPlace: $totalPlace, active: $active}) {
            slot {
              id
            }
          }
        }`,
        // Parameters
        variables: {
          startDate: new Date(this.date + ' ' + this.time),
          duration: this.timeSlot.duration,
          jobID: this.timeSlot.title,
          totalPlace: this.timeSlot.number,
          active: this.timeSlot.active
        }
      })
      

      // then hiding dialog
      this.hide()

      console.log(this.timeSlot)

      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Votre créneau a été ajouté'
      })
    },

    onCancelClick () {
      // we just need to hide dialog
      this.hide()
    }
  }
}
</script>

<style>
</style>
