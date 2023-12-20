<template>
    <div class="m-5">
        <h1> Welcome back, {{ username }}! </h1>
        <div class="user-info-container p-3">
            <UserInfoItem :userInfo="userInfo"></UserInfoItem>
        </div>

        <!-- SUB-SECTIONS -->
        <div class="sub-sections mt-4">
            <nav>
                <div class="nav nav-tabs" id="nav-tab" role="tablist">
                    <button class="nav-link active" id="nav-appointments-tab" data-bs-toggle="tab"
                        data-bs-target="#nav-appointments" type="button" role="tab" aria-controls="nav-appointments"
                        aria-selected="true">Your Appointments</button>
                    <button class="nav-link" id="nav-preferences-tab" data-bs-toggle="tab" data-bs-target="#nav-preferences"
                        type="button" role="tab" aria-controls="nav-preferences" aria-selected="false">Your
                        Preferences</button>
                </div>
            </nav>
            <div class="tab-content p-5" id="nav-tabContent">
                <div class="tab-pane fade show active" id="nav-appointments" role="tabpanel"
                    aria-labelledby="nav-appointments-tab" tabindex="0">
                    <div class="container text-center d-flex justify-content-center justify-content-md-start">
                        <div class="row">
                            <div class="col m-2" v-for="(appointment, index) in userInfo['appointments']" :key="index">
                                <AppointmentItem :timeslotId="appointment"></AppointmentItem>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="nav-preferences" role="tabpanel" aria-labelledby="nav-preferences-tab"
                    tabindex="0">
                    <div class="your-preferences">
                        <!-- EDIT PREFERENCES PAGE HERE -->
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
        </div>
    </div>
</template>

<script>
import AppointmentItem from '@/components/AppointmentItem.vue';
import UserInfoItem from '@/components/UserInfoItem.vue';

export default {
    components: {
        AppointmentItem,
        UserInfoItem
    },
    props: {
        username: String
    },
    data() {
        return {
            getNotifications: true,
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
.user-info-container {
    background-color: var(--secondary-color);
}

.schedule-container {
    display: flex;
}

.day {
    margin-right: 20px;
}

.time-checkbox {
    margin-bottom: 5px;
}

.nav-link {
    color: white;
    background-color: var(--accent-secondary);
}

/* Media query for adjusting justify-content */
@media screen and (min-width: 1080px) {
  .justify-content-md-start {
    justify-content: start !important;
  }
}
</style>
