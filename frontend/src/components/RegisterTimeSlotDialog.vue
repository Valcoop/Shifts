<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-actions align="right">
        <q-btn icon="close" flat round dense @click="onCancelClick" />
      </q-card-actions>
      <q-card-section>
        <h6 v-if="number != participants.length">Vous allez vous inscrire au créneau <span style="color: #268381">{{ title }}</span> du <span style="color: #268381">{{ weekday }} {{ day }} {{ month }} {{ year }}</span> de <span style="color: #268381">{{ startTime }}</span> à <span style="color: #268381">{{ endTime }}</span></h6>
        <h6 v-else>Ce créneau est actuellement complet</h6>
        <div class="q-pb-xs">Participants actuels : {{ participants.length }}/{{ number }}</div>
        <div v-if="participants.length > 0" class="q-pl-md q-pr-md q-pb-md">
          <q-btn size="10px" v-for="participant in participants" v-bind:key="participant" round color="grey" icon="fas fa-user-alt" class="q-ma-sm" disable>
            <q-tooltip content-class="bg-accent">{{ participant }}</q-tooltip>
          </q-btn>
        </div>
        <q-form v-if="number != participants.length" class="q-gutter-md">
          <q-input
            filled
            v-model="name"
            label="Votre nom et prénom"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Champ obligatoire']"
          />

          <q-input
            filled
            v-model="phone"
            label="Phone"
            mask="## ## ## ## ##"
            unmasked-value
          />
      </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-if="number != participants.length" color="primary" label="Inscription" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    title: String,
    weekday: String,
    day: String,
    month: String,
    year: String,
    startTime: String,
    endTime: String,
    number: Number,
    participants: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      name: null,
      phone: null
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
      if (this.name === null || this.phone === null) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: 'Vous devez remplir les deux champs nom et numéro de téléphone'
        })
      } else {
        // on OK, it is REQUIRED to
        // emit "ok" event (with optional payload)
        // before hiding the QDialog
        this.$emit('ok')
        // or with payload: this.$emit('ok', { ... })

        // then hiding dialog
        this.hide()

        // Notify
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Vous etes inscrit'
        })
      }
    },

    onCancelClick () {
      // we just need to hide dialog
      this.hide()

      this.name = null
      this.phone = null
    }
  }
}
</script>

<style>
</style>
