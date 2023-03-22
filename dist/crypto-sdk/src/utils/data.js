"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEncryptedClaims = exports.decryptData = exports.encryptData = exports.encryptClaimProof = void 0;
const crypto_1 = require("crypto");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const futoin_hkdf_1 = __importDefault(require("futoin-hkdf"));
const buffer_json_1 = require("./buffer-json");
const redactions_1 = require("./redactions");
const sign_data_1 = require("./sign-data");
const signatures_1 = require("./signatures");
const AUTH_TAG_LENGTH = 16;
/**
 * Encrypts data using recipient's public key and sender's private key.
 * @param publicKey - Recipient public key in raw (un-hexed) form.
 * @param privateKey - Sender's private key in raw (un-hexed) form.
 * @param data - claim proof to encrypt
 */
function encryptClaimProof(publicKey, privateKey, data) {
    const serialised = Buffer.from(JSON.stringify(data, buffer_json_1.BufferJSON.replacer));
    return encryptData(publicKey, privateKey, serialised);
}
exports.encryptClaimProof = encryptClaimProof;
/**
 * Encrypts data using recipient's public key and sender's private key.
 * @param {Uint8Array} publicKey - Recipient public key in raw (un-hexed) form.
 * @param {Uint8Array} privateKey - Sender's private key in raw (un-hexed) form.
 * @param {Uint8Array} data - serialized data to encrypt
 */
function encryptData(publicKey, privateKey, data) {
    const { key, salt } = getKeyAndSalt(publicKey, privateKey);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, salt, { authTagLength: AUTH_TAG_LENGTH });
    return Buffer.concat([
        cipher.update(data),
        cipher.final(),
        cipher.getAuthTag()
    ]);
}
exports.encryptData = encryptData;
/**
 * Decrypts data using sender's public key and recipient's private key.
 * @param {Uint8Array} privateKey - Recipient's private key in raw (un-hexed) form.
 * @param {Uint8Array} publicKey -Sender's public key in raw (un-hexed) form.
 * @param {Uint8Array} ciphertext - encrypted data
 */
/**
 * Decrypts data using sender's public key and recipient's private key.
 * @param {Uint8Array} privateKey - Recipient's private key in raw (un-hexed) form.
 * @param {Uint8Array} publicKey -Sender's public key in raw (un-hexed) form.
 * @param {Uint8Array} ciphertext - encrypted data
 */
function decryptData(privateKey, publicKey, ciphertext) {
    const { key, salt } = getKeyAndSalt(publicKey, privateKey);
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, salt, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(ciphertext.subarray(ciphertext.length - AUTH_TAG_LENGTH));
    ciphertext = ciphertext.subarray(0, ciphertext.length - AUTH_TAG_LENGTH);
    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);
}
exports.decryptData = decryptData;
/**
 * Call to verify that the claims are proven by the encrypted proofs
 * @param claims the claims to verify
 * @param encryptedProofs encrypted proofs of the claims
 * @param privateKey private part of the communication key, must have been used
 * to encrypt the "encryptedProofs"
 */
function verifyEncryptedClaims(claims, encryptedProofs, privateKey) {
    const revealedClaims = {};
    // claims we have not found a proof for
    const claimsMissing = new Set(claims.map(c => c.id));
    // go through all encrypted proofs and decrypt them
    // check if the decrypted proof matches the claim
    for (const { id, enc } of encryptedProofs) {
        const claim = claims.find(c => c.id === id);
        if (!claim) {
            throw new Error('Claim not found');
        }
        // 1. check the data decrypts successfully
        const decryped = decryptData(privateKey, claim.ownerPublicKey, enc);
        // 2. check the data is valid JSON
        const proof = JSON.parse(decryped.toString(), buffer_json_1.BufferJSON.reviver);
        // 3. check the claim parameters contained original link
        // match the ones decrypted
        if (!(0, redactions_1.isRedactionCongruent)(claim.redactedParameters, proof.parameters)) {
            throw new Error(`Claim parameters do not match for "${id}", redacted="${claim.redactedParameters}", decrypted="${proof.parameters}"`);
        }
        // 4. go through all signatures
        // and check that they are valid
        const dataStr = (0, sign_data_1.createSignDataForClaim)({
            provider: claim.provider,
            parameters: proof.parameters,
            owner: signatures_1.signatures.getAddress(claim.ownerPublicKey),
            timestampS: claim.timestampS,
            claimId: claim.id,
            context: ''
        });
        // set of witnesses whose signatures we've not seen
        const witnesses = new Set(claim.witnessAddresses);
        const signatureAddresses = new Set();
        for (const signature of proof.signatures) {
            const signer = ethers_1.utils.verifyMessage(dataStr, signature).toLowerCase();
            signatureAddresses.add(signer);
        }
        // check that each witness signed the claim
        witnesses.forEach(witness => {
            if (signatureAddresses.has(witness)) {
                signatureAddresses.delete(witness);
            }
            else {
                throw new Error(`Could not find signature for witness: ${witness}`);
            }
        });
        // check for extra signatures
        if (signatureAddresses.size > 0) {
            throw new Error(`Claim signed by more witnesses than expected`);
        }
        claimsMissing.delete(id);
        revealedClaims[id] = proof;
    }
    // 7. if there are any claims left, that did not have a proof
    // throw an error, because we expected all claims to be proven
    if (claimsMissing.size) {
        const missing = claims.map(c => c.id).join(', ');
        throw new Error(`Not all claims were proven: ${missing}`);
    }
    return revealedClaims;
}
exports.verifyEncryptedClaims = verifyEncryptedClaims;
function getKeyAndSalt(publicKey, privateKey) {
    const sharedSecret = Buffer.from(ethers_1.utils.arrayify(new utils_1.SigningKey(privateKey).computeSharedSecret(publicKey)));
    const key = (0, futoin_hkdf_1.default)(sharedSecret, 32, { salt: 'reclaim-key' });
    const salt = (0, futoin_hkdf_1.default)(sharedSecret, 12, { salt: 'reclaim-salt' });
    return { key, salt };
}
