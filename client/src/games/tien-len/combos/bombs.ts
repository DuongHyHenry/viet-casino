import { getRank } from "@/games/cards";
import { canBeatDouble } from "./doubles";

export function isValidDoubleStraight(selectedCombo: number[]): boolean {
    if (selectedCombo.length < 6 || selectedCombo.length % 2 !== 0) return false; //minimum length is 6 cards (3 pairs) and must be even number of cards
    for (let i = 0; i < selectedCombo.length; i++) {
        if (getRank(selectedCombo[i]) === '2') return false; //straight cannot contain '2'
        if (selectedCombo[i] !== selectedCombo[i - 1] + 1) {
            return false; 
        }
    }
    for (let i = 0; i < selectedCombo.length; i += 2) {
        if (selectedCombo[i] !== selectedCombo[i + 1]) return false; //check for pairs
    }
    return true;
    //check for consecutive pairs
}

export function canBeatDoubleStraight(doubleStraightA: number[], doubleStraightB: number[]): boolean {
    if (doubleStraightA.length !== doubleStraightB.length) return false;
    const lastPairA = [doubleStraightA[doubleStraightA.length - 2], doubleStraightA[doubleStraightA.length - 1]];
    const lastPairB = [doubleStraightB[doubleStraightB.length - 2], doubleStraightB[doubleStraightB.length - 1]];
    return canBeatDouble(lastPairA, lastPairB);
}


export function isValidQuadruple(selectedCombo: number[]): boolean { 
    if (selectedCombo.length !== 4) return false;
    if (selectedCombo[0] !== selectedCombo[1] || selectedCombo[0] !== selectedCombo[2] || selectedCombo[0] !== selectedCombo[3]) return false;
    else return true;
}

export function canBeatQuadruple(quadA: number[], quadB: number[]): boolean {
    if (quadA === quadB) return false;
    const cardA = quadA[0];
    const cardB = quadB[0];
    if (getRank(cardA) === '2') return false; //quadruple of '2' cannot be beaten
    if (getRank(cardB) === '2') return true;
    return getRank(cardA) > getRank(cardB);
}

export function canBombSingleTwo(selectedCombo: number[], cardB: number): boolean {
    if (getRank(cardB) !== '2') return false;
    if (isValidDoubleStraight(selectedCombo) || isValidQuadruple(selectedCombo)) {
        return true;
    }
    else return false;
}

export function canBombDoubleTwo(selectedCombo: number[], doubleB: number[]): boolean {
    if (getRank(doubleB[0]) !== '2') return false;
    if (isValidQuadruple(selectedCombo) || (isValidDoubleStraight(selectedCombo) && selectedCombo.length >= 6)) {
        return true;
    }
    else return false;
}