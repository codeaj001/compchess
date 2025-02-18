// components/ChessboardPreview.tsx

import { useEffect, useRef } from "react";
import Chessboard from "react-chessboard"; // You can use a chessboard component like react-chessboard

interface ChessboardPreviewProps {
  game: any; // Chess game state
  onMove: (move: string) => void; // Function to handle moves
}

export const ChessboardPreview = ({ game, onMove }: ChessboardPreviewProps) => {
  const chessboardRef = useRef(null);

  useEffect(() => {
    if (chessboardRef.current) {
      // You can use chessboard.js or any other library to render the board
      // Make sure to render the chessboard here with pieces and logic
    }
  }, [game]);

  const handleMove = (from: string, to: string) => {
    const move = { from, to };
    // Call the onMove prop to handle the move
    onMove(move);
  };

  return (
    <div ref={chessboardRef}>
      <Chessboard
        position={game ? game.fen() : "start"}
        onDrop={handleMove} // Handle piece drop
        renderSquare={(square) => <div>{square}</div>} // Custom square renderer
      />
    </div>
  );
};
