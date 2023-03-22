"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reclaim = void 0;
const utils_1 = require("../utils");
const Connection_1 = __importDefault(require("./Connection"));
const ethers_1 = require("ethers");
class Reclaim {
    constructor(callbackUrl) {
        this.getConsent = async (templateName, templateClaims) => {
            const template = {
                id: (0, utils_1.generateUuid)(),
                name: templateName,
                callbackUrl: this.callbackUrl,
                publicKey: this.creatorWallet.publicKey,
                claims: templateClaims
            };
            return new Connection_1.default(template, this.creatorWallet.privateKey);
        };
        this.callbackUrl = callbackUrl;
        this.creatorWallet = ethers_1.Wallet.createRandom();
    }
}
exports.Reclaim = Reclaim;
