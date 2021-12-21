import { createRouter, createWebHistory } from 'vue-router'
import Studio from '../views/Studio.vue'

const routes = [
  {
    path: '/',
    name: 'Studio',
    component: Studio
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
