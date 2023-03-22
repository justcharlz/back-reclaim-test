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
exports.generateAuthToken = exports.authenticate = exports.AUTH_TOKEN_EXPIRY_S = void 0;
const ethers_1 = require("ethers");
const signatures_1 = require("./signatures");
exports.AUTH_TOKEN_EXPIRY_S = 60 * 60;
/**
 * Decode and verify auth token
 * @param auth the auth token
 * @returns authorised user data
 */
function authenticate(auth) {
    const [plaintextB64, signatureB64] = auth.split('.');
    const plaintext = Buffer.from(plaintextB64, 'base64url');
    const signature = Buffer.from(signatureB64, 'base64url');
    const meId = ethers_1.utils.verifyMessage(plaintext, signature);
    const token = JSON.parse(plaintext.toString('utf-8'));
    if (typeof token !== 'object') {
        throw new Error('Invalid token');
    }
    const { id, expiresAtS } = token;
    if (typeof id !== 'string' || typeof expiresAtS !== 'number') {
        throw new Error('Invalid token data');
    }
    if (meId.toLowerCase() !== token.id.toLowerCase()) {
        throw new Error('Token signature/wallet mismatch');
    }
    if (token.expiresAtS < unixTimestampSeconds()) {
        throw new Error('Token expired');
    }
    return { id, expiresAtS };
}
exports.authenticate = authenticate;
/**
 * Generates a 1-hour valid auth token
 * @param privateKey the 0x hex prefixed standard eth private key
 * @param expiryS the expiry time for the token in seconds
 * @returns auth token for that key
 */
function generateAuthToken(privateKey, expiryS = exports.AUTH_TOKEN_EXPIRY_S) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new ethers_1.Wallet(privateKey);
        const data = JSON.stringify({
            id: wallet.address.toLowerCase(),
            expiresAtS: unixTimestampSeconds() + expiryS
        });
        const encodedData = Buffer.from(data);
        const sig = yield signatures_1.signatures.sign(encodedData, privateKey);
        const encodedSig = Buffer.from(ethers_1.utils.arrayify(sig));
        return encodedData.toString('base64url')
            + '.'
            + encodedSig.toString('base64url');
    });
}
exports.generateAuthToken = generateAuthToken;
function unixTimestampSeconds() {
    return Math.floor(Date.now() / 1000);
}
