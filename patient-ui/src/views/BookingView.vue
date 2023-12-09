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
                <tr>
                    <th> Times </th>
                    <th> Sunday </th>
                    <th> Monday </th>
                    <th> Tuesday </th>
                    <th> Wednesday </th>
                    <th> Thursday </th>
                    <th> Friday </th>
                    <th> Saturday </th>
                </tr>
                <tr>
                    <td> 8:00 </td>
                </tr>
                <tr>
                    <td> 9:00 </td>
                </tr>
                <tr>
                    <td> 10:00 </td>
                </tr>
                <tr>
                    <td> 11:00 </td>
                </tr>
                <tr>
                    <td> 12:00 </td>
                </tr>
                <tr>
                    <td> 13:00 </td>
                </tr>
                <tr>
                    <td> 14:00 </td>
                </tr>
                <tr>
                    <td> 15:00 </td>
                </tr>
                <tr>
                    <td> 16:00 </td>
                </tr>
                <tr>
                    <td> 17:00 </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import { Api } from '@/Api.js';
import HeaderBar from '@/components/HeaderBar.vue'

export default {
    data() {
        return {
            days: 7,
            clinic: {},
            time_slots: [],
            bookingObj: {}
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