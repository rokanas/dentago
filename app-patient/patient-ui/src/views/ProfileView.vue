<template>
    <div class="m-5">
        <h1> Welcome back, {{ firstName + ' ' + lastName }}! </h1>
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
                    <button class="nav-link" id="nav-recommendations-tab" data-bs-toggle="tab"
                        data-bs-target="#nav-recommendations" type="button" role="tab" aria-controls="nav-recommendations"
                        aria-selected="false" @click="getRecommendations">Your
                        Recommendations</button>
                </div>
            </nav>
            <div class="tab-content p-5" id="nav-tabContent">
                <div class="tab-pane fade show active" id="nav-appointments" role="tabpanel"
                    aria-labelledby="nav-appointments-tab" tabindex="0">
                    <div class="container text-center d-flex justify-content-center justify-content-md-start">
                        <div class="row">
                            <div v-if="appointments.length == 0" style="margin-bottom: 20rem;">
                                <h3>No appointments</h3>
                            </div>

                            <div v-else class="col m-2" v-for="(appointment, index) in appointments" :key="index">
                                <!-- CARD -->
                                <div class="card card-container" style="width: 18rem;" data-bs-toggle="modal"
                                    data-bs-target="#appointmentModal">
                                    <div class="card-header">
                                        <h5 href="#" class="card-title"> {{ appointment.clinic.name }} </h5>
                                    </div>
                                    <div class="card-body">
                                        <h6> {{ appointment.dentist.name }} </h6>
                                    </div>
                                    <div class="card-footer">
                                        {{ formatDateTime(appointment.startTime) }}
                                    </div>
                                </div>

                                <!-- MODAL -->
                                <div class="modal fade" id="appointmentModal" tabindex="-1"
                                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLabel">
                                                    Do you want to cancel your appointment?
                                                </h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                    aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <p>{{ appointment.clinic.name }} with {{ appointment.dentist.name }}</p>
                                                <p>{{ formatDateTime(appointment.startTime) }}</p>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal"
                                                    @click="confirmCancellation(appointment._id, patientId, appointment.clinic._id)">
                                                    Yes
                                                </button>
                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="nav-preferences" role="tabpanel" aria-labelledby="nav-preferences-tab"
                    tabindex="0">
                    <div class="your-preferences">
                        <!-- EDIT PREFERENCES PAGE HERE -->
                        <div class="container">
                            <div class="row justify-content-center">
                                <h3 id="schedule-text">Select your preferred schedule</h3>
                                <div class="col day m-2 rounded" v-for="(times, day) in preferredTimeWindow" :key="day">
                                    <h4 id="day-text">{{ day }}</h4>
                                    <div id="day-thingy">
                                        <div class="m-1" v-for="time in availableTimes" :key="time">
                                            <input class="form-check-input me-2" type="checkbox" :id="`${day}-${time}`"
                                                :value="time" v-model="preferredTimeWindow[day]"
                                                @change="sortPreferredTimes(day)" />
                                            <label :for="`${day}-${time}`">{{ formatTime(time) }}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row justify-content-end">
                                <div class="col">
                                    <button class="btn btn-primary m-2" @click="updatePreferences">Update
                                        preferences
                                    </button>

                                    <!--TODO: link this button to an API call -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="nav-recommendations" role="tabpanel"
                    aria-labelledby="nav-recommendations-tab" tabindex="0">
                    <h1>Your Recommendations</h1>

                    <div v-for="timeslot in recommendedTimeslots" :key="timeslot">
                        <div class="card card-container" style="width: 18rem;">
                        <div class="card-body">
                            <h6> {{ 'Clinic: ' + timeslot.clinic.name }} </h6>
                            <h6> {{ 'Dentist: ' + timeslot.dentist.name }} </h6>
                            <h6> {{ formatDateTime(timeslot.startTime) }} </h6>
                            <button @click="book(timeslot._id, patientId, timeslot.clinic._id)">Book</button>
                        </div>
                    </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Api } from '@/Api.js'

export default {
    props: {
        username: String
    },
    data() {
        return {
            firstName: JSON.parse(localStorage.getItem("patientData")).firstName,
            lastName: JSON.parse(localStorage.getItem("patientData")).lastName,
            patientId: JSON.parse(localStorage.getItem("patientData"))._id,
            getNotifications: true,
            // appointments: ['657304e861d1c9f248318320', '657304e861d1c9f248318326'],
            appointments: [],
            availableTimes: [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
            ],
            preferredTimeWindow: {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
                Saturday: [],
                Sunday: []
            },
            recommendedTimeslots: []
        };
    },
    created() {
        this.getAppointments()
    },
    methods: {
        sortPreferredTimes(day) {
            this.preferredTimeWindow[day].sort();
        },
        async getRecommendations() {
            console.log('Get recommendations');
            Api.get('/patients/' + this.patientId + '/recommendations', { headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` } })
                .then((res) => {
                    this.recommendedTimeslots = res.data.Timeslots;
                    // console.log(res);
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        formatTime(time) {
            /**
             * Formats time for a proper display in the UI
             * For example 8 -> 08:00 while 10 -> 10:00
             */
            return `${time < 10 ? `0${time}` : time}:00`;
        },
        async getAppointments() {
            Api.get('/patients/' + this.patientId + '/timeslots', { headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` } })
                .then((res) => {
                    this.appointments = res.data.Timeslots;
                    // console.log(this.appointments);
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        updatePreferences() {
            Api.patch('/patients/' + this.patientId + '/preferences',
                { preferredTimeWindow: this.preferredTimeWindow },
                { headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` } })
                .then((res) => {
                    // console.log(res)
                    alert('success!')
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        confirmCancellation(timeslotId, patientId, clinicId) {
            Api.patch('/clinics/' + clinicId + '/timeslots/' + timeslotId, {
                instruction: 'CANCEL',
                patient_id: patientId
            }, { headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` } })
                .then(response => {
                    if (response.data.Message === 'FAILURE') {
                        alert('This appointment has already been booked by someone else.');
                    }
                    // this.$router.push('/');
                    this.getAppointments();
                }).catch(error => {
                    alert('Something went wrong. Please try again.');
                    console.log(error);
                })
            this.cancelBookingPressed += 1;
        },
        formatDateTime(dateTimeString) {
            const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            const dateTime = new Date(dateTimeString);
            return dateTime.toLocaleString('en-US', options);
        },
        book(timeslotId, patientId, timeslotClinic){
            Api.patch('/clinics/' + timeslotClinic + '/timeslots/' + timeslotId, {
                instruction: 'BOOK',
                patient_id: patientId
            }, {headers: {Authorization: `Bearer ${localStorage.getItem("access-token")}`}})
            .then(response => {
                    if (response.data.Message === 'FAILURE'){
                        alert('This appointment has already been booked by someone else.');
                        this.$router.go()                   // Refresh the page to force a timeslot data update
                    } else {
                        alert('Booking successful!');
                        const username = JSON.parse(localStorage.getItem("patientData")).id;

                        this.$router.push(`/user/${username}`);
                        this.getAppointments();
                        this.getRecommendations();
                    }
                    // console.log(response);
                }).catch(error => {
                    alert('Something went wrong. Please try again.');
                    console.log(error);
                })
        },
    }
}
</script>

<style scoped>
.user-info-container {
    background-color: var(--secondary-color);
}

.day {
    background-color: var(--primary-color);
    box-shadow: 2.5px 2.5px 2.5px rgba(0, 0, 0, 0.5);
    width: 10em;
}

#schedule-text {
    text-align: center;
    font-weight: 300;
    font-size: 2rem;
}

#day-text {
    text-align: center;
    font-weight: 300;
    font-size: 1.5rem;
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

.timeslot {
    background-color: black;
    color: white;
}

.card-container {
    box-shadow: 2.5px 2.5px 2.5px rgba(0, 0, 0, 0.5);
}

.card-container:hover {
    transform: scale(1.02);
    box-shadow: 2.5px 2.5px 2.5px rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.card {
    color: white;
}

.card-header {
    background-color: var(--accent-primary);
}

.card-body {
    color: var(--text-color);
}

.card-footer {
    background-color: var(--accent-primary);
}

a {
    font-weight: bolder;
    color: var(--text-color);
}

a:hover {
    color: var(--accent-secondary)
}

#day-thingy {
    overflow-y: scroll;
    max-height: 20rem;
}</style>
