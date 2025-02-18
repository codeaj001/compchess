// pages/select-difficulty.tsx

import { useState } from "react";
import { useRouter } from "next/router";

const SelectDifficulty = () => {
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const router = useRouter();

  const handleDifficultySelection = (level: string) => {
    setDifficulty(level);
    router.push(`/chess-game?difficulty=${level}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-chess-cream">
      <h1 className="text-3xl mb-4">Select Difficulty Level</h1>
      <div className="flex gap-4">
        <button
          onClick={() => handleDifficultySelection("easy")}
          className="btn-primary"
        >
          Easy
        </button>
        <button
          onClick={() => handleDifficultySelection("medium")}
          className="btn-primary"
        >
          Medium
        </button>
        <button
          onClick={() => handleDifficultySelection("hard")}
          className="btn-primary"
        >
          Hard
        </button>
      </div>
    </div>
  );
};

export default SelectDifficulty;
