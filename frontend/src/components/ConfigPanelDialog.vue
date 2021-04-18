<template>
  <q-dialog ref="dialog" @hide="onDialogHide" >

    <q-splitter
      v-model="splitterModel"
      style="height: 100%; flex: 1 1 auto;"
    >

      <template v-slot:before>
        <q-tabs
          v-model="tab"
          vertical
          class="text-teal bg-grey-3 text-grey-7"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="copy" icon="fas fa-copy" label="Copier des jours" />
          <q-tab name="jobs" icon="fas fa-edit" label="Jobs" />
          <q-tab name="reasons" icon="fas fa-edit" label="Motifs absence" />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          vertical
          class="bg-grey-2"
          style='height: 100%;'
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel name="copy" style="hight: 100%">
            <q-card-actions align="right">
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-actions>
            <div class="q-pa-md">
              <div class="q-mb-sm">
                <q-badge v-if="rangeDate" color="teal">
                  Copier les jours du : {{ rangeDate.from }} au {{ rangeDate.to }}
                </q-badge>
                <q-badge v-else color="teal">
                  Selectionner les jours à copier
                </q-badge>
              </div>

              <q-btn icon="event" round color="primary">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="rangeDate" range/>
                </q-popup-proxy>
              </q-btn>
            </div>
            pour les jours du <q-input filled v-model="copyStartDate" label="Date">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="copyStartDate" :locale="myLocale">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            au <q-input filled v-model="copyEndStartDate" :placeholder="getCopyEndDate()" disable readonly/>
            <q-card-actions  align="right">
              <q-btn color="primary" label="Voir les nouveaux créneaux" @click="onCopySlotsClick()" />
            </q-card-actions>
            <q-card-section v-if="copyTimeSlots && copyTimeSlots.length > 0">
              <template v-for="(slot, index) in copyTimeSlots">
                <div :key="index" class="q-pa-xs">
                  <q-separator/>
                  <time-slot-form class="q-pa-md" v-bind:timeSlot="slot" v-bind:date="slot.date" v-bind:time="slot.time"/>
                </div>
              </template>
            </q-card-section>
            <q-card-actions  align="right">
                <q-btn v-if="copyTimeSlots && copyTimeSlots.length > 0" color="primary" label="Valider les créneaux" @click="onAddSlotsClick()" />
              </q-card-actions>
          </q-tab-panel>

          <q-tab-panel name="jobs">
            <ApolloQuery
              fetchPolicy="cache-and-network"
              nextFetchPolicy="cache-and-network"
              :query="gql => gql`
              {
                  jobs {
                    edges {
                      node {
                        id
                        name
                        color
                      }
                    }
                  }
                }
              `"
            >
            <template v-slot="{ result: { error, data }, isLoading, query }"> 
              <q-card-actions align="right">
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-actions>
              <q-card-actions align="left">
                <q-btn icon="fas fa-plus" color="primary" flat round dense @click="addDefaultJob(data.jobs.edges)" />
              </q-card-actions>
              <div v-if="isLoading" class="loading apollo">Loading...</div>
              <div v-else-if="error" class="error apollo">An error occurred</div>
              <div v-else-if="data" class="result apollo">
                <div v-for="(edge, index) in data.jobs.edges" :key="index" class="q-pa-xs">
                  <q-separator/>
                  <q-card-section class="q-pa-md">
                    <q-input
                      filled
                      v-model="edge.node.name"
                      label="Nom du job"
                      lazy-rules
                      :rules="[ val => val && val.length > 0 || 'Champ obligatoire']"
                    />
                    <q-input
                      filledGetTodos
                      v-model="edge.node.color"
                      label="Couleur"
                      class="my-input"
                    >
                      <template v-slot:append>
                          <q-icon class="fas fa-square" :style="getColorStyle(edge.node.color)"></q-icon>
                          <q-icon name="colorize" class="cursor-pointer">
                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-color v-model="edge.node.color" />
                            </q-popup-proxy>
                          </q-icon>
                      </template>
                    </q-input>
                  </q-card-section>
                  <q-card-actions  align="right">
                    <q-btn v-if="edge.node.id" color="primary" label="Mettre à jour" @click="onModifyJobClick(query, edge.node.id, edge.node.name, edge.node.color)" />
                    <q-btn v-else color="primary" label="Ajouter" @click="onCreateJobClick(query, edge.node.name, edge.node.color)" />
                    <q-btn v-if="edge.node.id" color="primary" label="Supprimer" @click="onDeleteJobClick(query, edge.node.id)" />
                    <q-btn v-else color="primary" label="Supprimer" @click="onRemoveNewJobClick(data.jobs.edges,index)" />
                  </q-card-actions>
                </div>
              </div>
              <div v-else class="no-result apollo">Pas de résultat</div>
            </template>
            </ApolloQuery>
          </q-tab-panel>

          <q-tab-panel name="reasons">
            <ApolloQuery
              fetchPolicy="cache-and-network"
              nextFetchPolicy="cache-and-network"
              :query="gql => gql`
              {
                absenceTypes{
                  edges{
                    node{
                      id 
                      reason
                    }
                  }
                }
              }
              `"
            >
            <template v-slot="{ result: { error, data }, isLoading, query }"> 
              <q-card-actions align="right">
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-actions>
              <div v-if="isLoading" class="loading apollo">Loading...</div>
              <div v-else-if="error" class="error apollo">An error occurred</div>
              <div v-else-if="data" class="result apollo">
                <q-card-actions align="left">
                  <q-btn icon="fas fa-plus" color="primary" flat round dense @click="addDefaultReason(data.absenceTypes.edges)" />
                </q-card-actions>
                <div v-for="(edge, index) in data.absenceTypes.edges" :key="index" class="q-pa-xs">
                  <q-separator/>
                  <q-card-section class="q-pa-md">
                    <q-input
                      filled
                      v-model="edge.node.reason"
                      label="Motif"
                      lazy-rules
                      :rules="[ val => val && val.length > 0 || 'Champ obligatoire']"
                    />
                  </q-card-section>
                  <q-card-actions  align="right">
                    <q-btn v-if="edge.node.id" color="primary" label="Mettre à jour" @click="onModifyReasonClick(query, edge.node.id, edge.node.reason)" />
                    <q-btn v-else color="primary" label="Ajouter" @click="onCreateReasonClick(query, edge.node.reason)" />
                    <q-btn v-if="edge.node.id" color="primary" label="Supprimer" @click="onDeleteReasonClick(query, edge.node.id, edge.node.reason)" />
                    <q-btn v-else color="primary" label="Supprimer" @click="onRemoveNewReasonClick(data.absenceTypes.edges,index)" />
                  </q-card-actions>
                </div>
              </div>
              <div v-else class="no-result apollo">Pas de résultat</div>
            </template>
            </ApolloQuery>
          </q-tab-panel>
        </q-tab-panels>
      </template>

    </q-splitter>
  </q-dialog>
</template>

<script>
import gql from 'graphql-tag'

import { date } from 'quasar'
import TimeSlotForm from './TimeSlotForm.vue'

export default {
  components: { TimeSlotForm },
  props: {
    timeSlots: Array
  },
  data () {
    return {
      rangeDate: null,
      copyStartDate: null,
      copyEndStartDate: null,
      titles: ['Stock', 'Livraison'],
      tab: 'copy',
      splitterModel: 30,
      myLocale: {
        days: 'Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi_Dimanche'.split('_'),
        daysShort: 'Lun_Mar_Mer_Jeu_Ven_Sam_Dim'.split('_'),
        months: 'Janvier_Fevrier_Mars_Avril_Mai_Juin_Juillet_Aout_Septembre_Octobre_Novembre_Decembre'.split('_'),
        monthsShort: 'Janv_Fevr_Mars_Avril_Mai_Juin_Juil_Aout_Sept_Oct_Nov_Dec'.split('_'),
        firstDayOfWeek: 0
      },
      copyTimeSlots: null,
      reasons: [
        {
          id: 1,
          reason: 'Maladie'
        },
        {
          id: 2,
          reason: 'Empechement'
        }
      ]
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

    onOKClick () {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick () {
      // we just need to hide dialog
      this.hide()
    },

    onModifyJobClick (query, id, title, color) {
      query.refetch()

      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le job a été modifié ' + id + ' ' + title + ' ' + color
      })
    },

    async onCreateJobClick (query, title, color) {
      // Call to the graphql mutation
      const result = await this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($name: String!, $color: String!) {
          addJob(input: { name: $name, color: $color}) {
            job {
              id
              name
              color
            }
          }
        }`,
        // Parameters
        variables: {
          name: title,
          color: color
        }
      })

      query.refetch()

      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le job ' + title + ' a été créé'
      })
    },

    async onDeleteJobClick (query, id) {
      const result = await this.$apollo.mutate({
        mutation: gql`mutation ($id: ID!) {
          removeJob(input: {jobID: $id}) {
            job {
              name
            }
          }
        }`,
        // Parameters
        variables: {
          id: id
        }
      })

      query.refetch()

      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le job ' + result.data.removeJob.job.name + ' a été supprimé '
      })
    },

    onRemoveNewJobClick (jobs, index) {
      jobs.splice(index, 1)
    },

    addDefaultJob (jobs) {
      jobs.unshift({
        node :{
          name: 'Titre',
          color: '#FFFFFF'
        }
      })
    },

    onModifyReasonClick (id, reason) {
      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le Motif a été modifié ' + id + ' ' + reason
      })
    },

    async onCreateReasonClick (query, reason) {

      const result = await this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($reason: String!) {
          addAbsenceType(input: { reason: $reason }) {
            absenceType {
              id
              reason
            }
          }
        }`,
        // Parameters
        variables: {
          reason: reason
        }
      })

      query.refetch()

      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le Motif ' +reason + ' a été créé '
      })
    },

    onDeleteReasonClick (id, reason) {
      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le Motif ' + reason + ' a été supprimé'
      })
    },

    onRemoveNewReasonClick (reasons,index) {
      reasons.splice(index, 1)
    },

    addDefaultReason (reasons) {
      reasons.unshift({
        node :{
          reason: 'Motif'
        }
      })
    },

    onCopySlotsClick () {
      if (this.rangeDate) {
        const startDate = this.rangeDate.from
        const endDate = this.rangeDate.to
        const tempArray = Array.from(this.timeSlots).filter(function (el) {
          return date.isBetweenDates(el.date, startDate, endDate, { inclusiveFrom: true, inclusiveTo: true })
        })
        this.copyTimeSlots = []
        for (let i = 0; i < tempArray.length; ++i) {
          const diff = date.getDateDiff(tempArray[i].date, startDate)
          const newDate = date.addToDate(this.copyStartDate, { days: diff })
          this.copyTimeSlots.push({
            date: date.formatDate(newDate, 'YYYY-MM-DD'),
            time: tempArray[i].time,
            duration: tempArray[i].duration,
            title: tempArray[i].title,
            bgcolor: tempArray[i].bgcolor,
            number: tempArray[i].number,
            participants: [],
            active: tempArray[i].active
          })
        }
      }
    },

    onAddSlotsClick () {
      for (const index in this.copyTimeSlots) {
        this.timeSlots.push({
          date: this.copyTimeSlots[index].date,
          time: this.copyTimeSlots[index].time,
          duration: this.copyTimeSlots[index].duration,
          title: this.copyTimeSlots[index].title,
          bgcolor: this.copyTimeSlots[index].bgcolor,
          number: this.copyTimeSlots[index].number,
          participants: [],
          active: this.copyTimeSlots[index].active
        })
      }
      console.log(this.timeSlots)
      this.copyTimeSlots = null
      console.log(this.timeSlots)
      this.rangeDate = null
      this.copyStartDate = null
    },

    getColorStyle (color) {
      const s = {}
      s.color = color
      return s
    },

    getCopyEndDate () {
      if (this.rangeDate && this.rangeDate.from && this.rangeDate.to && this.copyStartDate) {
        const dayDiff = date.getDateDiff(this.rangeDate.to, this.rangeDate.from)
        return date.formatDate(date.addToDate(this.copyStartDate, { days: dayDiff }), 'YYYY-MM-DD')
      }
      return null
    }

  }
}
</script>

<style>
</style>
