"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDouble = isValidDouble;
exports.canBeatDouble = canBeatDouble;
const rules_1 = require("../rules");
function isValidDouble(selectedCombo) {
    if (selectedCombo.length !== 2)
        return false;
    if (selectedCombo[0] !== selectedCombo[1])
        return false;
    else
        return true;
}
function canBeatDouble(doubleA, doubleB) {
    if (doubleA === doubleB)
        return false;
    const cardA = doubleA[0];
    const cardB = doubleB[0];
    return (0, rules_1.cardIsBigger)(cardA, cardB);
}
