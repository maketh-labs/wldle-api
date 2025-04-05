import dotenv from 'dotenv';
import { createPublicClient, createWalletClient, encodePacked, http, isAddressEqual, keccak256, zeroAddress, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CHAIN, CONTRACT_ADDRESSES, ENV, RESOLVER_PRIVATE_KEY } from '../constants';

dotenv.config();

// ABI for Duel contract
const DUEL_ABI = [
  {
    "type": "function",
    "name": "games",
    "inputs": [
      {
        "name": "gameId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "player1",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "player2",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "resolver",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "fee",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "settled",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  }
];

// Create a viem public client for reading from the blockchain
export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
});

// Create a wallet client for signing with the resolver's private key
export const account = privateKeyToAccount(RESOLVER_PRIVATE_KEY as `0x${string}`);

export const walletClient: WalletClient = createWalletClient({
  account,
  chain: CHAIN,
  transport: http(),
});

// Get game information from the blockchain
export const getGameFromChain = async (gameId: string) => {
  try {
    const gameData = await publicClient.readContract({
      address: CONTRACT_ADDRESSES[ENV].duel as `0x${string}`,
      abi: DUEL_ABI,
      functionName: 'games',
      args: [gameId as `0x${string}`],
    }) as [string, string, string, bigint, bigint, string, boolean];

    // if game does not exist, throw an error
    if (isAddressEqual(gameData[0] as `0x${string}`, zeroAddress)) {
      throw new Error('Game does not exist');
    }

    // Format the response to match our Game model
    return {
      player1: gameData[0].toLowerCase(),
      player2: gameData[1].toLowerCase(),
      resolver: gameData[2].toLowerCase(),
      amount: gameData[3].toString(),
      fee: gameData[4].toString(),
      token: gameData[5].toLowerCase(),
      settled: gameData[6],
    };
  } catch (error) {
    console.error('Error fetching game from blockchain:', error);
    throw error;
  }
};

// Sign game result
export const signGameResult = async (gameId: string, winner: string) => {
  try {
    // Ensure proper format of inputs (with 0x prefix)
    const gameIdHex = gameId.startsWith('0x') ? gameId : `0x${gameId}`;
    const winnerHex = winner.startsWith('0x') ? winner : `0x${winner}`;

    // Use viem's encodePacked to mimic abi.encodePacked in Solidity
    const packedData = encodePacked(
      ['bytes32', 'address'],
      [gameIdHex as `0x${string}`, winnerHex as `0x${string}`]
    );

    // Create message hash equivalent to keccak256(abi.encodePacked(gameId, winner))
    const messageHash = keccak256(packedData);

    // Sign the message - viem automatically prepends the Ethereum Signed Message prefix
    const signature = await walletClient.signMessage({
      account,
      message: { raw: messageHash },
    });

    return signature;
  } catch (error) {
    console.error('Error signing game result:', error);
    throw error;
  }
};