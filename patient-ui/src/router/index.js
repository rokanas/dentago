import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookingView from '../views/BookingView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/book/:clinicId',
      name: 'book-appointments',
      component: BookingView,
      props: true
    },
    {
      path: '/user/:username',
      name: 'profile',
      component: ProfileView,
      props: true
    }
  ]
})

export default router
