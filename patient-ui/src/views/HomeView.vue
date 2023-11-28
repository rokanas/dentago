<!-- favicon from https://www.flaticon.com/free-icon/tooth-whitening_1060876 -->

<template>
  <div>
    <HeaderBar></HeaderBar>
    <div class="banner">
      <h1> Welcome to Dentago! </h1>
      <p> {{ fillertext }} </p>
    </div>
    <div>
      <br>
      Find clinics near you: <br><br>
      <GoogleMap :api-key=API_KEY style="width: 100%; height: 500px" :center="center" :zoom="13">
          <Marker v-for="clinic in clinics" :key="clinic.id" :options="{ position: clinic.location }">
            <InfoWindow>
              Clinic id: {{ clinic.id }} <br>
              Clinic booking page
              <BookingButton :clinicId="clinic.id"></BookingButton>
            </InfoWindow>
          </Marker>
      </GoogleMap>
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
import { defineComponent } from 'vue';
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";
import HeaderBar from '@/components/HeaderBar.vue'
import ContactInfoItem from '@/components/ContactInfoItem.vue'
import BookingButton from '../components/BookingButton.vue';

export default defineComponent ({
  components: {
    GoogleMap,
    // eslint-disable-next-line vue/no-reserved-component-names
    Marker,
    InfoWindow,
    HeaderBar,
    ContactInfoItem,
    BookingButton
  },
  data() {
    return {
      API_KEY: import.meta.env.VITE_API_KEY,
      center: {lat: 57.709182620250374, lng: 11.973550969507114},
      clinics: [
        {id: "1", name: "Folktandvården Järntorget", location: {lat: 57.70052343850043, lng: 11.946638869202163}},
        {id: "2", name: "Folktandvården Sannegården", location: {lat: 57.711070430807794, lng: 11.926897811890154}},
        {id: "3", name: "Skansen Kronan", location: {lat: 57.696894257429264, lng: 11.956279286523937}}
      ],
      fillertext: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  }
});
</script>

