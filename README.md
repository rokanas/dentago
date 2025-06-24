> **NOTE:** This project repo has been migrated from GitLab for archival purposes. 
> 
> On GitLab, each service was contained in a separate repository. These repositories have now been consolidated in this main repo within their correspondingly named folders. The folders also contain installation instructions for each respective service.

# dentago

*Dentago* is a distributed system designed to centralize dentist appointment bookings across Sweden. 

It relies on MQTT for inter-component communication to achieve scalability, and reliability. Fault tolerance is achieved through diverse mechanisms such as circuit breakers and load balancers. 

To users, the system appears seamless: patients interact via a web-based interface, while dentists manage appointments through a dedicated GUI. The system is accessible on both computers and mobile devices, offering a versatile and intuitive user experience.

For a comprehensive report on system development, design and architecture, see the [wiki](https://github.com/rokanas/dentago/wiki).