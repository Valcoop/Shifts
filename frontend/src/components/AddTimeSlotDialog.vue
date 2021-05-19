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
        <q-separator v-if="copyTimeSlots && copyTimeSlots.length > 0" vertical/>
        <q-card-section v-if="copyTimeSlots && copyTimeSlots.length > 0">
          <h6 class="q-ma-xs">Modifier les créneaux existants</h6>
          <template v-for="(slot, index) in copyTimeSlots">
            <div :key="index" class="q-pa-xs">
              <q-separator/>
              <time-slot-form class="q-pa-md" v-bind:timeSlot="slot" v-bind:date="slot.date" v-bind:time="slot.time"/>
              <q-card-actions align="right">
                <q-btn color="primary" label="Modifier" @click="onModifyClick(slot.id, slot.jobID, slot.date, slot.time, slot.duration, slot.number, slot.active)" />
                <q-btn v-if="slot.participants.length==0" color="primary" label="Supprimer" @click="onDeleteClick(slot.id)" />
              </q-card-actions>
            </div>
          </template>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { UPDATE_SLOT_MUTATION, REMOVE_SLOT_MUTATION, ADD_SLOT_MUTATION } from './../apollo/graphql'

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
        duration: 30,
        number: 1,
        active: false,
        jobID: null,
        date: this.date,
        time: this.time
      },
      copyTimeSlots: JSON.parse(JSON.stringify(this.timeSlots))
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

    async onModifyClick (id, jobID, date, time, duration, number, active) {
      await this.$apollo.mutate({
        // Query
        mutation: UPDATE_SLOT_MUTATION,
        // Parameters
        variables: {
          slotID: id,
          startDate: new Date(date + ' ' + time),
          duration: duration,
          jobID: jobID,
          totalPlace: number,
          active: active
        }
      })

      // Emit Ok
      this.$emit('ok')

      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le créneau a été modifié'
      })
    },

    async onDeleteClick (id) {
      await this.$apollo.mutate({
        // Query
        mutation: REMOVE_SLOT_MUTATION,
        // Parameters
        variables: {
          slotID: id
        }
      })

      this.copyTimeSlots = this.copyTimeSlots.filter(
        function (slot) {
          return slot.id !== id
        }
      )

      // Emit Ok
      this.$emit('ok')

      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le créneau a été supprimé'
      })
    },

    async onAddClick () {
      if (this.timeSlot.jobID === null) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: 'Vous devez selectionner un titre'
        })
      } else {
        await this.$apollo.mutate({
          // Query
          mutation: ADD_SLOT_MUTATION,
          // Parameters
          variables: {
            startDate: new Date(this.timeSlot.date + ' ' + this.timeSlot.time),
            duration: this.timeSlot.duration,
            jobID: this.timeSlot.jobID,
            totalPlace: this.timeSlot.number,
            active: this.timeSlot.active
          }
        })

        // Emit Ok
        this.$emit('ok')

        // then hiding dialog
        this.hide()

        // Notify
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Votre créneau a été ajouté'
        })
      }
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
