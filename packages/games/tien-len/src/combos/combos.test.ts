import { test, expect } from "vitest";
import { getCard, getRank } from "@viet-casino/awesome-card-rules";
import { getRankValue, getSuitValue, cardIsBigger } from "../rules.js";
import { isValidSingle, canBeatSingle } from "./singles.js";
import { isValidDouble, canBeatDouble } from "./doubles.js"
import { isValidTriple, canBeatTriple } from "./triples.js"
import { isValidQuadruple, canBeatQuadruple } from "./bombs.js";
import { isValidStraight, canBeatStraight } from "./straights.js";
import { isValidDoubleStraight, canBeatDoubleStraight, canBombSingleTwo, canBombDoubleTwo } from "./bombs.js";
import { Combo, convertToCombo, isValidCombo, canBeatCombo } from "./combo-logic.js";

test("Rules.ts test:", () => {
    for (let i = 0; i < 52; i++) {
        console.log(i, getCard(i), getRankValue(i));
    }

    for (let i = 0; i < 52; i++) {
        console.log(getCard(i), getSuitValue(i));
    }
});

test("Validity testing:", () => {
    console.log(getRank(1));
    expect(isValidSingle([1])).toBe(true);
    expect(isValidSingle([1, 2])).toBe(false);

    console.log(getRank(1), getRank(14));
    expect(isValidDouble([1])).toBe(false);
    expect(isValidDouble([1, 14])).toBe(true);
    expect(isValidDouble([2, 14])).toBe(false);

    console.log(getRank(1), getRank(14), getRank(27));
    expect(isValidTriple([1])).toBe(false);
    expect(isValidTriple([1, 14])).toBe(false);
    expect(isValidTriple([1, 14, 27])).toBe(true);
    expect(isValidTriple([2, 14, 27])).toBe(false);

    console.log(getRank(1), getRank(14), getRank(27), getRank(40));
    expect(isValidQuadruple([1])).toBe(false);
    expect(isValidQuadruple([1, 14])).toBe(false);
    expect(isValidQuadruple([1, 14, 27])).toBe(false);
    expect(isValidQuadruple([1, 14, 27, 40])).toBe(true);
    expect(isValidQuadruple([2, 14, 27, 40])).toBe(false);

    let selectedCombo = [2, 3, 4]

    console.log(Number(getRank(selectedCombo[1])), Number(getRank(selectedCombo[0])) + 1)

    for (let i = 1; i < selectedCombo.length; i++) {
        if (getRank(selectedCombo[i]) === '2') return false; //straight cannot contain '2'
        if (getRank(selectedCombo[i]) !== getRank(selectedCombo[i - 1]) + 1) {
            console.log(i)
        }
    }

    console.log(getRank(2), getRank(3), getRank(4));
    expect(isValidStraight([2])).toBe(false);
    expect(isValidStraight([2, 3])).toBe(false);
    expect(isValidStraight([2, 3, 4])).toBe(true);
    expect(isValidStraight([2, 3, 4, 5])).toBe(true);
    expect(isValidStraight([2, 3, 4, 6])).toBe(false);
    expect(isValidStraight([1, 2, 3, 4, 5])).toBe(false);
    expect(isValidStraight([2, 3, 4, 5, 6])).toBe(true);

    console.log(getRank(2), getRank(3), getRank(17));
    expect(isValidStraight([2, 3, 17, 5, 6])).toBe(true);

    console.log(getCard(3), getCard(4), getCard(5), getCard(6), getCard(7), getCard(8), getCard(9), getCard(10));
    console.log(isValidStraight([3, 4, 5, 6, 7, 8, 9, 10]));

    // console.log(getRank(2), getRank(15), getRank(3), getRank(16), getRank(17), getRank(30));
    // expect(isValidDoubleStraight([2, 15, 3, 16, 17, 30])).toBe(true);

    // console.log(getRank(2), getRank(15), getRank(3), getRank(16), getRank(18), getRank(31));
    // expect(isValidDoubleStraight([2, 15, 3, 16, 18, 31])).toBe(false);

    // console.log(getRank(2), getRank(15), getRank(3), getRank(16), getRank(17), getRank(31));
    // expect(isValidDoubleStraight([2, 15, 3, 16, 17, 31])).toBe(false);
});

test("Singles comparisons:", () => {
    console.log("7 of Spades beats 5 of Spades:");
    console.log(getCard(6), getCard(4));
    expect(canBeatSingle([6], [4])).toBe(true);

    console.log("King of Spades beats 10 of Spades:");
    console.log(getCard(12), getCard(9));
    expect(canBeatSingle([13], [11])).toBe(true);

    console.log("Ace of Hearts beats Ace of Spades:");
    console.log(getCard(39), getCard(0));
    expect(canBeatSingle([39], [0])).toBe(true);

    console.log("Ace of Diamonds beats Ace of Clubs:");
    console.log(getCard(26), getCard(13));
    expect(canBeatSingle([26], [13])).toBe(true);

    console.log("Ace of Spades beats King of Hearts:");
    console.log(getCard(0), getCard(51));
    expect(canBeatSingle([0], [51])).toBe(true);

    console.log("Ace of Spades beats King of Spades:");
    console.log(getRankValue(0), getRankValue(12));
    expect(canBeatSingle([0], [11])).toBe(true);

    console.log("Two of Hearts beats Ace of Spades:");
    console.log(getCard(40), getCard(0));
    expect(canBeatSingle([40], [0])).toBe(true);
});

test("Doubles comparisons:", () => {
    console.log(getCard(6), getCard(19), getCard(4), getCard(17));
    expect(canBeatDouble([6, 19], [4, 17])).toBe(true);

    console.log(getCard(6), getCard(19), getCard(32), getCard(45));
    expect(canBeatDouble([6, 19], [31, 45])).toBe(false);

    console.log(getCard(19), getCard(32), getCard(6), getCard(45));
    expect(canBeatDouble([19, 32], [6, 45])).toBe(false);

    console.log(getCard(19), getCard(45), getCard(6), getCard(32));
    expect(canBeatDouble([19, 45], [6, 32])).toBe(true);

    console.log(getCard(6), getCard(45), getCard(19), getCard(32));
    expect(canBeatDouble([6, 45], [19, 32])).toBe(true);

    console.log(getCard(1), getCard(14), getCard(4), getCard(17));
    expect(canBeatDouble([1, 14], [4, 17])).toBe(true);
});

test("Triples comparisons:", () => {
    console.log(getCard(6), getCard(19), getCard(32), getCard(4), getCard(17), getCard(30));
    expect(canBeatTriple([6, 19, 32], [4, 17, 30])).toBe(true);
});

test("Straight comparisons:", () => {
    console.log(getCard(6), getCard(7), getCard(8), getCard(4), getCard(18), getCard(32));
    expect(canBeatStraight([6, 7, 8], [4, 18, 32])).toBe(true);

    console.log(getCard(6), getCard(7), getCard(8), getCard(19), getCard(20), getCard(21));
    expect(canBeatStraight([6, 7, 8], [19, 20, 21])).toBe(false);
});

test("Bomb comparisons:", () => {
    console.log(getCard(6), getCard(19), getCard(32), getCard(45), getCard(4), getCard(17), getCard(30), getCard(43));
    expect(canBeatQuadruple([6, 19, 32, 45], [4, 17, 30, 43])).toBe(true);

    console.log(getRank(2), getRank(15), getRank(3), getRank(16), getRank(17), getRank(30));
    console.log(getRank(3), getRank(16), getRank(4), getRank(17), getRank(18), getRank(31));
    expect(canBeatDoubleStraight([2, 15, 3, 16, 17, 30], [3, 16, 4, 17, 18, 31])).toBe(false);
    
    console.log(getRank(2), getRank(41), getRank(29), getRank(42), getRank(4), getRank(43));
    console.log(getRank(15), getRank(28), getRank(3), getRank(16), getRank(17), getRank(30));
    expect(canBeatDoubleStraight([2, 41, 29, 42, 4, 43], [15, 28, 3, 16, 17, 30])).toBe(true);

    console.log(getRank(2), getRank(41), getRank(29), getRank(42), getRank(4), getRank(43));
    console.log(getRank(1));
    expect(canBombSingleTwo([2, 41, 29, 42, 4, 43], 1)).toBe(true);

    console.log(getRank(2), getRank(41), getRank(29), getRank(42), getRank(4), getRank(43));
    console.log(getRank(1), getRank(14));
    expect(canBombDoubleTwo([2, 41, 29, 42, 4, 43], [1, 14])).toBe(false);

    console.log(getCard(6), getCard(19), getCard(32), getCard(45));
    console.log(getRank(1), getRank(14));
    expect(canBombDoubleTwo([6, 19, 32, 45], [1, 14])).toBe(true);
});

test("Straight comparisons:", () => {
    console.log(getCard(6), getCard(7), getCard(8), getCard(4), getCard(18), getCard(32));
    expect(canBeatStraight([6, 7, 8], [4, 18, 32])).toBe(true);

    console.log(getCard(6), getCard(7), getCard(8), getCard(19), getCard(20), getCard(21));
    expect(canBeatStraight([6, 7, 8], [19, 20, 21])).toBe(false);
});

test("Combo validity:", () => {
    console.log(convertToCombo([1]));

    console.log(convertToCombo([1, 1]));

    console.log(convertToCombo([1, 1, 1]));

    console.log(convertToCombo([1, 1, 1, 1]));

    console.log(convertToCombo([1, 2, 3]));

    console.log(convertToCombo([3, 4, 5]));
    
    console.log(convertToCombo([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]));

    console.log(convertToCombo([3, 16, 4, 17, 5, 18]));

    console.log(convertToCombo([3, 16, 4, 17, 5, 18, 6, 19]));
    
    console.log(convertToCombo([3, 16, 4, 17, 5, 18, 6, 19]));

});