import { test } from "vitest";
import * as handlers from './game-handlers.js'
import * as game from './game-state.js'
import * as combos from './combos/index.js'
import { getRank, getCard } from "@viet-casino/awesome-card-rules"
import { DumbSingleBot } from "./bots/dumb-single.js";



test("Test game flow:", async() => {
    let currentGame = game.createGame(["agent", "bot1", "bot2", "bot3"]);
    console.log(currentGame);

    const players = {
        agent: new DumbSingleBot("agent"),
        bot1: new DumbSingleBot("bot1"),
        bot2: new DumbSingleBot("bot2"),
        bot3: new DumbSingleBot("bot3"),
    };

    let i = 0;

    while(currentGame.phase.type !== "End") {

        if (currentGame.phase.type === "Dealing") {
            console.log("Dealing...");
            currentGame = game.reducer(currentGame, {type: "DEAL"});
            console.log(currentGame.players.agent.hand);
        }
        else if (currentGame.phase.type === "FirstPlay") {
            i++;
            console.log("First play:")
            const starter = currentGame.phase.starter;
            const action = players[starter].decide(currentGame);
            console.log(`My name is ${starter} and I am playing my three of spades: ${getCard(action.combo.cards)}`);
            currentGame = game.reducer(currentGame, action);
        }
        else if (currentGame.phase.type === "Round") {
            const currentPlayer = currentGame.phase.round.currentPlayer;
            const action = players[currentPlayer].decide(currentGame);
            if (action.type == "PASS") {
                console.log(`My name is ${currentPlayer} and I am passing.`);
            }
            else {
                i++;
                console.log(`My name is ${currentPlayer} and I am playing a card: ${getCard(action.combo.cards)}`);
            }
            //console.log(currentGame.players[currentPlayer].hand)
            currentGame = game.reducer(currentGame, action);
        }
    }

    console.log(currentGame.phase.ranking, i);
});