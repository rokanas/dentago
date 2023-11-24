<!-- favicon from https://www.flaticon.com/free-icon/tooth-whitening_1060876 -->

<template>
  <div>
    <HeaderBar></HeaderBar>
    <div class="banner">
      <h1> Welcome to Dentago! </h1>
      <p> {{ fillertext }} </p>
    </div>
    <div>
      Google Maps <br>
      <iframe width="600" height="450" style="border:0" loading="lazy" allowfullscreen :src=maps_url></iframe>
    </div>
    <div id="footer" class="banner">
      <ContactInfoItem
      img_src = "src/assets/email_material_icon.png"
      text = "dentago@gmail.com"
      ></ContactInfoItem>

      <ContactInfoItem
      img_src = "src/assets/phone_material_icon.png"
      text = "+461234567890"
      ></ContactInfoItem>

      <ContactInfoItem
      img_src = "src/assets/twitter_icon.png"
      text = "@dentago"
      ></ContactInfoItem>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 400%;
  color:#FFA686;
  filter: drop-shadow(1px 3px #32292F);
}
.banner{
  background-color: #FFF0A8;
  padding: 2%;
}

#footer{
  justify-content: space-evenly;
  display: flex;
}
</style>

<script>
import HeaderBar from '@/components/HeaderBar.vue'
import ContactInfoItem from '@/components/ContactInfoItem.vue'

export default {
  data() {
    return {
      maps_url: 'https://www.google.com/maps/embed/v1/view?zoom=10&center=57.7089%2C11.9746&key=' + import.meta.env.VITE_API_KEY,
      fillertext: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  },
  components: {
    HeaderBar,
    ContactInfoItem
  }
}
</script>

