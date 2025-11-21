import { cardIsBigger } from "../rules.js";
export function isValidDouble(selectedCombo) {
    if (selectedCombo.length !== 2)
        return false;
    if (selectedCombo[0] !== selectedCombo[1])
        return false;
    else
        return true;
}
export function canBeatDouble(doubleA, doubleB) {
    if (doubleA === doubleB)
        return false;
    const cardA = doubleA[0];
    const cardB = doubleB[0];
    return cardIsBigger(cardA, cardB);
}
