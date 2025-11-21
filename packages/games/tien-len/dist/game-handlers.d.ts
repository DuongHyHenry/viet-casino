import { playerState } from "./game-state.js";
import * as combos from './combos/index.js';
import { GameState } from './game-state.js';
import { RoundState } from './game-state.js';
import { PlayerID } from './game-state.js';
export declare function updateGameState(phase: GameState['phase'], seats: PlayerID[], seatIndex: Record<PlayerID, number>, players: Record<PlayerID, playerState>, winners: PlayerID[]): GameState;
export declare function updateRoundState(prev: RoundState, updates: Partial<RoundState>): RoundState;
export declare function findNextPlayer(state: GameState, round: RoundState, currentPlayer: PlayerID): PlayerID;
export declare function handleDealing(state: GameState): GameState;
export declare function handleFirstPlay(state: GameState, player: playerState, selectedCombo: combos.Combo): GameState;
export declare function handlePlayCard(state: GameState, player: playerState, selectedCombo: combos.Combo): GameState;
export declare function handlePass(state: GameState, player: playerState): GameState;
export declare function handlePlayFromControl(state: GameState, player: playerState, selectedCombo: combos.Combo): GameState;
export declare function handleWin(state: GameState, player: playerState): GameState;
//# sourceMappingURL=game-handlers.d.ts.map