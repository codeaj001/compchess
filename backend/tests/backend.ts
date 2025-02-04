import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Backend } from "../target/types/backend";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("settle_game", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Backend as Program<Backend>;
  
  let mint: anchor.web3.PublicKey;
  let playerOneTokenAccount: anchor.web3.PublicKey;
  let playerTwoTokenAccount: anchor.web3.PublicKey;
  let escrowAccount: anchor.web3.PublicKey;
  let escrowBump: number;
  let game: anchor.web3.Keypair;
  
  const playerOne = anchor.web3.Keypair.generate();
  const playerTwo = anchor.web3.Keypair.generate();
  const stakeAmount = new anchor.BN(1000000); // 1 token with 6 decimals

  before(async () => {
    // Airdrop SOL to players
    await provider.connection.requestAirdrop(playerOne.publicKey, 2e9);
    await provider.connection.requestAirdrop(playerTwo.publicKey, 2e9);

    // Create token mint
    mint = await createMint(
      provider.connection,
      playerOne,
      playerOne.publicKey,
      null,
      6
    );

    // Create token accounts
    playerOneTokenAccount = await createAccount(
      provider.connection,
      playerOne,
      mint,
      playerOne.publicKey
    );

    playerTwoTokenAccount = await createAccount(
      provider.connection,
      playerTwo,
      mint,
      playerTwo.publicKey
    );

    // Mint tokens to players
    await mintTo(
      provider.connection,
      playerOne,
      mint,
      playerOneTokenAccount,
      playerOne.publicKey,
      2000000 // 2 tokens
    );

    await mintTo(
      provider.connection,
      playerOne,
      mint,
      playerTwoTokenAccount,
      playerOne.publicKey,
      2000000 // 2 tokens
    );

    // Find PDA for escrow
    [escrowAccount, escrowBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("escrow"), playerOne.publicKey.toBuffer()],
      program.programId
    );

    // Create game account
    game = anchor.web3.Keypair.generate();
  });

  it("should successfully settle a game and distribute rewards", async () => {
    // Create game
    await program.methods
      .createGame(stakeAmount)
      .accounts({
        game: game.publicKey,
        playerOne: playerOne.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([game, playerOne])
      .rpc();

    // Join game
    await program.methods
      .joinGame()
      .accounts({
        game: game.publicKey,
        playerTwo: playerTwo.publicKey,
      })
      .signers([playerTwo])
      .rpc();

    // Get initial balances
    const initialWinnerBalance = (await getAccount(provider.connection, playerOneTokenAccount)).amount;
    
    // Settle game with playerOne as winner
    await program.methods
      .settleGame(playerOne.publicKey)
      .accounts({
        game: game.publicKey,
        escrowAccount: escrowAccount,
        winnerTokenAccount: playerOneTokenAccount,
        winner: playerOne.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([playerOne])
      .rpc();
    
      .depositStake()
      .accounts({
        game: game.publicKey,
        playerTokenAccount: playerOneTokenAccount,
        escrowAccount: escrowAccount,
        player: playerOne.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([playerOne])
      .rpc();
    
      .depositStake()
      .accounts({
        game: game.publicKey,
        playerTokenAccount: playerTwoTokenAccount,
        escrowAccount: escrowAccount,
        player: playerTwo.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([playerTwo])
      .rpc();
    // Get final balances
    const finalWinnerBalance = (await getAccount(provider.connection, playerOneTokenAccount)).amount;

    // Verify game state
    const gameState = await program.account.game.fetch(game.publicKey);
    assert.ok(gameState.status === { completed: {} });
    assert.ok(gameState.winner.equals(playerOne.publicKey));

    // Calculate expected rewards
    const totalStake = stakeAmount.muln(2);
    const platformFee = totalStake.divn(20); // 5%
    const expectedWinnerReward = totalStake.sub(platformFee);

    // Verify winner received correct amount
    assert.ok(
      finalWinnerBalance.sub(initialWinnerBalance).eq(expectedWinnerReward),
      "Winner did not receive correct reward amount"
    );

    // Verify escrow account is empty
    try {
      await getAccount(provider.connection, escrowAccount);
      assert.fail("Escrow account should be empty");
    } catch (e) {
      assert.ok(e.toString().includes("TokenAccountNotFoundError"));
    }
  });

  it("should fail when trying to settle an unstarted game", async () => {
    const newGame = anchor.web3.Keypair.generate();
    
    // Create new game but don't join it
    await program.methods
      .createGame(stakeAmount)
      .accounts({
        game: newGame.publicKey,
        playerOne: playerOne.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([newGame, playerOne])
      .rpc();

    try {
      await program.methods
        .settleGame(playerOne.publicKey)
        .accounts({
          game: newGame.publicKey,
          escrowAccount: escrowAccount,
          winnerTokenAccount: playerOneTokenAccount,
          winner: playerOne.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([playerOne])
        .rpc();
      assert.fail("Should have failed");
    } catch (e) {
      assert.ok(e.toString().includes("GameNotStarted"));
    }
  });

  it("should fail when trying to settle with invalid winner", async () => {
    const invalidWinner = anchor.web3.Keypair.generate();
    
    try {
      await program.methods
        .settleGame(invalidWinner.publicKey)
        .accounts({
          game: game.publicKey,
          escrowAccount: escrowAccount,
          winnerTokenAccount: playerOneTokenAccount,
          winner: invalidWinner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([invalidWinner])
        .rpc();
      assert.fail("Should have failed");
    } catch (e) {
      assert.ok(e.toString().includes("InvalidWinner"));
    }
  });
});

function depositStake() {
    throw new Error("Function not implemented.");
}
