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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.isValidCombo = isValidCombo;
exports.canBeatCombo = canBeatCombo;
__exportStar(require("./singles"), exports);
__exportStar(require("./doubles"), exports);
__exportStar(require("./triples"), exports);
__exportStar(require("./straights"), exports);
__exportStar(require("./bombs"), exports);
const combos = __importStar(require("../combos"));
function isValidCombo(selected) {
    if (selected.cards.length < 1) {
        return null;
    }
    switch (selected.type) {
        case 'Single':
            return combos.isValidSingle(selected.cards) ? selected : null;
        case 'Double':
            return combos.isValidDouble(selected.cards) ? selected : null;
        case 'Triple':
            return combos.isValidTriple(selected.cards) ? selected : null;
        case 'Straight':
            return combos.isValidStraight(selected.cards) ? selected : null;
        case 'Double Straight':
            return combos.isValidDoubleStraight(selected.cards) ? selected : null;
        case 'Quadruple':
            return combos.isValidQuadruple(selected.cards) ? selected : null;
        default:
            return null;
    }
}
function canBeatCombo(currentCombo, selectedCombo) {
    if (currentCombo.type === 'Single' && combos.canBombSingleTwo(selectedCombo.cards, currentCombo.cards[0]))
        return true;
    if (currentCombo.type === 'Double' && combos.canBombDoubleTwo(selectedCombo.cards, currentCombo.cards))
        return true;
    if (isValidCombo(selectedCombo) === null)
        return false;
    if (selectedCombo.type !== currentCombo.type)
        return false;
    switch (currentCombo.type) {
        case 'Single':
            return combos.canBeatSingle(selectedCombo.cards, currentCombo.cards);
        case 'Double':
            return combos.canBeatDouble(selectedCombo.cards, currentCombo.cards);
        case 'Triple':
            return combos.canBeatTriple(selectedCombo.cards, currentCombo.cards);
        case 'Straight':
            return combos.canBeatStraight(selectedCombo.cards, currentCombo.cards);
        case 'Quadruple':
            return combos.canBeatQuadruple(selectedCombo.cards, currentCombo.cards);
        case 'Double Straight':
            return combos.canBeatDoubleStraight(selectedCombo.cards, currentCombo.cards);
        default:
            return false;
    }
}
