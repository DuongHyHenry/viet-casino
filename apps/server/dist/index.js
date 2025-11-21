import fs from 'fs';
import Fastify from 'fastify';
import crypto from 'crypto';
import { Server } from 'socket.io';
import * as tienlen from '@viet-casino/awesome-tien-len';
fs;
const games = new Map();
const fastify = Fastify({
    logger: true
});
const io = new Server(fastify.server, {
    cors: { origin: '*' },
});
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('message', (message) => {
        console.log(message);
        io.emit('message', message);
    });
});
fastify.post('/tienlen/start', (request, reply) => {
    const { users } = request.body;
    if (!Array.isArray(users) || users.some(u => typeof u !== 'string')) {
        return reply.code(400).send({ error: "Wrong input format" });
    }
    if (users.length != 4) {
        return reply.code(400).send({ error: "Wrong number of players" });
    }
    const initializedGame = tienlen.createGame(users);
    const newState = tienlen.reducer(initializedGame, { type: 'DEAL' });
    const gameID = crypto.randomUUID();
    games.set(gameID, newState);
    return reply.send({ gameID, state: newState });
});
fastify.post('/tienlen/:gameID/play/:playerID', (request, reply) => {
    const { gameID, playerID } = request.params;
    const { move } = request.body;
    const game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    const newState = tienlen.reducer(game, {
        type: 'PLAY',
        player: playerID,
        combo: move
    });
    games.set(gameID, newState);
    return reply.send({ gameID, state: newState });
});
fastify.post('/tienlen/:gameID/pass/:playerID', (request, reply) => {
    const { gameID, playerID } = request.params;
    const game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    const newState = tienlen.reducer(game, { type: 'PASS', player: playerID });
    games.set(gameID, newState);
    return reply.send({ gameID, state: newState });
});
fastify.get('/tienlen/:gameID/game-state', (request, reply) => {
    const { gameID } = request.params;
    const game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    return reply.send({ gameID, state: game });
});
fastify.get('/tienlen/:gameID/player-state/:playerID', (request, reply) => {
    const { gameID, playerID } = request.params;
    const game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    const player = game.players[playerID];
    if (!player) {
        return reply.code(404).send({ error: "Player not found" });
    }
    return reply.send({ player });
});
fastify.get('/tienlen/:gameID/legal-actions/:playerID', (request, reply) => {
    // Make a helper function in game-handlers
});
try {
    fastify.listen({ port: 5000 });
}
catch (error) {
    fastify.log.error(error);
    process.exit(1);
}
