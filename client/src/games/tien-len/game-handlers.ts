import { Deck } from "../deck";

export function handleDealing(): number[][] {
    const deck = new Deck();
    deck.shuffle();
    let hand1 = deck.getCards().slice(0, 13);
    let hand2 = deck.getCards().slice(13, 26);
    let hand3 = deck.getCards().slice(26, 39);
    let hand4 = deck.getCards().slice(39);
    return [hand1, hand2, hand3, hand4];
}