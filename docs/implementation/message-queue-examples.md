---
sidebar_position: 1
---

# Message Queue Implementation Examples

## Kafka

### Producer Example
```java
// Producer configuration
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

// Create producer
KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// Send message
ProducerRecord<String, String> record = new ProducerRecord<>(
    "my-topic",
    "key",
    "message"
);
producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        exception.printStackTrace();
    } else {
        System.out.printf("Sent to partition %d, offset %d%n",
            metadata.partition(), metadata.offset());
    }
});

// Close producer
producer.close();
```

### Consumer Example
```java
// Consumer configuration
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "my-group");
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

// Create consumer
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

// Subscribe to topic
consumer.subscribe(Arrays.asList("my-topic"));

// Poll for messages
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        System.out.printf("Received: key=%s, value=%s%n",
            record.key(), record.value());
    }
}
```

## RabbitMQ

### Producer Example
```python
import pika

# Connect to RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Declare exchange and queue
channel.exchange_declare(exchange='my_exchange', exchange_type='direct')
channel.queue_declare(queue='my_queue')
channel.queue_bind(exchange='my_exchange', queue='my_queue', routing_key='my_key')

# Send message
channel.basic_publish(
    exchange='my_exchange',
    routing_key='my_key',
    body='Hello World!'
)

# Close connection
connection.close()
```

### Consumer Example
```python
import pika

# Connect to RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Declare queue
channel.queue_declare(queue='my_queue')

# Define callback
def callback(ch, method, properties, body):
    print(f"Received: {body}")

# Start consuming
channel.basic_consume(
    queue='my_queue',
    on_message_callback=callback,
    auto_ack=True
)

channel.start_consuming()
```

## AWS SQS

### Producer Example
```python
import boto3

# Create SQS client
sqs = boto3.client('sqs')

# Get queue URL
queue_url = sqs.get_queue_url(QueueName='my-queue')['QueueUrl']

# Send message
response = sqs.send_message(
    QueueUrl=queue_url,
    MessageBody='Hello World!',
    MessageAttributes={
        'Author': {
            'StringValue': 'John Doe',
            'DataType': 'String'
        }
    }
)

print(f"Message ID: {response['MessageId']}")
```

### Consumer Example
```python
import boto3

# Create SQS client
sqs = boto3.client('sqs')

# Get queue URL
queue_url = sqs.get_queue_url(QueueName='my-queue')['QueueUrl']

# Receive messages
while True:
    response = sqs.receive_message(
        QueueUrl=queue_url,
        MaxNumberOfMessages=10,
        WaitTimeSeconds=20
    )

    if 'Messages' in response:
        for message in response['Messages']:
            print(f"Received: {message['Body']}")

            # Delete message
            sqs.delete_message(
                QueueUrl=queue_url,
                ReceiptHandle=message['ReceiptHandle']
            )
```

## Redis Streams

### Producer Example
```python
import redis

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Add message to stream
message_id = r.xadd('mystream', {
    'field1': 'value1',
    'field2': 'value2'
})

print(f"Message ID: {message_id}")
```

### Consumer Example
```python
import redis

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Consumer group
group_name = 'mygroup'
consumer_name = 'consumer1'

# Create consumer group
try:
    r.xgroup_create('mystream', group_name, '0')
except redis.ResponseError as e:
    if 'BUSYGROUP' not in str(e):
        raise

# Read messages
while True:
    messages = r.xreadgroup(
        group_name,
        consumer_name,
        {'mystream': '>'},
        count=1,
        block=0
    )

    for stream, message_list in messages:
        for message_id, fields in message_list:
            print(f"Received: {fields}")

            # Acknowledge message
            r.xack('mystream', group_name, message_id)
```
