import { ERC8004Client, EthersAdapter, createAgentContext } from 'erc-8004-js';
import { createMcpServer } from 'erc-8004-js';
import { JsonRpcProvider } from 'ethers';

async function main() {
  const provider = new JsonRpcProvider(process.env.RPC_URL ?? 'http://localhost:8545');
  const signer = await provider.getSigner();
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

  const context = await createAgentContext({ client });
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
