<template>
  <div>
    <q-select filled v-model="timeSlot.jobID" :options="jobs" label="Titre" option-value="id" option-label="name" emit-value map-options :rules="[val => !!val || 'Champ obligatoire']"/>
    <q-input filled v-model="timeSlot.date" mask="date" label="Date" :rules="['date']">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date v-model="timeSlot.date" :locale="myLocale" first-day-of-week="1">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-input filled v-model="timeSlot.time" mask="time" label="Début du créneau" :rules="['time']">
      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-time v-model="timeSlot.time" :hour-options="[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]" :minute-options="[0,15,30,45]">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-input
      v-model.number="timeSlot.duration"
      type="number"
      :min=30
      step=15
      label="Durée (minutes)"
      filled
      :rules="[val => !!val || 'Field is required']"
    />
    <q-input
      v-model.number="timeSlot.number"
      type="number"
      :min=1
      label="Nombre de participants"
      filled
      :rules="[val => !!val || 'Field is required']"
    />
    <q-toggle
      v-model="timeSlot.active"
      color="primary"
      label="Creneau actif"
    />
  </div>
</template>

<script>
import { JOBS_QUERY } from './../apollo/graphql'

export default {
  props: {
    timeSlot: Object,
    date: String,
    time: String
  },
  data () {
    return {
      jobs: [],
      myLocale: {
        days: 'Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi'.split('_'),
        daysShort: 'Dim_Lun_Mar_Mer_Jeu_Ven_Sam'.split('_'),
        months: 'Janvier_Fevrier_Mars_Avril_Mai_Juin_Juillet_Aout_Septembre_Octobre_Novembre_Decembre'.split('_'),
        monthsShort: 'Janv_Fevr_Mars_Avril_Mai_Juin_Juil_Aout_Sept_Oct_Nov_Dec'.split('_')
      }
    }
  },
  apollo: {
    jobs: {
      query: JOBS_QUERY,
      update: data => {
        var jobs = []
        data.jobs.edges.forEach(
          function (edge) {
            jobs.push({ id: edge.node.id, name: edge.node.name })
          }
        )
        return jobs
      }
    }
  }
}
</script>

<style>
</style>
