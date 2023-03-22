import { utils } from "ethers"
import { ClaimInfo, CompleteClaimData } from "../types"

type CommunicationData = {
	communicationPublicKey: Uint8Array
	linkId: string
	context: string
}

export function createSignDataForCommunicationKey(
	{
		communicationPublicKey,
		linkId,
		context
	}: CommunicationData,
) {
	const str = `${utils.hexlify(communicationPublicKey).toLowerCase()}\n${linkId}\n${context ?? ''}`
	return Buffer.from(str, 'utf-8')
}

export function createSignDataForClaim(
	data: CompleteClaimData
) {
	const info = 'infoHash' in data ? data.infoHash : hashClaimInfo(data)
	return [
		info,
		data.owner.toLowerCase(),
		data.timestampS.toString(),
		data.claimId.toString(),
	].join('\n')
}

export function hashClaimInfo(info: ClaimInfo) {
	const str = `${info.provider}\n${info.parameters}\n${info.context || ''}`
	return utils.keccak256(Buffer.from(str, 'utf-8')).toLowerCase()
}