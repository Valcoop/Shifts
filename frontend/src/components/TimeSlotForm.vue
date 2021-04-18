<template>
  <div>
    <q-select filled 
        v-model="timeSlot.title" 
        :options="jobs" 
        label="Titre" 
        option-value="id"
        option-label="name"
        emit-value
        map-options 
        :rules="[val => !!val || 'Field is required']"/>
    <q-input filled v-model="date" mask="date" label="Date" :rules="['date']">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date v-model="date" :locale="myLocale">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-input filled v-model="time" mask="time" label="Début du créneau" :rules="['time']">
      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-time v-model="time">
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
      step=30
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
import gql from 'graphql-tag'

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
        days: 'Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi_Dimanche'.split('_'),
        daysShort: 'Lun_Mar_Mer_Jeu_Ven_Sam_Dim'.split('_'),
        months: 'Janvier_Fevrier_Mars_Avril_Mai_Juin_Juillet_Aout_Septembre_Octobre_Novembre_Decembre'.split('_'),
        monthsShort: 'Janv_Fevr_Mars_Avril_Mai_Juin_Juil_Aout_Sept_Oct_Nov_Dec'.split('_'),
        firstDayOfWeek: 0
      }
    }
  },
  apollo: {
    jobs: {
      query: gql`query {
        jobs(input: {}){
          edges{
            node{
              id 
              name
            }
          }
        }
      }`,
      update: data => {
        var jobs = []
        data.jobs.edges.forEach(
          function(edge){
            jobs.push({id: edge.node.id, name: edge.node.name})
          }
        )
        return jobs
      }
    }
  },
}
</script>

<style>
</style>
