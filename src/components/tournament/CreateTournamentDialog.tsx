
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { UseMutationResult } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateTournamentDialogProps {
  createTournamentMutation: UseMutationResult<any, Error, {
    name: string;
    maxPlayers: number;
    entryFee: number;
  }>;
}

export const CreateTournamentDialog = ({ createTournamentMutation }: CreateTournamentDialogProps) => {
  const { publicKey } = useWallet();
  const [open, setOpen] = useState(false);
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

    createTournamentMutation.mutate(newTournament);
    setOpen(false); // Close dialog on successful creation
    // Reset form
    setNewTournament({
      name: '',
      maxPlayers: 16,
      entryFee: 0.1
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
  );
};
