# app-patient

Repository for the patient UI of the system *"Dentago"*.
This repository communicates/relies on the following other repositories within the *Dentago* system:
- [*api-patient*](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/api-patient) for all endpoints and connections with other services.

## Features
This application is the graphical user interface (GUI) for the patients, and displays the following pages and components:
- *Header bar* - this appears at the top of the website, no matter the page. It shows a home button that takes the user to the home page, a notification button where the user can see their notifications, and the profile button where the patient user can register, login, or access their profile page;
- *Home page* - this is the main landing page. Here, the user can see a short description of the service offered by the website, as well as a Google Map with clinics. The map centers on the user's location if the patient user allows for location tracking, otherwise it will show a large portion of Sweden. When clicking on a clinic's marker, some information about the clinic will appear, as well as a button redirecting to the clinic's booking page for appointments. On this page, *Dentago*'s contact information can be found at the bottom;
- *Booking page* - this page shows all timeslots of a clinic in a given time period (default one week). If the timeslot is available to be booked, a button will appear. **A user must be logged in for the booking to be successful.** Otherwise, an unavailable timeslot will show as unavailable;
- *Register + login pages* - these two pages ask for the necessary information in order to register a new patient account and log in a patient into an existing account, respectively;
- *Profile page* - on a patient's profile page, they can see their upcoming appointments (*Your Appointments* tab), as well as set if they wish to receive notifications about any timeslots within a certain time period (example: Mondays from 13:00 to 14:00)(*Preferences* tab).

## Tech Stack
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vue3 Google Maps library](https://www.npmjs.com/package/vue3-google-map)
- [Google Maps API](https://developers.google.com/maps)
- [Axios](https://axios-http.com/docs/intro)
- [BootstrapVue](https://bootstrap-vue.org/)

## Configuration

After cloning the repository, open a terminal and move to the `patient-ui` directory. There, you can run:
```
npm install
npm run dev
```

Something similar to the following will appear:
```
  VITE v4.5.0  ready in 966 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h to show help

```

Ctrl + Click on `https://localhost:8080/` to open the web page in your browser.