"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusGame = void 0;
exports.runMiniSpin = runMiniSpin;
const gameUtils_1 = require("../../Utils/gameUtils");
class BonusGame {
    constructor(nosOfItem, parent) {
        this.noOfItems = nosOfItem;
        this.type = gameUtils_1.bonusGameType.default;
        this.result = [];
        this.parent = parent;
    }
    generateData(totalPay = 0) {
        this.result = [];
        let res = [];
        this.result = this.parent.settings.currentGamedata.bonus.payOut;
        if (this.parent.settings.bonus.start && this.parent.settings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.tap)
            this.shuffle(this.result);
        for (let i = 0; i < this.result.length; i++) {
            res.push(this.result[i].toString());
        }
        return res;
    }
    generateSlotData(reps = 0) {
        let res = [];
        let slot_array = [];
        let multiplier_array = [];
        slot_array.push(1);
        slot_array.push(2);
        slot_array.push(1);
        let reelNum = 1;
        if (!slot_array.includes(reelNum)) {
            reelNum = -1;
        }
        slot_array.forEach((element) => {
            if (element === reelNum)
                multiplier_array.push(this.parent.settings.currentGamedata.bonus.payTable[element]);
            else
                multiplier_array.push(0);
        });
        this.result = [...slot_array, reelNum, ...multiplier_array];
        for (let i = 0; i < this.result.length; i++) {
            res.push(this.result[i].toString());
        }
        return res;
    }
    setRandomStopIndex() {
        let amount = 0;
        console.log("bonus: ", this.parent.settings.currentGamedata.bonus);
        if (this.parent.settings.bonus.start && this.parent.settings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.spin) {
            this.parent.settings.bonus.stopIndex = this.getRandomPayoutIndex(this.parent.settings.currentGamedata.bonus.payOutProb);
            amount = this.parent.settings.BetPerLines * this.result[this.parent.settings.bonus.stopIndex];
        }
        else if (this.parent.settings.bonus.start && this.parent.settings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.tap) {
            for (let index = 0; index < this.result.length; index++) {
                if (this.result[index] == 0)
                    break;
                else
                    amount += this.parent.settings.BetPerLines * this.result[index];
            }
        }
        else if (this.parent.settings.bonus.start && this.parent.settings.currentGamedata.bonus.type == "slot") {
            for (let index = 1; index < 4; index++) {
                amount += this.parent.settings.BetPerLines * this.result[this.result.length - index];
            }
            console.log("amount", amount);
            console.log("current bet", this.parent.settings.BetPerLines);
        }
        else if (this.parent.settings.bonus.start && this.parent.settings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.layerTap) {
            let totalWinAmount = 0;
            const bonusData = this.parent.settings.currentGamedata.bonus;
            var selectedIndex = [];
            for (let layerIndex = 0; layerIndex < bonusData.payOut.length; layerIndex++) {
                const layerPayOuts = bonusData.payOut[layerIndex];
                const layerPayOutProb = bonusData.payOutProb[layerIndex];
                selectedIndex[layerIndex] = this.getRandomPayoutIndex(layerPayOutProb);
                const selectedPayOut = layerPayOuts[selectedIndex[layerIndex]];
                if (selectedPayOut === 0) {
                    console.log(`Payout is 0 at layer ${layerIndex}, exiting...`);
                    break;
                }
                totalWinAmount += this.parent.settings.BetPerLines * selectedPayOut;
            }
            console.log("Bonus Index", selectedIndex);
            amount += totalWinAmount;
        }
        if (!amount || amount < 0)
            amount = 0;
        return { selectedIndex, amount };
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let k = array[i];
            array[i] = array[j];
            array[j] = k;
        }
    }
    getRandomPayoutIndex(payOutProb) {
        const totalProb = payOutProb.reduce((sum, prob) => sum + prob, 0);
        const normalizedProb = payOutProb.map(prob => prob / totalProb);
        const cumulativeProb = [];
        normalizedProb.reduce((acc, prob, index) => {
            cumulativeProb[index] = acc + prob;
            return cumulativeProb[index];
        }, 0);
        const randomNum = Math.random();
        for (let i = 0; i < cumulativeProb.length; i++) {
            if (randomNum <= cumulativeProb[i]) {
                return i;
            }
        }
        return cumulativeProb.length - 1;
    }
}
exports.BonusGame = BonusGame;
/**
 * Selects a random index from a probability array based on weighted probabilities.
 *
 * @param probArray - An array of probabilities for each index. Each value represents the weight
 *                    for selecting that index.
 * @returns The index of the randomly selected item based on the probabilities.
 */
const getRandomIndex = (probArray) => {
    const totalProb = probArray.reduce((sum, prob) => sum + prob, 0);
    const rand = Math.random() * totalProb;
    let sum = 0;
    for (let i = 0; i < probArray.length; i++) {
        sum += probArray[i];
        if (rand < sum)
            return i;
    }
    return probArray.length - 1;
};
const getRandomSymbol = (symbols, probArray) => {
    const index = getRandomIndex(probArray);
    return symbols[index];
};
const generateInnerMatrix = (symbols, miniSlotProb) => {
    return Array.from({ length: 3 }, () => getRandomSymbol(symbols, miniSlotProb));
};
/**
 * Simulates a mini slot game spin based on bonus information and the bet per line.
 *
 * @param bonus - The bonus object containing information about symbols, probabilities, payouts, etc.
 * @param betPerLines - The amount of bet per line.
 * @returns An object containing the result of the mini spin, including the inner matrix, outer ring symbols, winnings, and total win amount.
 */
function runMiniSpin(bonus, betPerLines) {
    try {
        if (bonus.noOfItem < bonus.symbolCount)
            return;
        let lives = bonus.noOfItem > 5 ? 3 : bonus.noOfItem - ((bonus.winningValue).length + 1);
        let totalWinAmount = 0;
        const { symbols, miniSlotProb, outerRingProb, payOut } = bonus;
        let result = {
            innerMatrix: [],
            outerRingSymbol: [],
            totalWinAmount: 0,
            winings: [],
        };
        console.log(`Lives: ${lives}`);
        while (lives > 0) {
            const innerMatrix = generateInnerMatrix(symbols, miniSlotProb);
            const outerRingSymbol = getRandomSymbol(symbols, outerRingProb);
            const matchCount = innerMatrix.filter(symbol => symbol === outerRingSymbol).length;
            const winAmt = payOut[outerRingSymbol] * matchCount * betPerLines;
            const win = winAmt.toFixed(1);
            result.winings.push(win);
            result.innerMatrix.push(innerMatrix);
            result.outerRingSymbol.push(outerRingSymbol);
            result.totalWinAmount += Number(win);
            totalWinAmount += Number(win);
            if (outerRingSymbol === 7) {
                lives--;
            }
            console.log(`Inner Matrix: ${innerMatrix.join(', ')}`);
            console.log(`Outer Ring: ${outerRingSymbol}`);
            console.log(`Matches: ${matchCount}, Win: ${win}`);
            console.log(`Lives remaining: ${lives}`);
        }
        console.log(`${JSON.stringify(result)}`);
        return result;
    }
    catch (error) {
        console.error(error);
    }
}
