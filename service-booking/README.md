# service-booking

\ No newline at end of file
Repository for the booking service of the system *"Dentago"*.
This repository communicates/relies on the following other repositories within the *Dentago* system:
- [*api-patient*](https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-13/api-patient) to receive booking appointments.

## Features and Tech Stack
This service is designed to efficiently manage appointment bookings and cancellations. It incorporates the following options and characteristics:

- **Booking function**: Users can easily schedule appointments using this service. It processes booking instructions received via MQTT and securely store them in the MongoDB database.

- **Cancelling function**: In case users need to cancel their appointments, this service allows for seamless cancellation. It processes cancellation instructions received via MQTT and updates the database accordingly.

- **Connection to database**: This service establishes a Mongoose connection to a MongoDB database. This connection ensures reliable and efficient storage and retrieval of appointment-related information.

- **MQTT-based communication**: The service utilizes MQTT (Message Queuing Telemetry Transport) as a communication protocol. It receives instructions for booking or cancelling appointments via MQTT, ensuring reliable and real-time communication between the service and other connected systems.

- **Load balancing**: To optimize performance and ensure scalability, this service employs a load balancer. It utilizes multiple instances of the service and implements shared subscriptions. This distributes the workload evenly across the instances, ensuring efficient handling of appointment-related tasks.

- **Circuit breaker**: As a measure to handle system instability, this service incorporates a circuit breaker. It periodically checks the system's stability and availability. If the system is deemed temporarily unavailable or unstable, the circuit breaker activates, preventing further requests until the system stabilizes again. This helps maintain the overall reliability and performance of the service.

## Tech Stack
- [Node.js](https://nodejs.org/en)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database/)
- [Mongoose](https://mongoosejs.com/)
- [Mosquitto](https://mosquitto.org/)
- [Opossum](https://nodeshift.dev/opossum/)

## Configuration

After cloning the repository, open a terminal and run:
```
npm install
npm run dev
```

Something similar to the following will appear:
```

> service-booking@1.0.0 dev
> nodemon ./bookingService.js service1

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node ./bookingService.js service1`
Created a circuit breaker with a timeout of (5000), a reset timeout of (30000) and an error threshold percentage of (50).
Attempting to connect to database...
Connected to MongoDB!
Connected to the MQTT broker: mqtt://test.mosquitto.org

```

At this point the service will start processing requests. 

It is possible to run several instances of the service. To do this, you should specify the name of the service instance when you run it, e.g., `nodemon ./bookingService.js service1`. As a convenience shortcut, you can alternatively run `npm run dev1`, up to `dev4`.