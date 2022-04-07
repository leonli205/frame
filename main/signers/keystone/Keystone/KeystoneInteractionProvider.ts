// @ts-ignore
import * as uuid from "uuid";
import { InteractionProvider } from "@keystonehq/base-eth-keyring";
import { EventEmitter } from "events";
import { ObservableStore } from "@metamask/obs-store";
import {
  EthSignRequest,
  ETHSignature, CryptoAccount,
} from "@keystonehq/bc-ur-registry-eth";

export class KeystoneInteractionProvider extends EventEmitter implements InteractionProvider {
  static instance: KeystoneInteractionProvider;
  public memStore!: ObservableStore<{
    _version: number;
    sign: {
      request?: {
        requestId: string;
        payload: {
          type: string;
          cbor: string;
        };
        title?: string;
        description?: string;
      };
    };
  }>;

  constructor() {
    super();
    if (KeystoneInteractionProvider.instance) {
      return KeystoneInteractionProvider.instance;
    }
    this.memStore = new ObservableStore({
      _version: 1,
      sign: {},
    });
    KeystoneInteractionProvider.instance = this;
  }

  readCryptoHDKeyOrCryptoAccount = () => Promise.resolve(CryptoAccount.fromCBOR(Buffer.from('', "hex")))

  requestSignature = (
    signRequest: EthSignRequest,
    requestTitle?: string,
    requestDescription?: string
  ): Promise<ETHSignature> => {
    return new Promise((resolve, reject) => {
      const ur = signRequest.toUR();
      const requestIdBuffer = signRequest.getRequestId();
      const requestId = uuid.stringify(requestIdBuffer);
      const signPayload = {
        requestId,
        payload: {
          type: ur.type,
          cbor: ur.cbor.toString("hex"),
        },
        title: requestTitle,
        description: requestDescription,
      };
      this.memStore.updateState({
        sign: {
          request: signPayload,
        },
      });

      this.once(`${requestId}-signed`, (cbor: string) => {
        const ethSignature = ETHSignature.fromCBOR(Buffer.from(cbor, "hex"));
        this.resetState();
        resolve(ethSignature);
      });
      this.once(`${requestId}-canceled`, () => {
        this.resetState();
        reject(
          new Error("KeystoneError#Tx_canceled. Signing canceled, please retry")
        );
      });
    });
  };

  submitSignature = (requestId: string, cbor: string) => {
    this.emit(`${requestId}-signed`, cbor);
  };

  cancelRequestSignature = () => {
    const signPayload = this.memStore.getState().sign.request;
    if (signPayload) {
      const {requestId} = signPayload;
      this.memStore.updateState({sign: {}});
      this.emit(`${requestId}-canceled`);
    }
  };

  private resetState = () => {
    this.memStore.updateState({
      sign: {},
    });
  };
}
