import * as handlers from './game-handlers.js'

import { Combo } from './combos/index'

export type PlayerID = string;

export type playerState = {
    id: PlayerID;
    hand: number[];
    hasWon: boolean;
}

export type Phase =
  | { type: 'Dealing' }
  | { type: 'FirstPlay'; starter: PlayerID; }
  | { type: 'Round'; round: RoundState; }
  | { type: 'End'; ranking: PlayerID[]; };

export function createGame(seats: PlayerID[]): GameState {
    const seatIndex: Record<PlayerID, number> = {};
    seats.forEach((id, i) => (seatIndex[id] = i));
    return {
      phase: { type: 'Dealing'},
      seats,
      seatIndex,
      players: {},
      winners: [],
    };
}

export function reducer(state: GameState, action: Actions): GameState {
  switch (action.type) {
    case 'DEAL':
      return handlers.handleDealing(state);
    case 'PLAY':
      if (state.phase.type === 'FirstPlay') {
        return handlers.handleFirstPlay(state, state.players[action.player], action.combo);
      }
      if (state.phase.type === 'Round') {
        if ((state.phase.round.controller === action.player && state.phase.round.combosPlayed === 0)) {
          return handlers.handlePlayFromControl(state, state.players[action.player], action.combo);
        }
        if ((state.phase.round.passesSinceWin === state.seats.length - state.winners.length && state.phase.round.inheritor === action.player)) {
          return handlers.handlePlayFromControl(state, state.players[action.player], action.combo);
        }
        return handlers.handlePlayCard(state, state.players[action.player], action.combo);
      }
      return { ...state, error: 'Cannot play in this phase.' };
    case 'PASS':
      return handlers.handlePass(state, state.players[action.player]);
    default:
      return state;
  }
}

export type Actions =
  | { type: 'DEAL' }
  | { type: 'PLAY'; player: PlayerID; combo: Combo }
  | { type: 'PASS'; player: PlayerID }

export type RoundState = {
  controller: PlayerID | null;
  lastComboPlayed: Combo | null;
  playerToBeat: PlayerID | null;
  currentPlayer: PlayerID;
  combosPlayed: number;
  playersIn: Set<PlayerID>;
  passesSinceWin: number;
  inheritor?: PlayerID;
}

export type GameState = {
  phase: Phase;
  seats: PlayerID[];
  seatIndex: Record<PlayerID, number>;
  players: Record<PlayerID, playerState>;
  winners: PlayerID[];
  error?: string;
}