const { AzureProducer } = require('./Azure/azureProducer');
const { SQSProducer } = require('./AWS/sqsProducer');
const Redis = require('ioredis');
const uuid4 = require('uuid4');

// Default service to Azure
let service = 'azure';

// Check for command-line arguments
if (process.argv.length > 2) {
    service = process.argv[2].toLowerCase(); // Get the service from the command line argument
}

const redis = new Redis({
    host: '',
    port: 6380, // Default port for Azure Cache for Redis
    password: '',
    tls: {}, // Enable TLS
});

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

let producer;

if (service === 'azure') {
    producer = new AzureProducer(config.azure);
} else if (service === 'sqs') {
    producer = new SQSProducer(config.sqs);
} else {
    throw new Error('Invalid service configuration');
}

// Example usage
(async () => {
    setInterval(async () => {
        let nrid = uuid4();
        const message = {
            body: { data: `ORIGINAL MESSAGE ${nrid}`, nrid: nrid },
            seq: 0
        };

        await producer.sendMessage(message);

        if (Math.random() < 0.6) {
            console.log(`Received COMPLEMENTARY message - Id: ${nrid}`);
            redis.set(nrid, true, 'EX', 100);
        }
    }, 3000);
})();