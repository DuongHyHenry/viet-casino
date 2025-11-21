"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSingle = isValidSingle;
exports.canBeatSingle = canBeatSingle;
const rules_1 = require("../rules");
function isValidSingle(selectedCombo) {
    if (selectedCombo.length !== 1)
        return false;
    else
        return true;
}
function canBeatSingle(cardA, cardB) {
    if (cardA === cardB)
        return false;
    return (0, rules_1.cardIsBigger)(cardA[0], cardB[0]);
}
