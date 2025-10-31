import { ethers, JsonRpcProvider } from 'ethers';
import { ERC8004Client, EthersAdapter } from "erc-8004-js";
import { createAgentContext } from "../src/agent-tools";
import { createMcpServer } from "../src/agent-adapters";
import dotenv from "dotenv";

dotenv.config();

// FIXME: the MCP is not working
async function main() {
  const provider = new JsonRpcProvider(process.env.RPC_URL ?? 'http://localhost:8545');
  const signer = new ethers.Wallet(
    process.env.HEDERA_TESTNET_PRIVATE_KEY_1!,
    provider
  );
  const adapter = new EthersAdapter(provider, signer);
  const client = new ERC8004Client({
    adapter,
    addresses: {
      identityRegistry: process.env.IDENTITY_REGISTRY ?? '0x0000000000000000000000000000000000000000',
      reputationRegistry: process.env.REPUTATION_REGISTRY ?? '0x0000000000000000000000000000000000000000',
      validationRegistry: process.env.VALIDATION_REGISTRY ?? '0x0000000000000000000000000000000000000000',
      chainId: Number(process.env.CHAIN_ID ?? 31337),
    },
  });

  const context = await createAgentContext({client});
  const server: any = await createMcpServer(context);

  if (typeof server.start === 'function') {
    await server.start();
    console.log('MCP server started');
  } else {
    console.log('MCP server created');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
