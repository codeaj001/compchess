
import { motion } from "framer-motion";
import { Users, Clock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

interface Game {
  id: string;
  creator: string;
  amount: number;
  createdAt: Date;
  status: 'open' | 'inProgress' | 'completed';
}

interface AvailableGamesProps {
  games: Game[];
}

export const AvailableGames = ({ games }: AvailableGamesProps) => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();

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
  );
};
