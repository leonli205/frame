// @ts-ignore
import { v5 as uuid } from 'uuid'
import { FrameKeyring } from '@keystonehq/frame-airgapped-keyring'
import { CryptoAccount, CryptoHDKey } from "@keystonehq/bc-ur-registry-eth";

import Signer from '../../Signer'

export default class Keystone extends Signer {

  addressCount: number = 100

  keystoneKeyring: FrameKeyring = new FrameKeyring();

  constructor (id: string) {
    super()
    this.type = 'keystone'
    this.id = id
  }

  async open () {
  }

  syncKeyring({type, cbor}: {type: string, cbor: string}): void {
    if(type === 'crypto-account'){
      this.addressCount = 10
      this.keystoneKeyring.syncKeyring(CryptoAccount.fromCBOR(Buffer.from(cbor, 'hex')))
    } else {
      this.addressCount = 100
      this.keystoneKeyring.syncKeyring(CryptoHDKey.fromCBOR(Buffer.from(cbor, 'hex')))
    }
  }

  close () {
    this.emit('close')
    this.removeAllListeners()

    super.close()
  }

  async deriveAddresses () {
    this.addresses = []

    let accounts = await this.keystoneKeyring.getAccounts()
    if(!accounts.length){
      await this.keystoneKeyring.addAccounts(this.addressCount)
      accounts = await this.keystoneKeyring.getAccounts()
    }
    this.addresses = accounts

    this.status = 'ok'
    this.emit('update')
  }
}
