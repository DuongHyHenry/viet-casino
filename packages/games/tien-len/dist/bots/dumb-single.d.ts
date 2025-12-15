import { Bot } from "./bot-types.js";
import { GameState, Actions, PlayerID } from "../game-state.js";
export declare class DumbSingleBot implements Bot {
    private readonly PlayerID;
    constructor(PlayerID: PlayerID);
    decide(state: GameState): Actions;
}
export declare function getValidMoves(state: GameState, PlayerID: string): number[];
export declare function selectLowestSingle(hand: number[]): number;
//# sourceMappingURL=dumb-single.d.ts.map