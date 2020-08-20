// We use web sockets to receive asyncronous search requests from the search bar

const WebSocketServer = require('ws').Server;

const genius = require('./genius');

require('dotenv').config();

const wss = new WebSocketServer({ port: process.env.WS_PORT });

wss.on('connection', function(socket) {

    // When data is received
    socket.on('message', (data) => {

        var res;
        genius.geniusSearch(data, function(res) {
            socket.send(JSON.stringify(res));
        });
            
    });

});


