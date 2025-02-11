
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Tournament {
  id: string;
  name: string;
  startDate: Date;
  playersCount: number;
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  status: 'upcoming' | 'inProgress' | 'completed';
}

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    name: 'Weekend Warriors Cup',
    startDate: new Date(Date.now() + 86400000), // Tomorrow
    playersCount: 12,
    maxPlayers: 32,
    entryFee: 0.1,
    prizePool: 2.5,
    status: 'upcoming'
  },
  {
    id: '2',
    name: 'Grand Master Challenge',
    startDate: new Date(Date.now() + 172800000), // Day after tomorrow
    playersCount: 8,
    maxPlayers: 16,
    entryFee: 0.2,
    prizePool: 2.8,
    status: 'upcoming'
  }
];

const Tournament = () => {
  const navigate = useNavigate();

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
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-chess-muted hover:text-chess-dark transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </motion.div>

        <div className="grid gap-6">
          {MOCK_TOURNAMENTS.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-6 rounded-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{tournament.name}</h3>
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
                  <Button onClick={() => navigate(`/tournament/${tournament.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tournament;
