import { canBeatDouble } from "./doubles.js";
import { getCard, getRank } from "@viet-casino/awesome-card-rules";
import * as cards from '@viet-casino/awesome-card-rules';
export function isValidDoubleStraight(selectedCombo) {
    if (selectedCombo.length < 6 || selectedCombo.length % 2 !== 0)
        return false; //minimum length is 6 cards (3 pairs) and must be even number of cards
    for (let i = 2; i < selectedCombo.length; i++) {
        if (cards.getRank(selectedCombo[i]) === '2')
            return false; //straight cannot contain '2'
        if (Number(getRank(selectedCombo[i])) !== Number(getRank(selectedCombo[i - 2])) + 1) {
            return false;
        }
    }
    for (let i = 0; i < selectedCombo.length; i += 2) {
        if (Number(getRank(selectedCombo[i])) !== Number(getRank(selectedCombo[i + 1])))
            return false; //check for pairs
    }
    return true;
    //check for consecutive pairs
}
export function canBeatDoubleStraight(doubleStraightA, doubleStraightB) {
    if (doubleStraightA.length !== doubleStraightB.length)
        return false;
    const lastPairA = [doubleStraightA[doubleStraightA.length - 2], doubleStraightA[doubleStraightA.length - 1]];
    console.log(getCard(lastPairA[0]), getCard(lastPairA[1]));
    const lastPairB = [doubleStraightB[doubleStraightB.length - 2], doubleStraightB[doubleStraightB.length - 1]];
    console.log(getCard(lastPairB[0]), getCard(lastPairB[1]));
    return canBeatDouble(lastPairA, lastPairB);
}
export function isValidQuadruple(selectedCombo) {
    if (selectedCombo.length !== 4)
        return false;
    if (getCard(selectedCombo[0])[0] !== getCard(selectedCombo[1])[0] || getCard(selectedCombo[0])[0] !== getCard(selectedCombo[2])[0] || getCard(selectedCombo[0])[0] !== getCard(selectedCombo[3])[0])
        return false;
    else
        return true;
}
export function canBeatQuadruple(quadA, quadB) {
    if (quadA === quadB)
        return false;
    if (!isValidQuadruple(quadA) || !isValidQuadruple(quadB))
        return false;
    const cardA = quadA[3];
    const cardB = quadB[3];
    if (cards.getRank(cardB) === '2')
        return false; //quadruple of '2' cannot be beaten
    if (cards.getRank(cardA) === '2')
        return true;
    return cards.getRank(cardA) > cards.getRank(cardB);
}
export function canBombSingleTwo(selectedCombo, cardB) {
    if (cards.getRank(cardB) !== '2')
        return false;
    if (isValidDoubleStraight(selectedCombo) || isValidQuadruple(selectedCombo)) {
        return true;
    }
    else
        return false;
}
export function canBombDoubleTwo(selectedCombo, doubleB) {
    if (cards.getRank(doubleB[0]) !== '2')
        return false;
    if (isValidQuadruple(selectedCombo) || (isValidDoubleStraight(selectedCombo) && selectedCombo.length >= 8)) {
        return true;
    }
    else
        return false;
}
