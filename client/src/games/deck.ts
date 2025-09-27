export class Deck {
    private readonly cards: number[];

    constructor() {
        // Initialize a standard deck of 52 cards represented by numbers 0-51
        this.cards = Array.from({ length: 52 }, (_, i) => i);
    }

    /**
     * Shuffle the deck using Fisher-Yates algorithm
     */
    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            // Pick a random index from 0 to i
            const j = Math.floor(Math.random() * (i + 1));

            // Swap cards[i] and cards[j] if they are different
            if (i !== j) {
                [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
            }
        }
    }

    /**
     * Get a copy of the cards array
     */
    getCards(): number[] {
        return [...this.cards];
    }
}