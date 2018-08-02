const grpc = require('grpc');
const random_proto = grpc.load(__dirname + '/randomNum.proto').pckgRandom;

function main () {
    const client = new random_proto.srvRandom('localhost:50051', grpc.credentials.createInsecure());
    setInterval(() => {
        client.getLocations({
            longitude: Math.random() * (10),
            latitude: Math.random() * (10)
        }, function(err, response) {
            console.log(err+response)
        });
    }, 1000);
}

main();