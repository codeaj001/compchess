
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, ArrowLeft, RotateCcw } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const DIFFICULTY_LEVELS = [
  { id: "beginner", name: "Beginner", description: "Perfect for learning the basics" },
  { id: "intermediate", name: "Intermediate", description: "For players who know the rules well" },
  { id: "advanced", name: "Advanced", description: "Challenging gameplay for experienced players" }
] as const;

type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]["id"];

const Practice = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("beginner");
  const [game, setGame] = useState(new Chess());
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Reset the game
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setIsGameStarted(false);
  }, []);

  // Function to make a random move for the AI
  const makeAIMove = useCallback(async () => {
    const moves = game.moves();
    if (moves.length === 0 || game.isGameOver()) return;

    setIsThinking(true);
    
    // Simulate AI "thinking" time based on difficulty
    const thinkingTime = {
      beginner: 500,
      intermediate: 800,
      advanced: 1200
    }[selectedDifficulty];

    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    // Make a move based on difficulty
    let move;
    if (selectedDifficulty === "beginner") {
      // Random moves for beginner
      move = moves[Math.floor(Math.random() * moves.length)];
    } else {
      // More "intelligent" moves for intermediate and advanced
      // This is a simple implementation - could be enhanced with actual chess AI logic
      const captureMoves = moves.filter(m => m.includes("x"));
      const checkMoves = moves.filter(m => m.includes("+"));
      
      if (selectedDifficulty === "advanced" && checkMoves.length > 0) {
        move = checkMoves[Math.floor(Math.random() * checkMoves.length)];
      } else if (captureMoves.length > 0 && Math.random() > 0.3) {
        move = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      } else {
        move = moves[Math.floor(Math.random() * moves.length)];
      }
    }

    game.move(move);
    setGame(new Chess(game.fen()));
    setIsThinking(false);

    // Check game status
    if (game.isCheckmate()) {
      toast.error("Checkmate! AI wins!");
    } else if (game.isDraw()) {
      toast.info("Game drawn!");
    } else if (game.isCheck()) {
      toast.warning("Check!");
    }
  }, [game, selectedDifficulty]);

  // Handle player moves
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (!isGameStarted) return false;
    
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q" // Always promote to queen for simplicity
      });

      if (move === null) return false;
      
      setGame(new Chess(game.fen()));

      // Check game status after player move
      if (game.isCheckmate()) {
        toast.success("Checkmate! You win!");
        return true;
      } else if (game.isDraw()) {
        toast.info("Game drawn!");
        return true;
      } else if (game.isCheck()) {
        toast.warning("Check!");
      }

      // Make AI move
      setTimeout(makeAIMove, 300);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleStartGame = () => {
    setIsGameStarted(true);
    toast.success(`Starting ${selectedDifficulty} level game - You play as white!`);
  };

  return (
    <div className="min-h-screen bg-chess-cream p-8">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-3">
            <Bot size={32} className="text-chess-gold" />
            <h1 className="text-3xl font-bold">Practice with AI</h1>
          </div>
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-chess-muted hover:text-chess-dark transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Game Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full aspect-square max-w-2xl mx-auto"
          >
            <div className="relative">
              <Chessboard 
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation="white"
                customBoardStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                }}
              />
              {isThinking && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-lg">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <p className="text-lg font-semibold">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {!isGameStarted ? (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-center">Select Difficulty</h2>
                <div className="grid gap-4">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <motion.div
                      key={level.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`glass-panel p-6 rounded-xl cursor-pointer ${
                        selectedDifficulty === level.id 
                          ? "border-2 border-chess-gold" 
                          : "border-2 border-transparent"
                      }`}
                      onClick={() => setSelectedDifficulty(level.id)}
                    >
                      <h3 className="text-xl font-semibold mb-2">{level.name}</h3>
                      <p className="text-chess-muted">{level.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-panel px-8 py-4 rounded-xl text-xl font-semibold mt-8 mx-auto block"
                  onClick={handleStartGame}
                >
                  Start Game
                </motion.button>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="glass-panel p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Game Controls</h3>
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 text-chess-muted hover:text-chess-dark transition-colors"
                  >
                    <RotateCcw size={20} />
                    Reset Game
                  </button>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Current Game</h3>
                  <p className="text-chess-muted">
                    Difficulty: <span className="font-semibold capitalize">{selectedDifficulty}</span>
                  </p>
                  {game.isCheck() && (
                    <p className="text-red-500 font-semibold mt-2">Check!</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
