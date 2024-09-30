"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameUtils_1 = require("../../Utils/gameUtils");
const SlotUtils_1 = require("../../Utils/SlotUtils");
const RandomResultGenerator_1 = require("../RandomResultGenerator");
const BonusGame_1 = require("./BonusGame");
const CheckResult_1 = require("./CheckResult");
const newGambleGame_1 = require("./newGambleGame");
const WinData_1 = require("./WinData");
class BaseSlotGame {
    constructor(currentGameData) {
        this.currentGameData = currentGameData;
        this.playerData = {
            haveWon: 0,
            currentWining: 0,
            totalbet: 0,
            rtpSpinCount: 0,
            totalSpin: 0,
        };
        this.settings = {
            currentGamedata: {
                id: "",
                matrix: { x: 0, y: 0 },
                linesApiData: [],
                Symbols: [
                    {
                        Name: "",
                        Id: null,
                        weightedRandomness: 0,
                        useWildSub: false,
                        multiplier: [],
                        defaultAmount: [],
                        symbolsCount: [],
                        increaseValue: [],
                        reelInstance: [], // Ensure reelInstance is initialized
                    },
                ],
                bonus: {
                    isEnabled: false,
                    type: "",
                    noOfItem: 0,
                    payOut: [], // Ensure payOut is initialized
                    payOutProb: [], // Ensure payOutProb is initialized
                    payTable: [], // Ensure payTable is initialized
                },
                bets: [], // Ensure bets is initialized
                linesCount: 0, // Ensure linesCount is initialized
            },
            tempReels: [[]],
            payLine: [],
            useScatter: false,
            wildSymbol: {
                SymbolName: "-1",
                SymbolID: -1,
                useWild: false,
            },
            Symbols: [],
            Weights: [],
            resultSymbolMatrix: [],
            lineData: [],
            fullPayTable: [],
            _winData: undefined,
            resultReelIndex: [],
            noOfBonus: 0,
            totalBonuWinAmount: [],
            jackpot: {
                symbolName: "",
                symbolsCount: 0,
                symbolId: 0,
                defaultAmount: 0,
                increaseValue: 0,
                useJackpot: false,
            },
            bonus: {
                start: false,
                stopIndex: -1,
                game: null,
                id: -1,
                symbolCount: -1,
                pay: -1,
                useBonus: false,
            },
            freeSpin: {
                symbolID: "-1",
                freeSpinMuiltiplier: [],
                freeSpinStarted: false,
                freeSpinsAdded: false,
                freeSpinCount: 0,
                noOfFreeSpins: 0,
                useFreeSpin: false,
            },
            scatter: {
                symbolID: "-1",
                multiplier: [],
                useScatter: false,
            },
            currentBet: 0,
            currentLines: 0,
            BetPerLines: 0,
            startGame: false,
            gamble: new newGambleGame_1.gambleCardGame(this),
            reels: [[]],
            currentMoolahCount: 0,
        };
        this.initialize(currentGameData.gameSettings);
        // this.messageHandler((data: any));
    }
    sendMessage(action, message) {
        this.currentGameData.sendMessage(action, message);
    }
    sendError(message) {
        this.currentGameData.sendError(message);
    }
    sendAlert(message) {
        this.currentGameData.sendAlert(message);
    }
    updatePlayerBalance(message) {
        this.currentGameData.updatePlayerBalance(message);
    }
    deductPlayerBalance(message) {
        this.currentGameData.deductPlayerBalance(message);
    }
    getPlayerData() {
        return this.currentGameData.getPlayerData();
    }
    messageHandler(response) {
        switch (response.id) {
            case "SPIN":
                if (this.settings.startGame) {
                    this.settings.currentLines = response.data.currentLines;
                    this.settings.BetPerLines = this.settings.currentGamedata.bets[response.data.currentBet];
                    this.settings.currentBet =
                        this.settings.currentGamedata.bets[response.data.currentBet] *
                            this.settings.currentLines;
                    this.spinResult();
                }
                break;
            case "GENRTP":
                this.settings.currentLines = response.data.currentLines;
                this.settings.BetPerLines = this.settings.currentGamedata.bets[response.data.currentBet];
                this.settings.currentBet =
                    this.settings.currentGamedata.bets[response.data.currentBet] * this.settings.currentLines;
                this.getRTP(response.data.spins);
                break;
            case "checkMoolah":
                this.checkforMoolah();
                break;
            case "GambleInit":
                this.settings.gamble.resetGamble();
                const sendData = this.settings.gamble.sendInitGambleData(response.data.GAMBLETYPE);
                this.sendMessage("gambleInitData", sendData);
                break;
            case "GambleResultData":
                this.settings.gamble.getResult(response.data.GAMBLETYPE);
                break;
            case "GAMBLECOLLECT":
                this.settings.gamble.updateCredits();
                break;
            default:
                console.warn(`Unhandled message ID: ${response.id}`);
                this.sendError(`Unhandled message ID: ${response.id}`);
                break;
        }
    }
    initialize(GameData) {
        this.settings.Symbols = [];
        this.settings.Weights = [];
        this.settings._winData = new WinData_1.WinData(this);
        this.settings.currentGamedata = GameData[0] || GameData;
        this.initSymbols();
        gameUtils_1.UiInitData.paylines = (0, gameUtils_1.convertSymbols)(this.settings.currentGamedata.Symbols);
        this.settings.startGame = true;
        this.makePayLines();
        this.sendInitdata();
    }
    initSymbols() {
        var _a, _b;
        for (let i = 0; i < this.settings.currentGamedata.Symbols.length; i++) {
            this.settings.Symbols.push((_a = this.settings.currentGamedata.Symbols[i].Id) === null || _a === void 0 ? void 0 : _a.toString(), this.settings.currentGamedata.Symbols[i].multiplier);
            this.settings.Weights.push((_b = this.settings.currentGamedata.Symbols[i]) === null || _b === void 0 ? void 0 : _b.weightedRandomness);
        }
    }
    makePayLines() {
        this.settings.currentGamedata.Symbols.forEach((element) => {
            if (!element.useWildSub) {
                this.handleSpecialSymbols(element);
            }
        });
    }
    handleSpecialSymbols(symbol) {
        switch (symbol.Name) {
            case gameUtils_1.specialIcons.FreeSpin:
                this.settings.freeSpin.symbolID = symbol.Id;
                this.settings.freeSpin.freeSpinMuiltiplier = symbol.multiplier;
                this.settings.freeSpin.useFreeSpin = true;
                break;
            case gameUtils_1.specialIcons.jackpot:
                this.settings.jackpot.symbolName = symbol.Name;
                this.settings.jackpot.symbolId = symbol.Id;
                this.settings.jackpot.symbolsCount = symbol.symbolsCount;
                this.settings.jackpot.defaultAmount = symbol.defaultAmount;
                this.settings.jackpot.increaseValue = symbol.increaseValue;
                this.settings.jackpot.useJackpot = true;
                break;
            case gameUtils_1.specialIcons.wild:
                this.settings.wildSymbol.SymbolName = symbol.Name;
                this.settings.wildSymbol.SymbolID = symbol.Id;
                this.settings.wildSymbol.useWild = true;
                break;
            case gameUtils_1.specialIcons.scatter:
                (this.settings.scatter.symbolID = symbol.Id),
                    (this.settings.scatter.multiplier = symbol.multiplier);
                this.settings.scatter.useScatter = true;
                break;
            case gameUtils_1.specialIcons.bonus:
                this.settings.bonus.id = symbol.Id;
                this.settings.bonus.symbolCount = symbol.symbolCount;
                this.settings.bonus.pay = symbol.pay;
                this.settings.bonus.useBonus = true;
                break;
            default:
                break;
        }
    }
    sendInitdata() {
        this.settings.lineData = this.settings.currentGamedata.linesApiData;
        this.settings.reels = this.generateInitialreel();
        if (this.settings.currentGamedata.bonus.isEnabled &&
            this.settings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.spin || this.settings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.layerTap || this.settings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.miniSpin) {
            this.settings.bonus.game = new BonusGame_1.BonusGame(this.settings.currentGamedata.bonus.noOfItem, this);
        }
        // let specialSymbols = this.settings.currentGamedata.Symbols.filter(
        //   (element) => !element.useWildSub
        // );
        const dataToSend = {
            GameData: {
                Reel: this.settings.reels,
                Lines: this.settings.currentGamedata.linesApiData,
                Bets: this.settings.currentGamedata.bets,
                canSwitchLines: false,
                LinesCount: this.settings.currentGamedata.linesCount,
                autoSpin: [1, 5, 10, 20],
            },
            // TODO: Unknown source of generateData()
            BonusData: this.settings.bonus.game != null
                ? this.settings.bonus.game.generateData(this.settings.bonus.pay)
                : [],
            UIData: gameUtils_1.UiInitData,
            PlayerData: {
                Balance: this.getPlayerData().credits,
                haveWon: this.playerData.haveWon,
                currentWining: this.playerData.currentWining,
                totalbet: this.playerData.totalbet,
            },
            maxGambleBet: 300,
        };
        this.sendMessage("InitData", dataToSend);
    }
    generateInitialreel() {
        let matrix = [];
        for (let i = 0; i < this.settings.currentGamedata.matrix.x; i++) {
            let reel = [];
            this.settings.currentGamedata.Symbols.forEach((element) => {
                for (let j = 0; j < element.reelInstance[i]; j++) {
                    reel.push(element.Id.toString());
                }
            });
            (0, gameUtils_1.shuffleArray)(reel);
            matrix.push(reel);
        }
        return matrix;
    }
    spinResult() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const playerData = this.getPlayerData();
                if (this.settings.currentBet > playerData.credits) {
                    console.log("Low Balance : ", playerData.credits);
                    console.log("Current Bet : ", this.settings.currentBet);
                    this.sendError("Low Balance");
                    return;
                }
                if (this.settings.currentGamedata.bonus.isEnabled &&
                    this.settings.currentGamedata.bonus.type == gameUtils_1.bonusGameType.tap) {
                    this.settings.bonus.game = new BonusGame_1.BonusGame(this.settings.currentGamedata.bonus.noOfItem, this);
                }
                /*
                      MIDDLEWARE GOES HERE
                      */
                if (!this.settings.freeSpin.freeSpinStarted &&
                    this.settings.freeSpin.freeSpinCount === 0) {
                    yield this.deductPlayerBalance(this.settings.currentBet);
                }
                if (this.settings.freeSpin.freeSpinStarted &&
                    this.settings.freeSpin.freeSpinCount > 0) {
                    this.settings.freeSpin.freeSpinCount--;
                    this.settings.freeSpin.freeSpinsAdded = false;
                    // this.settings.currentBet = 0;
                    console.log(this.settings.freeSpin.freeSpinCount, "this.settings.freeSpinCount");
                    if (this.settings.freeSpin.freeSpinCount <= 0) {
                        this.settings.freeSpin.freeSpinStarted = false;
                        this.settings.freeSpin.freeSpinsAdded = false;
                    }
                }
                this.settings.tempReels = [[]];
                this.settings.bonus.start = false;
                this.playerData.totalbet += this.settings.currentBet;
                new RandomResultGenerator_1.RandomResultGenerator(this);
                const result = new CheckResult_1.CheckResult(this);
                result.makeResultJson(gameUtils_1.ResultType.normal);
            }
            catch (error) {
                console.error("Failed to generate spin results:", error);
                this.sendError("Spin error");
            }
        });
    }
    getRTP(spins) {
        try {
            let spend = 0;
            let won = 0;
            this.playerData.rtpSpinCount = spins;
            for (let i = 0; i < this.playerData.rtpSpinCount; i++) {
                this.spinResult();
                spend += this.settings.currentBet;
                won = this.settings._winData.totalWinningAmount;
            }
            let rtp = 0;
            if (spend > 0) {
                rtp = won / spend;
            }
            return;
        }
        catch (error) {
            console.error("Failed to calculate RTP:", error);
            this.sendError("RTP calculation error");
        }
    }
    checkforMoolah() {
        try {
            this.settings.tempReels = this.settings.reels;
            const lastWinData = this.settings._winData;
            lastWinData.winningSymbols = (0, SlotUtils_1.combineUniqueSymbols)((0, SlotUtils_1.removeRecurringIndexSymbols)(lastWinData.winningSymbols));
            const index = lastWinData.winningSymbols.map((str) => {
                const index = str.split(",").map(Number);
                return index;
            });
            let matrix = [];
            matrix = this.settings.resultSymbolMatrix;
            index.forEach((element) => {
                matrix[element[1]][element[0]] = null;
            });
            const movedArray = (0, SlotUtils_1.cascadeMoveTowardsNull)(matrix);
            let transposed = (0, SlotUtils_1.transposeMatrix)(movedArray);
            let iconsToFill = [];
            for (let i = 0; i < transposed.length; i++) {
                let row = [];
                for (let j = 0; j < transposed[i].length; j++) {
                    if (transposed[i][j] == null) {
                        let index = (this.settings.resultReelIndex[i] + j + 2) %
                            this.settings.tempReels[i].length;
                        transposed[i][j] = this.settings.tempReels[i][index];
                        row.unshift(this.settings.tempReels[i][index]);
                        this.settings.tempReels[i].splice(j, 1);
                    }
                }
                if (row.length > 0)
                    iconsToFill.push(row);
            }
            matrix = (0, SlotUtils_1.transposeMatrix)(transposed);
            this.settings.resultSymbolMatrix = matrix;
            // tempGame.
            const result = new CheckResult_1.CheckResult(this);
            result.makeResultJson(gameUtils_1.ResultType.moolah, iconsToFill);
            this.settings._winData.winningSymbols = [];
            this.settings.tempReels = [];
        }
        catch (error) {
            console.error("Failed to check for Moolah:", error);
            this.sendError("Moolah check error");
            return error;
        }
    }
}
exports.default = BaseSlotGame;
