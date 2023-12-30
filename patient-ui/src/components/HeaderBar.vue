<template>
    <div id="navbar">
        <button class="btn btn-link" @click="navigateTo('/')" data-toggle="tooltip" data-placement="bottom" title="Home">
            <span class="material-symbols-outlined">
                home
            </span>
        </button>

        <div class="dropdown">
            <button class="btn">
                <span v-if="notifications.length === 0" class="material-symbols-outlined">
                    notifications
                </span>
                <span v-else class="material-symbols-outlined">
                    notifications_unread
                </span>
            </button>
            <div class="dropdown-content">
                <NotificationItem v-for="notification in notifications" :key="notification._id"
                    :category="notification.category" :message="notification.message" :timeslots="notification.timeslots">
                </NotificationItem>
            </div>
        </div>


        <button class="btn btn-link" @click="redirect()" data-toggle="tooltip" data-placement="bottom" title="Profile">
            <span class="material-symbols-outlined">
                account_circle
            </span>
        </button>
    </div>
</template>


<style scoped>
#navbar {
    display: flex;
    background-color: #FFA686;
    filter: drop-shadow(0px 2px 2px #000000);
    justify-content: space-evenly;
    padding: 1%;
}

#title {
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
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
}

.dropdown:hover .dropdown-content {
    display: block;
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
                { _id: 1, category: "CANCEL", message: "Appointment on Sunday, December 10th 2023 has been cancelled by dentist John.", timeslots: ["123rasd21dsad"] },
                { _id: 2, category: "CANCEL", message: "Appointment on Monday, December 11th 2023 has been cancelled by dentist John.", timeslots: ["123rasd21dsad"] },
                { _id: 3, category: "RECOMMENDATION", message: "The following appointments have been recommended to you: ", timeslots: ["123rasd21dsad", "12dsa2sasa"] },
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
        navigateTo(route) {
            this.$router.push(route);
        },
        redirect() {
            this.$router.push('/user/' + this.username);
        },
        getNotifications() {
            // TODO
        }
    }
}
</script>

<style scoped>
.material-symbols-outlined {
    color: black;
    font-size: 1.8em;
    /* Adjust the size as needed */
    /* transition: transform 0.2s, color 0.2s; */
}

.material-symbols-outlined:hover {
    /* transform: scale(1.2); Adjust the scale factor as needed for the pop effect */
    color: #333;
    /* Darker shade of black for hover effect */
}
</style>
