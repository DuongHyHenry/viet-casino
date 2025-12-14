import { cardIsBigger } from "../rules.js";
import { getRank } from "@viet-casino/awesome-card-rules";

export function isValidStraight(selectedCombo: number[]): boolean {
    if (selectedCombo.length < 3) return false; //minimum straight length is 3
    if (getRank(selectedCombo[0]) === '2') return false;
    for (let i = 1; i < selectedCombo.length; i++) {
        if (getRank(selectedCombo[i]) === '2') return false; //straight cannot contain '2'
        if ((Number(selectedCombo[i]) % 13) !== (Number(selectedCombo[i - 1]) % 13) + 1) {
            if ((Number(selectedCombo[i]) % 13) === (Number(selectedCombo[i - 1]) % 13) - 12) { //ends with ace
                continue;
            }
            else {
                return false;
            }
        }
    }
    return true;
}

export function canBeatStraight(straightA: number[], straightB: number[]) : boolean {
        if (straightA.length !== straightB.length) return false;
        if (!isValidStraight(straightA) || !isValidStraight(straightB)) return false;
        //compare highest cards
        const highestA = Math.max(...straightA);
        const highestB = Math.max(...straightB);
        if (highestA === highestB) return false; //same straight
        return cardIsBigger(highestA, highestB);
    }