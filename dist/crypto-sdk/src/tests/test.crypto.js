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
const ethers_1 = require("ethers");
const __1 = require("..");
describe('Crypto', () => {
    it('should encrypt & decrypt', () => {
        const alice = ethers_1.Wallet.createRandom();
        const bob = ethers_1.Wallet.createRandom();
        const data = Buffer.from('{"a":"123","b":123}', 'utf8');
        const ciphertext = (0, __1.encryptData)(ethers_1.utils.arrayify(bob.publicKey), ethers_1.utils.arrayify(alice.privateKey), data);
        const plaintext = (0, __1.decryptData)(ethers_1.utils.arrayify(bob.privateKey), ethers_1.utils.arrayify(alice.publicKey), ciphertext);
        expect(Buffer.from(plaintext)).toEqual(data);
    });
    it('should verify encrypted claims', () => __awaiter(void 0, void 0, void 0, function* () {
        const alice = ethers_1.Wallet.createRandom();
        const bob = ethers_1.Wallet.createRandom();
        const witness = ethers_1.Wallet.createRandom();
        const params = "test@gmail.com";
        const data = (0, __1.createSignDataForClaim)({
            provider: 'google-login',
            context: '',
            parameters: params,
            claimId: 1,
            timestampS: Math.floor(Date.now() / 1000),
            owner: alice.address.toLowerCase()
        });
        const sig = yield __1.signatures.sign(Buffer.from(data), witness.privateKey);
        const proof = {
            parameters: params,
            signatures: [sig]
        };
        const encProof = (0, __1.encryptClaimProof)(ethers_1.utils.arrayify(bob.publicKey), ethers_1.utils.arrayify(alice.privateKey), proof);
        const eProof = {
            id: 1,
            enc: encProof
        };
        const claim = {
            id: 1,
            ownerPublicKey: yield __1.signatures.getPublicKey(alice.privateKey),
            provider: 'google-login',
            redactedParameters: '****@gmail.com',
            timestampS: Math.floor(Date.now() / 1000),
            witnessAddresses: [witness.address.toLowerCase()]
        };
        (0, __1.verifyEncryptedClaims)([claim], [eProof], ethers_1.utils.arrayify(bob.privateKey));
    }));
});
