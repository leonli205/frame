import { BaseKeyring, StoredKeyring } from "@keystonehq/base-eth-keyring";
import { KeystoneInteractionProvider } from "./KeystoneInteractionProvider";

export class KeystoneKeyring extends BaseKeyring {
  constructor(opts?: StoredKeyring) {
    super(opts);
  }

  getInteraction = (): KeystoneInteractionProvider => {
    return new KeystoneInteractionProvider();
  };

  getMemStore = () => {
    return this.getInteraction().memStore;
  };

  submitSignature = this.getInteraction().submitSignature;
  cancelSignRequest = this.getInteraction().cancelRequestSignature;
}