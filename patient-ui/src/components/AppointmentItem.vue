<!-- Some code was reused from https://git.chalmers.se/courses/dit342/2023/group-15-web -->

<template>
<div>
    <div class="card card-container" style="width: 18rem;">
        <div data-bs-toggle="modal" data-bs-target="#appointmentModal">
            <div class="card-header">
                <h5 href="#" class="card-title">{{ timeslotData.clinic }}</h5>
            </div>
            <!-- TODO: Use the actual clinic image or a dentist -->
            <img src="https://http.dog/404.jpg" class="card-img-top p-2" alt="Dentist Picture">
        </div>
        <div class="card-body">
            <!-- <a href="#" class="card-link">{{ 'Dentist: ' + timeslotData.dentist }}</a> -->
            <button class="btn btn-outline-tertiary">
                {{ timeslotData.dentist }}
            </button>
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
                    <h5 class="modal-title" id="appointmentModalLabel"> {{ "FUCK YOU CLINIC" }}</h5>
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
                    <button v-if="cancelBookingPressed == 1" type="button" class="btn btn-danger" @click="confirmCancellation(timeslot._id, patientId)">Confirm Cancellation</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { Api } from '@/Api.js'

// TODO: Fetch the timeslot data here
export default {
    mounted(){
        const myModalEl = this.$refs.myModal;
        myModalEl.addEventListener('hidden.bs.modal', this.resetCancelBookingPressed);
    },
    props: {
        timeslot: Object
    },
    computed: {
        formattedTime() {
            return this.formatDateTime(this.timeslotData.time);
        }
    },
    data() {
        return {
            patientId: JSON.parse(localStorage.getItem("patientData"))._id,
            timeslotData: {
                clinic: this.timeslot.clinic.name,
                dentist: this.timeslot.dentist.name,
                time: this.timeslot.startTime
            },
            cancelBookingPressed: 0
        }
    },
    methods: {
        formatDateTime(dateTimeString) {
            console.log(dateTimeString);
            const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            const dateTime = new Date(dateTimeString);
            return dateTime.toLocaleString('en-US', options);
        },
        confirmCancellation(timeslotId, patientId) {
            Api.patch('/clinics/' + this.clinicId + '/timeslots/' + timeslotId, {
                instruction: 'CANCEL',
                patient_id: patientId
            }, {headers: {Authorization: `Bearer ${localStorage.getItem("access-token")}`}})
            .then(response => {
                    if (response.data.Message === 'FAILURE'){
                        alert('This appointment has already been booked by someone else.');
                    }
                    this.$router.go();
                    console.log(response);
                }).catch(error => {
                    alert('Something went wrong. Please try again.');
                    console.log(error);
                })
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
    /* background-color: var(--accent-primary); */
}
.card-header {
    background-color: var(--accent-primary);
}
.card {
    /* background-color: var(--secondary-color); */
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
</style>
