# Distributed Timeout System

A robust distributed timeout system that leverages message queues and Redis to handle distributed processing with timeout capabilities. This system supports both Azure Service Bus and AWS SQS as message queue providers.

## Overview

This project implements a distributed timeout pattern where:

1. A producer sends messages to a queue with a delay
2. A consumer processes these messages after the delay
3. If a complementary action happens before the delayed message is processed, the system marks the message as already handled using Redis

This pattern is useful for implementing timeout mechanisms in distributed systems, retry logic, or handling eventual consistency scenarios.

## Architecture

The system consists of the following components:

- **Producer**: Sends messages to the queue with a 6-second delay
- **Consumer**: Processes messages from the queue
- **Redis**: Used as a distributed cache to track message status
- **Message Queue**: Either Azure Service Bus or AWS SQS

## Prerequisites

- Node.js (v14 or higher)
- Redis instance
- Azure Service Bus namespace and queue (for Azure implementation)
- AWS SQS queue (for AWS implementation)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/allansli/distributed-timeout.git
   cd distributed-timeout
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the connection settings:
   - Open `producer.js` and `consumer.js`
   - Update the Redis connection settings
   - Update the Azure Service Bus or AWS SQS configuration based on your preferred service

## Configuration

### Redis Configuration
Update the Redis connection details in both `producer.js` and `consumer.js`:

```javascript
const redis = new Redis({
    host: 'YOUR_REDIS_HOST',
    port: 6380, // Default port for Azure Cache for Redis
    password: 'YOUR_REDIS_PASSWORD',
    tls: {}, // Enable TLS
});
```

### Azure Service Bus Configuration
Update the Azure configuration in both `producer.js` and `consumer.js`:

```javascript
const config = {
    azure: {
        connectionString: 'YOUR_AZURE_CONNECTION_STRING',
        queueName: 'YOUR_QUEUE_NAME',
    },
    // ...
};
```

### AWS SQS Configuration
Update the AWS configuration in both `producer.js` and `consumer.js`:

```javascript
const config = {
    sqs: {
        region: 'YOUR_AWS_REGION',
        queueUrl: 'YOUR_SQS_QUEUE_URL',
        accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY'
    }
};
```

## Usage

### Running the Producer

To run the producer with Azure Service Bus (default):
```
node producer.js
```

To run the producer with AWS SQS:
```
node producer.js sqs
```

### Running the Consumer

To run the consumer with Azure Service Bus (default):
```
node consumer.js
```

To run the consumer with AWS SQS:
```
node consumer.js sqs
```

## How It Works

1. The producer sends a message to the queue with a 6-second delay
2. With a 60% probability, the producer simulates a "complementary" action and stores the message ID in Redis
3. After the delay, the consumer receives the message from the queue
4. The consumer checks Redis to see if the message has already been handled:
   - If the message ID exists in Redis, it logs "Message already processed"
   - If the message ID doesn't exist in Redis, it processes the message

This pattern allows for efficient handling of scenarios where a timeout or delayed action might be needed, but can be canceled if a complementary action occurs before the timeout.

## Use Cases

- Implementing timeout mechanisms in distributed systems
- Handling eventual consistency in microservices
- Implementing retry logic with cancellation capabilities
- Building distributed workflow systems

## License

This project is licensed under the ISC License - see the LICENSE file for details.