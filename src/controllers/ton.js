import TonProofService from "../services/ton-proof.js";
import TonApiService from "../services/ton-api.js"; // Make sure this import exists

export const generatePayload = async (req, res) => {
  try {
    const service = new TonProofService();
    const payload = await service.generatePayload(); // Ensure generatePayload is async if needed
    res.status(200).json({ payload });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const checkProof = async (req, res) => {
  try {
    const body = req.body; // Assumes parse method exists
    const client = await TonApiService.create(body.network);
    const service = new TonProofService();

    const isValid = await service.checkProof(body, (address) =>
      client.getWalletPublicKey(address)
    );
    if (!isValid) {
      return res.status(400).json({ error: "Invalid proof" });
    }

    res.status(200).json({ isValid });
  } catch (error) {
    res.status(400).json({ error: "Invalid request", trace: error.message });
  }
};
