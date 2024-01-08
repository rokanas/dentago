<template>
    <div>
        <h1> {{ clinic.name }}</h1>
        <input type="date" v-model="selectedStartDate">
        <input type="date" v-model="selectedEndDate">
        <button @click="getSelection(selectedStartDate, selectedEndDate)">GET SELECTED</button>
        <p> <b>Address:</b> {{ clinic.address }} </p>

        <div v-if="timeslots.length == 0">
            <h3>No timeslots available for the selected range</h3>
        </div>
        <div>
            <table>
                <tr v-for="(value, key) in days" :key="key">
                    <!-- The key (the date) is stored as a string including the time, so we extract just the date using "substring()" -->
                    <th> {{ key.substring(0, 15) }} </th>
                    <td v-for="appt in value" :key="appt" :class="{ 'unavailable': appt['patient'] !== null }">
                        <!-- 'appt' stands for 'appointment' -->
                        <!-- When getting minutes that are "00", they only show "0" when printing, so there was a v-if statement needed -->
                        <p v-if="appt['startTime'].getMinutes() === 0 && appt['endTime'].getMinutes() === 0">
                            {{ appt['startTime'].getHours() }}:{{ appt['startTime'].getMinutes() }}0 - {{ appt['endTime'].getHours() }}:{{ appt['endTime'].getMinutes() }}0
                        </p>
                        <p v-else-if="appt['startTime'].getMinutes() === 0">
                            {{ appt['startTime'].getHours() }}:{{ appt['startTime'].getMinutes() }}0 - {{ appt['endTime'].getHours() }}:{{ appt['endTime'].getMinutes() }}
                        </p>
                        <p v-else-if="appt['endTime'].getMinutes() === 0">
                            {{ appt['startTime'].getHours() }}:{{ appt['startTime'].getMinutes() }} - {{ appt['endTime'].getHours() }}:{{ appt['endTime'].getMinutes() }}0
                        </p>
                        <p v-else>
                            {{ appt['startTime'].getHours() }}:{{ appt['startTime'].getMinutes() }} - {{ appt['endTime'].getHours() }}:{{ appt['endTime'].getMinutes() }}
                        </p>
                        <p>{{ appt['dentist']['name'] }}</p>
                        <button class="btn btn-secondary" v-if="appt['patient'] === null" @click="book(appt['_id'], patientId)"> Book </button>
                        <p v-else> <i> Unavailable </i> </p>
                    </td> 
                </tr>
            </table>
        </div>
    </div>
</template>

<style scoped>
table {
    border: 2px solid;
    border-collapse: collapse;
    width: 100%;
    height: 75vh;
}

th {
    background-color: aquamarine;
    border: 3px solid;
    width: 10%;
}

td {
    background-color: azure;
    border: 2px solid;
    text-align: center;
}
.unavailable {
    background-color: #ffcccc; /* Set your desired background color for unavailable appointments */
}
</style>

<script>
import { Api } from '@/Api.js';

export default {
    data() {
        return {
            days: {},
            clinic: {},
            timeslots: [],
            patientId: JSON.parse(localStorage.getItem("patientData"))._id,
            startDate: new Date().toLocaleDateString('sv-SE'),
            selectedStartDate: null,
            selectedEndDate: null,
        }
    },
    computed: {
        endDate() {
            const endDate = new Date(this.startDate);
            endDate.setDate(endDate.getDate() + 60); // Default endDate of 2 months

            return endDate.toLocaleDateString('sv-SE');
        }
    },
    props: {
        clinicId: String
    },
    created() {
        this.getClinic(),
        // this.getTimeSlots()
        setInterval(this.getTimeSlots, 60000); // refresh the timeslot data every minute (60 000 milliseconds)
    },
    methods: {
        getClinic() {
            Api.get('/clinics/' + this.clinicId, {headers: {Authorization: `Bearer ${localStorage.getItem("access-token")}`}})
                .then(response => {
                    this.clinic = response.data;
                    this.getTimeSlots();
                }).catch(error => {
                    console.log(error);
                })
        },
        getTimeSlots(){
            // add sorting filtering
            // TODO: add a date picker for startDate and endDate
            Api.get(`/clinics/${this.clinic._id}/timeslots?startDate=${this.startDate}&endDate=${this.endDate}`, {headers: {Authorization: `Bearer ${localStorage.getItem("access-token")}`}})
            .then(response => {
                    this.timeslots = response.data.Timeslots;
                    this.organizeAppointments();
                }).catch(error => {
                    console.log(error);
                })
        },
        getSelection(){
            // add sorting filtering
            // TODO: add a date picker for startDate and endDate
            Api.get(`/clinics/${this.clinic._id}/timeslots?startDate=${this.selectedStartDate}&endDate=${this.selectedEndDate}`, {headers: {Authorization: `Bearer ${localStorage.getItem("access-token")}`}})
            .then(response => {
                    this.timeslots = response.data.Timeslots;
                    this.organizeAppointments();
                }).catch(error => {
                    console.log(error);
                })
        },
        book(timeslotId, patientId){
            Api.patch('/clinics/' + this.clinicId + '/timeslots/' + timeslotId, {
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
                    }
                    console.log(response);
                }).catch(error => {
                    alert('Something went wrong. Please try again.');
                    console.log(error);
                })
        },
        // a helper function to compare two dates
        areEqualDates(date1, date2){
            if(date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()){
                return true;
            }
            return false;
        },
        organizeAppointments(){
            // In order for the following method to work, the date properties of a timeslot need to be changed from String to Date.
            for(let i=0; i<this.timeslots.length; i++){
                let startDate = new Date(this.timeslots[i].startTime);
                let endDate = new Date(this.timeslots[i].endTime);

                this.timeslots[i].startTime = startDate;
                this.timeslots[i].endTime = endDate;
            }

            // This creates a map-like object where the key is each individual date when there are timeslots, and the value is those timeslots.
            this.days = {};

            for(let i=0; i<this.timeslots.length; i++){
                let timeslot = this.timeslots[i];
                let daysKey = new Date(timeslot["startTime"].getFullYear(), timeslot["startTime"].getMonth(), timeslot["startTime"].getDate());

                if(this.days[daysKey] === undefined){
                    this.days[daysKey] = [timeslot];
                } else {
                    this.days[daysKey].push(timeslot);
                }
            }
        }
    }
}
</script>