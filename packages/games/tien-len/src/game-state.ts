import * as handlers from './game-handlers.js'

import { Combo } from './combos/index.js'

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
      console.log(`[DEAL]`);
      return handlers.handleDealing(state);
    case 'PLAY':
      console.log(`[PLAY] ${action.player}`, action.combo);
      if (state.phase.type === 'FirstPlay') {
        return handlers.handleFirstPlay(state, state.players[action.player], action.combo);
      }
      if (state.phase.type === 'Round') {
        if ((state.phase.round.controller === action.player && state.phase.round.combosPlayed === 0)) {
          return handlers.handlePlayFromControl(state, state.players[action.player], action.combo);
        }
        //console.log(`${state.phase.round.passesSinceWin} vs ${state.seats.length - state.winners.length - 1}`)
        //console.log(`${state.phase.round.inheritor} vs ${action.player}`)
        console.log(`playersIn: ${state.phase.round.playersIn.size}`);
        if ((state.phase.round.playersIn.size === 1 || state.phase.round.inheritor === action.player)) {
          console.log(`${action.player} has gained control! V2`);
          return handlers.handlePlayFromControl(state, state.players[action.player], action.combo);
        }
        return handlers.handlePlayCard(state, state.players[action.player], action.combo);
      }
      return { ...state, error: 'Cannot play in this phase.' };
    case 'PASS':
      console.log(`[PASS] ${action.player}`);
      return handlers.handlePass(state, state.players[action.player]);
    default:
      return state;
  }
}

export function convertPlayersIn(state: GameState): any {
  if (state.phase.type !== "Round") return state;

  return {
    ...state,
    phase: {
      ...state.phase,
      round: {
        ...state.phase.round,
        playersIn: Array.from(state.phase.round.playersIn ?? []),
      },
    },
  };
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