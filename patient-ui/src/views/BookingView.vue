<template>
    <div>
        <HeaderBar></HeaderBar>

        <h1> Clinic id = {{ clinicId }}</h1>

        <div>
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
import HeaderBar from '@/components/HeaderBar.vue'

export default {
    data() {
        return {
            days: 7
        }
    },
    components: {
        HeaderBar
    },
    props: {
        clinicId: String
    },
    methods: {
        getClinic() {
            // will get information about the clinic
        }
    }
}
</script>