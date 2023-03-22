import { createCipheriv, createDecipheriv } from 'crypto'
import { utils } from 'ethers'
import { SigningKey } from 'ethers/lib/utils'
import  hkdf from 'futoin-hkdf'
import { Claim, ClaimProof, EncryptedClaimProof } from '../types'
import { BufferJSON } from './buffer-json'
import { isRedactionCongruent } from './redactions'
import { createSignDataForClaim } from './sign-data'
import {signatures} from "./signatures";

const AUTH_TAG_LENGTH = 16

/**
 * Encrypts data using recipient's public key and sender's private key.
 * @param publicKey - Recipient public key in raw (un-hexed) form.
 * @param privateKey - Sender's private key in raw (un-hexed) form.
 * @param data - claim proof to encrypt
 */
export function encryptClaimProof(publicKey: Uint8Array, privateKey: Uint8Array, data: ClaimProof): Uint8Array {
	const serialised = Buffer.from(JSON.stringify(data, BufferJSON.replacer))
	return encryptData(publicKey, privateKey, serialised)
}

/**
 * Encrypts data using recipient's public key and sender's private key.
 * @param {Uint8Array} publicKey - Recipient public key in raw (un-hexed) form.
 * @param {Uint8Array} privateKey - Sender's private key in raw (un-hexed) form.
 * @param {Uint8Array} data - serialized data to encrypt
 */
export function encryptData(publicKey: Uint8Array, privateKey: Uint8Array, data: Uint8Array): Uint8Array {
	const { key, salt } = getKeyAndSalt(publicKey, privateKey)
	const cipher = createCipheriv('aes-256-gcm', key, salt, { authTagLength: AUTH_TAG_LENGTH })
	return Buffer.concat([
		cipher.update(data),
		cipher.final(),
		cipher.getAuthTag()
	])
}

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
export function decryptData(privateKey: Uint8Array, publicKey: Uint8Array, ciphertext: Uint8Array): Uint8Array {
	const { key, salt } = getKeyAndSalt(publicKey, privateKey)
	const decipher = createDecipheriv('aes-256-gcm', key, salt, { authTagLength: AUTH_TAG_LENGTH })
	decipher.setAuthTag(
		ciphertext.subarray(ciphertext.length - AUTH_TAG_LENGTH)
	)
	ciphertext = ciphertext.subarray(0, ciphertext.length - AUTH_TAG_LENGTH)

	return Buffer.concat([
		decipher.update(ciphertext),
		decipher.final()
	])
}

/**
 * Call to verify that the claims are proven by the encrypted proofs
 * @param claims the claims to verify
 * @param encryptedProofs encrypted proofs of the claims
 * @param privateKey private part of the communication key, must have been used
 * to encrypt the "encryptedProofs"
 */
export function verifyEncryptedClaims(
	claims: Claim[],
	encryptedProofs: EncryptedClaimProof[],
	privateKey: Uint8Array,
) {
	const revealedClaims: { [id: string]: ClaimProof } = {}
	// claims we have not found a proof for
	const claimsMissing = new Set<number>(claims.map(c => c.id))
	// go through all encrypted proofs and decrypt them
	// check if the decrypted proof matches the claim
	for(const { id, enc } of encryptedProofs) {
		const claim = claims.find(c => c.id === id)
		if(!claim) {
			throw new Error('Claim not found')
		}

		// 1. check the data decrypts successfully
		const decryped = decryptData(privateKey, claim.ownerPublicKey, enc)
		// 2. check the data is valid JSON
		const proof: ClaimProof = JSON.parse(decryped.toString(), BufferJSON.reviver)
		// 3. check the claim parameters contained original link
		// match the ones decrypted
		if(!isRedactionCongruent(claim.redactedParameters, proof.parameters)) {
			throw new Error(`Claim parameters do not match for "${id}", redacted="${claim.redactedParameters}", decrypted="${proof.parameters}"`)
		}

		// 4. go through all signatures
		// and check that they are valid
		const dataStr = createSignDataForClaim({
			provider: claim.provider,
			parameters: proof.parameters,
			owner: signatures.getAddress(claim.ownerPublicKey),
			timestampS: claim.timestampS,
			claimId: claim.id,
			context: ''
		})

		// set of witnesses whose signatures we've not seen
		const witnesses = new Set(claim.witnessAddresses)
		const signatureAddresses = new Set()
		for(const signature of proof.signatures) {
			const signer = utils.verifyMessage(dataStr, signature).toLowerCase()
			signatureAddresses.add(signer)
		}

		// check that each witness signed the claim
		witnesses.forEach(witness => {
			if (signatureAddresses.has(witness)){
				signatureAddresses.delete(witness)
			} else {
				throw new Error(`Could not find signature for witness: ${witness}`)
			}
		})

		// check for extra signatures
		if (signatureAddresses.size > 0){
			throw new Error(`Claim signed by more witnesses than expected`)
		}

		
		claimsMissing.delete(id)
		revealedClaims[id] = proof
	}

	// 7. if there are any claims left, that did not have a proof
	// throw an error, because we expected all claims to be proven
	if(claimsMissing.size) {
		const missing = claims.map(c => c.id).join(', ')
		throw new Error(`Not all claims were proven: ${missing}`)
	}

	return revealedClaims
}

function getKeyAndSalt(publicKey: Uint8Array, privateKey: Uint8Array) {
	const sharedSecret = Buffer.from(
		utils.arrayify(new SigningKey(privateKey).computeSharedSecret(publicKey))
	)
	const key = hkdf(sharedSecret, 32, { salt: 'reclaim-key' })
	const salt = hkdf(sharedSecret, 12, { salt: 'reclaim-salt' })
	return { key, salt }
} 