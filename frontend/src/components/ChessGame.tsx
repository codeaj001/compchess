'use client';

import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const ChessGame = () => {
    const [game, setGame] = useState<Chess>(new Chess());

    function makeAMove(move: any) {
        const gameCopy = new Chess(game.fen());
        try {
            const result = gameCopy.move(move);
            if (result === null) return false;
            setGame(gameCopy);
            return true;
        } catch (e) {
            return false;
        }
    }

    function onDrop(sourceSquare: string, targetSquare: string) {
        const move = makeAMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' // always promote to queen for simplicity
        });
        return move;
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h2 className="text-xl font-bold">Chess Game</h2>
            <div style={{ width: 400, height: 400 }}>
                <Chessboard 
                    position={game.fen()} 
                    onPieceDrop={onDrop}
                    boardWidth={400}
                />
            </div>
        </div>
    );
};

export default ChessGame;