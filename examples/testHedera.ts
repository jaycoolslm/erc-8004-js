/**
 * Example script to test ERC-8004 SDK with local Hardhat chain
 *
 * Prerequisites:
 * 1. Run hardhat node: npx hardhat node
 * 2. Deploy contracts with the ignition script
 *
 * This example demonstrates:
 * - Initializing the SDK with adapter pattern
 * - Registering agents
 * - Reading agent information
 * - Updating tokenURI
 */
import dotenv from "dotenv";
dotenv.config();
import { ERC8004Client, EthersAdapter } from "../src";
import { ethers } from "ethers";
import {
  TopicMessageSubmitTransaction,
  Client,
  PrivateKey,
} from "@hashgraph/sdk";

// Contract addresses from your deployment
const IDENTITY_REGISTRY = "0x4c74ebd72921d537159ed2053f46c12a7d8e5923";
const REPUTATION_REGISTRY = "0xc565edcba77e3abeade40bfd6cf6bf583b3293e0";
const VALIDATION_REGISTRY = "0x18df085d85c586e9241e0cd121ca422f571c2da6";

/**
 * Generate a random CIDv0 (Qm...) for testing purposes
 * CIDv0 format: base58(0x12 + 0x20 + 32 random bytes)
 */
function generateRandomCIDv0(): string {
  // Base58 alphabet
  const BASE58_ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  // Create random 32 bytes
  const randomBytes = ethers.randomBytes(32);

  // Build CIDv0 structure: [0x12 (sha256), 0x20 (32 bytes), ...random bytes...]
  const cidBytes = new Uint8Array(34);
  cidBytes[0] = 0x12; // sha256
  cidBytes[1] = 0x20; // 32 bytes length
  cidBytes.set(randomBytes, 2);

  // Encode to base58
  const bytes = Array.from(cidBytes);
  let num = BigInt(
    "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("")
  );

  let encoded = "";
  while (num > 0n) {
    const remainder = Number(num % 58n);
    encoded = BASE58_ALPHABET[remainder] + encoded;
    num = num / 58n;
  }

  // Handle leading zeros
  for (let i = 0; i < cidBytes.length && cidBytes[i] === 0; i++) {
    encoded = "1" + encoded;
  }

  return encoded;
}

async function main() {
  console.log("🚀 ERC-8004 SDK Test\n");

  // Connect to Hedera
  console.log("Connecting to Hedera");
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || "");
  const HEDERA_TESTNET_PRIVATE_KEY_1 =
    process.env.HEDERA_TESTNET_PRIVATE_KEY_1 || "";
  const HEDERA_TESTNET_PRIVATE_KEY_2 =
    process.env.HEDERA_TESTNET_PRIVATE_KEY_2 || "";
  const agentOwner = new ethers.Wallet(HEDERA_TESTNET_PRIVATE_KEY_1, provider);
  const feedbackGiver = new ethers.Wallet(
    HEDERA_TESTNET_PRIVATE_KEY_2,
    provider
  );

  const client = Client.forTestnet().setOperator(
    process.env.HEDERA_TESTNET_ACCOUNT_1,
    PrivateKey.fromStringECDSA(HEDERA_TESTNET_PRIVATE_KEY_1)
  );

  // Create adapter for agent owner
  const agentAdapter = new EthersAdapter(provider, agentOwner);

  // Initialize SDK with adapter for agent owner
  const agentClient = new ERC8004Client({
    adapter: agentAdapter,
    addresses: {
      identityRegistry: IDENTITY_REGISTRY,
      reputationRegistry: REPUTATION_REGISTRY,
      validationRegistry: VALIDATION_REGISTRY,
      chainId: 296, // Hardhat chain ID
    },
  });

  // Create SDK instance for feedback giver
  const feedbackAdapter = new EthersAdapter(provider, feedbackGiver);
  const feedbackClient = new ERC8004Client({
    adapter: feedbackAdapter,
    addresses: {
      identityRegistry: IDENTITY_REGISTRY,
      reputationRegistry: REPUTATION_REGISTRY,
      validationRegistry: VALIDATION_REGISTRY,
      chainId: 296,
    },
  });

  const agentOwnerAddress = agentOwner.address;
  const feedbackGiverAddress = feedbackGiver.address;
  console.log(`Agent Owner: ${agentOwnerAddress}`);
  console.log(`Feedback Giver: ${feedbackGiverAddress}\n`);

  // Register a single agent that will be used for all tests
  console.log("Registering agent with URI and metadata...");
  let agentId: bigint;
  try {
    const registrationURI = `ipfs://${generateRandomCIDv0()}`;
    const metadata = [
      { key: "agentName", value: "TestAgent" },
      {
        key: "agentWallet",
        value: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
      },
    ];

    const result = await agentClient.identity.registerWithMetadata(
      registrationURI,
      metadata
    );
    agentId = result.agentId;
    console.log(`✅ Registered agent ID: ${agentId}`);
    console.log(`   TX Hash: ${result.txHash}`);
    console.log(
      `   🔍 View on Etherscan: https://hashscan.io/testnet/tx/${result.txHash}`
    );
    console.log(`   Owner: ${await agentClient.identity.getOwner(agentId)}`);
    console.log(`   URI: ${await agentClient.identity.getTokenURI(agentId)}`);

    // Read back metadata
    const agentName = await agentClient.identity.getMetadata(
      agentId,
      "agentName"
    );
    const agentWallet = await agentClient.identity.getMetadata(
      agentId,
      "agentWallet"
    );
    console.log(`   Metadata - agentName: ${agentName}`);
    console.log(`   Metadata - agentWallet: ${agentWallet}\n`);
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
    return;
  }

  // Test 1: Set metadata after registration
  console.log("Test 1: Set metadata after registration");
  try {
    const setMetadataResult = await agentClient.identity.setMetadata(
      agentId,
      "status",
      "active"
    );
    const status = await agentClient.identity.getMetadata(agentId, "status");
    console.log(`   Set metadata - status: ${status}`);
    console.log(`   TX Hash: ${setMetadataResult.txHash}`);
    console.log(
      `   🔍 View on Etherscan: https://hashscan.io/testnet/tx/${setMetadataResult.txHash}\n`
    );
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
  }

  // Test 2: Create feedbackAuth and submit feedback
  console.log("Test 2: Create feedbackAuth and submit feedback");
  try {
    // Get chain ID
    const chainId = await agentClient.getChainId();

    // Get the last feedback index for the feedback giver
    const lastIndex = await agentClient.reputation.getLastIndex(
      agentId,
      feedbackGiverAddress
    );
    console.log(`   Last feedback index: ${lastIndex}`);

    // Create feedbackAuth (agent owner authorizes feedback giver)
    const feedbackAuth = agentClient.reputation.createFeedbackAuth(
      agentId,
      feedbackGiverAddress,
      lastIndex + BigInt(1), // Allow next feedback
      BigInt(Math.floor(Date.now() / 1000) + 3600), // Valid for 1 hour
      BigInt(chainId),
      agentOwnerAddress
    );
    console.log(
      `✅ FeedbackAuth created (indexLimit: ${feedbackAuth.indexLimit})`
    );

    // Agent owner signs the feedbackAuth
    const signedAuth = await agentClient.reputation.signFeedbackAuth(
      feedbackAuth
    );
    console.log(`✅ FeedbackAuth signed: ${signedAuth.slice(0, 20)}...`);

    const topicId = "0.0.7135055";
    const feedbackMessage = `{
  "agentRegistry": "eip155:296:${IDENTITY_REGISTRY}",
  "agentId": ${agentId},
  "clientAddress": "eip155:296:${HEDERA_TESTNET_PRIVATE_KEY_2}",
  "createdAt": "${new Date().toISOString()}",
  "feedbackAuth": "${feedbackAuth}",
  "score": 100,
}`;
    const txTopicMessageSubmit = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId) //Fill in the topic ID
      .setMessage(feedbackMessage)
      .execute(client);

    //Request the receipt of the transaction
    const receiptTopicMessageSubmitTx = await txTopicMessageSubmit.getReceipt(
      client
    );

    const feedbackUri = `hcs://${topicId}/${receiptTopicMessageSubmitTx.topicSequenceNumber}`;

    // Feedback giver submits feedback
    const feedbackResult = await feedbackClient.reputation.giveFeedback({
      agentId,
      score: 95,
      tag1: "excellent",
      tag2: "reliable",
      feedbackUri,
      feedbackAuth: signedAuth,
    });
    console.log(`✅ Feedback submitted!`);
    console.log(`   Score: 95 / 100`);
    console.log(`   Tags: excellent, reliable`);
    console.log(`   TX Hash: ${feedbackResult.txHash}`);
    console.log(
      `   🔍 View on Etherscan: https://hashscan.io/testnet/tx/${feedbackResult.txHash}`
    );

    // Read the feedback back
    // Note: Feedback indices are 1-based in the smart contract
    // After submitting feedback, lastIndex is incremented to 1
    const feedback = await feedbackClient.reputation.readFeedback(
      agentId,
      feedbackGiverAddress,
      lastIndex + BigInt(1) // Use the new index after submission
    );
    console.log(`✅ Feedback retrieved:`);
    console.log(`   Score: ${feedback.score} / 100`);
    console.log(`   Tag1: ${feedback.tag1}`);
    console.log(`   Tag2: ${feedback.tag2}`);

    // Get reputation summary
    const summary = await agentClient.reputation.getSummary(agentId);
    console.log(`✅ Reputation summary:`);
    console.log(`   Feedback Count: ${summary.count}`);
    console.log(`   Average Score: ${summary.averageScore} / 100\n`);
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
  }

  // Test 3: Validation workflow
  console.log("Test 3: Validation workflow");
  try {
    // Generate a random IPFS CID for the validation request
    const validationCid = generateRandomCIDv0();
    const requestUri = `ipfs://${validationCid}`;

    // Import ipfsUriToBytes32 dynamically
    const { ipfsUriToBytes32 } = await import("../src");
    const requestHash = ipfsUriToBytes32(requestUri);

    // Request validation from feedback giver (acting as validator)
    const requestResult = await agentClient.validation.validationRequest({
      validatorAddress: feedbackGiverAddress,
      agentId: agentId,
      requestUri,
      requestHash,
    });
    console.log(`✅ Validation requested`);
    console.log(`   Validator: ${feedbackGiverAddress}`);
    console.log(`   Request URI: ${requestUri}`);
    console.log(`   Request Hash: ${requestResult.requestHash}`);
    console.log(`   TX Hash: ${requestResult.txHash}`);
    console.log(
      `   🔍 View on Etherscan: https://hashscan.io/testnet/tx/${requestResult.txHash}`
    );

    // Wait for 1 block confirmation
    console.log(`   Waiting for 1 block confirmation...`);
    const requestTxReceipt = await provider.getTransactionReceipt(
      requestResult.txHash
    );
    if (requestTxReceipt) {
      const requestBlockNumber = requestTxReceipt.blockNumber;
      let currentBlock = await provider.getBlockNumber();
      while (currentBlock < requestBlockNumber + 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
        currentBlock = await provider.getBlockNumber();
      }
      console.log(`   ✅ Block confirmation received (block ${currentBlock})`);
    }

    // Validator (feedback giver) provides response
    const responseUri = `ipfs://${generateRandomCIDv0()}`;
    const responseResult = await feedbackClient.validation.validationResponse({
      requestHash,
      response: 100, // 100 = passed
      responseUri,
      tag: "zkML-proof",
    });
    console.log(`✅ Validation response provided`);
    console.log(`   Response: 100 (passed)`);
    console.log(`   Tag: zkML-proof`);
    console.log(`   Response URI: ${responseUri}`);
    console.log(`   TX Hash: ${responseResult.txHash}`);
    console.log(
      `   🔍 View on Etherscan: https://hashscan.io/testnet/tx/${responseResult.txHash}`
    );

    // Read validation status
    const status = await agentClient.validation.getValidationStatus(
      requestHash
    );
    console.log(`✅ Validation status retrieved:`);
    console.log(`   Validator: ${status.validatorAddress}`);
    console.log(`   Agent ID: ${status.agentId}`);
    console.log(`   Response: ${status.response} / 100`);
    console.log(`   Tag: ${status.tag}`);
    console.log(
      `   Last Update: ${new Date(
        Number(status.lastUpdate) * 1000
      ).toISOString()}`
    );

    // Get validation summary for agent
    const validationSummary = await agentClient.validation.getSummary(agentId, [
      feedbackGiverAddress,
    ]);
    console.log(`✅ Validation summary:`);
    console.log(`   Validation Count: ${validationSummary.count}`);
    console.log(`   Average Response: ${validationSummary.avgResponse} / 100`);

    // Get all validation requests for agent
    const agentValidations = await agentClient.validation.getAgentValidations(
      agentId
    );
    console.log(`✅ Agent validations retrieved:`);
    console.log(`   Total validations: ${agentValidations.length}`);
    for (let i = 0; i < agentValidations.length; i++) {
      console.log(`   [${i}] Request Hash: ${agentValidations[i]}`);
    }

    // Get all requests handled by validator
    const validatorRequests =
      await feedbackClient.validation.getValidatorRequests(
        feedbackGiverAddress
      );
    console.log(`✅ Validator requests retrieved:`);
    console.log(`   Total requests: ${validatorRequests.length}`);
    for (let i = 0; i < validatorRequests.length; i++) {
      console.log(`   [${i}] Request Hash: ${validatorRequests[i]}`);
    }
    console.log();
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
  }

  console.log("✨ All tests completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
