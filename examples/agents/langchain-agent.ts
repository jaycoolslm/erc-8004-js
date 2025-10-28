import {
  ERC8004Client,
  EthersAdapter,
  createAgentContext,
  createLangChainTools,
} from "../../src";
import { ethers, JsonRpcProvider } from "ethers";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import dotenv from "dotenv";
import prompts from "prompts";

dotenv.config();

// Contract addresses from your deployment
const IDENTITY_REGISTRY = "0x4c74ebd72921d537159ed2053f46c12a7d8e5923";
const REPUTATION_REGISTRY = "0xc565edcba77e3abeade40bfd6cf6bf583b3293e0";
const VALIDATION_REGISTRY = "0x18df085d85c586e9241e0cd121ca422f571c2da6";

async function main() {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
  });
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
        IDENTITY_REGISTRY ?? "0x0000000000000000000000000000000000000000",
      reputationRegistry:
        REPUTATION_REGISTRY ?? "0x0000000000000000000000000000000000000000",
      validationRegistry:
        VALIDATION_REGISTRY ?? "0x0000000000000000000000000000000000000000",
      chainId: Number(process.env.CHAIN_ID ?? 296),
    },
  });

  const context = await createAgentContext({ client });
  const tools = await createLangChainTools(context, {
    categories: ["identity", "reputation"],
  });

  console.log(`Loaded ${tools.length} LangChain tools`);

  // Load the structured chat prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant"],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // In-memory conversation history
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output",
    returnMessages: true,
  });

  // Wrap everything in an executor that will maintain memory
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory,
    returnIntermediateSteps: false,
  });

  while (true) {
    const { userInput } = await prompts({
      type: "text",
      name: "userInput",
      message: "You",
    });

    // Handle early termination
    if (
      !userInput ||
      ["exit", "quit"].includes(userInput.trim().toLowerCase())
    ) {
      console.log("Goodbye!");
      break;
    }

    try {
      const response = await agentExecutor.invoke({ input: userInput });
      // The structured-chat agent puts its final answer in `output`
      console.log(`AI: ${response?.output ?? response}`);
    } catch (err) {
      console.error("Error:", err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
