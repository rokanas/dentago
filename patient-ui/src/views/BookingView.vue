<template>
    <div>
        <HeaderBar></HeaderBar>

        <h1> Clinic name = {{ clinic.clinicName }}</h1>

        <div>
            <button @click="getClinic()"> Get clinic </button>
            <button @click="getTimeSlots()"> Get time slots </button>
            <button @click="book()"> Book </button>
            <button @click="cancel()"> Cancel </button>

            <table>
                <tr v-for="day in days" :key="day">
                    <th> {{ day }} </th>
                    <td> 08:00 </td>
                    <td> 09:00 </td>
                    <td> 10:00 </td>
                    <td> 11:00 </td>
                    <td> 12:00 </td>
                    <td> 13:00 </td>
                    <td> 14:00 </td>
                    <td> 15:00 </td>
                    <td> 16:00 </td>
                    <td> 17:00 </td>
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
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            clinic: {},
            time_slots: [],
        }
    },
    components: {
        HeaderBar
    },
    props: {
        clinicId: String
    },
    created() {
        this.getClinic
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
            Api.get('/clinics/greenHillZoneClinic/timeslots')
            .then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                })
        },
        book(){
            Api.patch('/clinics/greenHillZoneClinic/timeslots/65670525633adae86e582c54', {
                instruction: 'BOOK',
                patient_id: '65670667fb90f7239456b2f2'
            })
            .then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                })
        },
        cancel(){
            Api.patch('/clinics/greenHillZoneClinic/timeslots/65670525633adae86e582c54', {
                instruction: 'CANCEL',
                patient_id: '65670667fb90f7239456b2f2'
            })
            .then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                })
        }
    }
}
</script>