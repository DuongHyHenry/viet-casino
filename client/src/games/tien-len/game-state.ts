import * as handlers from './game-handlers'

import { Combo } from './combos/index'

export type PlayerID = string;

export type playerState {
    id: PlayerID;
    hand: number[];
    hasPassed: boolean;
    hasWon: boolean;
}

export type Phase =
  | { type: 'Dealing' }
  | { type: 'First Play'; }
  | { type: 'Control'; current: PlayerID; currentCombo: Combo; }
  | { type: 'Continuation'; current: PlayerID; currentCombo: Combo; }
  | { type: 'Inheritance'; current: PlayerID; currentCombo: Combo; }
  | { type: 'End'; ranking: PlayerID[]; };

export function reducer(state: gameState): gameState {
  switch (state.phase.type) {
    case 'Dealing':
      return handlers.handleDealing(state);
    case 'First Play':
      //handle first play
    case 'Control':
      //handle control
    case 'Continuation':
      //handle continuation
    case 'Inheritance':
      //handle inheritance
    case 'End':
      //handle end
    default:
      return state;
  }
}

export type gameState = {
  phase: Phase;
  seats: PlayerID[];
  seatIndex: Record<PlayerID, number>;
  players: Record<PlayerID, playerState>;
  winnerIndex: PlayerID[];
}