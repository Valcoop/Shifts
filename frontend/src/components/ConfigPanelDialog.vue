<script>
import { date } from 'quasar'
import TimeSlotForm from './TimeSlotForm.vue'
import { JOBS_QUERY, ABSENCE_TYPES_QUERY, ADD_SLOT_MUTATION, UPDATE_JOB_MUTATION, ADD_JOB_MUTATION, ADD_ABSENCE_TYPE_MUTATION, UPDATE_ABSENCE_TYPE_MUTATION, SLOTS_QUERY } from './../apollo/graphql'

export default {
  components: { TimeSlotForm },
  data () {
    return {
      queries: {
        jobs: JOBS_QUERY,
        absences: ABSENCE_TYPES_QUERY
      },
      rangeDate: null,
      copyStartDate: null,
      copyEndStartDate: null,
      tab: 'copy',
      splitterModel: 30,
      myLocale: {
        days: 'Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi'.split('_'),
        daysShort: 'Dim_Lun_Mar_Mer_Jeu_Ven_Sam'.split('_'),
        months: 'Janvier_Fevrier_Mars_Avril_Mai_Juin_Juillet_Aout_Septembre_Octobre_Novembre_Decembre'.split('_'),
        monthsShort: 'Janv_Fevr_Mars_Avril_Mai_Juin_Juil_Aout_Sept_Oct_Nov_Dec'.split('_')
      },
      copyTimeSlots: null
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

    async onModifyJobClick (query, id, title, color) {
      await this.$apollo.mutate({
        mutation: UPDATE_JOB_MUTATION,
        // Parameters
        variables: {
          jobID: id,
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
        message: 'Le job ' + title + ' a été modifié'
      })
    },

    async onCreateJobClick (query, title, color) {
      // Call to the graphql mutation
      await this.$apollo.mutate({
        // Query
        mutation: ADD_JOB_MUTATION,
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

    addDefaultJob (jobs) {
      jobs.unshift({
        node: {
          name: 'Titre',
          color: '#FFFFFF'
        }
      })
    },

    async onModifyReasonClick (query, id, reason) {
      await this.$apollo.mutate({
        // Query
        mutation: UPDATE_ABSENCE_TYPE_MUTATION,
        // Parameters
        variables: {
          absenceTypeID: id,
          reason: reason
        }
      })

      query.refetch()

      // Notify
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Le Motif ' + reason + ' a été modifié'
      })
    },

    async onCreateReasonClick (query, reason) {
      await this.$apollo.mutate({
        // Query
        mutation: ADD_ABSENCE_TYPE_MUTATION,
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
        message: 'Le Motif ' + reason + ' a été créé '
      })
    },

    onRemoveNewReasonClick (reasons, index) {
      reasons.splice(index, 1)
    },

    addDefaultReason (reasons) {
      reasons.unshift({
        node: {
          reason: 'Motif'
        }
      })
    },

    async onCopySlotsClick () {
      if (this.rangeDate) {
        const startDate = new Date(this.rangeDate.from)
        const endDate = new Date(this.rangeDate.to)
        endDate.setDate(endDate.getDate() + 1)
        await this.$apollo.query({
          query: SLOTS_QUERY,
          variables: {
            startDate: startDate,
            endDate: endDate
          }
        }).then(data => {
          const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Europe/Paris'
          }
          const formatter = new Intl.DateTimeFormat('sv-SE', options)
          this.copyTimeSlots = []
          for (const key in data.data.slots) {
            var slot = data.data.slots[key]
            var diff = date.getDateDiff(formatter.format(new Date(slot.startDate)).slice(0, 10), startDate)
            var newDate = date.addToDate(this.copyStartDate, { days: diff })
            this.copyTimeSlots.push(
              {
                date: formatter.format(newDate).slice(0, 10),
                time: formatter.format(new Date(slot.startDate)).slice(11, 16),
                duration: slot.duration,
                jobID: slot.job.id,
                number: slot.totalPlace,
                active: slot.active
              }
            )
          }
        })

        // Emit Ok
        this.$emit('ok')
      }
    },

    async onAddSlotsClick () {
      for (const index in this.copyTimeSlots) {
        await this.$apollo.mutate({
          // Query
          mutation: ADD_SLOT_MUTATION,
          // Parameters
          variables: {
            startDate: new Date(this.copyTimeSlots[index].date + ' ' + this.copyTimeSlots[index].time),
            duration: this.copyTimeSlots[index].duration,
            jobID: this.copyTimeSlots[index].jobID,
            totalPlace: this.copyTimeSlots[index].number,
            active: this.copyTimeSlots[index].active
          }
        })
      }

      // Emit Ok
      this.$emit('ok')

      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Vos créneaux ont été ajouté'
      })

      this.copyTimeSlots = []
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
                  <q-date v-model="rangeDate" range :locale="myLocale" first-day-of-week="1"/>
                </q-popup-proxy>
              </q-btn>
            </div>
            pour les jours du <q-input filled v-model="copyStartDate" label="Date">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="copyStartDate" :locale="myLocale" first-day-of-week="1">
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
              :query="queries.jobs"
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
              :query="queries.absences"
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
