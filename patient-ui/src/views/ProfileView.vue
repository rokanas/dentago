<template>
    <div>
        <HeaderBar></HeaderBar>

        <h1> Welcome back, {{ username }}! </h1>

        <!-- TODO: Turn this into a component maybe -->

        <div class="user-info">
            <div>
                <label>Name: </label>
                <input type="text" v-model="userInfoTemp.firstName" :disabled="!isEditing"
                    :placeholder="userInfo['firstName']" />
            </div>
            <div>
                <label>Last Name: </label>
                <input type="text" v-model="userInfoTemp.lastName" :disabled="!isEditing"
                    :placeholder="userInfo['lastName']" />
            </div>
            <div>
                <label>Contact Info: </label>
                <input type="text" v-model="userInfoTemp.contactInfo" :disabled="!isEditing"
                    :placeholder="userInfo['contactInfo']" />
            </div>
            <button @click="toggleEdit">
                {{ !isEditing ? 'Edit' : 'Update' }}
            </button>
        </div>

        <div class="sub-sections">
            <!-- TODO: Use bootstrap to turn this into tabs -->
            <div class="your-appointments">
                <h2>Your upcoming appointments: </h2>
                <!-- TODO: Bootstrap this too -->
                <div v-for="(appointment, index) in userInfo['appointments']" :key="index">
                    <AppointmentItem :timeslotId="appointment"></AppointmentItem>
                </div>
                <div class="your-preferences">
                    <h2>Your preferences: </h2>
                    <div class="schedule-container">
                        <div v-for="(day, index) in preferredTimeWindow" :key="index" class="day">
                            <h4>{{ day.name }}</h4>
                            <div v-for="time in availableTimes" :key="time" class="time-checkbox">
                                <input type="checkbox" :id="`${day.name}-${time}`" :value="time" v-model="day.times" />
                                <label :for="`${day.name}-${time}`">{{ time }}</label>
                            </div>
                        </div>
                    </div>
                    <br>
                    <input type="checkbox" id="checkbox" v-model="getNotifications" />
                    <label for="checkbox"> Notify Me </label>

                    <button>Update preferences</button> <!--TODO: link this button to an API call -->
                </div>
            </div>
        </div>

        <!-- Display the selected data -->
        <!-- <div>
            Selected Time Slots:
            <pre>{{ preferredTimeWindow }}</pre>
        </div> -->
    </div>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue'
import AppointmentItem from '@/components/AppointmentItem.vue';

export default {
    components: {
        HeaderBar,
        AppointmentItem
    },
    props: {
        username: String
    },
    methods: {
        toggleEdit() {
            this.isEditing = !this.isEditing;
        }
    },
    data() {
        return {
            getNotifications: true,
            isEditing: false,
            userInfoTemp: { firstName: '', lastName: '', contactInfo: '' },
            userInfo: { firstName: 'Sapo', lastName: 'Reqlo', contactInfo: '+46694203255', appointments: ['657304e861d1c9f248318320', '657304e861d1c9f248318326'] },
            availableTimes: [
                '8:00', '9:00', '10:00', '11:00',
                '12:00', '13:00', '14:00', '15:00',
                '16:00', '17:00'
            ],
            preferredTimeWindow: [
                { name: 'Monday', times: [] },
                { name: 'Tuesday', times: [] },
                { name: 'Wednesday', times: [] },
                { name: 'Thursday', times: [] },
                { name: 'Friday', times: [] },
                { name: 'Saturday', times: [] },
                { name: 'Sunday', times: [] }
            ]
        };
    }
}
</script>

<style scoped>
.schedule-container {
    display: flex;
}

.day {
    margin-right: 20px;
}

.time-checkbox {
    margin-bottom: 5px;
}
</style>
