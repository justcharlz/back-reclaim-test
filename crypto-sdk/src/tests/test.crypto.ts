import { utils, Wallet } from 'ethers'
import {
	Claim,
	ClaimProof, createSignDataForClaim,
	decryptData,
	encryptClaimProof,
	encryptData,
	EncryptedClaimProof,
	signatures,
	verifyEncryptedClaims
} from '..'

describe('Crypto', () => {

	it('should encrypt & decrypt', () => {

		const alice = Wallet.createRandom()
		const bob = Wallet.createRandom()

		const data = Buffer.from('{"a":"123","b":123}', 'utf8')
		const ciphertext = encryptData(
			utils.arrayify(bob.publicKey),
			utils.arrayify(alice.privateKey),
			data
		)

		const plaintext = decryptData(
			utils.arrayify(bob.privateKey),
			utils.arrayify(alice.publicKey),
			ciphertext
		)
		expect(Buffer.from(plaintext)).toEqual(data)
	})

	it('should verify encrypted claims',async ()=>{

		const alice = Wallet.createRandom()
		const bob = Wallet.createRandom()
		const witness = Wallet.createRandom()

		const params = "test@gmail.com"
		const data = createSignDataForClaim({
			provider:'google-login',
			context:'', // TODO why context can only be empty?
			parameters:params,
			claimId:1,
			timestampS: Math.floor(Date.now() / 1000),
			owner:alice.address.toLowerCase()
		})

		const sig = await signatures.sign(Buffer.from(data),witness.privateKey)

		const proof: ClaimProof = {
			parameters:params,
			signatures:[sig]
		}

		const encProof =  encryptClaimProof(utils.arrayify(bob.publicKey), utils.arrayify(alice.privateKey),proof)

		const eProof : EncryptedClaimProof = {
			id:1,
			enc:encProof
		}

		const claim:Claim = {
			id:1,
			ownerPublicKey:await signatures.getPublicKey(alice.privateKey),
			provider:'google-login',
			redactedParameters:'****@gmail.com',
			timestampS: Math.floor(Date.now() / 1000),
			witnessAddresses:[witness.address.toLowerCase()]
		}

		verifyEncryptedClaims([claim],[eProof],utils.arrayify(bob.privateKey))
	})
})
