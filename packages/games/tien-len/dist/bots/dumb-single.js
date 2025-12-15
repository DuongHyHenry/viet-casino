import { cardIsBigger } from "../rules.js";
export class DumbSingleBot {
    PlayerID;
    constructor(PlayerID) {
        this.PlayerID = PlayerID;
    }
    decide(state) {
        if (state.phase.type === "FirstPlay") {
            if (state.phase.starter === this.PlayerID) {
                return { type: 'PLAY', player: this.PlayerID, combo: { type: 'Single', cards: [2] } };
            }
            else {
                return { type: 'PASS', player: this.PlayerID };
            }
        }
        const hand = getValidMoves(state, this.PlayerID);
        if (hand && hand.length > 0) {
            return { type: 'PLAY', player: this.PlayerID, combo: { type: 'Single', cards: [selectLowestSingle(hand)] } };
        }
        else {
            return { type: 'PASS', player: this.PlayerID };
        }
    }
}
export function getValidMoves(state, PlayerID) {
    const hand = state.players[PlayerID].hand;
    if (state.phase.type !== "Round") {
        return [];
    }
    const cardToBeat = state.phase.round.lastComboPlayed;
    if (cardToBeat === null) {
        return hand;
    }
    if (cardToBeat.type !== "Single") {
        return [];
    }
    const newHand = [];
    for (let i = 0; i < hand.length; i++) {
        if (cardIsBigger(hand[i], cardToBeat.cards[0])) {
            newHand.push(hand[i]);
        }
    }
    return newHand;
}
export function selectLowestSingle(hand) {
    return hand[0];
}
