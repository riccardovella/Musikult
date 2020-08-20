const request = require('request');
const childProcess = require('child_process');
const WebSocketServer = require('ws').Server;

var invoked = false;
const scriptPath = './utilities/player-producer.js';

var process = childProcess.fork(scriptPath);

// listen for errors as they may prevent the exit event from firing
process.on('error', function (err) {

    if (invoked) return;
    invoked = true;

    console.log(err.name + ": " + err.message);

});

// execute the callback once the process has finished running
process.on('exit', function (code) {

    if (invoked) return;
    invoked = true;

    var err = code === 0 ? null : new Error('exit code ' + code);
    if(err) console.log("ERROR: " + err.name + ": " + err.message);

});



const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) throw error0;


    connection.createChannel(function(error1, channel) {

        if (error1) throw error1;

        var queue = 'hello';

        channel.assertQueue(queue, {

            durable: false

        });

        console.log(" [*] Waiting for messages in %s. ", queue);

        channel.consume(queue, function(msg) {

            console.log(" [x] Received %s", msg.content.toString());
            
        }, {
            noAck: true
        });

    });
    
});