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
describe('Auth', () => {
    it('should validate token', () => __awaiter(void 0, void 0, void 0, function* () {
        const acc = ethers_1.Wallet.createRandom();
        const token = yield (0, utils_1.generateAuthToken)(acc.privateKey);
        const usr = (0, utils_1.authenticate)(token);
        expect(usr.id.toLowerCase()).toEqual(acc.address.toLowerCase());
    }));
});
