
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8 sm:mb-12"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Crown size={isMobile ? 24 : 32} className="text-chess-gold" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">CompChess Dashboard</h1>
      </div>
      <button 
        onClick={() => navigate("/")}
        className="text-sm sm:text-base text-chess-muted hover:text-chess-dark transition-colors"
      >
        Back to Home
      </button>
    </motion.div>
  );
};
