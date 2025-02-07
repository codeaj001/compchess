
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, Users, Bot, Trophy } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

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
            <Crown size={32} className="text-chess-gold" />
            <h1 className="text-3xl font-bold">CompChess Dashboard</h1>
          </div>
          <button 
            onClick={() => navigate("/")}
            className="text-chess-muted hover:text-chess-dark transition-colors"
          >
            Back to Home
          </button>
        </motion.div>

        {/* Game Modes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameModeCard
            title="Play vs Player"
            description="Challenge other players in real-time matches"
            icon={Users}
            onClick={() => {}}
          />
          <GameModeCard
            title="Practice with AI"
            description="Improve your skills against our AI opponent"
            icon={Bot}
            onClick={() => {}}
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
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}

const GameModeCard = ({ title, description, icon: Icon, onClick }: GameModeCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="glass-panel p-6 rounded-xl cursor-pointer"
    onClick={onClick}
  >
    <Icon size={32} className="text-chess-gold mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-chess-muted">{description}</p>
  </motion.div>
);

export default Dashboard;
