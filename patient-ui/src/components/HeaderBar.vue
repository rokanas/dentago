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
                <NotificationItem v-for="notification in notifications"
                :key="notification._id"
                :category="notification.category"
                :message="notification.message"
                :timeslots="notification.timeslots"
                ></NotificationItem>
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
</style>

<script>
import NotificationItem from '@/components/NotificationItem.vue'

export default {
    data() {
        return {
            username: 'ratKing', // placeholder value
            // TODO: remove placeholder values
            notifications: [
                {_id: 1, category: "CANCEL", message: "Appointment on Sunday, December 10th 2023 has been cancelled by dentist John.", timeslots: ["123rasd21dsad"]},
                {_id: 2, category: "CANCEL", message: "Appointment on Monday, December 11th 2023 has been cancelled by dentist John.", timeslots: ["123rasd21dsad"]},
                {_id: 3, category: "RECOMMENDATION", message: "The following appointments have been recommended to you: ", timeslots: ["123rasd21dsad", "12dsa2sasa"]},
            ]
        }
    },
    components: {
        NotificationItem
    },
    created() {
        this.getNotifications()
    },
    methods: {
        redirect(){
            this.$router.push('/user/' + this.username);
        }
    }
}
</script>