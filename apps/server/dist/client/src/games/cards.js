"use strict";
//helper functions for cards
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuit = getSuit;
exports.getRank = getRank;
exports.getCard = getCard;
function getSuit(card) {
    const suits = ['Spades', 'Clubs', 'Diamonds', 'Hearts'];
    return suits[Math.floor(card / 13) % 4];
}
function getRank(card) {
    const rank = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return rank[card % 13];
}
function getCard(card) {
    return [getRank(card), getSuit(card)];
}
