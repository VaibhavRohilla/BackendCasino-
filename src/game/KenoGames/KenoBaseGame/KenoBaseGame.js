"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KenoBaseGame {
    constructor(currentGameData) {
        this.currentGameData = currentGameData;
        console.log(currentGameData.gameSettings.id);
        if (!currentGameData.gameSettings.isSpecial) {
            console.log(" Not KENO Special Game ");
        }
        else {
            console.log("  KENO Special Game ");
        }
    }
    initialize(data) {
        console.log("CHANED PARSHEET IN KENO ");
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
    }
}
exports.default = KenoBaseGame;
