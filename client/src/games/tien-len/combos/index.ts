export * from './singles';
export * from './doubles';
export * from './triples';
export * from './straights';
export * from './bombs';

export type Combo = 
  | {type: 'Single'; card: number }
  | {type: 'Pair'; cards: number[] }
  | {type: 'Triple'; cards: number[] }
  | {type: 'Straight'; cards: number[] }
  | {type: 'Bomb'; cards: number[] };