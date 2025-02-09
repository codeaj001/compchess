
import { useNavigate } from "react-router-dom";
import { Users, Bot, Trophy, Plus } from "lucide-react";
import { GameModeCard } from "./GameModeCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { useState } from "react";

interface Game {
  id: string;
  creator: string;
  amount: number;
  createdAt: Date;
  status: 'open' | 'inProgress' | 'completed';
}

export const GameModes = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [solAmount, setSolAmount] = useState<string>('0.04');
  const [games, setGames] = useState<Game[]>([]);

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

    const newGame = {
      id: Math.random().toString(),
      creator: publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4),
      amount,
      createdAt: new Date(),
      status: 'open' as const
    };

    // Update the games list in local storage
    const existingGames = JSON.parse(localStorage.getItem('games') || '[]');
    const updatedGames = [...existingGames, newGame];
    localStorage.setItem('games', JSON.stringify(updatedGames));

    toast.success("Game created successfully!");
    window.dispatchEvent(new Event('gamesUpdated'));
  };

  return (
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
            <DialogDescription>
              Set the stake amount for your new game. Minimum stake is 0.04 SOL.
            </DialogDescription>
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
  );
};
