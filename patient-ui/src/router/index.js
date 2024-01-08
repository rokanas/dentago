import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookingView from '../views/BookingView.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/book/:clinicId',
      name: 'book-appointments',
      component: BookingView,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/:username',
      name: 'profile',
      component: ProfileView,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    // Catch-all route for undefined routes
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ]
})

// TODO: sole this later
// Navigation guard to check authentication before navigating to certain routes
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Check if the user is authenticated (you can implement your own authentication check here)
    const isAuthenticated = localStorage.getItem("access-token");
    
    if (!isAuthenticated) {
      // If not authenticated, redirect to the login page
      next('/login');
    } else {
      // If authenticated, proceed with the navigation
      next();
    }
  } else {
    // For routes that do not require authentication, proceed with the navigation
    next();
  }
});

export default router
