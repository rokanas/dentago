# app-dentist

Repository for the Dentist CLI tool of the system *"Dentago"*. 

This repository communicates/relies on the following other repositories within the *Dentago* system:
- [*api-dentist*](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/api-dentist) for all endpoints.
- [*service-booking*](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/service-booking) to receive timeslot booking/cancellation notifications.

## Features
This service is used to used to test and demo the Dentist API functionalities and can also serve as a substitute for Clinics/Dentists that do not have their own IT-system to integrate with the Dentago system.

### Login Menu options
- **Login as Dentist**: Dentists are the users of the CLI Tool.
- **Register new Dentist**: Register a new Dentist in the Dentago database.
- **Register new Clinic**: Register a new Clinic in the Dentago database.
- **Get list of all Clinics**: Retrieve a list of all the Clinics in the Dentago Database.
- **Exit**: Exits the application after closing all MQTT connections.

### Main Menu options
- **Add new Dentist**: Registers a new Dentist in the Dentago database using the Clinic associated with the currently logged in user (Dentist).
- **Add new Timeslot**: Adds a new Timeslot (appointment) in the Dentago database.
- **Get all Timeslots (Clinic)**: Gets all the Timeslots for the Clinic associated with the currently logged in user (Dentist).
- **Get all Timeslots (Current User)**:Gets all the Timeslots associated with the currently logged in user (Dentist).
- **Assign Dentist to Timeslot**: Assigns a Dentist to an already existing Timeslot.
- **Cancel appointment**: Removes the assigned Dentist from an already existing Timeslot, effectively "unpublishing" the Timeslot or cancelling the appointment if it was already booked by a Patient.
- **Exit**: Exits the application after closing all MQTT connections.

## Tech Stack
- [Node.js](https://nodejs.org/en)
- [Mosquitto](https://www.npmjs.com/package/mqtt)

For an detailed list of `npm` dependencies please refer to the [package.json](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/app-dentist/-/blob/main/package.json?ref_type=heads) file.

## Configuration

After cloning the repository, open a terminal in the `app-dentist` directory and run the following command to install the dependencies:
```
npm install
```

With the necessary setup in place, you can run:
```
npm start
npm run dev
```

Something similar to the following will appear:
```
> app-dentist@1.0.0 start
> node app.js

Connected to MQTT broker
Subscribed to messages on: dentago/dentist/login/87fc23475a56a703fc68
Subscribed to messages on: dentago/dentist/clinics/87fc23475a56a703fc68
Subscribed to messages on: dentago/dentist/creation/clinics/87fc23475a56a703fc68
Subscribed to messages on: dentago/dentist/creation/dentists/87fc23475a56a703fc68

=== Login Menu ===
1. Login (Dentist)
2. Register new Dentist
3. Register new Clinic
4. Get all Clinics
0. Exit
Enter your option:
```
At which point the CLI tool can be used (assuming the Patient API is available).
