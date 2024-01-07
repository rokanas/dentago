<template>
  <div class="container-fluid mt-5 mb-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <h2 class="card-header text-center">Register</h2>
          <div class="card-body">
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="registerEmail" class="form-label">Email address</label>
                <input
                  type="email"
                  class="form-control"
                  id="registerEmail"
                  v-model="registerForm.id"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <input
                  type="firstName"
                  class="form-control"
                  id="firstName"
                  v-model="registerForm.firstName"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <input
                  type="lastName"
                  class="form-control"
                  id="lastName"
                  v-model="registerForm.lastName"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="registerPassword" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="registerPassword"
                  v-model="registerForm.password"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="registerConfirmPassword" class="form-label">Confirm Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="registerConfirmPassword"
                  v-model="registerForm.confirmPassword"
                  required
                />
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">Register</button>
              </div>
            </form>
          </div>
          <div class="card-footer text-center">
            <small
              >Already have an account? <router-link to="/login">Login Here</router-link></small
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
  name: 'RegisterPage',
  data() {
    return {
      registerForm: {
        id: '',
        password: '',
        firstName: '',
        lastName: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    async handleRegister() {
      // Validate passwords match, etc.
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        alert('Passwords do not match!')
      } else {
        Api.post('/register', {
          id: this.registerForm.id,
          password: this.registerForm.password,
          firstName: this.registerForm.firstName,
          lastName: this.registerForm.lastName
        })
          .then((res) => {
            if (res.status === 201){
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
            this.registerForm = {}
            this.$router.push('/')
          })
          .catch((err) => {
            console.log(err)
          })
      }
    }
  }
}
</script>