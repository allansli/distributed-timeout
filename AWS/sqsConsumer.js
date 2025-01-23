const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

class SQSConsumer {
    constructor(config, receveidConfirmation) {
        this.receveidConfirmation = receveidConfirmation;
        this.sqsClient = new SQSClient({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
        this.queueUrl = config.queueUrl;
    }

    async receiveMessages() {
        const params = {
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 10, // Long polling
        };
        try {
            const command = new ReceiveMessageCommand(params);
            const result = await this.sqsClient.send(command);
            if (result.Messages) {
                for (const message of result.Messages) {
                    console.log(`Received message: ${message.Body}`);
                    let content = JSON.parse(message.Body);
                    try {
                        if (!await this.receveidConfirmation(content.body.nrid)) {
                            console.log(`Processed message: ${content.body.nrid}`);
                        } else {
                            console.log(`Message already processed: ${content.body.nrid}`);
                        }
                        await this.sqsClient.send(new DeleteMessageCommand({
                            QueueUrl: this.queueUrl,
                            ReceiptHandle: message.ReceiptHandle,
                        }));
                    } catch (processingError) {
                        console.error('Error processing message:', processingError);
                    }
                }
            }
        } catch (error) {
            console.error('Error receiving messages from SQS:', error);
        }
    }

    async start() {
        console.log('Starting SQS Consumer...');
        while (true) {
            await this.receiveMessages();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before polling again
        }
    }
}

module.exports = { SQSConsumer };