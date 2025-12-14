import { getRank } from "@viet-casino/awesome-card-rules";
export function getSuitValue(card) {
    return Math.floor(card / 13) % 4;
}
export function getRankValue(card) {
    if (getRank(card) === 'A')
        return 13; //A is the second highest rank
    else if (getRank(card) === '2')
        return 14; //2 is the highest rank
    else
        return Math.floor(card) % 13;
}
export function cardIsBigger(cardA, cardB) {
    if (cardA === cardB)
        return false;
    if (getRankValue(cardA) === getRankValue(cardB)) {
        return getSuitValue(cardA) > getSuitValue(cardB);
    }
    else
        return getRankValue(cardA) > getRankValue(cardB);
}
// export function cardIsPlayable(card: number, currentPlay: number[]): boolean {
//     if (cardIsBigger(card, currentPlay[0])) {
//         if (currentPlay.length === 1) return true;
//         else if (currentPlay.length === 2) {
//             //Check combos
//         }
//     }
// }
