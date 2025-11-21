"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDoubleStraight = isValidDoubleStraight;
exports.canBeatDoubleStraight = canBeatDoubleStraight;
exports.isValidQuadruple = isValidQuadruple;
exports.canBeatQuadruple = canBeatQuadruple;
exports.canBombSingleTwo = canBombSingleTwo;
exports.canBombDoubleTwo = canBombDoubleTwo;
const cards_1 = require("../../cards");
const doubles_1 = require("./doubles");
function isValidDoubleStraight(selectedCombo) {
    if (selectedCombo.length < 6 || selectedCombo.length % 2 !== 0)
        return false; //minimum length is 6 cards (3 pairs) and must be even number of cards
    for (let i = 0; i < selectedCombo.length; i++) {
        if ((0, cards_1.getRank)(selectedCombo[i]) === '2')
            return false; //straight cannot contain '2'
        if (selectedCombo[i] !== selectedCombo[i - 1] + 1) {
            return false;
        }
    }
    for (let i = 0; i < selectedCombo.length; i += 2) {
        if (selectedCombo[i] !== selectedCombo[i + 1])
            return false; //check for pairs
    }
    return true;
    //check for consecutive pairs
}
function canBeatDoubleStraight(doubleStraightA, doubleStraightB) {
    if (doubleStraightA.length !== doubleStraightB.length)
        return false;
    const lastPairA = [doubleStraightA[doubleStraightA.length - 2], doubleStraightA[doubleStraightA.length - 1]];
    const lastPairB = [doubleStraightB[doubleStraightB.length - 2], doubleStraightB[doubleStraightB.length - 1]];
    return (0, doubles_1.canBeatDouble)(lastPairA, lastPairB);
}
function isValidQuadruple(selectedCombo) {
    if (selectedCombo.length !== 4)
        return false;
    if (selectedCombo[0] !== selectedCombo[1] || selectedCombo[0] !== selectedCombo[2] || selectedCombo[0] !== selectedCombo[3])
        return false;
    else
        return true;
}
function canBeatQuadruple(quadA, quadB) {
    if (quadA === quadB)
        return false;
    const cardA = quadA[0];
    const cardB = quadB[0];
    if ((0, cards_1.getRank)(cardA) === '2')
        return false; //quadruple of '2' cannot be beaten
    if ((0, cards_1.getRank)(cardB) === '2')
        return true;
    return (0, cards_1.getRank)(cardA) > (0, cards_1.getRank)(cardB);
}
function canBombSingleTwo(selectedCombo, cardB) {
    if ((0, cards_1.getRank)(cardB) !== '2')
        return false;
    if (isValidDoubleStraight(selectedCombo) || isValidQuadruple(selectedCombo)) {
        return true;
    }
    else
        return false;
}
function canBombDoubleTwo(selectedCombo, doubleB) {
    if ((0, cards_1.getRank)(doubleB[0]) !== '2')
        return false;
    if (isValidQuadruple(selectedCombo) || (isValidDoubleStraight(selectedCombo) && selectedCombo.length >= 6)) {
        return true;
    }
    else
        return false;
}
