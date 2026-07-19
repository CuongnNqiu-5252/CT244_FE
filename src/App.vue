<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'

const authStore = useAuthStore()
const theme = useTheme()

onMounted(() => {
  if (authStore.token) {
    authStore.checkAuth()
  }

  // Khôi phục theme từ localStorage
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.global.name.value = savedTheme
  }
})
</script>