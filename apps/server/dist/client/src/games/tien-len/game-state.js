"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = createGame;
exports.reducer = reducer;
const handlers = __importStar(require("./game-handlers.js"));
function createGame(seats) {
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
function reducer(state, action) {
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
