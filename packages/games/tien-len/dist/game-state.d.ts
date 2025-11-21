import { Combo } from './combos/index.js';
export type PlayerID = string;
export type playerState = {
    id: PlayerID;
    hand: number[];
    hasWon: boolean;
};
export type Phase = {
    type: 'Dealing';
} | {
    type: 'FirstPlay';
    starter: PlayerID;
} | {
    type: 'Round';
    round: RoundState;
} | {
    type: 'End';
    ranking: PlayerID[];
};
export declare function createGame(seats: PlayerID[]): GameState;
export declare function reducer(state: GameState, action: Actions): GameState;
export type Actions = {
    type: 'DEAL';
} | {
    type: 'PLAY';
    player: PlayerID;
    combo: Combo;
} | {
    type: 'PASS';
    player: PlayerID;
};
export type RoundState = {
    controller: PlayerID | null;
    lastComboPlayed: Combo | null;
    playerToBeat: PlayerID | null;
    currentPlayer: PlayerID;
    combosPlayed: number;
    playersIn: Set<PlayerID>;
    passesSinceWin: number;
    inheritor?: PlayerID;
};
export type GameState = {
    phase: Phase;
    seats: PlayerID[];
    seatIndex: Record<PlayerID, number>;
    players: Record<PlayerID, playerState>;
    winners: PlayerID[];
    error?: string;
};
//# sourceMappingURL=game-state.d.ts.map