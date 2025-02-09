
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, Users, Bot, Trophy, Plus, Clock, Coins } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Game {
  id: string;
  creator: string;
  amount: number;
  createdAt: Date;
  status: 'open' | 'inProgress' | 'completed';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { publicKey } = useWallet();
  const [solAmount, setSolAmount] = useState<string>('0.04');
  const [games, setGames] = useState<Game[]>([
    {
      id: '1',
      creator: 'ABC...XYZ',
      amount: 0.05,
      createdAt: new Date(),
      status: 'open'
    },
    // Add more mock games as needed
  ]);

  const handleCreateGame = () => {
    const amount = parseFloat(solAmount);
    if (amount < 0.04) {
      toast.error("Minimum stake amount is 0.04 SOL");
      return;
    }

    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Here we would add the actual Solana transaction logic
    const newGame: Game = {
      id: Math.random().toString(),
      creator: publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4),
      amount,
      createdAt: new Date(),
      status: 'open'
    };

    setGames([newGame, ...games]);
    toast.success("Game created successfully!");
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleJoinGame = (game: Game) => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    navigate(`/pvp?gameId=${game.id}`);
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
            title="Tournament"
            description="Compete in tournaments to win prizes"
            icon={Trophy}
            onClick={() => navigate("/tournament")}
          />
          <Dialog>
            <DialogTrigger asChild>
              <div>
                <GameModeCard
                  title="Create Game"
                  description="Start a new game with custom SOL stake"
                  icon={Plus}
                  onClick={() => {}}
                />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Game</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stake Amount (SOL)</label>
                  <Input
                    type="number"
                    min="0.04"
                    step="0.01"
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                    placeholder="Enter SOL amount"
                  />
                  <p className="text-xs text-chess-muted">Minimum stake: 0.04 SOL</p>
                </div>
                <Button onClick={handleCreateGame} className="w-full">
                  Create Game
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Available Games Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Games</h2>
          <div className="grid gap-4">
            {games.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-4 rounded-lg flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-chess-gold" />
                    <span className="font-medium">{game.creator}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-chess-muted">
                    <div className="flex items-center gap-1">
                      <Coins size={14} />
                      <span>{game.amount} SOL</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatTimeAgo(game.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleJoinGame(game)}>
                  Join Game
                </Button>
              </motion.div>
            ))}
          </div>
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
