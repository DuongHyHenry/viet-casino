import { PlayerID } from './player-state'

import { playerState } from './player-state';

import { Combo } from './combos/index'

type Phase =
  | { type: 'Dealing' }
  | { type: 'Opening'; current: PlayerID; currentCombo: Combo; roundsPlayed: number; }
  | { type: 'Play'; current: PlayerID; currentCombo: Combo; }
  | { type: 'End'; ranking: PlayerID[]; };

type gameState = {
  phase: Phase;
  seatIndex: Record<PlayerID, number>;
  players: Record<PlayerID, playerState>;
}