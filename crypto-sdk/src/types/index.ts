export type PrivateKey = string

type Awaitable<T> = T | Promise<T>

export type ServiceSignatureProvider = {
	/**
	 * Returns public key in compressed (compact) format used in Reclaim RPC calls
	 * @param privateKey corresponding private key in raw o hex form
	 */
	getPublicKey(privateKey: PrivateKey): Awaitable<Uint8Array>
	/**
	 * Returns address corresponding to the provided public key
	 * @param publicKey raw o hex form, compressed or uncompressed
	 */
	getAddress(publicKey: Uint8Array): string
	/**
	 * Signs data with the provided private key
	 * @param data raw data to be signed
	 * @param privateKey private key in raw or hex format
	 */
	sign(data: Uint8Array, privateKey: PrivateKey): Awaitable<Uint8Array>
	/**
	 * Verifies signature against provided data and an address
	 * @param data raw data to be verified. Must be same as used in sign() call
	 * @param signature signature bytes
	 * @param addressBytes address corresponding to a public key
	 */
	verify(data: Uint8Array, signature: Uint8Array, addressBytes: Uint8Array | string): Awaitable<boolean>
}

export type ClaimInfo = {
	provider: string
	parameters: string
	context?: string
}

export type AnyClaimInfo = ClaimInfo | { infoHash: string }

export type CompleteClaimData = (
	{
		owner: string
		timestampS: number
		claimId: number
	}
) & AnyClaimInfo

export type AuthToken = {
	/** wallet address of the user */
	id: string
	/** unix timestamp in seconds */
	expiresAtS: number
}

export type Claim = {
	id: number
	provider: string
	redactedParameters: string
	ownerPublicKey: Uint8Array

	timestampS: number
	witnessAddresses: string[]
}

export type EncryptedClaimProof = {
	id: number
	enc: Uint8Array
}

export type ClaimProof = {
	parameters: string
	signatures: Uint8Array[]
}
