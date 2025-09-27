import { getRank } from "@/games/cards";

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


export function isValidQuadruple(selectedCombo: number[]): boolean { 
    if (selectedCombo.length !== 4) return false;
    if (selectedCombo[0] !== selectedCombo[1] || selectedCombo[0] !== selectedCombo[2] || selectedCombo[0] !== selectedCombo[3]) return false;
    else return true;
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