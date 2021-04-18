<template>
  <div class="q-pa-md">
    <div class="container text-right">
      <q-btn class="glossy" rounded color="primary" icon="fas fa-cogs" label="Panneau de configuartion" @click="showConfigPanelDialog()"/>
    </div>
    <week v-bind:timeSlots="timeSlots" type="admin"/>
  </div>
</template>

<script>
import ConfigPanelDialog from '../components/ConfigPanelDialog.vue'
import Week from '../components/Week.vue'

export default {
  name: 'Admin',
  components: { Week },
  data () {
    return {
      timeSlots: [
        {
          id: 1,
          title: 'Meeting',
          details: 'Time to pitch my idea to the company',
          date: '2021-03-28',
          time: '10:00',
          duration: 120,
          bgcolor: 'red',
          icon: 'fas fa-handshake',
          number: 5,
          participants: [],
          active: false
        },
        {
          id: 2,
          title: 'Test2',
          details: 'Company is paying!',
          date: '2021-04-01',
          time: '18:30',
          duration: 30,
          bgcolor: 'teal',
          icon: 'fas fa-hamburger',
          number: 2,
          participants: ['Dupont Nicole', 'Martin Kevin'],
          active: false
        },
        {
          id: 3,
          title: 'Lunch',
          details: 'Company is paying!',
          date: '2021-04-01',
          time: '11:30',
          duration: 90,
          bgcolor: 'teal',
          icon: 'fas fa-hamburger',
          number: 3,
          participants: [],
          active: true
        },
        {
          id: 4,
          title: 'Test',
          details: 'Company is paying!',
          date: '2021-04-01',
          time: '08:30',
          duration: 60,
          bgcolor: 'teal',
          icon: 'fas fa-hamburger',
          number: 4,
          participants: ['Dupont Nicole'],
          active: true
        },
        {
          id: 5,
          title: 'Visit mom',
          details: 'Always a nice chat with mom',
          date: '2021-04-01',
          time: '11:00',
          duration: 90,
          bgcolor: 'blue-grey',
          icon: 'fas fa-car',
          number: 1,
          participants: [],
          active: true
        },
        {
          id: 6,
          title: 'Visit me',
          details: 'Always a nice chat with mom',
          date: '2021-04-01',
          time: '10:00',
          duration: 120,
          bgcolor: 'blue-grey',
          icon: 'fas fa-car',
          number: 2,
          participants: ['Dupont Nicole', 'Martin Kevin'],
          active: true
        },
        {
          id: 7,
          title: 'Hello',
          details: 'Always a nice chat with mom',
          date: '2021-04-01',
          time: '08:00',
          duration: 120,
          bgcolor: 'blue-grey',
          icon: 'fas fa-car',
          number: 5,
          participants: ['Dupont Nicole', 'Martin Kevin', 'D Nicole', 'M Kevin'],
          active: true
        }
      ]
    }
  },
  methods: {
    showConfigPanelDialog () {
      return this.$q
        .dialog({
          component: ConfigPanelDialog,

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
          timeSlots: this.timeSlots

          // ...more.props...
        })
        .onOk(() => {
          console.log('OK')
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
