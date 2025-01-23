const { ServiceBusClient } = require('@azure/service-bus');

class AzureConsumer {
    constructor(config, receveidConfirmation) {
        this.receveidConfirmation = receveidConfirmation;
        this.client = new ServiceBusClient(config.connectionString);
        this.queueName = config.queueName;
        this.receiver = this.client.createReceiver(this.queueName, {
            receiveMode: "peekLock",
        });
    }

    async receiveMessages() {
        try {
            // Subscribe to the receiver to process messages
            this.receiver.subscribe({
                processMessage: async (message) => {
                    let content = JSON.parse(message.body);
                    console.log(`Received message: Id: ${content.body.nrid} Seq: ${message.sequenceNumber} - Data: ${content.body.data}`);

                    if (!await this.receveidConfirmation(content.body.nrid)) {
                        console.log(`Processed message: ${content.body.nrid}`);
                    } else {
                        console.log(`Message already processed: ${content.body.nrid}`);
                    }

                    // Complete the message after processing
                    await this.receiver.completeMessage(message);
                },
                processError: async (err) => {
                    console.log("Error occurred: ", err);
                },
            });
        } catch (error) {
            console.error('Error subscribing to Azure Service Bus:', error);
        }
    }

    async close() {
        await this.receiver.close();
        await this.client.close();
    }

    async start() {
        console.log('Starting Azure Consumer...');
        await this.receiveMessages(); // Start receiving messages
    }
}

module.exports = { AzureConsumer };