import { motion } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreateTournamentDialog } from "@/components/tournament/CreateTournamentDialog";
import { TournamentCard } from "@/components/tournament/TournamentCard";

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

  // Fetch tournaments
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching tournaments:", error);
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
      
      // First get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: tournament.name,
          max_players: tournament.maxPlayers,
          entry_fee: tournament.entryFee,
          creator_id: user.id,
          creator_wallet: publicKey.toBase58(),
          start_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'upcoming'
        })
        .select()
        .single();

      if (error) {
        console.error("Create tournament error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success("Tournament created successfully!");
    },
    onError: (error) => {
      console.error("Create tournament error:", error);
      toast.error("Failed to create tournament");
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
            <CreateTournamentDialog createTournamentMutation={createTournamentMutation} />
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
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                joinTournamentMutation={joinTournamentMutation}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tournament;
