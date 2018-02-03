#!/usr/bin/env node
const net = require('net');

if (process.argv.length < 3) {
    console.error(`Usage: ${process.argv.join(' ')} TOKEN1 [TOKEN2 TOKEN...]`);
    process.exit(1);
}

const port = process.env.PORT || 8413;
const waitSet = new Set(process.argv.slice(2));
const connections = new Map();

const anonymousMode = process.argv[2] === '-n';
let awaiting = waitSet.size;
if (anonymousMode) {
    awaiting = parseInt(process.argv[3]);
}

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
    if (anonymousMode) {
        connections.set(socket, awaiting);
        awaiting -= 1;

        console.log(`[join] awaiting ${awaiting}`);

        if (awaiting === 0) {
            for (let connection of connections.keys()) {
                connections.delete(connection);
                connection.end('Reached barrier!\n');
            }
            server.close();
        }
    } else {
        socket.on('data', data => {
            const token = data.toString().trim();
            if (waitSet.has(token)) {
                console.log(`[join] ${token}`);
                waitSet.delete(token);
                connections.set(socket, token);
                checkSet();
            } else {
                socket.end('Invalid token!\n');
            }
        });
        socket.on('end', () => {
            if (connections.has(socket)) {
                const token = connections.get(socket);
                console.log(`[leave] ${token}`);
                waitSet.add(token);
                connections.delete(socket);
            }
        });
    }
});

server.listen(port);
