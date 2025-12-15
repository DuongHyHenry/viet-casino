import { test } from "vitest";
import * as game from './game-state.js';
import * as combos from './combos/index.js';
import { getRank } from "@viet-casino/awesome-card-rules";
test("Test game flow:", () => {
    let currentGame = game.createGame(["agent", "bot1", "bot2", "bot3"]);
    console.log(currentGame);
    currentGame = game.reducer(currentGame, { type: "DEAL" });
    console.log(currentGame);
    console.log(currentGame.players.agent.hand);
    if (currentGame.phase.type !== "FirstPlay") {
        console.log("Goofy ordering");
        return;
    }
    const starter = currentGame.phase.starter;
    console.log(combos.convertToCombo([2]));
    currentGame = game.reducer(currentGame, { type: "PLAY", player: starter, combo: { type: "Single", cards: [2] } });
    console.log(currentGame);
    console.log(currentGame.players.agent.hand);
    let hand = [];
    for (let i = 0; i < currentGame.players.agent.hand.length; i++) {
        hand.push(getRank(currentGame.players.agent.hand[i]));
    }
    console.log(hand);
});
