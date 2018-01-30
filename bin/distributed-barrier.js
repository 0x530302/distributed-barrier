#!/usr/bin/env node
const net = require('net');

if (process.argv.length < 3) {
    console.error(`Usage: ${process.argv.join(' ')} TOKEN1 [TOKEN2 TOKEN...]`);
    process.exit(1);
}

const port = process.env.PORT || 8413;
const waitSet = new Set(process.argv.slice(2));
const connections = [];

const checkSet = () => {
    if (waitSet.size === 0) {
        connections.forEach(connection => {
            connection.end('Reached barrier!\n');
        });
        server.close();
    }
};

const server = net.createServer(socket => {
    socket.on('data', data => {
        const uuid = data.toString().trim();
        if (waitSet.has(uuid)) {
            waitSet.delete(uuid);
            connections.push(socket);
            checkSet();
        } else {
            socket.end('Invalid uuid!\n');
        }
    });
});

server.listen(port);
