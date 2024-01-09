# api-patient

Repository for the Patient client API of the system *"Dentago"*. 

This repository communicates/relies on the following other repositories within the *Dentago* system:
- [*service-authentication*](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/service-authentication)
- [*service-availability*](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/service-availability)
- [*service-booking*](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/service-booking)

## Features

This service deals with all Patient client requests.

## Tech Stack

For an detailed list please refer to the [package.json](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/api-patient/-/blob/main/package.json?ref_type=heads) file.

## Configuration

After cloning the repository, open a terminal in the `api-patient` directory and run the following command to install the dependencies:
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

At which point the service will be able to start processing requests from the Patient clients.
