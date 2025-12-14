import { test } from "vitest";
import * as handlers from './game-handlers.js'
import * as game from './game-state.js'
import * as combos from './combos/index.js'

test("Test game flow:", () => {
    let currentGame = game.createGame(["agent", "bot1", "bot2", "bot3"]);
    console.log(currentGame);

    currentGame = game.reducer(currentGame, {type: "DEAL"});
    console.log(currentGame);

    console.log(currentGame.players.agent.hand);

    if (currentGame.phase.type !== "FirstPlay") {
        console.log("Goofy ordering");
        return;
    }

    const starter = currentGame.phase.starter;

    console.log(combos.convertToCombo([2]))

    currentGame = game.reducer(currentGame, {type: "PLAY", player: starter, combo: combos.convertToCombo([2])});

    console.log(currentGame)

    console.log(currentGame.players.agent.hand);
});