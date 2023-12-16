<!-- Some code was reused from https://git.chalmers.se/courses/dit342/2023/group-15-web -->

<template>
    <div class="card card-container" style="width: 18rem;">
        <div data-bs-toggle="modal" data-bs-target="#appointmentModal">
            <div class="card-header">
                <h5 href="#" class="card-title">{{ timeslotData.clinic }}</h5>
            </div>
            <!-- TODO: Use the actual clinic image or a dentist -->
            <img src="https://http.dog/404.jpg" class="card-img-top" alt="Dentist Picture">
        </div>
        <div class="card-body">
            <a href="#" class="card-link">{{ 'Dentist: ' + timeslotData.dentist }}</a>
        </div>
        <div class="card-footer">
            {{ formattedTime }}
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="appointmentModal" tabindex="-1" aria-labelledby="appointmentModalLabel" aria-hidden="true" ref="myModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="appointmentModalLabel"> {{ timeslotData.clinic }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p v-if="cancelBookingPressed == 0"> {{ 'Would you like to cancel your appointment at ' + formattedTime + '?' }} </p>
                    <p v-if="cancelBookingPressed == 1"> {{ 'Are you sure you want to cancel your appointment at ' + formattedTime + '?' }} </p>
                    <p v-if="cancelBookingPressed == 2"> {{ 'Your appointment was cancelled!' }} </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button v-if="cancelBookingPressed == 0" type="button" class="btn btn-danger" @click="handleButtonCancel">Cancel Booking</button>
                    <button v-if="cancelBookingPressed == 1" type="button" class="btn btn-danger" @click="confirmCancellation">Confirm Cancellation</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

// TODO: Fetch the timeslot data here
export default {
    mounted(){
        const myModalEl = this.$refs.myModal;
        myModalEl.addEventListener('hidden.bs.modal', this.resetCancelBookingPressed);
    },
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
            timeslotData: { clinic: 'Green Hill Zone Clinic', dentist: 'Sonic The Hedgehog', time: '2005-09-23T14:00:00.000+00:00' },
            cancelBookingPressed: 0
        }
    },
    methods: {
        formatDateTime(dateTimeString) {
            const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            const dateTime = new Date(dateTimeString);
            return dateTime.toLocaleString('en-US', options);
        },
        confirmCancellation() {
            // TODO: Cancel appointment here
            console.log('Cancel appointment');
            this.cancelBookingPressed += 1;
        },
        handleButtonCancel() {
            this.cancelBookingPressed += 1;
        },
        resetCancelBookingPressed() {
            this.cancelBookingPressed = 0;
        }
    },
}
</script>

<style scoped>
.timeslot {
    background-color: black;
    color: white;
}

.card-container:hover {
    transform: scale(1.02);
    box-shadow: rgba(0, 0, 0, 0.25) 0px 5px 10px;
    cursor: pointer;
}
</style>
