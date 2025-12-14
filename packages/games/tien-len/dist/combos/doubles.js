import { cardIsBigger } from "../rules.js";
import { getCard } from "@viet-casino/awesome-card-rules";
export function isValidDouble(selectedCombo) {
    if (selectedCombo.length !== 2)
        return false;
    if (getCard(selectedCombo[0])[0] !== getCard(selectedCombo[1])[0])
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
