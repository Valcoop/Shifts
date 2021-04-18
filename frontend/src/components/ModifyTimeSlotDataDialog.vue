<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-actions align="right">
        <q-btn icon="close" flat round dense @click="onCancelClick" />
      </q-card-actions>
      <q-card-section>
        <h6 >Vous allez modifier vos informations pour le créneau <span style="color: #268381">{{ title }}</span> du <span style="color: #268381">{{ weekday }} {{ day }} {{ month }} {{ year }}</span> de <span style="color: #268381">{{ startTime }}</span> à <span style="color: #268381">{{ endTime }}</span></h6>
        <q-form class="q-gutter-md">
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
        <q-btn color="primary" label="Modifier" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    id: Number,
    title: String,
    weekday: String,
    day: String,
    month: String,
    year: String,
    startTime: String,
    endTime: String,
    name: String,
    phone: String
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
          message: 'Vos données ont été mis à jour'
        })
      }
    },

    onCancelClick () {
      // we just need to hide dialog
      this.hide()
    }
  }
}
</script>

<style>
</style>
