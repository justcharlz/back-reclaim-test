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
exports.authoriseWalletForClaimCreation = exports.signatures = void 0;
const ethers_1 = require("ethers");
const sign_data_1 = require("./sign-data");
const utils_1 = require("ethers/lib/utils");
exports.signatures = {
    getPublicKey(privateKey) {
        const pub = (0, utils_1.computePublicKey)(privateKey, true);
        return ethers_1.utils.arrayify(pub);
    },
    getAddress(publicKey) {
        return (0, utils_1.computeAddress)(publicKey).toLowerCase();
    },
    sign(data, privateKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = getEthWallet(privateKey);
            const signature = yield wallet.signMessage(data);
            return ethers_1.utils.arrayify(signature);
        });
    },
    verify(data, signature, addressBytes) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = typeof addressBytes === 'string'
                ? addressBytes
                : ethers_1.utils.hexlify(addressBytes);
            const signerAddress = ethers_1.utils.verifyMessage(data, signature);
            return signerAddress.toLowerCase() === address.toLowerCase();
        });
    }
};
function getEthWallet(privateKey) {
    if (!privateKey) {
        throw new Error('Private key missing');
    }
    return new ethers_1.Wallet(privateKey);
}
const DEFAULT_MINT_EXPIRY_M = 15;
/**
 * Authorise "requestor" to create a claim for "me"
 * using the given application data
 * @param me wallet who will own the credential
 * @param requestor wallet that will actually talk to the SC
 * @param data info about the credential to mint
 */
function authoriseWalletForClaimCreation(me, requestor, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const expiryMs = Date.now() + (DEFAULT_MINT_EXPIRY_M * 60 * 1000);
        const serialised = (0, sign_data_1.createSignDataForClaim)(Object.assign(Object.assign({}, data), { owner: requestor.toLowerCase(), timestampS: Math.floor(expiryMs / 1000), claimId: 0 }));
        const signature = yield exports.signatures.sign(Buffer.from(serialised), me.privateKey);
        return { signature, expiryMs };
    });
}
exports.authoriseWalletForClaimCreation = authoriseWalletForClaimCreation;
