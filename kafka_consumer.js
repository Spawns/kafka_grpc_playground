const Kafka = require('node-rdkafka');
const protobuf = require('protobufjs');
const Consumer = new Kafka.KafkaConsumer({
    'group.id': 'kafka',
    'metadata.broker.list': 'localhost:9092',
    'enable.auto.commit': true,
    'fetch.message.max.bytes': 1024*1024,
    'fetch.wait.max.ms': 1000
});

Consumer.connect();

Consumer.on('ready', () => {
    Consumer.subscribe(['locations']);
    Consumer.consume();
}).on('data', data => {
    protobuf.load(`randomNum.proto`, (err, root) => {
        const Locations = root.lookupType("pckgRandom.Locations");
        const decoded_message = Locations.decode(data.value);
        console.log(decoded_message);
    });
});