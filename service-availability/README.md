# service-availability

Repository for the Availability service of the system *"Dentago"*. 

This repository communicates/relies on the following other repositories within the *Dentago* system:
- [*api-patient*](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/api-patient) in order to receive the user requests.

## Features
This service is used to efficiently fetch **available** timeslots from the database and forward them to the requesting user.

- **Returning list of available Timeslots**: User requests for Timeslot data are forwarded to this service from the Patient API using MQTT. Included in the message payload is a Clinic ID and a time range in order to filter the DB query.
- **Generating list of recommended Timeslots**: Upon receiving a recommendation request, the service will return Timeslots that, in addition to the given Clinic ID and time range, also filters the Timeslots by comparing them to a given Patient's (the user) preferences. A Patient ID is part of the payload to facilitate this functionality.


## Tech Stack
- [Node.js](https://nodejs.org/en)
- [MongoDB](https://www.npmjs.com/package/mongodb)
- [Mongoose](https://www.npmjs.com/package/mongoose)
- [Mosquitto](https://www.npmjs.com/package/mqtt)

For an detailed list please refer to the [package.json](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/service-availability/-/blob/main/package.json?ref_type=heads) file.

## Configuration

After cloning the repository, open a terminal in the `service-availability` directory and run the following command to install the dependencies:
```
npm install
```
In order for the service to connect to the Mongo Database, a `.env` file must be added to the directory containing the link:
```
MONGODB_URI=[MONGO_DB_LINK]
```
The service can be run without this environmental variable, but will then connect to a local test MongoDB test instance.

With the necessary setup in place, you can run:
```
npm start
npm run dev
```

Something similar to the following will appear:
```
> service-availability@1.0.0 start
> node app.js

Connected to MQTT broker
Subscribed to messages on: dentago/availability/
Subscribed to messages on: dentago/availability/recommendation/
Subscribed to messages on: dentago/monitor/availability/ping
Connected to MongoDB
```
At which point the service will be able to start processing requests from the Patient API.
