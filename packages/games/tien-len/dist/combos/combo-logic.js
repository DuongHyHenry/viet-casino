import * as singles from './singles.js';
import * as doubles from './doubles.js';
import * as triples from './triples.js';
import * as straights from './straights.js';
import * as bombs from './bombs.js';
export function convertToCombo(selected) {
    if (selected.length < 1) {
        return null;
    }
    switch (selected.length) {
        case 1:
            return { type: 'Single', cards: selected };
        case 2:
            if (doubles.isValidDouble(selected)) {
                return { type: 'Double', cards: selected };
            }
            else {
                return null;
            }
        case 3:
            if (triples.isValidTriple(selected)) {
                return { type: 'Triple', cards: selected };
            }
            else if (straights.isValidStraight(selected)) {
                return { type: 'Straight', cards: selected };
            }
            else {
                return null;
            }
        case 4:
            if (bombs.isValidQuadruple(selected)) {
                return { type: 'Quadruple', cards: selected };
            }
            else if (straights.isValidStraight(selected)) {
                return { type: 'Straight', cards: selected };
            }
            else {
                return null;
            }
        case 5:
            if (straights.isValidStraight(selected)) {
                return { type: 'Straight', cards: selected };
            }
            else {
                return null;
            }
        default:
            if (straights.isValidStraight(selected)) {
                return { type: 'Straight', cards: selected };
            }
            else if (bombs.isValidDoubleStraight(selected)) {
                return { type: 'Double Straight', cards: selected };
            }
            else {
                return null;
            }
    }
}
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
