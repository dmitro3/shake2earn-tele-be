import { sha256 } from "@ton/crypto";
import { Address, Cell, contractAddress, loadStateInit } from "@ton/ton";
import { Buffer } from "buffer";
import tweetnacl from "tweetnacl";
import { tryParsePublicKey } from "../wrappers/wallets-data.js";

const tonProofPrefix = "ton-proof-item-v2/";
const tonConnectPrefix = "ton-connect";
const allowedDomains = ["shake2earn.blockey.co", "localhost:3001"];
const validAuthTime = 15 * 60; // 15 minute

export default class TonProofService {
  /**
   * Generate a random payload.
   */
  generatePayload() {
    return Buffer.from(tweetnacl.randomBytes(32)).toString("hex");
  }

  /**
   * Reference implementation of the checkProof method:
   * https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#address-proof-signature-ton_proof
   */
  async checkProof(payload, getWalletPublicKey) {
    try {
      console.log({ payload, getWalletPublicKey });
      const stateInit = loadStateInit(
        Cell.fromBase64(payload.proof.state_init).beginParse()
      );

      let publicKey =
        tryParsePublicKey(stateInit) ??
        (await getWalletPublicKey(payload.address));
      if (!publicKey) return false;

      console.log({ publicKey });

      const wantedPublicKey = Buffer.from(payload.public_key, "hex");
      if (!publicKey.equals(wantedPublicKey)) return false;

      const wantedAddress = Address.parse(payload.address);
      const address = contractAddress(wantedAddress.workChain, stateInit);

      console.log({ address });

      if (!address.equals(wantedAddress)) return false;

      if (!allowedDomains.includes(payload.proof.domain.value)) return false;

      const now = Math.floor(Date.now() / 1000);
      if (now - validAuthTime > payload.proof.timestamp) return false;

      const message = {
        workchain: address.workChain,
        address: address.hash,
        domain: {
          lengthBytes: payload.proof.domain.lengthBytes,
          value: payload.proof.domain.value,
        },
        signature: Buffer.from(payload.proof.signature, "base64"),
        payload: payload.proof.payload,
        stateInit: payload.proof.state_init,
        timestamp: payload.proof.timestamp,
      };

      console.log({ message });

      const wc = Buffer.alloc(4);
      wc.writeUInt32BE(message.workchain, 0);

      const ts = Buffer.alloc(8);
      ts.writeBigUInt64LE(BigInt(message.timestamp), 0);

      const dl = Buffer.alloc(4);
      dl.writeUInt32LE(message.domain.lengthBytes, 0);

      const msg = Buffer.concat([
        Buffer.from(tonProofPrefix),
        wc,
        message.address,
        dl,
        Buffer.from(message.domain.value),
        ts,
        Buffer.from(message.payload),
      ]);

      const msgHash = Buffer.from(await sha256(msg));

      const fullMsg = Buffer.concat([
        Buffer.from([0xff, 0xff]),
        Buffer.from(tonConnectPrefix),
        msgHash,
      ]);

      const result = Buffer.from(await sha256(fullMsg));

      return tweetnacl.sign.detached.verify(
        result,
        message.signature,
        publicKey
      );
    } catch (e) {
      return false;
    }
  }
}
