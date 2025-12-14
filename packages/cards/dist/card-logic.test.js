import { getCard } from "./cards.js";
import { Deck } from "./deck.js";
test("Converting random number:", () => {
    let number = 51;
    const card = getCard(number);
    console.log(card);
});
test("Creating and shuffling deck:", () => {
    const deck = new Deck();
    console.log("Unshuffled:");
    deck.printDeck();
    deck.shuffle();
    console.log("Shuffled:");
    deck.printDeck();
});
