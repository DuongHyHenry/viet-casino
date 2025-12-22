import { cardIsBigger } from "../rules.js";
import { getRank } from "@viet-casino/awesome-card-rules";
export function isValidDouble(selectedCombo) {
    if (selectedCombo.length !== 2)
        return false;
    if (getRank(selectedCombo[0]) !== getRank(selectedCombo[1]))
        return false;
    else
        return true;
}
export function canBeatDouble(doubleA, doubleB) {
    if (doubleA === doubleB)
        return false;
    if (!isValidDouble(doubleA) || !isValidDouble(doubleB))
        return false;
    const cardA = doubleA[1];
    const cardB = doubleB[1];
    return cardIsBigger(cardA, cardB);
}
