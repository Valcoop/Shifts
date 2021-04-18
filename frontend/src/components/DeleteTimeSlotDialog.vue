<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-actions align="right">
        <q-btn icon="close" flat round dense @click="onCancelClick" />
      </q-card-actions>
      <q-card-section>
        <div align="center"><q-icon color='primary' name='fas fa-exclamation-triangle' size='44px' /></div>
        <h6>Vous êtes sur le point de vous désinscrire du créneau <span style="color: #268381">{{ title }}</span> du <span style="color: #268381">{{ weekday }} {{ day }} {{ month }} {{ year }}</span> de <span style="color: #268381">{{ startTime }}</span> à <span style="color: #268381">{{ endTime }}</span></h6>
        <q-select filled v-model="motif" :options="motifs" label="Motif" :rules="[val => !!val || 'Champ obligatoire']"/>
        <q-input
          v-model="details"
          filled
          type="textarea"
          label="Détails"
          shadow-text="Champ obligatoire pour le motif Autres"
          :rules="[val => motif === 'Autres' ? !!val : 1  || 'Champ obligatoire quand le motif est Autres']"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Confirmer" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    id: Number,
    userId: Number,
    title: String,
    weekday: String,
    day: String,
    month: String,
    year: String,
    startTime: String,
    endTime: String,
    number: Number
  },
  data () {
    return {
      motifs: ['Maladie', 'Autres'],
      motif: null,
      details: null
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
      if (this.motif === null) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: 'Vous devez selectionner un motif'
        })
      } else if (this.motif === 'Autres' && this.details === null) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: 'Vous devez renseigner un détail lorsque le motif est Autres'
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
          message: 'Vous etes désinscrit'
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
