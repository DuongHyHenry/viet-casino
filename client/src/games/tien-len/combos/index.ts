export * from './singles';
export * from './doubles';
export * from './triples';
export * from './straights';
export * from './bombs';

import * as combos from '../combos';

export function isValidCombo(selectedCombo: Combo): Combo | null {
  if (combos.isValidSingle(selectedCombo.cards)) return selectedCombo;
  if (combos.isValidDouble(selectedCombo.cards)) return selectedCombo;
  if (combos.isValidTriple(selectedCombo.cards)) return selectedCombo;
  if (combos.isValidStraight(selectedCombo.cards)) return selectedCombo;
  if (combos.isValidDoubleStraight(selectedCombo.cards)) return selectedCombo;
  if (combos.isValidQuadruple(selectedCombo.cards)) return selectedCombo;
  return null;
}

export type Combo = 
  | {type: 'Single'; cards: number[] }
  | {type: 'Double'; cards: number[] }
  | {type: 'Triple'; cards: number[] }
  | {type: 'Straight'; cards: number[] }
  | {type: 'Quadruple'; cards: number[] }
  | {type: 'Double Straight'; cards: number[] };