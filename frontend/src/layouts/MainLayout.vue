<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="error === null"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Valcoop Planning
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="error === null"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1 text-primary text-bold"
    >
      <q-list>
        <q-item to="/" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="dashboard"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Accueil</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/planning" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="far fa-calendar-alt"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Planning</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isAdmin==true" to="/admin" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="fas fa-tools"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Admin</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view v-if="error === null"/>
      <div v-else class="text-center vertical-middle">
        <h1>Bienvenue sur le Planning Valcoop</h1>
        <q-btn class="glossy" rounded color="primary" label="Se connecter" size="xl" @click="login()"/>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { USER_QUERY } from './../apollo/graphql'

export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false,
      error: null
    }
  },
  apollo: {
    isAdmin: {
      query: USER_QUERY,
      fetchPolicy: 'cache-and-network',
      error (error) {
        this.error = JSON.stringify(error.message)
      },
      update: data => {
        return data.currentUser.isAdmin
      }
    }
  },
  methods: {
    login () {
      window.location.href = 'http://localhost:3000/auth/login'
    }
  }
}
</script>
