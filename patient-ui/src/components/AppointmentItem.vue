<template>
    <div class="timeslot">
        <h2>
            Timeslot: {{ timeslotId }}
        </h2>
        <h3>
            Clinic: {{ timeslotData.clinic }}
        </h3>
        <h3>
            Dentist: {{ timeslotData.dentist }}
        </h3>
        <h3>
            Time: {{ timeslotData.time }}
        </h3>
    </div>
</template>

<script>
// TODO: Fetch the timeslot data here
export default {
    props: {
        timeslotId: String
    },
    data() {
        return {
            timeslotData: { clinic: 'Green Hill Zone Clinic', dentist: 'Sonic The Hedgehog', time: '2005-09-23T14:00:00.000+00:00' }
        }
    }
}
</script>

<style scoped>
.timeslot {
    background-color: black;
    color: white;
}
</style>