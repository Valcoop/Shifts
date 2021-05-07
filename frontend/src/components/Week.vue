<template>
  <div class="row items-center" style="max-width: 100%; width: 100%; height: 100%;">
    <div class="col full-height">
      <div class="row justify-center items-center">
        <q-btn @click="calendarPrev" icon="fas fa-angle-left"/>
        <q-separator vertical />
        <q-btn @click="calendarNext" icon="fas fa-angle-right"/>
        <q-btn color="primary" label="Aujourd'hui" @click="setToday" flat class="q-ml-sm"/>
      </div>
      <q-separator />
      <div v-if="!this.$apollo.loading" style="overflow: hidden; height: 100%;">
        <q-calendar
          ref="calendar"
          v-model="selectedDate"
          view="week"
          locale="fr"
          animated
          hour24-format
          :disabled-before="disabledBefore"
          :interval-height="13"
          :interval-minutes="15"
          :interval-count="64"
          :interval-start="24"
          :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          @click:time2="onClickTimeDialog"
        >
          <template #head-day="{ timestamp }">
            <div class="row justify-between items-center text-white overflow-hidden" style="background: #26A69A">
              <div class="text-center" style="width: 100%;">{{ weekdayFormatter(timestamp, false).toUpperCase() }}</div>
              <div class="text-center text-bold" style="width: 100%;  font-size: 16px;">{{ dayFormatter(timestamp, false) }}</div>
              <div class="text-center" style="width: 100%; font-size: 16px;">{{ monthFormatter(timestamp, false) }} {{ yearFormatter(timestamp, false) }}</div>
            </div>
          </template>
          <template #day-body="{ timestamp, timeStartPos, timeDurationHeight }">
            <template v-for="(event, index) in getTimeSlots(timestamp.date)">
                <q-card
                  v-ripple
                  v-if="event.time"
                  :key="index"
                  class="my-event justify-center bordered"
                  :class="badgeClasses(event, 'body')"
                  :style="badgeStyles(event, 'body', timeStartPos, timeDurationHeight)"
                  @click="showRegisterDialog(event, timestamp)"
                >
                    <q-linear-progress
                        v-if="event.time"
                        :key="index"
                        size='sm'
                        :value="progressBarValue(event)"
                        :color="colorProgressBar(event)"
                      />
                    <q-tooltip v-if="event.number !== event.participants.length">
                      {{ event.title }}: {{ (event.number - event.participants.length) }} places restantes
                    </q-tooltip>
                    <q-tooltip v-else>
                      {{ event.title }}: Complet
                    </q-tooltip>
                    <q-card-section class="q-pa-xs">
                      <span v-if="$mq === 'lg'" class="ellipsis center">{{ event.title }}</span>
                    </q-card-section>
                    <div v-if="event.participants && $mq === 'lg' && event.duration >= 60" class="q-pl-xs">
                      <q-btn size="4px" v-for="participant in event.participants" v-bind:key="participant.fullName" round color="grey" icon="fas fa-user-alt" disable>
                        <q-tooltip content-class="bg-accent">{{ participant.fullName }}</q-tooltip>
                      </q-btn>
                      <q-btn size="4px" v-for="index in (event.number - event.participants.length)" :key="index" round color="secondary" icon="fas fa-plus" />
                    </div>
                </q-card>
              </template>
          </template>
        </q-calendar>
      </div>
    </div>
  </div>
</template>

<script>
import QCalendar from '@quasar/quasar-ui-qcalendar'
import RegisterTimeSlotDialog from 'components/RegisterTimeSlotDialog.vue'
import AddTimeSlotDialog from 'components/AddTimeSlotDialog.vue'
import { ACTIVE_PARAM_SLOTS_QUERY } from './../apollo/graphql'

const CURRENT_DAY = new Date()

function getCurrentDay (day) {
  const newDay = new Date(CURRENT_DAY)
  newDay.setDate(day)
  const tm = QCalendar.parseDate(newDay)
  return tm.date
}

const reRGBA = /^\s*rgb(a)?\s*\((\s*(\d+)\s*,\s*?){2}(\d+)\s*,?\s*([01]?\.?\d*?)?\s*\)\s*$/

function textToRgb (color) {
  if (typeof color !== 'string') {
    throw new TypeError('Expected a string')
  }

  const m = reRGBA.exec(color)
  if (m) {
    const rgb = {
      r: Math.min(255, parseInt(m[2], 10)),
      g: Math.min(255, parseInt(m[3], 10)),
      b: Math.min(255, parseInt(m[4], 10))
    }
    if (m[1]) {
      rgb.a = Math.min(1, parseFloat(m[5]))
    }
    return rgb
  }
  return hexToRgb(color)
}

function hexToRgb (hex) {
  if (typeof hex !== 'string') {
    throw new TypeError('Expected a string')
  }

  hex = hex.replace(/^#/, '')

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  } else if (hex.length === 4) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }

  const num = parseInt(hex, 16)

  return hex.length > 6
    ? { r: num >> 24 & 255, g: num >> 16 & 255, b: num >> 8 & 255, a: Math.round((num & 255) / 2.55) }
    : { r: num >> 16, g: num >> 8 & 255, b: num & 255 }
}

function luminosity (color) {
  if (typeof color !== 'string' && (!color || color.r === undefined)) {
    throw new TypeError('Expected a string or a {r, g, b} object as color')
  }

  const
    rgb = typeof color === 'string' ? textToRgb(color) : color,
    r = rgb.r / 255,
    g = rgb.g / 255,
    b = rgb.b / 255,
    R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4),
    G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4),
    B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function startOfWeek(date){
  var date = new Date(date)
  var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

function endOfWeek(date){
  var date = new Date(date)
  var lastday = date.getDate() - (date.getDay() - 1) + 7
  return new Date(date.setDate(lastday))
}

export default {
  props: {
    active: Boolean,
    type: String
  },
  data () {
    return {
      customDialog: null,
      selectedDate: getCurrentDay(CURRENT_DAY.getDate()),
      today: getCurrentDay(CURRENT_DAY.getDate()),
      monthFormatter: this.monthFormatterFunc(),
      dayFormatter: this.dayFormatterFunc(),
      weekdayFormatter: this.weekdayFormatterFunc(),
      yearFormatter: this.yearFormatterFunc(),
      locale: 'fr',
      events: [],
      timeSlots: [],
      userID: this.$q.cookies.get('userId')
    }
  },
  apollo: {
    timeSlots: {
      query: ACTIVE_PARAM_SLOTS_QUERY,
        // Parameters
        variables () {
          return {
            startDate: startOfWeek(this.selectedDate),
            endDate: endOfWeek(this.selectedDate),
            active: this.active
          }
        },
        fetchPolicy: 'cache-and-network',
      update: data => {
        var slots = []
        data.slots.forEach(
          function(slot){
            const participants = []
            slot.userSlots.edges.forEach(function(edge){participants.push({fullName: edge.node.fullName, userSlotID: edge.node.id})})
            const options = {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit',
              timeZone: 'Europe/Paris'
            }
            const formatter = new Intl.DateTimeFormat('sv-SE', options)
            slots.push(
              { 
                id: slot.id,
                title: slot.job.name,
                date: formatter.format(new Date(slot.startDate)).slice(0, 10),
                time: formatter.format(new Date(slot.startDate)).slice(11, 16),
                duration: slot.duration,
                bgcolor: slot.job.color,
                number: slot.totalPlace,
                participants: participants,
                active: slot.active,
                jobID: slot.job.id
              }
            )
          }
        )
        return slots
      }
    }
  },
  methods: {
    async calendarNext () {
      await this.$refs.calendar.next()
      await this.$apollo.queries.timeSlots.refetch()
    },
    async calendarPrev () {
      await this.$refs.calendar.prev()
      await this.$apollo.queries.timeSlots.refetch()
    },
    async setToday () {
      await this.$refs.calendar.moveToToday()
      await this.$apollo.queries.timeSlots.refetch()
    },
    getHeadDay (timestamp) {
      return `${timestamp.date}`
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
    isCssColor (color) {
      return !!color && !!color.match(/^(#|(rgb|hsl)a?\()/)
    },
    badgeClasses (event, type) {
      if (event.active) {
        const cssColor = this.isCssColor(event.bgcolor)
        return {
          [`text-white bg-${event.bgcolor}`]: !cssColor
        }
      }
    },
    badgeStyles (event, type, timeStartPos, timeDurationHeight) {
      const s = {}
      if (this.isCssColor(event.bgcolor) && event.active) {
        s['background-color'] = event.bgcolor
        s.color = luminosity(event.bgcolor) > 0.5 ? 'black' : 'white'
      }
      if (!event.active) {
        s.background = 'repeating-linear-gradient(45deg, ' + event.bgcolor + ' 0px, ' + event.bgcolor + ' 20px, #d3dfe8 20px, #d3dfe8 40px)'
      }
      if (timeStartPos) {
        s.top = timeStartPos(event.time) + 'px'
      }
      if (timeDurationHeight) {
        s.height = timeDurationHeight(event.duration) + 'px'
      }
      if (event.nbOverlappingTimes !== 1) {
        const width = (1 / event.nbOverlappingTimes) * 100
        s.width = width + '%'
        if (event.position !== 1) {
          s['margin-left'] = (event.position - 1) * width + '%'
        }
      }
      if (event.number === event.participants.length) {
        s.opacity = 0.50
      }
      s['z-index'] = event.zIndex
      s['align-items'] = 'flex-start'
      return s
    },
    getTimeSlots (dt) {
      const timeSlots = []
      const todayTimeSlots = this.timeSlots.filter(function (el) {
        return el.date === dt
      })
      todayTimeSlots.sort((a, b) => (QCalendar.parsed(a.date + ' ' + a.time) > QCalendar.parsed(b.date + ' ' + b.time)) ? 1 : ((QCalendar.parsed(a.date + ' ' + a.time) < QCalendar.parsed(b.date + ' ' + b.time)) ? -1 : 0))
      for (let i = 0; i < todayTimeSlots.length; ++i) {
        if (todayTimeSlots[i].time) {
          if (todayTimeSlots.length > 0) {
            // check for overlapping times
            todayTimeSlots[i].position = 1
            todayTimeSlots[i].nbOverlappingTimes = 1
            const startTime = QCalendar.parsed(todayTimeSlots[i].date + ' ' + todayTimeSlots[i].time)
            const endTime = QCalendar.addToDate(startTime, { minute: todayTimeSlots[i].duration })
            for (let j = 0; j < todayTimeSlots.length; ++j) {
              if (todayTimeSlots[i].id === todayTimeSlots[j].id) {
                // pass
              } else if (todayTimeSlots[j].time) {
                var added = false
                const startTime2 = QCalendar.parsed(todayTimeSlots[j].date + ' ' + todayTimeSlots[j].time)
                const endTime2 = QCalendar.addToDate(startTime2, { minute: todayTimeSlots[j].duration })
                if (QCalendar.isBetweenDates(startTime, startTime2, endTime2, true) && !QCalendar.compareDateTime(startTime, endTime2)) {
                  if (!QCalendar.compareTimestamps(startTime, startTime2) || todayTimeSlots[i].id > todayTimeSlots[j].id) {
                    todayTimeSlots[i].position += 1
                  }
                  todayTimeSlots[i].nbOverlappingTimes += 1
                  added = true
                }
                if (QCalendar.isBetweenDates(endTime, startTime2, endTime2, true) && !QCalendar.compareDateTime(endTime, startTime2)) {
                  if (added === false) {
                    added = true
                    todayTimeSlots[i].nbOverlappingTimes += 1
                  }
                }
              }
            }
            timeSlots.push(todayTimeSlots[i])
          }
        }
      }
      // order by duration and put z-index
      todayTimeSlots.sort((a, b) => (a.duration < b.duration) ? 1 : (a.duration > b.duration) ? -1 : 0)
      for (let i = 0; i < todayTimeSlots.length; ++i) {
        todayTimeSlots[i].zIndex = i + 1
      }
      return timeSlots
    },
    filterTimeSlots (timeSlots, dt, time) {
      const filteredTimeSlots = []
      const todayTimeSlots = this.timeSlots.filter(function (el) {
        return el.date === dt
      })
      const dateTime = QCalendar.parsed(dt + ' ' + time)
      for (let i = 0; i < todayTimeSlots.length; ++i) {
        const startTime = QCalendar.parsed(todayTimeSlots[i].date + ' ' + todayTimeSlots[i].time)
        const endTime = QCalendar.addToDate(startTime, { minute: todayTimeSlots[i].duration })
        if (QCalendar.isBetweenDates(dateTime, startTime, endTime, true)) {
          filteredTimeSlots.push(todayTimeSlots[i])
        }
      }
      return filteredTimeSlots.sort((a, b) => (QCalendar.parsed(a.date + ' ' + a.time) > QCalendar.parsed(b.date + ' ' + b.time)) ? 1 : ((QCalendar.parsed(a.date + ' ' + a.time) < QCalendar.parsed(b.date + ' ' + b.time)) ? -1 : 0))
    },
    showRegisterDialog (event, timestamp) {
      if (this.type !== 'admin' && this.today <= timestamp.date) {
        return this.$q
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
            id: event.id,
            userID: this.userID,
            title: event.title,
            weekday: this.weekdayFormatter(timestamp, false),
            day: this.dayFormatter(timestamp, false),
            month: this.monthFormatter(timestamp, false),
            year: this.yearFormatter(timestamp, false),
            startTime: event.time,
            endTime: QCalendar.getTime(QCalendar.addToDate(QCalendar.parsed(event.date + ' ' + event.time), { minute: event.duration })),
            number: event.number,
            participants: event.participants
            // ...more.props...
          })
          .onOk(() => {
            this.$apollo.queries.timeSlots.refetch()
          })
          .onCancel(() => {
            console.log('Cancel')
          })
          .onDismiss(() => {
            console.log('Called on OK or Cancel')
          })
      }
      return null
    },
    progressBarValue (event) {
      return (event.participants.length / event.number)
    },
    colorProgressBar (event) {
      const progress = this.progressBarValue(event)
      if (progress < 0.5) {
        return 'red'
      } else if (progress >= 0.5 && progress < 0.8) {
        return 'orange'
      } else {
        return 'primary'
      }
    },
    roundTime (time) {
      const timeSplit = time.split(':')
      const hour = timeSplit[0]
      var minutes = parseInt(timeSplit[1])
      if (minutes < 15) {
        minutes = '00'
      } else if (minutes>=15 && minutes<30){
        minutes = '15'
      } else if (minutes>=30 && minutes<45 ){
        minutes = '30'
      } else {
        minutes = '45'
      }
      return hour + ':' + minutes
    },
    onClickTimeDialog (data) {
      if (this.type === 'admin' && this.today <= data.scope.timestamp.date) {
        const date = data.scope.timestamp.date
        const time = this.roundTime(data.scope.timestamp.time)
        return this.$q
          .dialog({
            component: AddTimeSlotDialog,

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
            date: date,
            time: time,
            timeSlots: this.filterTimeSlots(this.timeSlots, date, time)
            // ...more.props...
          })
          .onOk(() => {
            this.$apollo.queries.timeSlots.refetch()
          })
          .onCancel(() => {
            console.log('Cancel')
          })
          .onDismiss(() => {
            console.log('Called on OK or Cancel')
          })
      }
      return null
    }
  },
  computed: {
    disabledBefore () {
      // find the monday of this week
      let ts = QCalendar.parseTimestamp(this.today)
      ts = QCalendar.addToDate(ts, { day: -1 })
      return ts.date
    },
    eventsMap () {
      const map = {}
      this.events.forEach((event) => (map[event.date] = map[event.date] || []).push(event))
      return map
    }
  }
}
</script>

<style lang="sass" scoped>
.my-text-caption
  font-size: 0.7rem
  font-weight: 400
  line-height: .75rem !important
  letter-spacing: 0.03333em

.title-bar
  width: 100%
  height: 70px
  background: #9c27b0
  display: flex
  flex-direction: row
  flex: 1

.direction-button
  background: #9c27b0
  color: white
  z-index: 20

.selected-date
  color: #9c27b0
  background: white

.my-event
  width: 100%
  position: absolute
  font-size: 12px

.full-width
  left: 0
  width: 100%

.left-side
  left: 0
  width: 49.75%

.right-side
  left: 50.25%
  width: 49.75%
</style>
