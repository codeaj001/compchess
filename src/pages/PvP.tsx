
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PvP = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);

  const handleFindMatch = () => {
    setIsSearching(true);
    toast.info("Searching for opponent...");

    // Simulate matchmaking delay
    setTimeout(() => {
      setIsSearching(false);
      toast.error("No opponents found. Please try again later.");
    }, 3000);
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
            <Users size={32} className="text-chess-gold" />
            <h1 className="text-3xl font-bold">Player vs Player</h1>
          </div>
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-chess-muted hover:text-chess-dark transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Matchmaking Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl font-semibold mb-6">Quick Match</h2>
          <motion.button
            whileHover={{ scale: isSearching ? 1 : 1.05 }}
            whileTap={{ scale: isSearching ? 1 : 0.95 }}
            className={`glass-panel px-8 py-4 rounded-xl text-xl font-semibold flex items-center justify-center gap-3 min-w-[200px] ${
              isSearching ? "opacity-75 cursor-not-allowed" : ""
            }`}
            onClick={handleFindMatch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Searching...
              </>
            ) : (
              "Find Match"
            )}
          </motion.button>
          <p className="mt-4 text-chess-muted">
            {isSearching 
              ? "Searching for an opponent at your skill level..."
              : "Looking for a quick game? Click to find an opponent at your skill level."
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PvP;
