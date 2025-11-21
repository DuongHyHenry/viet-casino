import * as handlers from './game-handlers.js';
export function createGame(seats) {
    const seatIndex = {};
    seats.forEach((id, i) => (seatIndex[id] = i));
    return {
        phase: { type: 'Dealing' },
        seats,
        seatIndex,
        players: {},
        winners: [],
    };
}
export function reducer(state, action) {
    switch (action.type) {
        case 'DEAL':
            return handlers.handleDealing(state);
        case 'PLAY':
            if (state.phase.type === 'FirstPlay') {
                return handlers.handleFirstPlay(state, state.players[action.player], action.combo);
            }
            if (state.phase.type === 'Round') {
                if ((state.phase.round.controller === action.player && state.phase.round.combosPlayed === 0)) {
                    return handlers.handlePlayFromControl(state, state.players[action.player], action.combo);
                }
                if ((state.phase.round.passesSinceWin === state.seats.length - state.winners.length && state.phase.round.inheritor === action.player)) {
                    return handlers.handlePlayFromControl(state, state.players[action.player], action.combo);
                }
                return handlers.handlePlayCard(state, state.players[action.player], action.combo);
            }
            return { ...state, error: 'Cannot play in this phase.' };
        case 'PASS':
            return handlers.handlePass(state, state.players[action.player]);
        default:
            return state;
    }
}
