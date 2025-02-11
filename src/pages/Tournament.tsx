
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Tournament {
  id: string;
  name: string;
  start_date: string;
  players_count: number;
  max_players: number;
  entry_fee: number;
  creator_wallet: string;
  status: 'upcoming' | 'inProgress' | 'completed';
}

const Tournament = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const [newTournament, setNewTournament] = useState({
    name: '',
    maxPlayers: 16,
    entryFee: 0.1
  });

  // Fetch tournaments
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error("Error loading tournaments");
        throw error;
      }
      return data as Tournament[];
    }
  });

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (tournament: {
      name: string;
      maxPlayers: number;
      entryFee: number;
    }) => {
      if (!publicKey) throw new Error("Wallet not connected");
      
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: tournament.name,
          max_players: tournament.maxPlayers,
          entry_fee: tournament.entryFee,
          creator_id: (await supabase.auth.getUser()).data.user?.id,
          creator_wallet: publicKey.toBase58(),
          start_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'upcoming'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success("Tournament created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create tournament");
      console.error("Create tournament error:", error);
    }
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!publicKey) throw new Error("Wallet not connected");
      
      const { error } = await supabase
        .from('tournament_players')
        .insert({
          tournament_id: tournamentId,
          player_id: (await supabase.auth.getUser()).data.user?.id,
          wallet_address: publicKey.toBase58()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success("Successfully joined tournament!");
    },
    onError: (error) => {
      toast.error("Failed to join tournament");
      console.error("Join tournament error:", error);
    }
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

    createTournamentMutation.mutate(newTournament);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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
          {isLoading ? (
            <div className="text-center py-12 text-chess-muted">
              Loading tournaments...
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12 text-chess-muted">
              No tournaments available. Create one to get started!
            </div>
          ) : (
            tournaments.map((tournament) => (
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
                      <span className="text-sm text-chess-muted">
                        by {tournament.creator_wallet.slice(0, 4)}...{tournament.creator_wallet.slice(-4)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-chess-muted">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{formatDate(tournament.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{tournament.players_count}/{tournament.max_players} players</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>Entry: {tournament.entry_fee} SOL</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-chess-muted">Prize Pool</div>
                      <div className="font-semibold text-chess-gold">
                        {(tournament.entry_fee * tournament.max_players).toFixed(1)} SOL
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        if (!publicKey) {
                          toast.error("Please connect your wallet first");
                          return;
                        }
                        joinTournamentMutation.mutate(tournament.id);
                      }}
                      disabled={tournament.players_count >= tournament.max_players}
                    >
                      {tournament.players_count >= tournament.max_players ? 'Full' : 'Join Tournament'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tournament;
