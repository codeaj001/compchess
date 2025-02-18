import { motion } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreateTournamentDialog } from "@/components/tournament/CreateTournamentDialog";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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

      const walletStr = publicKey.toBase58();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: tournament.name,
          max_players: tournament.maxPlayers,
          entry_fee: tournament.entryFee,
          creator_wallet: walletStr,
          creator_id: user.id,
          start_date: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
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
      toast.error("Failed to create tournament. Please make sure your wallet is connected and you are logged in.");
    }
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!publicKey) throw new Error("Wallet not connected");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('tournament_players')
        .insert({
          tournament_id: tournamentId,
          wallet_address: publicKey.toBase58(),
          player_id: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success("Successfully joined tournament!");
    },
    onError: (error) => {
      toast.error("Failed to join tournament. Please make sure your wallet is connected and you are logged in.");
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
    <div className="min-h-screen bg-chess-cream">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <Trophy size={isMobile ? 24 : 32} className="text-chess-gold" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Tournaments</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <CreateTournamentDialog createTournamentMutation={createTournamentMutation} />
            <button 
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 text-chess-muted hover:text-chess-dark transition-colors px-4 py-2 rounded-lg border border-chess-muted/20 hover:border-chess-muted/40"
            >
              <ArrowLeft size={isMobile ? 18 : 20} />
              {isMobile ? "Back" : "Back to Dashboard"}
            </button>
          </div>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-chess-muted"
            >
              Loading tournaments...
            </motion.div>
          ) : tournaments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-chess-muted"
            >
              <p className="mb-2">No tournaments available.</p>
              <p className="text-sm">Create one to get started!</p>
            </motion.div>
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
