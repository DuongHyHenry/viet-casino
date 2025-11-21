"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTriple = isValidTriple;
exports.canBeatTriple = canBeatTriple;
const rules_1 = require("../rules");
function isValidTriple(selectedCombo) {
    if (selectedCombo.length !== 3)
        return false;
    if (selectedCombo[0] !== selectedCombo[1] || selectedCombo[0] !== selectedCombo[2])
        return false;
    else
        return true;
}
function canBeatTriple(tripleA, tripleB) {
    if (tripleA === tripleB)
        return false;
    const cardA = tripleA[0];
    const cardB = tripleB[0];
    return (0, rules_1.cardIsBigger)(cardA, cardB);
}
