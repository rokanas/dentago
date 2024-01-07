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
                <button type="submit" class="btn btn-primary" @click="handleLogin()">Login</button>
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
import { Api } from '../Api';

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
      Api.patch('/login', {
        id: this.loginForm.email,
        password: this.loginForm.password
      })
        .then((res) => {
          if (res.status === 200){
            localStorage.setItem("access-token", res.data.AccessToken)
            localStorage.setItem("refresh-token", res.data.Patient.refreshToken)
            localStorage.setItem("patientId", res.data.Patient._id)

            // TODO: Properly store the data
            const patientData = {
                "username": res.data.Patient.id,
                "firstName": res.data.Patient.firstName,
                "lastName": res.data.Patient.lastName,
              }

              localStorage.setItem("patientData", JSON.stringify(patientData));
          }
            this.loginForm = {}
            this.$router.push('/')
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
}
</script>
<style scoped></style>
