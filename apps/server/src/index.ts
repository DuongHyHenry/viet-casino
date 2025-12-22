import fs from 'fs';
import Fastify from 'fastify';
import crypto from 'crypto';
import { Server } from 'socket.io';

import * as tienlen from '@viet-casino/awesome-tien-len';

fs;

const games = new Map<string, tienlen.GameState>();

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

fastify.post('/tienlen/start', (request, reply) => {
    const { players } = request.body as { players: string[] };
    if (!Array.isArray(players) || players.some(u => typeof u !== 'string')) {
        return reply.code(400).send({ error: "Wrong input format" });
    }
    if (players.length != 4) {
        return reply.code(400).send({ error: "Wrong number of players" });
    }
    const initializedGame = tienlen.createGame(players);
    const state = tienlen.reducer(initializedGame, {type: 'DEAL'});
    const gameID = crypto.randomUUID();
    games.set(gameID, state);

    const newState = tienlen.convertPlayersIn(state);

    return reply.send({ gameID, state: newState });
});

fastify.post('/tienlen/:gameID/play/:playerID', (request, reply) => {
    const { gameID, playerID } = request.params as { gameID: string; playerID: string };
    const move = request.body as tienlen.Combo;

    const game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    
    const state = tienlen.reducer(game, {
        type: 'PLAY', 
        player: playerID, 
        combo: move
    });

    games.set(gameID, state);

    const newState = tienlen.convertPlayersIn(state);

    return reply.send({ gameID, state: newState });
});

fastify.post('/tienlen/:gameID/botstep', (request, reply) => {
    const { gameID } = request.params as { gameID: string; };

    let game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }

    let currentPlayer

    const botList: Record<string, any> = {
        bot1: new tienlen.DumbSingleBot("bot1"),
        bot2: new tienlen.DumbSingleBot("bot2"),
        bot3: new tienlen.DumbSingleBot("bot3")
    }

    let i = 0;

    while (i < 30) {
        if (game.phase.type == "FirstPlay") {
            currentPlayer = game.phase.starter;
        }
        else if (game.phase.type == "Round") {
            currentPlayer = game.phase.round.currentPlayer;
        }
        else if (game.phase.type == "End") {
            break;
        }
        else {
            return reply.code(404).send({ error: "Game state needs to be in FirstPlay or Round for /botstep to work" });
        }
        if (currentPlayer == "agent") {
            break;
        }

        let action = botList[currentPlayer].decide(game);
        
        game = tienlen.reducer(game, action)

        i++;
    }

    games.set(gameID, game)

    const newState = tienlen.convertPlayersIn(game);

    return reply.send({ gameID, state: newState });
});

fastify.post('/tienlen/:gameID/pass/:playerID', (request, reply) => {
    const { gameID, playerID } = request.params as { gameID: string, playerID: string };
    const game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    const state = tienlen.reducer(game, {type: 'PASS', player: playerID});
    games.set(gameID, state);
    
    const newState = tienlen.convertPlayersIn(state);

    return reply.send({ gameID, state: newState });
});

fastify.get('/tienlen/:gameID/game-state', (request, reply) => {
    const { gameID } = request.params as { gameID: string };
    const game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    const newState = tienlen.convertPlayersIn(game);

    return reply.send({ gameID, state: newState });
});

fastify.get('/tienlen/:gameID/player-state/:playerID', (request, reply) => {
    const { gameID, playerID } = request.params as { gameID: string, playerID: string };
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
    const { gameID, playerID } = request.params as { gameID: string, playerID: string };
    const game = games.get(gameID);
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    const player = game.players[playerID];
    if (!player) {
        return reply.code(404).send({ error: "Player not found" });
    }

    const legalActions = tienlen.getValidMoves(game, playerID); 

    return reply.send({ legalActions });
});

try{ 
    fastify.listen({ port: 5000 });
} catch(error) {
    fastify.log.error(error);
    process.exit(1);
}
