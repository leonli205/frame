import log from 'electron-log'

// @ts-ignore
import { v5 as uuid } from 'uuid'

import { SignerAdapter } from '../adapters'
import Keystone from './Keystone'
import store from '../../store'
import { CryptoAccount, CryptoHDKey } from "@keystonehq/bc-ur-registry-eth";

const ns = '3bbcee75-cecc-5b56-8031-b6641c1ed1f1'

export default class KeystoneSignerAdapter extends SignerAdapter {
  private knownSigners: { [id: string]: Keystone }
  private observer: any;

  constructor() {
    super('keystone')

    this.knownSigners = {}
  }

  open() {
    this.observer = store.observer( () => {
      const ur = store('main.keystone.sync')

      if(ur){
        const id = this.getKeyringId(ur)
        if(!this.knownSigners[id]){
          this.handleSyncDevice(ur, id)
        }
      }
    })

    super.open()
  }

  close() {
    if (this.observer) {
      this.observer.remove()
      this.observer = null
    }

    super.close()
  }

  remove(keystone: Keystone) {
    if (keystone.id in this.knownSigners) {
      log.info(`removing Keystone ${keystone.id}`)

      delete this.knownSigners[keystone.id]

      keystone.close()
    }
  }

  private getKeyringId({type, cbor}: {type: string, cbor: string}): string{
    if(type === 'crypto-account'){
      const cryptoAccount = CryptoAccount.fromCBOR(Buffer.from(cbor, 'hex'))
      return uuid(`Keystone${cryptoAccount.getRegistryType()?.getType()}-${cryptoAccount.getMasterFingerprint().toString("hex")}`, ns)
    } else {
      const cryptoHDKey = CryptoHDKey.fromCBOR(Buffer.from(cbor, 'hex'))
      return uuid(`Keystone${cryptoHDKey.getNote()}${cryptoHDKey.getParentFingerprint()!.toString("hex")}`, ns)
    }
  }

  private handleSyncDevice(ur: {type: string, cbor: string}, id: string) {
    const keystone = new Keystone(id)
    keystone.syncKeyring(ur)

    const emitUpdate = () => this.emit('update', keystone)

    keystone.on('update', emitUpdate)
    keystone.on('error', emitUpdate)

    keystone.keystoneKeyring.getInteraction().memStore.subscribe(state => {
      store.setKeystoneMemStore(state.sign.request)
    })

    this.knownSigners[id] = keystone

    keystone.deriveAddresses()
  }
}
