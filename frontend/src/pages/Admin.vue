<template>
  <div class="q-pa-md">
    <div class="container text-right">
      <q-btn class="glossy" rounded color="primary" icon="fas fa-cogs" label="Panneau de configuartion" @click="showConfigPanelDialog()"/>
    </div>
    <week v-bind:active="active" type="admin"/>
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
      active: null
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
