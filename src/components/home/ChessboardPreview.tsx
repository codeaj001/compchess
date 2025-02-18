export const ChessboardPreview = () => {
  // Simple data structure for chess pieces
  const pieces = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ];

  // Map chess pieces to their corresponding emojis or SVG icons
  const pieceIcons: Record<string, string> = {
    "r": "♜", "n": "♞", "b": "♝", "q": "♛", "k": "♚", "p": "♟",
    "R": "♖", "N": "♘", "B": "♗", "Q": "♕", "K": "♔", "P": "♙"
  };

  return (
    <div className="relative aspect-square bg-gradient-to-br from-chess-gold/20 to-transparent rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-chess-gold/20 to-chess-gold/5 rounded-2xl blur-3xl" />
      <div className="relative glass-panel rounded-2xl p-4 md:p-8">
        <div className="chessboard">
          {pieces.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              // Create each square with alternating colors
              const isDarkSquare = (rowIndex + colIndex) % 2 === 1;
              const pieceStyle = rowIndex === 0 || rowIndex === 1 ? "text-black font-bold" : "text-white font-bold"; // Bold white for bottom pieces, bold black for top pieces
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`chess-square ${isDarkSquare ? "dark-square" : "light-square"}`}
                >
                  <div className="piece">
                    {piece && (
                      <span className={`${pieceStyle} piece-icon`}>
                        {pieceIcons[piece]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
