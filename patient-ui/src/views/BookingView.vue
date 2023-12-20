<template>
    <div>
        <HeaderBar></HeaderBar>

        <h1> {{ clinic.name }}</h1>

        <p> <b>Address:</b> {{ clinic.address }} </p>

        <div>
            <table>
                <tr v-for="(value, key) in days" :key="key">
                    <!-- The key (the date) is stored as a string including the time, so we extract just the date using "substring()" -->
                    <th> {{ key.substring(0, 15) }} </th>
                    <td v-for="appt in value" :key="appt">
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
                        <!-- TODO: move cancel button to profile page -->
                        <button v-if="appt['patient'] !== null" @click="book(appt['_id'])"> Book </button>
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
</style>

<script>
import { Api } from '@/Api.js';
import HeaderBar from '@/components/HeaderBar.vue'

export default {
    data() {
        return {
            days: {},
            clinic: {},
            timeslots: []
        }
    },
    components: {
        HeaderBar
    },
    props: {
        clinicId: String
    },
    created() {
        this.getClinic(),
        this.getTimeSlots()
    },
    methods: {
        getClinic() {
            Api.get('/clinics/' + this.clinicId)
                .then(response => {
                    this.clinic = response.data;
                }).catch(error => {
                    console.log(error);
                })
        },
        getTimeSlots(){
            Api.get('/clinics/' + this.clinicId + '/timeslots')
            .then(response => {
                    this.timeslots = response.data.Timeslots;
                    this.organizeAppointments();
                }).catch(error => {
                    console.log(error);
                })
        },
        book(timeslotId){
            Api.patch('/clinics/' + this.clinicId + '/timeslots/' + timeslotId, {
                instruction: 'BOOK',
                patient_id: '65670667fb90f7239456b2f2'      // TODO: remove this placeholder value
            })
            .then(response => {
                    alert('Booking successful!');
                    console.log(response);
                }).catch(error => {
                    alert('Something went wrong. Please try again.');
                    console.log(error);
                })
        },
        cancel(timeslotId){
            Api.patch('/clinics/' + this.clinicId + '/timeslots/' + timeslotId, {
                instruction: 'CANCEL',
                patient_id: '65670667fb90f7239456b2f2'      // TODO: remove this placeholder value
            })
            .then(response => {
                    console.log(response);
                }).catch(error => {
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