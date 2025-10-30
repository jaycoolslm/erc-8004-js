import {
  ERC8004Client,
  EthersAdapter,
} from "erc-8004-js";
import { JsonRpcProvider } from "ethers";
import { createAiSdkTools } from "../src/agent-adapters";
import { createAgentContext } from "../src/agent-tools";

async function main() {
  const provider = new JsonRpcProvider(
    process.env.RPC_URL ?? "http://localhost:8545"
  );
  const signer = await provider.getSigner();
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
