import {
  ERC8004Client,
  EthersAdapter,
} from "erc-8004-js";
import { ethers, JsonRpcProvider } from "ethers";
import { createAiSdkTools } from "../src/agent-adapters";
import { createAgentContext } from "../src/agent-tools";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new JsonRpcProvider("https://testnet.hashio.io/api");
  const signer = new ethers.Wallet(
    process.env.HEDERA_TESTNET_PRIVATE_KEY_1!,
    provider
  );
  const adapter = new EthersAdapter(provider, signer);

  const client = new ERC8004Client({
    adapter,
    addresses: {
      identityRegistry:
        process.env.IDENTITY_REGISTRY ??
        "0x0000000000000000000000000000000000000000",
      reputationRegistry:
        process.env.REPUTATION_REGISTRY ??
        "0x0000000000000000000000000000000000000000",
      validationRegistry:
        process.env.VALIDATION_REGISTRY ??
        "0x0000000000000000000000000000000000000000",
      chainId: Number(process.env.CHAIN_ID ?? 31337),
    },
  });

  const context = await createAgentContext({ client });
  const tools = await createAiSdkTools(context);

  console.log(`AI SDK tool names: ${Object.keys(tools).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
