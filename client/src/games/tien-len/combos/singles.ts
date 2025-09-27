import { cardIsBigger } from "../rules";

export function isValidSingle(selectedCombo: number[]): boolean {
    if (selectedCombo.length !== 1) return false;
    else return true;
}

export function canBeatSingle(cardA: number, cardB: number): boolean {
    if (cardA === cardB) return false;
    return cardIsBigger(cardA, cardB);
}

