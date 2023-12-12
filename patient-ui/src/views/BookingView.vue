<template>
    <div>
        <HeaderBar></HeaderBar>

        <h1> Clinic name = {{ clinic.clinicName }}</h1>

        <div>
            <!-- <button @click="getClinic()"> Get clinic </button>
            <button @click="getTimeSlots()"> Get time slots </button> -->
            <button @click="book()"> Book </button>
            <button @click="cancel()"> Cancel </button>

            <table>
                <tr v-for="(value, key) in days" :key="key">
                    <th> {{ key.substring(0, 15) }} </th>
                    <td v-for="appt in value" :key="appt">
                        <p v-if="appt['startTime'].getMinutes() === 0">
                            {{ appt['startTime'].getHours() }}:{{ appt['startTime'].getMinutes() }}0
                        </p>
                        <p v-else> {{ appt['startTime'].getHours() }}:{{ appt['startTime'].getMinutes() }} </p>
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
        this.getTimeSlots(),
        this.organizeAppointments()
    },
    methods: {
        getClinic() {
            Api.get('/clinics/' + this.clinicId)
                .then(response => {
                    this.clinic = response.data;
                    console.log(response);
                    console.log(this.clinic);
                }).catch(error => {
                    console.log(error);
                })
        },
        getTimeSlots(){
            Api.get('/clinics/' + this.clinicId + '/timeslots')
            .then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                })
        },
        book(timeslotId){
            Api.patch('/clinics/' + this.clinicId + '/timeslots/' + timeslotId, {
                instruction: 'BOOK',
                patient_id: '65670667fb90f7239456b2f2'
            })
            .then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                })
        },
        cancel(timeslotId){
            Api.patch('/clinics/' + this.clinicId + '/timeslots/' + timeslotId, {
                instruction: 'CANCEL',
                patient_id: '65670667fb90f7239456b2f2'
            })
            .then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                })
        },
        areEqualDates(date1, date2){
            if(date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()){
                return true;
            }
            return false;
        },
        organizeAppointments(){
            for(let i=0; i<this.timeslots.length; i++){
                let timeslot = this.timeslots[i];
                let daysKey = new Date(timeslot.startTime.getFullYear(), timeslot.startTime.getMonth(), timeslot.startTime.getDate());

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