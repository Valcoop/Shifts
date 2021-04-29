<template>
  <q-card class='q-mt-sm'>
      <q-card-section class='text-h6 q-pb-none'>
        <q-item>
          <q-item-section avatar class=''>
            <q-icon color='blue' name='far fa-calendar-plus' size='44px' />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <div class='text-h6'>Prochains créneaux libres</div>
            </q-item-label>
            <q-item-label caption class='text-black'>
              Inscrivez-vous aux prochains créneaux libres!
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section class='q-pa-none q-ma-none'>
        <q-table class='no-shadow no-border' :data='nextTimeSlots' :columns='columns'>
          <template v-slot:body-cell-Horaires='props'>
            <q-td :props="props">
              <div>{{ getHoraire(props.row) }}</div>
            </q-td>
          </template>
          <template v-slot:body-cell-Poste='props'>
            <q-td :props='props'>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ props.row.title }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>
          <template v-slot:body-cell-Actions="props">
            <q-td :props="props">
              <div class="row">
                <q-btn v-for="participant in props.row.participants" v-bind:key="participant.fullName" round class='q-pa-sm q-ma-sm' color="grey" icon="fas fa-user-alt" disable>
                  <q-tooltip content-class="bg-accent">{{ participant.fullName }}</q-tooltip>
                </q-btn>
                <q-btn v-for="index in (props.row.number - props.row.participants.length)" :key="index" round class='q-pa-sm q-ma-sm' color="secondary" icon="fas fa-plus" @click="showDialog(props.row)"/>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
</template>

<script>
import QCalendar from '@quasar/quasar-ui-qcalendar'
import RegisterTimeSlotDialog from 'components/RegisterTimeSlotDialog.vue'
import { ACTIVE_NON_FULL_SLOTS_QUERY } from './../apollo/graphql'

export default {
  name: 'ListProchainsCreneaux',
  data () {
    return {
      slide: 1,
      userID: this.$q.cookies.get('userId'),
      tab: 'horaires',
      monthFormatter: this.monthFormatterFunc(),
      dayFormatter: this.dayFormatterFunc(),
      weekdayFormatter: this.weekdayFormatterFunc(),
      yearFormatter: this.yearFormatterFunc(),
      locale: 'fr',
      nextTimeSlots: [],
      columns: [
        {
          name: 'Horaires',
          label: 'Horaires',
          align: 'left'
        },
        {
          name: 'Poste',
          label: 'Poste',
          field: 'title',
          align: 'left'
        },
        {
          name: 'Actions',
          label: 'Actions',
          align: 'left'
        }
      ]
    }
  },
  apollo: {
    nextTimeSlots: {
      query: ACTIVE_NON_FULL_SLOTS_QUERY,
      variables () {
        return {
          startDate: new Date(),
          endDate: this.endDate()
        }
      },
      fetchPolicy: 'cache-and-network',
      update: data => {
        const nextTimeSlots = []
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
        data.slots.forEach(
          function (slot) {
            const participants = []
            slot.attendees.edges.forEach(
              function (edge) {
                participants.push({ userSlotId: edge.node.userSlotId, fullName: edge.node.fullName })
              }
            )
            nextTimeSlots.push(
              {
                id: slot.id,
                title: slot.job.name,
                date: formatter.format(new Date(slot.startDate)).slice(0, 10),
                time: formatter.format(new Date(slot.startDate)).slice(11, 16),
                duration: slot.duration,
                bgcolor: slot.job.color,
                number: slot.totalPlace,
                participants: participants
              }
            )
          }
        )
        return nextTimeSlots
      }
    }
  },
  methods: {
    endDate () {
      var myCurrentDate = new Date()
      var endDate = new Date(myCurrentDate)
      endDate.setDate(endDate.getDate() + 30)
      return endDate
    },
    monthFormatterFunc () {
      const longOptions = { timeZone: 'UTC', month: 'long' }
      const shortOptions = { timeZone: 'UTC', month: 'short' }

      return QCalendar.createNativeLocaleFormatter(
        this.locale,
        (_tms, short) => short ? shortOptions : longOptions
      )
    },
    weekdayFormatterFunc () {
      const longOptions = { timeZone: 'UTC', weekday: 'long' }
      const shortOptions = { timeZone: 'UTC', weekday: 'short' }

      return QCalendar.createNativeLocaleFormatter(
        this.locale,
        (_tms, short) => short ? shortOptions : longOptions
      )
    },
    dayFormatterFunc () {
      const longOptions = { timeZone: 'UTC', day: '2-digit' }
      const shortOptions = { timeZone: 'UTC', day: 'numeric' }

      return QCalendar.createNativeLocaleFormatter(
        this.locale,
        (_tms, short) => short ? shortOptions : longOptions
      )
    },
    yearFormatterFunc () {
      const options = { timeZone: 'UTC', year: 'numeric' }
      return QCalendar.createNativeLocaleFormatter(
        this.locale,
        (_tms, short) => short ? options : options
      )
    },
    getHoraire (row) {
      const timestamp = QCalendar.parsed(row.date + ' ' + row.time)
      const weekday = this.weekdayFormatter(timestamp, false)
      const day = this.dayFormatter(timestamp, false)
      const month = this.monthFormatter(timestamp, false)
      const year = this.yearFormatter(timestamp, false)
      return weekday + ' ' + day + ' ' + month + ' ' + year + ' de ' + row.time + ' à ' + QCalendar.getTime(QCalendar.addToDate(timestamp, { minute: row.duration }))
    },
    showDialog (row) {
      const timestamp = QCalendar.parsed(row.date + ' ' + row.time)
      this.customDialog = this.$q
        .dialog({
          component: RegisterTimeSlotDialog,

          // optional if you want to have access to
          // Router, Vuex store, and so on, in your
          // custom component:
          parent: this, // becomes child of this Vue node
          // ("this" points to your Vue component)
          // (prop was called "root" in < 1.1.0 and
          // still works, but recommending to switch
          // to the more appropriate "parent" name)

          // props forwarded to component
          // (everything except "component" and "parent" props above):
          // apiResponse: this.resp
          id: row.id,
          userID: this.userID,
          title: row.title,
          weekday: this.weekdayFormatter(timestamp, false),
          day: this.dayFormatter(timestamp, false),
          month: this.monthFormatter(timestamp, false),
          year: this.yearFormatter(timestamp, false),
          startTime: row.time,
          endTime: QCalendar.getTime(QCalendar.addToDate(timestamp, { minute: row.duration })),
          number: row.number,
          participants: row.participants
          // ...more.props...
        })
        .onOk(() => {
          this.$emit('update')
        })
        .onCancel(() => {
          console.log('Cancel')
        })
        .onDismiss(() => {
          console.log('Called on OK or Cancel')
        })
    }
  }
}
</script>
