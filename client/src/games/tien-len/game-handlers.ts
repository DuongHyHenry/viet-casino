import { Deck } from "../deck";
import { playerState } from "./player-state";
import * as combos from './combos';
import { gameState } from './game-state';

export function handleDealing(state: gameState): gameState {
    const deck = new Deck();
    deck.shuffle();
    let hand1 = deck.getCards().slice(0, 13);
    let hand2 = deck.getCards().slice(13, 26);
    let hand3 = deck.getCards().slice(26, 39);
    let hand4 = deck.getCards().slice(39);
    state.players[state.seatIndex[0]].hand = hand1;
    state.players[state.seatIndex[1]].hand = hand2;
    state.players[state.seatIndex[2]].hand = hand3;
    state.players[state.seatIndex[3]].hand = hand4;
    return { ...state, phase: { type: 'First Play' } };
}

export function handleFirstPlay(state: gameState, player: playerState, selectedCombo: combos.Combo): gameState | Error {
    //find player with 3 of spades
    if (!player.hand.includes(0)) { //3 of spades is represented by 0
        return { ...state };
    }
    else {
        if (selectedCombo.cards.includes(0)) {
            player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
            return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
        }
        else {
            return Error("First play must include 3 of spades");
        }
    }
}

export function handlePlayCard(state: gameState, player: playerState, currentCombo: combos.Combo, selectedCombo: combos.Combo): gameState {
    if (player.hand.length < currentCombo.cards.length) {
        player.hasPassed = true;
        return { ...state};
    }
    if (player.hasPassed === true) {
        return { ...state};
    }
    else {
        switch (currentCombo.type) {
            case 'Single':
                if (combos.canBombSingleTwo(selectedCombo.cards, currentCombo.cards[0])) {
                    player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
                    return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
                }
                if (combos.isValidSingle(selectedCombo.cards) && combos.canBeatSingle(selectedCombo.cards, currentCombo.cards)) {
                    player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
                    return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
                }
            case 'Double':
                if (combos.canBombDoubleTwo(selectedCombo.cards, currentCombo.cards)) {
                    player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
                    return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
                }
                if (combos.isValidDouble(selectedCombo.cards) && combos.canBeatDouble(selectedCombo.cards, currentCombo.cards)) {
                    player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
                    return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
                }
            case 'Triple':
                if (combos.isValidTriple(selectedCombo.cards) && combos.canBeatTriple(selectedCombo.cards, currentCombo.cards)) {
                    player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
                    return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
                }
            case 'Straight':
                if (combos.isValidStraight(selectedCombo.cards) && combos.canBeatStraight(selectedCombo.cards, currentCombo.cards)) {
                    player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
                    return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
                }
            case 'Quadruple':
                if (combos.isValidQuadruple(selectedCombo.cards) && combos.canBeatQuadruple(selectedCombo.cards, currentCombo.cards)) {
                    player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
                    return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
                }
            case 'Double Straight':
                if (combos.isValidDoubleStraight(selectedCombo.cards) && combos.canBeatDoubleStraight(selectedCombo.cards, currentCombo.cards)) {
                    player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
                    return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: selectedCombo}};
                }
            default:
                player.hasPassed = true;
                return { ...state};
            }
    }
}

export function handlePass(state: gameState, player: playerState): gameState {
    player.hasPassed = true;
    return { ...state };
}

export function checkForControl(state: gameState): gameState {
    let activePlayers = Object.values(state.players).filter(player => !player.hasPassed);
    if (activePlayers.length === 1) {
        let winner = activePlayers[0];
        winner.hasPassed = false;
        return { ...state, phase: { type: 'Control', current: winner.id, currentCombo: { type: 'Single', cards: [] } } };
    }
    else {
        return { ...state };
    }
}

export function handlePlayFromControl(state: gameState, player: playerState, selectedCombo: combos.Combo): gameState | Error{
    if (selectedCombo.cards.length === 0) {
        return Error("Must play a valid combo from control");
    }
    let combo = combos.isValidCombo(selectedCombo);
    if (combo === null) {
        return Error("Invalid combo played from control");
    }
    else {
        player.hand = player.hand.filter(card => !selectedCombo.cards.includes(card));
        Object.values(state.players).forEach(p => p.hasPassed = false);
        if (player.hand.length === 0) {
            let newState = { ...state, phase: { type: 'Inheritance', current: player.id, currentCombo: combo } }; //TODO: 
            return handleWin(newState, player); //TODO: Implement a way to do the "seize control vs inherit control" rule
        }
        return { ...state, phase: { type: 'Continuation', current: player.id, currentCombo: combo } };
    }
}

export function handleWin(state: gameState, player: playerState): gameState {
    //append player to winnerIndex and set their hasWon to true
    player.hasWon = true;
    state.winnerIndex.push(player.id);
    //check if game is over
    if (state.winnerIndex.length === 3) {
        let lastPlayer = Object.values(state.players).find(p => !p.hasWon);
        state.winnerIndex.push(lastPlayer.id);
        return { ...state, phase: { type: 'End', ranking: state.winnerIndex } };
    }
}

export function handleInheritance(state: gameState, player: playerState, selectedCombo: combos.Combo): gameState {
    
}