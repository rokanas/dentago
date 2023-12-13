from locust import HttpUser, task

# TODO: https://docs.locust.io/en/stable/running-distributed.html - make processes distributed to help with CPU/memory usage

class Dentago(FastHttpUser):
    @task
    def dentago(self):
# ------------------------------ CLINICS -------------------------------------------------
        # GET /clinics --- on Home page (Google Map)
        self.client.get("/clinics")

        # GET /clinics/:clinicId --- on Booking page for a specific clinic
        self.client.get("/clinics/657304e661d1c9f248318308")

# ------------------------------ TIMESLOTS -----------------------------------------------

        # GET /clinics/:clinicId/timeslots --- on Booking page to showcase the (un)available timeslots
        self.client.get("/clinics/657304e661d1c9f248318308/timeslots")

        # PATCH /clinics/:clinicId/timeslots/:timeslotId --- on Booking page when booking an appointment
        self.client.patch(
            "/clinics/657304e661d1c9f248318306/timeslots/657304e861d1c9f248318323",
            {"instruction": "BOOK", "patient": "657378334875f85b1a0233c2"}
            )

        # PATCH /clinics/:clinicId/timeslots/:timeslotId --- on Profile page when cancelling an appointment
        self.client.patch(
            "/clinics/657304e661d1c9f248318306/timeslots/657304e861d1c9f248318323",
            {"instruction": "CANCEL", "patient": "657378334875f85b1a0233c2"}
            )

# ------------------------------ PATIENTS ------------------------------------------------

        # TODO:
        # GET /patients/ --- on Profile page get specific patient


# ---------------------------- NOTIFICATIONS ---------------------------------------------

        # TODO