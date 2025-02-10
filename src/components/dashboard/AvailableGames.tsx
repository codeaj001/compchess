
import { motion } from "framer-motion";
import { Users, Clock, Coins, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Game {
  id: string;
  creator: string;
  amount: number;
  createdAt: Date;
  status: 'open' | 'inProgress' | 'completed';
}

interface AvailableGamesProps {
  games?: Game[];
}

export const AvailableGames = ({ games: propGames }: AvailableGamesProps) => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [games, setGames] = useState<Game[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterByAmount, setFilterByAmount] = useState<string>("all");

  useEffect(() => {
    // Load initial games from localStorage
    const loadGames = () => {
      const storedGames = JSON.parse(localStorage.getItem('games') || '[]');
      setGames(storedGames.map((game: any) => ({
        ...game,
        createdAt: new Date(game.createdAt)
      })));
    };

    loadGames();

    // Listen for updates to games
    window.addEventListener('gamesUpdated', loadGames);
    return () => window.removeEventListener('gamesUpdated', loadGames);
  }, []);

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

  const filteredAndSortedGames = [...games]
    .filter(game => {
      if (filterByAmount === "all") return true;
      if (filterByAmount === "low") return game.amount <= 0.1;
      if (filterByAmount === "medium") return game.amount > 0.1 && game.amount <= 0.5;
      return game.amount > 0.5;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "highest") return b.amount - a.amount;
      return a.amount - b.amount;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Available Games</h2>
        <div className="flex gap-4">
          <Select value={filterByAmount} onValueChange={setFilterByAmount}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All amounts</SelectItem>
              <SelectItem value="low">Low (≤ 0.1 SOL)</SelectItem>
              <SelectItem value="medium">Medium (0.1-0.5 SOL)</SelectItem>
              <SelectItem value="high">High (&gt; 0.5 SOL)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="highest">Highest amount</SelectItem>
              <SelectItem value="lowest">Lowest amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4">
        {filteredAndSortedGames.map((game) => (
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
        {filteredAndSortedGames.length === 0 && (
          <div className="text-center py-8 text-chess-muted">
            No games available matching your filters
          </div>
        )}
      </div>
    </div>
  );
};
