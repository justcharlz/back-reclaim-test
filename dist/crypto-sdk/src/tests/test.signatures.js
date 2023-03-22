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
const utils_1 = require("../utils");
describe('Signatures', () => {
    it('should sign & verify', () => __awaiter(void 0, void 0, void 0, function* () {
        const alice = ethers_1.Wallet.createRandom();
        const data = Buffer.from('{"a":"123","b":123}', 'utf8');
        const signature = yield utils_1.signatures.sign(data, alice.privateKey);
        const addr = utils_1.signatures.getAddress(ethers_1.utils.arrayify(alice.publicKey));
        const res = yield utils_1.signatures.verify(data, signature, addr);
        expect(res).toEqual(true);
    }));
});
