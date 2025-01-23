const { ServiceBusClient } = require('@azure/service-bus');

class AzureProducer {
    constructor(config) {
        this.client = new ServiceBusClient(config.connectionString);
        this.queueName = config.queueName;
        this.sender = this.client.createSender(this.queueName);
    }

    async sendMessage(message) {
        try {
            // Create a ServiceBusMessage object
            const messageBody = {
                body: JSON.stringify(message), // Convert the message to a JSON string
            };

            // Schedule the message to be sent after a delay (6 seconds)
            await this.sender.scheduleMessages(messageBody, new Date(Date.now() + 6000));
            console.log(`Message sent to Azure Service Bus: ${JSON.stringify(message)}`);
        } catch (error) {
            console.error('Error sending message to Azure Service Bus:', error);
        }
    }

    async close() {
        await this.sender.close();
        await this.client.close();
    }
}

module.exports = { AzureProducer };