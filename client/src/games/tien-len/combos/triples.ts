import { cardIsBigger } from "../rules";

export function isValidTriple(selectedCombo: number[]): boolean {
    if (selectedCombo.length !== 3) return false;
    if (selectedCombo[0] !== selectedCombo[1] || selectedCombo[0] !== selectedCombo[2]) return false;
    else return true;
}

export function canBeatTriple(tripleA: number[], tripleB: number[]): boolean {
    if (tripleA === tripleB) return false;
    const cardA = tripleA[0];
    const cardB = tripleB[0];
    return cardIsBigger(cardA, cardB);
}
