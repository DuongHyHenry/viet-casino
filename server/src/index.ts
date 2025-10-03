import fs from 'fs';
import Fastify from 'fastify';
import { Server } from 'socket.io';

fs;

const fastify = Fastify({
    logger: true
});

const io = new Server(fastify.server, {
    cors: {origin: '*'},
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('message', (message) => {
        console.log(message);
        io.emit('message', message)
    });
});

fastify.get('/', (req, res) => {
    return {

    };
});

try{ 
    fastify.listen({ port: 3000 });
} catch(error) {
    fastify.log.error(error);
    process.exit(1);
}
