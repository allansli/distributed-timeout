const { AzureConsumer } = require('./Azure/azureConsumer');
const { SQSConsumer } = require('./AWS/sqsConsumer');
const Redis = require('ioredis');

const redis = new Redis({
    host: '',
    port: 6380, // Default port for Azure Cache for Redis
    password: '',
    tls: {}, // Enable TLS
});

// Default service to Azure
let service = 'azure';

// Check for command-line arguments
if (process.argv.length > 2) {
    service = process.argv[2].toLowerCase(); // Get the service from the command line argument
}

const receveidConfirmation = async (nrid) => {
    const result = await redis.get(nrid);
    return result !== null;
};

const config = {
    azure: {
        connectionString: '',
        queueName: '',
    },
    sqs: {
        region: '',
        queueUrl: '',
        accessKeyId: '', // Add your AWS Access Key ID
        secretAccessKey: '' // Add your AWS Secret Access Key
    }
};

let consumer;

if (service === 'azure') {
    consumer = new AzureConsumer(config.azure, receveidConfirmation);
} else if (service === 'sqs') {
    consumer = new SQSConsumer(config.sqs, receveidConfirmation);
} else {
    throw new Error('Invalid service configuration');
}

// Example usage
(async () => {
    await consumer.start();
})();