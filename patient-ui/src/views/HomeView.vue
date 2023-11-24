<template>
  <div>
    <HeaderBar></HeaderBar>
    <div class="banner">
      Welcome to Dentago! <br>
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      <br>
    </div>
    <div>
      Google Maps <br>
      <iframe width="600" height="450" style="border:0" loading="lazy" allowfullscreen :src=maps_url></iframe>
    </div>
    <div id="footer" class="banner">
      <div>
        <img src="../assets/email_material_icon.png">
        dentago@gmail.com
      </div>

      <div>
        <img src="../assets/phone_material_icon.png">
        +461234567890
      </div>

      <div>
        <img src="../assets/twitter_icon.png">
        @dentago
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner{
  display: flex;
  background-color: bisque;
  padding: 2%;
}

#footer.banner{
  justify-content: space-evenly;
}
</style>

<script>
import HeaderBar from '@/components/HeaderBar.vue'

export default {
  data() {
    return {
      maps_url: 'https://www.google.com/maps/embed/v1/view?zoom=10&center=57.7089%2C11.9746&key=' + import.meta.env.VITE_API_KEY
    }
  },
  components: {
    HeaderBar
  }
}
</script>

