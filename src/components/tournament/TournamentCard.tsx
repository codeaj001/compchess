
import { motion } from "framer-motion";
import { Users, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { UseMutationResult } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

interface TournamentCardProps {
  tournament: {
    id: string;
    name: string;
    start_date: string;
    players_count: number;
    max_players: number;
    entry_fee: number;
    creator_wallet: string;
  };
  joinTournamentMutation: UseMutationResult<void, Error, string>;
  formatDate: (date: string) => string;
}

export const TournamentCard = ({ 
  tournament, 
  joinTournamentMutation, 
  formatDate 
}: TournamentCardProps) => {
  const { publicKey } = useWallet();
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel p-4 sm:p-6 rounded-xl"
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          <div className="flex items-start sm:items-center flex-col sm:flex-row sm:gap-2">
            <h3 className="text-lg sm:text-xl font-semibold">{tournament.name}</h3>
            <span className="text-sm text-chess-muted">
              by {tournament.creator_wallet.slice(0, 4)}...{tournament.creator_wallet.slice(-4)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 text-sm text-chess-muted">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{formatDate(tournament.start_date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>{tournament.players_count}/{tournament.max_players}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{tournament.entry_fee} SOL</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 sm:pt-0">
          <div className="text-center sm:text-right">
            <div className="text-sm text-chess-muted">Prize Pool</div>
            <div className="font-semibold text-chess-gold text-lg">
              {(tournament.entry_fee * tournament.max_players).toFixed(1)} SOL
            </div>
          </div>
          <Button 
            className="w-full sm:w-auto"
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
  );
};
