package org.example;// Subscriber.java
// This class implements a subscriber that subscribes to messages to the bookAppointment topic using MQTT protocols and Paho library.
// It establishes a connection with HiveMQ broker and handles connection failures and unsuccessful publishing.

import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

public class Subscriber {
    private static final String brokerUrl = "tcp://broker.hivemq.com:1883";
    private static final String clientId = "Subscriber";
    private static final String topic = "bookAppointment";
    private static final int qos = 2;
    private static MqttClient client;

    public static void main(String[] args) {
        // Create a memory persistence object
        MemoryPersistence persistence = new MemoryPersistence();
        try {
            // Create a new MQTT client
            client = new MqttClient(brokerUrl, clientId, persistence);
            // Set the callback for the client
            client.setCallback(new SubscriberCallback());
            // Connect to the broker
            System.out.println("Connecting to broker: " + brokerUrl);
            client.connect();
            System.out.println("Connected");
            // Subscribe to the topic
            System.out.println("Subscribing to topic: " + topic);
            client.subscribe(topic, qos);
            System.out.println("Subscribed");

        } catch (MqttException me) {
            // Handle connection failures and unsuccessful publishing
            System.out.println("Reason: " + me.getReasonCode());
            System.out.println("Message: " + me.getMessage());
            System.out.println("Localized message: " + me.getLocalizedMessage());
            System.out.println("Cause: " + me.getCause());
            System.out.println("Exception: " + me);
            me.printStackTrace();
        }
    }
}