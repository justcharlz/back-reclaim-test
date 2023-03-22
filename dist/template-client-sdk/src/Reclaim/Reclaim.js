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
        this.getConsent = (templateName, templateClaims) => __awaiter(this, void 0, void 0, function* () {
            const template = {
                id: (0, utils_1.generateUuid)(),
                name: templateName,
                callbackUrl: this.callbackUrl,
                publicKey: this.creatorWallet.publicKey,
                claims: templateClaims
            };
            return new Connection_1.default(template, this.creatorWallet.privateKey);
        });
        this.callbackUrl = callbackUrl;
        this.creatorWallet = ethers_1.Wallet.createRandom();
    }
}
exports.Reclaim = Reclaim;
