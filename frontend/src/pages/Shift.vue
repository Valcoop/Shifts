<template>
  <div class="q-pa-md">
    <week v-bind:timeSlots="timeSlots" type="shift" />
  </div>
</template>

<script>
import Week from 'components/Week.vue'

export default {
  name: 'Shift',
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
          participants: ['Dupont Nicole', 'Martin Kevin'],
          active: true
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
          active: true
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
  }
}
</script>
