import * as singles from './singles.js';
import * as doubles from './doubles.js';
import * as triples from './triples.js';
import * as straights from './straights.js';
import * as bombs from './bombs.js';
export function isValidCombo(selected) {
    if (selected.cards.length < 1) {
        return null;
    }
    switch (selected.type) {
        case 'Single':
            return singles.isValidSingle(selected.cards) ? selected : null;
        case 'Double':
            return doubles.isValidDouble(selected.cards) ? selected : null;
        case 'Triple':
            return triples.isValidTriple(selected.cards) ? selected : null;
        case 'Straight':
            return straights.isValidStraight(selected.cards) ? selected : null;
        case 'Double Straight':
            return bombs.isValidDoubleStraight(selected.cards) ? selected : null;
        case 'Quadruple':
            return bombs.isValidQuadruple(selected.cards) ? selected : null;
        default:
            return null;
    }
}
export function canBeatCombo(currentCombo, selectedCombo) {
    if (currentCombo.type === 'Single' && bombs.canBombSingleTwo(selectedCombo.cards, currentCombo.cards[0]))
        return true;
    if (currentCombo.type === 'Double' && bombs.canBombDoubleTwo(selectedCombo.cards, currentCombo.cards))
        return true;
    if (isValidCombo(selectedCombo) === null)
        return false;
    if (selectedCombo.type !== currentCombo.type)
        return false;
    switch (currentCombo.type) {
        case 'Single':
            return singles.canBeatSingle(selectedCombo.cards, currentCombo.cards);
        case 'Double':
            return doubles.canBeatDouble(selectedCombo.cards, currentCombo.cards);
        case 'Triple':
            return triples.canBeatTriple(selectedCombo.cards, currentCombo.cards);
        case 'Straight':
            return straights.canBeatStraight(selectedCombo.cards, currentCombo.cards);
        case 'Quadruple':
            return bombs.canBeatQuadruple(selectedCombo.cards, currentCombo.cards);
        case 'Double Straight':
            return bombs.canBeatDoubleStraight(selectedCombo.cards, currentCombo.cards);
        default:
            return false;
    }
}
