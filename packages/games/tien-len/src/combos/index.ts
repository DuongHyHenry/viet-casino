export * from './singles.js';
export * from './doubles.js';
export * from './triples.js';
export * from './straights.js';
export * from './bombs.js';

import * as combos from '.';

export function isValidCombo(selected: Combo): Combo | null {
  if (selected.cards.length < 1) {
    return null;
  }
  switch (selected.type) {
    case 'Single':         
      return combos.isValidSingle(selected.cards) ? selected : null;
    case 'Double':         
      return combos.isValidDouble(selected.cards) ? selected : null;
    case 'Triple':         
      return combos.isValidTriple(selected.cards) ? selected : null;
    case 'Straight':       
      return combos.isValidStraight(selected.cards) ? selected : null;
    case 'Double Straight':
      return combos.isValidDoubleStraight(selected.cards) ? selected : null;
    case 'Quadruple':      
      return combos.isValidQuadruple(selected.cards) ? selected : null;
    default:               
      return null;
  }
}

export function canBeatCombo(currentCombo: combos.Combo, selectedCombo: combos.Combo): boolean {
  if (currentCombo.type === 'Single' && combos.canBombSingleTwo(selectedCombo.cards, currentCombo.cards[0])) return true;
  if (currentCombo.type === 'Double' && combos.canBombDoubleTwo(selectedCombo.cards, currentCombo.cards)) return true;

  if (isValidCombo(selectedCombo) === null) return false;

  if (selectedCombo.type !== currentCombo.type) return false;

  switch (currentCombo.type) {
    case 'Single':
      return combos.canBeatSingle(selectedCombo.cards, currentCombo.cards);
    case 'Double':
      return combos.canBeatDouble(selectedCombo.cards, currentCombo.cards);
    case 'Triple':
      return combos.canBeatTriple(selectedCombo.cards, currentCombo.cards);
    case 'Straight':
      return combos.canBeatStraight(selectedCombo.cards, currentCombo.cards);
    case 'Quadruple':
      return combos.canBeatQuadruple(selectedCombo.cards, currentCombo.cards);
    case 'Double Straight':
      return combos.canBeatDoubleStraight(selectedCombo.cards, currentCombo.cards);
    default:
      return false;
  }
}

export type Combo = 
  | {type: 'Single'; cards: number[] }
  | {type: 'Double'; cards: number[] }
  | {type: 'Triple'; cards: number[] }
  | {type: 'Straight'; cards: number[] }
  | {type: 'Quadruple'; cards: number[] }
  | {type: 'Double Straight'; cards: number[] };