import {utils, Wallet} from "ethers";
import {signatures} from "../utils";

describe('Signatures', () => {

    it('should sign & verify', async () => {

        const alice = Wallet.createRandom()

        const data = Buffer.from('{"a":"123","b":123}', 'utf8')
        const signature = await signatures.sign(
            data,
            alice.privateKey,
        )

        const addr = signatures.getAddress(utils.arrayify(alice.publicKey))
        const res = await signatures.verify(data,signature,addr)

        expect(res).toEqual(true)
    })
})