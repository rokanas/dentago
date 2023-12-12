<template>
    <div id="navbar">
        <router-link id="title" to="/"> Dentago </router-link>
        <div class="dropdown">
            <button class="btn">
                <!-- TODO: Add different icon for unread notifications -->
                <img src="../assets/notification.png">
                Notifications
            </button>
            <div class="dropdown-content">
                <Notification v-for="notification in notifications"
                :key="notification._id"
                :title="notification.title"
                :description="notification.description"
                ></Notification>
            </div>
        </div>
        <button class="btn" @click="redirect()"> Profile </button>
    </div>
</template>

<style scoped>
#navbar{
    display: flex;
    background-color: #FFA686;
    filter: drop-shadow(0px 2px 2px #000000);
    justify-content: space-evenly;
    padding: 1%;
}

#title{
    font-size: larger;
}

.dropdown {
    position: relative;
    display: inline-block;
}

.btn {
  background-color: #ff865a;
  padding: 12px;
  font-size: medium;
  /* border: none; */
  cursor: pointer;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: beige;
  min-width: 300px;
  max-height: 300px;
  text-overflow: clip;
  overflow: scroll;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown:hover .dropdown-content {
  display: block;
}
</style>

<script>
import Notification from '@/components/Notification.vue'

export default {
    data() {
        return {
            username: 'ratKing', // placeholder value
            // TODO: remove placeholder values
            notifications: [
                {_id: 1, title: "APPOINTMENT CANCELLED", description: "Appointment on Sunday, December 10th 2023 has been cancelled by dentist John."},
                {_id: 2, title: "APPOINTMENT CONFIRMED", description: "Appointment booking confirmed!"},
                {_id: 3, title: "APPOINTMENT CONFIRMED", description: "Appointment booking confirmed!"},
                {_id: 4, title: "APPOINTMENT CONFIRMED", description: "Appointment booking confirmed!"},
                {_id: 5, title: "APPOINTMENT CANCELLED", description: "Appointment on Monday, December 11th 2023 has been cancelled by dentist John."},
                {_id: 6, title: "APPOINTMENT CONFIRMED", description: "Appointment booking confirmed!"},
            ]
        }
    },
    components: {
        Notification
    },
    created() {
        this.getNotifications()
    },
    methods: {
        redirect(){
            this.$router.push('/user/' + this.username);
        },
        getNotifications(){
            // TODO
        }
    }
}
</script>