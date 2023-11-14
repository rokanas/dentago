package org.example;
// This class implements a publisher that publishes a confirmation message to the confirmAppointment topic using MQTT protocols and Paho library.
// It establishes a connection with HiveMQ broker and handles connection and subscription problems.

import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

public class Publisher {
    private static final String brokerUrl = "tcp://broker.hivemq.com:1883";
    private static final String clientId = "Publisher";
    private static final String topic = "confirmAppointment";
    private static final int qos = 2;
    private static MqttClient client;

    public static void main(String[] args) {
        // Create a memory persistence object
        MemoryPersistence persistence = new MemoryPersistence();

        try {
            // Create a new MQTT client
            client = new MqttClient(brokerUrl, clientId, persistence);

            // Connect to the broker
            System.out.println("Connecting to broker: " + brokerUrl);
            client.connect();
            System.out.println("Connected");

            // Perform necessary confirmation actions once an appointment has been booked
            String message = "Your appointment has been confirmed. Thank you for choosing our service.";

            // Publish the message to the topic
            System.out.println("Publishing message: " + message);
            MqttMessage mqttMessage = new MqttMessage(message.getBytes());
            mqttMessage.setQos(qos);
            client.publish(topic, mqttMessage);
            System.out.println("Message published");

            // Disconnect from the broker
            client.disconnect();
            System.out.println("Disconnected");

        } catch (MqttException me) {
            // Handle connection and subscription problems
            System.out.println("Reason: " + me.getReasonCode());
            System.out.println("Message: " + me.getMessage());
            System.out.println("Localized message: " + me.getLocalizedMessage());
            System.out.println("Cause: " + me.getCause());
            System.out.println("Exception: " + me);
            me.printStackTrace();
        }
    }
}