
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DIFFICULTY_LEVELS = [
  { id: "beginner", name: "Beginner", description: "Perfect for learning the basics" },
  { id: "intermediate", name: "Intermediate", description: "For players who know the rules well" },
  { id: "advanced", name: "Advanced", description: "Challenging gameplay for experienced players" }
] as const;

type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]["id"];

const Practice = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("beginner");

  const handleStartGame = () => {
    toast.info(`Starting ${selectedDifficulty} level game...`);
    // TODO: Implement AI game logic
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

        {/* Difficulty Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default Practice;
