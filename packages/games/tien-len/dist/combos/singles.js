import { cardIsBigger } from "../rules.js";
export function isValidSingle(selectedCombo) {
    if (selectedCombo.length !== 1)
        return false;
    else
        return true;
}
export function canBeatSingle(cardA, cardB) {
    if (cardA === cardB)
        return false;
    return cardIsBigger(cardA[0], cardB[0]);
}
