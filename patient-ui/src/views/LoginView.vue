@import './base.css';

<template>
  <div class="container-fluid mt-5 mb-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <h2 class="card-header text-center">Login</h2>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="loginEmail" class="form-label">Email address</label>
                <input
                  type="email"
                  class="form-control"
                  id="loginEmail"
                  v-model="loginForm.email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="loginPassword" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="loginPassword"
                  v-model="loginForm.password"
                  required
                />
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
          <div class="card-footer text-center">
            <small
              >Don't have an account? <router-link to="/register">Register Now</router-link></small
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      loginForm: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      console.log(this.loginForm)
      try {
        // We need to replace with the actual API call
        const response = await this.$http.post('/api/login', this.loginForm)
        // Handle response, store token, redirect, etc.
      } catch (error) {
        // Handle error, show message, etc.
      }
    }
  }
}
</script>
<style scoped></style>
