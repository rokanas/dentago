from locust import HttpUser, task

class Dentago(HttpUser):
    @task
    def dentago(self):
        self.client.get("/clinics")
        self.client.get("/clinics/greenHillZoneClinic")