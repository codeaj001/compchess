
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, Users, Bot, Trophy } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-chess-cream p-4 sm:p-8">
      <div className="container mx-auto">
        {/* Header */}
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

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <GameModeCard
            title="Play vs Player"
            description="Challenge other players in real-time matches"
            icon={Users}
            onClick={() => navigate("/pvp")}
          />
          <GameModeCard
            title="Practice with AI"
            description="Improve your skills against our AI opponent"
            icon={Bot}
            onClick={() => navigate("/practice")}
          />
          <GameModeCard
            title="Join Tournament"
            description="Compete in tournaments for rewards"
            icon={Trophy}
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

interface GameModeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

const GameModeCard = ({ title, description, icon: Icon, onClick }: GameModeCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="glass-panel p-4 sm:p-6 rounded-xl cursor-pointer"
    onClick={onClick}
  >
    <Icon size={24} className="text-chess-gold mb-3 sm:mb-4" />
    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-chess-muted">{description}</p>
  </motion.div>
);

export default Dashboard;
