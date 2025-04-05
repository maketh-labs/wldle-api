# wldle-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# API Specs

## Authentication
 
 ### Wallet Login
 **Endpoint**: `POST /auth/login`
 
 **Request Example**:
 ```json
 {
   "address": "0x1234...",
   "signature": "0xabcd..."
 }
 ```
 
 **Description**: 
 - `address`: User's Ethereum wallet address
 - `signature`: Signature of the "Sign in to wldle" message signed with the wallet
 
 **Response Example**:
 ```json
 {
   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 }
 ```
 
 ### Token Refresh
 **Endpoint**: `POST /auth/refresh`
 
 **Request Example**:
 ```json
 {
   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 }
 ```
 
 **Response Example**:
 ```json
 {
   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 }
 ```
 
 ### Logout
 **Endpoint**: `POST /auth/logout`
 
 **Headers**:
 ```
 Authorization: Bearer {accessToken}
 ```
 
 **Response Example**:
 ```json
 {
   "message": "Logged out successfully"
 }
 ```
 
 ## Game API
 
 ### Get Game Information
 **Endpoint**: `GET /games/{gameId}`
 
 **Request Parameters**:
 - `gameId`: Game ID created on-chain (bytes32)
 
 **Response Example**:
 ```json
 {
   "gameId": "0x1234...",
   "player1": "0xabcd...",
   "player2": "0xefgh...",
   "resolver": "0xijkl...",
   "amount": "1000000000000000000",
   "fee": "100000000000000000",
   "token": "0xmnop...",
   "settled": false,
   "player1Completed": false,
   "player2Completed": false,
   "winner": null,
   "signature": null
 }
 ```
 
 ### Get Player Progress
 **Endpoint**: `GET /games/{gameId}/progress`
 
 **Headers**:
 ```
 Authorization: Bearer {accessToken}
 ```
 
 **Request Parameters**:
 - `gameId`: Game ID
 
 **Response Example**:
 ```json
 {
   "gameId": "0x1234...",
   "completed": false,
   "guesses": [
     {
       "guess": "hello",
       "pattern": ["green", "gray", "blue", "gray", "green"],
       "solved": false,
       "tryNumber": 1
     }
   ],
   "remainingTries": 5,
   "winner": null
 }
 ```
 
 ### Make a Guess
 **Endpoint**: `POST /games/{gameId}/guess`
 
 **Headers**:
 ```
 Authorization: Bearer {accessToken}
 ```
 
 **Request Parameters**:
 - `gameId`: Game ID
 
 **Request Body**:
 ```json
 {
   "guess": "world"
 }
 ```
 
 **Response Example**:
 ```json
 {
   "gameId": "0x1234...",
   "guess": "world",
   "pattern": ["green", "gray", "green", "blue", "gray"],
   "solved": false,
   "tryNumber": 2
 }
 ```
 
 ## Integration Flow
 
 ### Game Participation Flow
 1. **On-chain Game Participation**:
    - Users participate in the game by calling the `join` or `joinWithPermit` function of the Duel contract.
    - The function call returns a `gameId`.
 
 2. **Wallet Authentication**:
    - Sign the "Sign in to wldle" message with the user's wallet and call the `/auth/login` API.
    - Receive accessToken and refreshToken after authentication.
 
 3. **Game Play**:
    - Check game information with the game ID. (`/games/{gameId}`)
    - Play the game by making guesses. (`/games/{gameId}/guess`)
    - Check game progress. (`/games/{gameId}/progress`)
 
 4. **Game Result Check**:
    - The winner is determined when both players complete the game.
    - Check the winner and signature through game information lookup.
 
 ### Authentication Token Management
 - accessToken is valid for 1 hour.
 - refreshToken is valid for 14 days.
 - When accessToken expires, use refreshToken to issue new tokens.
 
 ## Error Handling
 
 The API returns the following HTTP status codes:
 
 - `200 OK`: Request successful
 - `400 Bad Request`: Invalid request parameters
 - `401 Unauthorized`: Authentication failed or token expired
 - `500 Internal Server Error`: Server error
 
 Error response format:
 ```json
 {
   "error": "Error message"
 }
 ```
 
 ## Data Models
 
 ### Game Model
 ```typescript
 {
   gameId: string;         // Game unique ID (bytes32)
   player1: string;        // Player1's wallet address
   player2: string;        // Player2's wallet address
   resolver: string;       // Game result signer's wallet address
   token: string;          // Token contract address used
   amount: string;         // Betting amount (wei as string)
   fee: string;            // Fee (wei as string)
   settled: boolean;       // Game settlement status
   answer: string;         // Game answer (server only)
   player1Completed: boolean; // Player1 game completion status
   player2Completed: boolean; // Player2 game completion status
   winner: string;         // Winner's wallet address (0x0...0 for draw)
   signature: string;      // Signature for game result
 }
 ```
 
 ### GameGuess Model
 ```typescript
 {
   gameId: string;         // Game ID
   player: string;         // Player's wallet address
   guess: string;          // Guessed word
   pattern: {              // Result pattern
     pattern: ("gray" | "blue" | "green")[]; // Result for each letter
     solved: boolean;      // Correct answer status
   };
   tryNumber: number;      // Try number (1-6)
 }
 ```
 
 ## Appendix: Winner Determination Rules
 
 1. If one player gets the correct answer and the other doesn't, the player who got it right wins.
 2. If both get the correct answer, the player who used fewer attempts wins.
 3. If both got it right in the same number of attempts, the player with more green tiles wins.
 4. If the number of green tiles is equal, the player with more blue tiles wins.
 5. If both green and blue tiles are equal, it's a draw.
 6. If neither player gets the correct answer, it's a draw.
