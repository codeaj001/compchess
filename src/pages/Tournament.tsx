
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Clock, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Tournament {
  id: string;
  name: string;
  startDate: Date;
  playersCount: number;
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  status: 'upcoming' | 'inProgress' | 'completed';
  creator: string;
}

const Tournament = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const storedTournaments = localStorage.getItem('tournaments');
    return storedTournaments ? JSON.parse(storedTournaments).map((t: any) => ({
      ...t,
      startDate: new Date(t.startDate)
    })) : [];
  });
  const [newTournament, setNewTournament] = useState({
    name: '',
    maxPlayers: 16,
    entryFee: 0.1
  });

  const handleCreateTournament = () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!newTournament.name) {
      toast.error("Please enter a tournament name");
      return;
    }

    const tournament: Tournament = {
      id: Math.random().toString(),
      name: newTournament.name,
      startDate: new Date(Date.now() + 86400000), // Starts in 24 hours
      playersCount: 0,
      maxPlayers: newTournament.maxPlayers,
      entryFee: newTournament.entryFee,
      prizePool: newTournament.entryFee * newTournament.maxPlayers,
      status: 'upcoming',
      creator: publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4)
    };

    const updatedTournaments = [...tournaments, tournament];
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    toast.success("Tournament created successfully!");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-chess-cream p-4 sm:p-8">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Trophy size={32} className="text-chess-gold" />
            <h1 className="text-2xl sm:text-3xl font-bold">Tournaments</h1>
          </div>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={20} />
                  Create Tournament
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tournament</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tournament Name</label>
                    <Input
                      value={newTournament.name}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter tournament name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Players</label>
                    <Input
                      type="number"
                      value={newTournament.maxPlayers}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                      min={4}
                      max={32}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entry Fee (SOL)</label>
                    <Input
                      type="number"
                      value={newTournament.entryFee}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: parseFloat(e.target.value) }))}
                      min={0.1}
                      step={0.1}
                    />
                  </div>
                  <Button onClick={handleCreateTournament} className="w-full">
                    Create Tournament
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <button 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-chess-muted hover:text-chess-dark transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-6 rounded-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{tournament.name}</h3>
                    <span className="text-sm text-chess-muted">by {tournament.creator}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-chess-muted">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{formatDate(tournament.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{tournament.playersCount}/{tournament.maxPlayers} players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>Entry: {tournament.entryFee} SOL</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-chess-muted">Prize Pool</div>
                    <div className="font-semibold text-chess-gold">{tournament.prizePool} SOL</div>
                  </div>
                  <Button onClick={() => {
                    if (!publicKey) {
                      toast.error("Please connect your wallet first");
                      return;
                    }
                    toast.success("Successfully joined tournament!");
                  }}>
                    Join Tournament
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {tournaments.length === 0 && (
            <div className="text-center py-12 text-chess-muted">
              No tournaments available. Create one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tournament;
