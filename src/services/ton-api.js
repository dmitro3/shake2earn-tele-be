import { Address, TonClient4 } from "@ton/ton";
import { CHAIN } from "../constants/ton.js";
import { Buffer } from "buffer";

class TonApiService {
  static create(client) {
    if (client === CHAIN.MAINNET) {
      client = new TonClient4({
        endpoint: "https://mainnet-v4.tonhubapi.com",
      });
    } else if (client === CHAIN.TESTNET) {
      client = new TonClient4({
        endpoint: "https://testnet-v4.tonhubapi.com",
      });
    }
    return new TonApiService(client);
  }

  constructor(client) {
    this.client = client;
  }

  /**
   * Get wallet public key by address.
   */
  async getWalletPublicKey(address) {
    const masterAt = await this.client.getLastBlock();
    const result = await this.client.runMethod(
      masterAt.last.seqno,
      Address.parse(address),
      "get_public_key",
      []
    );
    return Buffer.from(
      result.reader.readBigNumber().toString(16).padStart(64, "0"),
      "hex"
    );
  }

  /**
   * Get account info by address.
   */
  async getAccountInfo(address) {
    const masterAt = await this.client.getLastBlock();
    return await this.client.getAccount(
      masterAt.last.seqno,
      Address.parse(address)
    );
  }
}

export default TonApiService;
