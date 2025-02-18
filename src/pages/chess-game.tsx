// pages/chess-game.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChessboardPreview } from "@/components/home/ChessboardPreview"; // Import your chessboard preview component
import Chess from "chess.js"; // Use chess.js for handling game logic

const ChessGame = () => {
  const [game, setGame] = useState<Chess | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { difficulty } = router.query;
    if (difficulty) {
      setDifficulty(difficulty as string);
      initializeGame(difficulty);
    }
  }, [router.query]);

  const initializeGame = (difficulty: string) => {
    const chess = new Chess();
    // Adjust AI behavior based on difficulty
    // For simplicity, we can create a function that adjusts AI difficulty
    console.log(`Starting game with difficulty: ${difficulty}`);
    // Here, you could add your logic for AI to make moves depending on difficulty.
    setGame(chess);
  };

  // Example AI move handling (this can be expanded based on difficulty)
  const makeAIMove = () => {
    if (game) {
      const moves = game.legal_moves();
      const aiMove = moves[Math.floor(Math.random() * moves.length)]; // Random move for now (replace with AI logic)
      game.ugly_move(aiMove);
      setGame(game);
    }
  };

  const handlePlayerMove = (move: string) => {
    if (game) {
      game.ugly_move(move);
      setGame(game);
      makeAIMove(); // After player move, AI makes its move
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Play Chess - Difficulty: {difficulty}</h1>
      <div className="flex justify-center">
        <ChessboardPreview game={game} onMove={handlePlayerMove} /> {/* Pass the game and move handler */}
      </div>
    </div>
  );
};

export default ChessGame;
