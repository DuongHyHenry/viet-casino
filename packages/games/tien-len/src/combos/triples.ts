import { cardIsBigger } from "../rules.js";
import { getCard, getRank } from "@viet-casino/awesome-card-rules"

export function isValidTriple(selectedCombo: number[]): boolean {
    if (selectedCombo.length !== 3) return false;
    if (getRank(selectedCombo[0]) !== getCard(selectedCombo[1])[0] || getCard(selectedCombo[0])[0] !== getCard(selectedCombo[2])[0]) return false;
    else return true;
}

export function canBeatTriple(tripleA: number[], tripleB: number[]): boolean {
    if (tripleA === tripleB) return false;
    if (!isValidTriple(tripleA) || !isValidTriple(tripleB)) return false
    const cardA = tripleA[2];
    const cardB = tripleB[2];
    return cardIsBigger(cardA, cardB);
}
