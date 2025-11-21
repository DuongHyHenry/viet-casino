export type Combo = {
    type: 'Single';
    cards: number[];
} | {
    type: 'Double';
    cards: number[];
} | {
    type: 'Triple';
    cards: number[];
} | {
    type: 'Straight';
    cards: number[];
} | {
    type: 'Quadruple';
    cards: number[];
} | {
    type: 'Double Straight';
    cards: number[];
};
export declare function isValidCombo(selected: Combo): Combo | null;
export declare function canBeatCombo(currentCombo: Combo, selectedCombo: Combo): boolean;
//# sourceMappingURL=combo-logic.d.ts.map