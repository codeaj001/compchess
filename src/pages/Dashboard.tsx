
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GameModes } from "@/components/dashboard/GameModes";
import { AvailableGames } from "@/components/dashboard/AvailableGames";

interface Game {
  id: string;
  creator: string;
  amount: number;
  createdAt: Date;
  status: 'open' | 'inProgress' | 'completed';
}

const Dashboard = () => {
  const [games, setGames] = useState<Game[]>([
    {
      id: '1',
      creator: 'ABC...XYZ',
      amount: 0.05,
      createdAt: new Date(),
      status: 'open'
    },
  ]);

  return (
    <div className="min-h-screen bg-chess-cream p-4 sm:p-8">
      <div className="container mx-auto">
        <DashboardHeader />
        <GameModes />
        <AvailableGames games={games} />
      </div>
    </div>
  );
};

export default Dashboard;
