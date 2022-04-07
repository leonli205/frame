// @ts-ignore
import { v5 as uuid } from 'uuid'
import { CryptoAccount, CryptoHDKey } from "@keystonehq/bc-ur-registry-eth";
import { TransactionData } from "../../../transaction";
import { addHexPrefix } from "ethereumjs-util";

import Signer from '../../Signer'
import { KeystoneKeyring } from "./KeystoneKeyring";
import chainConfig from "../../../chains/config";
import { TransactionFactory } from "@ethereumjs/tx";
import { TypedData } from "eth-sig-util";

export default class Keystone extends Signer {

  addressCount: number = 100

  keystoneKeyring: KeystoneKeyring = new KeystoneKeyring();

  constructor (id: string) {
    super()
    this.type = 'keystone'
    this.id = id
  }

  syncKeyring({type, cbor}: {type: string, cbor: string}): void {
    if(type === 'crypto-account'){
      this.addressCount = 10
      this.keystoneKeyring.syncKeyring(CryptoAccount.fromCBOR(Buffer.from(cbor, 'hex')))
    } else {
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

  verifyAddress(index: number, current: string, display: boolean, cb: Callback<boolean>) {
    this.keystoneKeyring.__addressFromIndex('m', index).then(address => {
      if (address.toUpperCase() === current.toUpperCase()) {
        cb(null, true)
      } else {
        cb(new Error('Address does not match device'), undefined)
      }
    })
  }

  signTransaction(index: number, rawTx: TransactionData, cb: Callback<string>) {
    const common = chainConfig(parseInt(rawTx.chainId), parseInt(rawTx.type) === 2 ? 'london' : 'berlin')
    const tx: any = TransactionFactory.fromTxData(rawTx, {common})

    this.keystoneKeyring.signTransaction(rawTx.from!, tx).then((signedTx) => {
      cb(null, addHexPrefix(signedTx.serialize().toString('hex')))
    }).catch(error => {
      cb(error, undefined)
    })
  }

  signMessage(index: number, message: string, cb: Callback<string>) {
    this.keystoneKeyring.__addressFromIndex('m', index).then(address => {
      this.keystoneKeyring.signMessage(address, message)
        .then(signedMessage => {
          cb(null, signedMessage)
        }).catch((e) => {
        const message = 'Sign message error'
        cb(new Error(message), undefined)
      })
    })
  }

  signTypedData (index: number, version: string, typedData: TypedData, cb: Callback<string>) {
    this.keystoneKeyring.__addressFromIndex('m', index).then(address => {
      this.keystoneKeyring.signTypedData(address, typedData)
        .then(signedMessage => {
          cb(null, signedMessage)
        }).catch((e) => {
        const message = 'Sign typed data error'
        cb(new Error(message), undefined)
      })
    })
  }
}
