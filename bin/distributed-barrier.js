#!/usr/bin/env node
const net = require('net');

if (process.argv.length < 3) {
    console.error(`Usage: ${process.argv.join(' ')} TOKEN1 [TOKEN2 TOKEN...]`);
    process.exit(1);
}

const port = process.env.PORT || 8413;
const waitSet = new Set(process.argv.slice(2));
const connections = new Map();

const checkSet = () => {
    if (waitSet.size === 0) {
        for (let connection of connections.keys()) {
            connections.delete(connection);
            connection.end('Reached barrier!\n');
        }
        server.close();
    }
};

const server = net.createServer(socket => {
    socket.on('data', data => {
        const token = data.toString().trim();
        if (waitSet.has(token)) {
            waitSet.delete(token);
            connections.set(socket, token);
            checkSet();
        } else {
            socket.end('Invalid token!\n');
        }
    });
    socket.on('end', () => {
        if (connections.has(socket)) {
            waitSet.add(connections.get(socket));
            connections.delete(socket);
        }
    });
});

server.listen(port);
