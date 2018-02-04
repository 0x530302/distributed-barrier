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
    setTimeout(() => {
        if (waitSet.size === 0) {
            for (let connection of connections.keys()) {
                connections.delete(connection);
                connection.end('Reached barrier!\n');
                setTimeout(() => connection.destroy(), 500);
            }
            server.close();
        }
    }, 1000);
};

const server = net.createServer(socket => {
    console.log(`[debug] ${socket.remoteAddress}:${socket.remotePort}`);
    socket.setNoDelay();

    socket.once('data', data => {
        const token = data.toString().split('\n', 1)[0].trim();
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
});

server.listen(port);
