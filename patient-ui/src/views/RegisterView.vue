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
                  v-model="registerForm.email"
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
                <div v-if="passwordError" class="alert alert-danger">
                  {{ passwordErrorMessage }}
                </div>
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
export default {
  name: 'RegisterPage',
  data() {
    return {
      registerForm: {
        email: '',
        password: '',
        confirmPassword: ''
      },
      passwordError: false,
      passwordErrorMessage: ''
    }
  },
  methods: {
    async handleRegister() {
      console.log(this.registerForm)
      // Validate passwords match, etc.
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.passwordError = true
        this.passwordErrorMessage = 'Passwords do not match.'
        return
      }
      this.passwordError = false // Reset error state before the API call

      // API call to backend to register the user
      try {
        // We need to replace with an actual API call
        const response = await this.$http.post('/api/register', this.registerForm)
        // Handle response, possibly autologin and redirect to home
      } catch (error) {
        // Handle error, perhaps show message to the user
      }
    }
  }
}
</script>
