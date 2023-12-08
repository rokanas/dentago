# service-monitoring

A simple heartbeat monitor for the different services of the dentago system

## TODO:

- [ ] Try implementing QOS
- [x] See if a response interval can be defined
- [x] Try implementing it for many services :)

Send an acknowledgement from the client, if it doesn't receive it in a certain time, the client is OFFLINE. Try again a few seconds
