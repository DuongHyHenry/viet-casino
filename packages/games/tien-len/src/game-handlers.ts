import { Deck } from "@viet-casino/awesome-card-rules";
import { playerState } from "./game-state.js";
import * as combos from './combos/index.js';
import { GameState } from './game-state.js';
import { RoundState } from './game-state.js';
import { PlayerID } from './game-state.js';
import { sortHelper } from "./rules.js";

export function updateGameState(phase: GameState['phase'], seats: PlayerID[], seatIndex: Record<PlayerID, number>, players: Record<PlayerID, playerState>, winners: PlayerID[]): GameState { 
    return { 
        phase: phase, 
        seats: seats, 
        seatIndex: seatIndex, 
        players: players, 
        winners: winners 
    }; 
}

export function updateRoundState(prev: RoundState, updates: Partial<RoundState>): RoundState {
    return {
        ...prev,
        ...updates,
        playersIn: updates.playersIn ? new Set(updates.playersIn) : new Set(prev.playersIn),
    };
}

export function findNextPlayer(state: GameState, round: RoundState, currentPlayer: PlayerID): PlayerID {
    const currentPlayerIndex = state.seatIndex[currentPlayer];
    for (let i = 1; i < state.seats.length; i++) {
        const nextPlayerIndex = (currentPlayerIndex + i) % state.seats.length;
        if (round.playersIn.has(state.seats[nextPlayerIndex]) && !state.winners.includes(state.seats[nextPlayerIndex])) {
            return state.seats[nextPlayerIndex];
        }
        else {
            continue;
        }
    }
    throw new Error('No next player found. This should not happen as player should have gotten control.');
}

export function handleDealing(state: GameState): GameState {
    const deck = new Deck();
    deck.shuffle();
    let cards = deck.getCards();
    const players: Record<PlayerID, playerState> = {};
    for (let i = 0; i < state.seats.length; i++) {
        const id = state.seats[i];
        const hand = cards
            .slice(i * 13, (i + 1) * 13)
            .sort(sortHelper); //TODO: sorts by numeric order right now, change it to sort by actual tien len strength
        players[id] = {
            id: id,
            hand: hand,
            hasWon: false,
        };
    }
    const starter = state.seats.find(pid => players[pid].hand.includes(2))!;
    return updateGameState(
        { type: 'FirstPlay', starter: starter }, 
        state.seats, 
        state.seatIndex, 
        players, 
        []
    );
}

export function handleFirstPlay(state: GameState, player: playerState, selectedCombo: combos.Combo): GameState {
    if (state.phase.type !== "FirstPlay" || player.id !== state.phase.starter) {
      return { ...state, error: 'It is not your turn to start.' };
    }
    if ((combos.isValidCombo(selectedCombo) !== null) && selectedCombo.cards.includes(2)) {
        const newHand = state.players[player.id].hand.filter(card => !selectedCombo.cards.includes(card));
        const updatedPlayers = {
            ...state.players,
            [player.id]: {
                ...player,
                hand: newHand,
            },
        }

        const tempRound: RoundState = {
            controller: player.id,
            lastComboPlayed: selectedCombo,
            playerToBeat: player.id,
            currentPlayer: player.id,
            combosPlayed: 1,
            playersIn: new Set<PlayerID>(state.seats),
            passesSinceWin: 0,
            inheritor: undefined,
        };

        if (updatedPlayers[player.id].hand.length === 0) {
            const winners = [...state.winners, player.id];
            const players = {
                ...updatedPlayers,
                [player.id]: { ...updatedPlayers[player.id], hasWon: true },
            };       
             return updateGameState(
                { type: 'End', ranking: winners },
                state.seats,
                state.seatIndex,
                players,
                winners,
            )
        }
        
        const nextPlayer = findNextPlayer(state, tempRound, player.id);
        const newRound: RoundState = { ...tempRound, currentPlayer: nextPlayer };

        return updateGameState(
            { type: 'Round', round: newRound },
            state.seats,
            state.seatIndex,
            updatedPlayers,
            state.winners,
        )
    }
    else {
        return { ...state, error: 'Invalid combo played. Please play a valid combo that includes the 3 of Spades.' };
    }
}

export function handlePlayCard(state: GameState, player: playerState, selectedCombo: combos.Combo): GameState {
    if (state.phase.type !== 'Round') return { ...state, error: 'No active round.' };
    if (player.id !== state.phase.round.currentPlayer) {
        return { ...state, error: 'Not your turn.' };
    }
    const currentCombo = state.phase.round.lastComboPlayed;
    if (currentCombo === null) {
        return { ...state, error: 'No combo to beat. Why are we not in the control function?' };
    }
    if (combos.canBeatCombo(currentCombo, selectedCombo)) {
        const newHand = state.players[player.id].hand.filter(card => !selectedCombo.cards.includes(card));
        const updatedPlayers = {
            ...state.players,
            [player.id]: {
                ...player,
                hand: newHand,
            },
        }

        if (updatedPlayers[player.id].hand.length === 0) {
            return handleWin(state, player);
        }

        const round = state.phase.round;
        return updateGameState(
            { type: 'Round', round: updateRoundState( round, {
                controller: round.controller,
                lastComboPlayed: selectedCombo,
                playerToBeat: player.id,
                currentPlayer: findNextPlayer(state, round, player.id),
                combosPlayed: round.combosPlayed + 1,
                playersIn: round.playersIn,
                passesSinceWin: 0,
                inheritor: undefined,
            } ) },
            state.seats,
            state.seatIndex,
            updatedPlayers,
            state.winners,
        )
    }
    else {
        return { ...state, error: 'Invalid combo played. Please play a valid combo that can beat the current combo.' };
    }
}

export function handlePass(state: GameState, player: playerState): GameState {
    if (state.phase.type !== 'Round') return { ...state, error: 'No active round.' };
    const round = state.phase.round;
    if (player.id !== round.currentPlayer) {
        return { ...state, error: 'Not your turn.' };
    }
    if (state.phase.round.playersIn.size === 1) {
        if (round.playerToBeat === null) {
            return { ...state, error: 'Invalid round state, player to beat should not be null.' };
        }

        const alive = state.seats.filter(pid => !state.winners.includes(pid));

        return updateGameState(
            { type: 'Round', round: updateRoundState( round, {
                controller: round.playerToBeat,
                lastComboPlayed: null,
                playerToBeat: null,
                currentPlayer: round.playerToBeat,
                combosPlayed: 0,
                playersIn: new Set<PlayerID>(alive),
                passesSinceWin: 0,
                inheritor: undefined,
            } ) },
            state.seats,
            state.seatIndex,
            state.players,
            state.winners,
        )
    }
    else {
        const newPlayersIn = new Set<PlayerID>(round.playersIn);
        if (!newPlayersIn.has(player.id)) {
            return { ...state, error: 'You already passed.' };
        }
        newPlayersIn.delete(player.id);
        let passesSinceWinValue = round.passesSinceWin;
        if (state.phase.round.inheritor) {
            passesSinceWinValue++;
        }
        const nextRound: RoundState = { ...round, playersIn: newPlayersIn };
        return updateGameState(
            { type: 'Round', round: updateRoundState( round, {
                controller: round.controller,
                lastComboPlayed: round.lastComboPlayed,
                playerToBeat: round.playerToBeat,
                currentPlayer: findNextPlayer(state, nextRound, player.id),
                combosPlayed: round.combosPlayed,
                playersIn: newPlayersIn,
                passesSinceWin: passesSinceWinValue,
            } ) },
            state.seats,
            state.seatIndex,
            state.players,
            state.winners,
        )
    }
}

export function handlePlayFromControl(state: GameState, player: playerState, selectedCombo: combos.Combo): GameState {
    if (state.phase.type !== 'Round') {
        return { ...state, error: 'Not in Round Phase.' };
    }
    const round = state.phase.round;
    if (combos.isValidCombo(selectedCombo) !== null) {
        const newHand = state.players[player.id].hand.filter(card => !selectedCombo.cards.includes(card));
        const updatedPlayers = {
            ...state.players,
            [player.id]: {
                ...player,
                hand: newHand,
            },
        }
        if (updatedPlayers[player.id].hand.length === 0) {
            return handleWin(state, player);
        }
        const alive = state.seats.filter(pid => !state.winners.includes(pid));
        const nextRound: RoundState = { ...round, playersIn: new Set<PlayerID>(alive) };
        return updateGameState(
            { type: 'Round', round: updateRoundState( round, {
                controller: player.id,
                lastComboPlayed: selectedCombo,
                playerToBeat: player.id,
                currentPlayer: findNextPlayer(state, nextRound, player.id),
                combosPlayed: 1,
                playersIn: new Set<PlayerID>(alive),
                passesSinceWin: 0,
                inheritor: undefined,
            } ) },
            state.seats,
            state.seatIndex,
            updatedPlayers,
            state.winners,
        )
    }
    else {
        return { ...state, error: 'Invalid combo played. Please play a valid combo.' };
    }
}

export function handleWin(state: GameState, player: playerState): GameState {
    //TODO: Add a condition where if someone hasn't put any cards down when another player wins, they insta lose
    if (state.phase.type != 'Round') {
        return { ...state, error: 'Invalid phase, should be Round.' }
    }
    const winners = state.winners.includes(player.id) ? state.winners : [...state.winners, player.id];
    const players: Record<PlayerID, playerState> = {
        ...state.players,
        [player.id]: {
            ...state.players[player.id],
            hasWon: true,
        },
    };
    const round = state.phase.round;
    if (winners.length === 3) {
        let lastPlayer = Object.values(players).find(p => !p.hasWon);
        if (!lastPlayer) {
            return { ...state, error: 'Error determining last player.' };
        }
        const ranking = [...winners, lastPlayer.id];
        return updateGameState(
            { type: 'End', ranking: ranking },
            state.seats,
            state.seatIndex,
            players,
            ranking,
        )
    }
    else {
        const alive = state.seats.filter(pid => !winners.includes(pid));
        const nextRound: RoundState = { ...round, playersIn: new Set<PlayerID>(alive) };
        const nextState: GameState = { ...state, players, winners, phase: { type: 'Round', round: nextRound } };
        return updateGameState(
            { type: 'Round', round: updateRoundState( round, {
                controller: round.controller,
                lastComboPlayed: round.lastComboPlayed,
                playerToBeat: round.playerToBeat,
                currentPlayer: findNextPlayer(nextState, nextRound, player.id),
                combosPlayed: round.combosPlayed,
                playersIn: new Set<PlayerID>(alive),
                passesSinceWin: 1,
                inheritor: findNextPlayer(nextState, nextRound, player.id),
            } ) },
            state.seats,
            state.seatIndex,
            players,
            winners,
        )
    }
}
