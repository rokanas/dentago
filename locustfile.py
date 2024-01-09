from locust import HttpUser, task

# https://docs.locust.io/en/stable/running-distributed.html - make processes distributed to help with CPU/memory usage

class Dentago(FastHttpUser):
    @task
    def dentago(self):
# ------------------------------ CLINICS -------------------------------------------------
        # GET /clinics --- on Home page (Google Map)
        self.client.get("/clinics")

        # GET /clinics/:clinicId --- on Booking page for a specific clinic
        self.client.get("/clinics/659c3100a31820e99ca3a100")

# ------------------------------ TIMESLOTS -----------------------------------------------

        # GET /clinics/:clinicId/timeslots --- on Booking page to showcase the (un)available timeslots
        self.client.get("/clinics/659c3100a31820e99ca3a100/timeslots")

        # PATCH /clinics/:clinicId/timeslots/:timeslotId --- on Booking page when booking an appointment
        self.client.patch(
            "/clinics/659c3100a31820e99ca3a100/timeslots/659c31cda31820e99ca3a10e",
            {"instruction": "BOOK", "patient": "659c4e5997edd2fb2978df02"}
            )

        # PATCH /clinics/:clinicId/timeslots/:timeslotId --- on Profile page when cancelling an appointment
        self.client.patch(
            "/clinics/659c3100a31820e99ca3a100/timeslots/659c31cda31820e99ca3a10e",
            {"instruction": "CANCEL", "patient": "659c4e5997edd2fb2978df02"}
            )