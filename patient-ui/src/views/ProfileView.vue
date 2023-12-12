<template>
    <div>
        <HeaderBar></HeaderBar>

        <h1> Welcome back! </h1>

        <div class="userInfo">
            <h2> {{ username }}</h2>
            <h3> Name: {{ userInfo['firstName'] }}</h3>
            <h3> Last Name: {{ userInfo['lastName'] }}</h3>
            <h3> Contact Info: {{ userInfo['contactInfo'] }}</h3>
        </div>
        <div class="yourAppointments">
            <h2>Your upcoming appointments:</h2>

            <div v-for="(appointment, index) in userInfo['appointments']" :key="index">
                <!-- {{ appointment }} -->
                <AppointmentItem :timeslotId="appointment"></AppointmentItem>
            </div>
        </div>
        <div class="preferences">
            <h2>Preferences</h2>
            <h3>Preferred Time Window</h3>

            <div>Preferred time window: {{ preferredTimeWindow }}</div>

            <select v-model="preferredTimeWindow" multiple>
                <option>8 A.M.</option>
                <option>9 A.M.</option>
                <option>10 A.M.</option>
                <option>11 A.M.</option>
                <option>12 A.M.</option>
                <option>13 A.M.</option>
                <option>14 A.M.</option>
                <option>15 A.M.</option>
                <option>16 A.M.</option>
                <option>17 A.M.</option>
            </select>

            <input type="checkbox" id="checkbox" v-model="getNotifications" />
            <label for="checkbox"> Notify Me </label>

            <button>Update preferences</button> // TODO: link this button to an API call

        </div>

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
    data() {
        return {
            preferredTimeWindow: [],
            userInfo: { firstName: 'Sapo', lastName: 'Reqlo', contactInfo: '+46694203255', appointments: ['657304e861d1c9f248318320', '657304e861d1c9f248318326'] }
        }
    }
}
</script>
