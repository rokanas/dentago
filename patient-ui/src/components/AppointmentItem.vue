<!-- Some code was reused from https://git.chalmers.se/courses/dit342/2023/group-15-web -->

<template>
    <div class="card card-container" :class="courseCardClass">
        <div @click="handleCardClick">
            <div class="card-header card-accent" :class="cardAccentClass">
                {{ timeslotData.clinic }}
            </div>
            <div class="card-body">{{ timeslotData.dentist }}</div>
        </div>
        <div class="card-footer card-accent" :class="cardAccentClass">
            {{ formattedTime }}
        </div>
    </div>
</template>

<script>
// TODO: Fetch the timeslot data here
export default {
    props: {
        timeslotId: String
    },
    computed: {
        formattedTime() {
            return this.formatDateTime(this.timeslotData.time);
        }
    },
    data() {
        return {
            timeslotData: { clinic: 'Green Hill Zone Clinic', dentist: 'Sonic The Hedgehog', time: '2005-09-23T14:00:00.000+00:00' }
        }
    },
    methods: {
        formatDateTime(dateTimeString) {
            const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
            const dateTime = new Date (dateTimeString);
            return dateTime.toLocaleString('en-US', options);
        },
        handleCardClick () {

        },
        handleButtonClick() {

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
