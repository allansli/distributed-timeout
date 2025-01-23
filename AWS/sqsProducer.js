const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

class SQSProducer {
    constructor(config) {
        // Initialize the SQS client with the specified region and credentials
        this.sqsClient = new SQSClient({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
        this.queueUrl = config.queueUrl;
    }

    async sendMessage(message) {
        const params = {
            MessageBody: JSON.stringify(message), // Convert the message to a JSON string
            QueueUrl: this.queueUrl,
            DelaySeconds: 6
        };
        try {
            // Create a command to send the message
            const command = new SendMessageCommand(params);
            // Send the command using the SQS client
            const result = await this.sqsClient.send(command);
            console.log(`Message sent to SQS: ${JSON.stringify(message)}`);
        } catch (error) {
            console.error('Error sending message to SQS:', error);
        }
    }
}

module.exports = { SQSProducer };