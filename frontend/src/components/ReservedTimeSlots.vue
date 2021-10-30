<template>
  <q-card class="q-mt-sm">
    <q-card-section class="text-h6 q-pb-none">
      <q-item>
        <q-item-section avatar class="">
          <q-icon color="blue" name="far fa-calendar-check" size="44px" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <div class="text-h6">Prochains créneaux reservés</div>
          </q-item-label>
          <q-item-label caption class="text-black">
            N'oubliez pas de venir!
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section class="q-pa-none q-ma-none">
      <q-table
        class="no-shadow no-border"
        :data="reservedtimeSlots"
        :columns="columns"
      >
        <template v-slot:body-cell-Horaires="props">
          <q-td :props="props">
            <div>{{ getHoraire(props.row) }}</div>
          </q-td>
        </template>
        <template v-slot:body-cell-Poste="props">
          <q-td :props="props">
            <q-item>
              <q-item-section>
                <q-item-label>{{ props.row.poste }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-td>
        </template>
        <template v-slot:body-cell-Nom="props">
          <q-td :props="props">
            <q-item>
              <q-item-section>
                <q-item-label>{{ props.row.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-td>
        </template>
        <template v-slot:body-cell-Actions="props">
          <q-td :props="props">
            <div class="row">
              <div class="col">
                <q-btn
                  round
                  color="secondary"
                  icon="fas fa-pencil-alt"
                  @click="showModifyDialog(props.row)"
                />
              </div>
              <div class="col">
                <q-btn
                  round
                  color="red"
                  icon="fas fa-trash"
                  @click="showDeleteDialog(props.row)"
                />
              </div>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script>
import QCalendar from '@quasar/quasar-ui-qcalendar'
import ModifyTimeSlotDataDialog from 'components/ModifyTimeSlotDataDialog.vue'
import DeleteTimeSlotDialog from 'components/DeleteTimeSlotDialog.vue'
import { USER_QUERY } from './../apollo/graphql'

export default {
  name: 'CreneauxReserves',
  data () {
    return {
      slide: 1,
      tab: 'horaires',
      monthFormatter: this.monthFormatterFunc(),
      dayFormatter: this.dayFormatterFunc(),
      weekdayFormatter: this.weekdayFormatterFunc(),
      yearFormatter: this.yearFormatterFunc(),
      locale: 'fr',
      reservedtimeSlots: [],
      columns: [
        {
          name: 'Horaires',
          label: 'Horaires',
          align: 'left'
        },
        {
          name: 'Poste',
          label: 'Poste',
          field: 'poste',
          align: 'left'
        },
        {
          name: 'Nom',
          label: 'Nom',
          field: 'nom',
          align: 'left'
        },
        {
          name: 'Actions',
          label: 'Actions',
          field: (row) => row.nom,
          format: (val) => `${val}`,
          align: 'left'
        }
      ]
    }
  },
  apollo: {
    reservedtimeSlots: {
      query: USER_QUERY,
      // Parameters
      variables () {
        return {
          startDate: new Date()
        }
      },
      fetchPolicy: 'cache-and-network',
      update: (data) => {
        const reservedtimeSlots = []
        for (const keySlot in data.currentUser.userSlots.edges) {
          const edge = data.currentUser.userSlots.edges[keySlot]
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
          for (const keyParticipant in edge.node.slot.userSlots.edges) {
            const participant = edge.node.slot.userSlots.edges[keyParticipant]
            if (participant.node.id === edge.node.id) {
              reservedtimeSlots.push({
                userSlotID: participant.node.id,
                slotID: edge.node.slot.id,
                date: formatter
                  .format(new Date(edge.node.slot.startDate))
                  .slice(0, 10),
                time: formatter
                  .format(new Date(edge.node.slot.startDate))
                  .slice(11, 16),
                duration: edge.node.slot.duration,
                poste: edge.node.slot.job.name,
                name: participant.node.fullName,
                phone: participant.node.phoneNumber
              })
            }
          }
        }
        return reservedtimeSlots
      }
    }
  },
  methods: {
    monthFormatterFunc () {
      const longOptions = { timeZone: 'UTC', month: 'long' }
      const shortOptions = { timeZone: 'UTC', month: 'short' }

      return QCalendar.createNativeLocaleFormatter(this.locale, (_tms, short) =>
        short ? shortOptions : longOptions
      )
    },
    weekdayFormatterFunc () {
      const longOptions = { timeZone: 'UTC', weekday: 'long' }
      const shortOptions = { timeZone: 'UTC', weekday: 'short' }

      return QCalendar.createNativeLocaleFormatter(this.locale, (_tms, short) =>
        short ? shortOptions : longOptions
      )
    },
    dayFormatterFunc () {
      const longOptions = { timeZone: 'UTC', day: '2-digit' }
      const shortOptions = { timeZone: 'UTC', day: 'numeric' }

      return QCalendar.createNativeLocaleFormatter(this.locale, (_tms, short) =>
        short ? shortOptions : longOptions
      )
    },
    yearFormatterFunc () {
      const options = { timeZone: 'UTC', year: 'numeric' }

      return QCalendar.createNativeLocaleFormatter(this.locale, (_tms, short) =>
        short ? options : options
      )
    },
    getHoraire (row) {
      const timestamp = QCalendar.parsed(row.date + ' ' + row.time)
      const weekday = this.weekdayFormatter(timestamp, false)
      const day = this.dayFormatter(timestamp, false)
      const month = this.monthFormatter(timestamp, false)
      const year = this.yearFormatter(timestamp, false)
      return (
        weekday +
        ' ' +
        day +
        ' ' +
        month +
        ' ' +
        year +
        ' de ' +
        row.time +
        ' à ' +
        QCalendar.getTime(
          QCalendar.addToDate(timestamp, { minute: row.duration })
        )
      )
    },
    showModifyDialog (row) {
      const timestamp = QCalendar.parsed(row.date + ' ' + row.time)
      this.customDialog = this.$q
        .dialog({
          component: ModifyTimeSlotDataDialog,

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
          userSlotID: row.userSlotID,
          title: row.title,
          weekday: this.weekdayFormatter(timestamp, false),
          day: this.dayFormatter(timestamp, false),
          month: this.monthFormatter(timestamp, false),
          year: this.yearFormatter(timestamp, false),
          startTime: row.time,
          endTime: QCalendar.getTime(
            QCalendar.addToDate(timestamp, { minute: row.duration })
          ),
          name: row.name,
          phone: row.phone
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
    },
    showDeleteDialog (row) {
      const timestamp = QCalendar.parsed(row.date + ' ' + row.time)
      this.customDialog = this.$q
        .dialog({
          component: DeleteTimeSlotDialog,

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
          userSlotID: row.userSlotID,
          title: row.title,
          weekday: this.weekdayFormatter(timestamp, false),
          day: this.dayFormatter(timestamp, false),
          month: this.monthFormatter(timestamp, false),
          year: this.yearFormatter(timestamp, false),
          startTime: row.time,
          endTime: QCalendar.getTime(
            QCalendar.addToDate(timestamp, { minute: row.duration })
          )
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
