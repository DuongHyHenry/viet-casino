//helper functions for cards

export function getSuit(card: number) {
    const suits: string[] = ['Spades', 'Clubs', 'Diamonds', 'Hearts'];
    return suits[Math.floor(card / 13) % 4];
}


export function getRank(card: number) {
    const rank: string[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return rank[card % 13];
}


export function getCard(card: number) {
    return [getRank(card), getSuit(card)];
}