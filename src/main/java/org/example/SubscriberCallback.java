package org.example;
// This class implements the MqttCallback interface and defines the actions to be taken when a message is received, the connection is lost, or the delivery is complete.
import org.eclipse.paho.client.mqttv3.*;

public class SubscriberCallback implements MqttCallback {
    @Override
    public void connectionLost(Throwable cause) {
        // This method is called when the connection to the broker is lost.
        // todo reconnect here or implement a retry logic.
        System.out.println("Connection lost: " + cause.getMessage());
    }
    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        // This method is called when a message is received from the broker.
        // todo process the message here or send it to another component.
        System.out.println("Message arrived: " + message.toString());
    }
    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // This method is called when the delivery of a message is complete.
        // todo check the status of the delivery here or log it.
        System.out.println("Delivery complete: " + token.isComplete());
    }
}