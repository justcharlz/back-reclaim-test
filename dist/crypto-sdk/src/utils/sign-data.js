"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashClaimInfo = exports.createSignDataForClaim = exports.createSignDataForCommunicationKey = void 0;
const ethers_1 = require("ethers");
function createSignDataForCommunicationKey({ communicationPublicKey, linkId, context }) {
    const str = `${ethers_1.utils.hexlify(communicationPublicKey).toLowerCase()}\n${linkId}\n${context !== null && context !== void 0 ? context : ''}`;
    return Buffer.from(str, 'utf-8');
}
exports.createSignDataForCommunicationKey = createSignDataForCommunicationKey;
function createSignDataForClaim(data) {
    const info = 'infoHash' in data ? data.infoHash : hashClaimInfo(data);
    return [
        info,
        data.owner.toLowerCase(),
        data.timestampS.toString(),
        data.claimId.toString(),
    ].join('\n');
}
exports.createSignDataForClaim = createSignDataForClaim;
function hashClaimInfo(info) {
    const str = `${info.provider}\n${info.parameters}\n${info.context || ''}`;
    return ethers_1.utils.keccak256(Buffer.from(str, 'utf-8')).toLowerCase();
}
exports.hashClaimInfo = hashClaimInfo;
