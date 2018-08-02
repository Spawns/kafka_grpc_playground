const protobuf = require('protobufjs');
const grpc = require('grpc');
const random_proto = grpc.load(__dirname + '/randomNum.proto').pckgRandom;

const Producer = require('node-rdkafka').Producer({
    'client.id': 'my-client1',
    'metadata.broker.list': 'localhost:9092',
    'dr_cb': true,
    'request.required.acks': 'all'
});

Producer.connect();

const getLocations = call => {
    const data = {
        longitude: call.request.longitude,
        latitude: call.request.latitude,
    };
    protobuf.load(`${__dirname}/randomNum.proto`, (err, root) => {
        if (err)
            throw err;
        const Locations = root.lookupType("pckgRandom.Locations");
        const errMsg = Locations.verify(data);
        if (errMsg)
            throw Error(errMsg);
        const message = Locations.create(data);
        const buffer = Locations.encode(message).finish();
        try{
            Producer.produce('locations', 0, buffer, null, Date.now());
        } catch (err) {
            console.error('A problem occurred when sending our message');
            console.error(err);
        }
    });
    console.log(`Longitude: ${data.longitude} Latitude: ${data.latitude}`);
};

const main = () => {
    const server = new grpc.Server();
    server.addService(random_proto.srvRandom.service, {getLocations: getLocations});
    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    server.start();
};

Producer.on('ready', () => {
    main();
});

Producer.on('event.error', err => {
    console.error('Error from producer');
    console.error(err);
});
