import React, { useEffect, useState } from "react";
import socket from "../socket"; // socket.js faylidan socketni import qilish

const Game = ({ player }) => {
  const [players, setPlayers] = useState({});
  const [bulletDirection, setBulletDirection] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Personage ning pozitsiyasi va harakatini boshqarish
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hp, setHp] = useState(100);

  useEffect(() => {
    socket.on("player_positions", (positions) => {
      setPlayers(positions);
    });

    socket.on("player_dead", (id) => {
      setPlayers((prevPlayers) => {
        const newPlayers = { ...prevPlayers };
        delete newPlayers[id];
        return newPlayers;
      });
      setGameOver(true);
    });

    socket.on("leaderboard_update", (players) => {
      setLeaderboard(
        Object.entries(players).map(([id, { score, name }]) => ({
          id,
          name,
          score,
        }))
      );
    });

    return () => {
      socket.off("player_positions");
      socket.off("player_dead");
      socket.off("leaderboard_update");
    };
  }, []);

  // W, A, S, D tugmalarini bosganda harakat qilish
  const handleKeyDown = (e) => {
    const step = 5;
    if (gameOver) return;

    if (e.key === "w") setPosition((prev) => ({ ...prev, y: prev.y - step }));
    if (e.key === "s") setPosition((prev) => ({ ...prev, y: prev.y + step }));
    if (e.key === "a") setPosition((prev) => ({ ...prev, x: prev.x - step }));
    if (e.key === "d") setPosition((prev) => ({ ...prev, x: prev.x + step }));
  };

  // Mouse xohishlariga qarab o'q otish
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Space tugmasi bosilganda o'qni otish
  const handleSpaceKey = (e) => {
    if (e.code === "Space" && player) {
      const direction = { x: mousePos.x - position.x, y: mousePos.y - position.y };
      setBulletDirection(direction);
      socket.emit("fire", { direction, room: player.room });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleSpaceKey);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleSpaceKey);
    };
  }, [mousePos, position, player]);

  // Leaderboardni ko'rsatish
  const renderLeaderboard = () => {
    return leaderboard.map(({ id, name, score }) => (
      <div key={id} className="flex justify-between p-2 border-b">
        <div>{name}</div>
        <div>{score}</div>
      </div>
    ));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 relative">
      {gameOver ? (
        <div className="card bg-red-800 p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Game Over</h2>
          <button
            onClick={() => setGameOver(false)}
            className="btn btn-success w-full"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4">{player.name}'s Game</h1>

          {/* Players */}
          <div className="space-y-4 mb-6">
            {Object.entries(players).map(([id, { name, x, y, hp }]) => (
              <div key={id} className="card bg-gray-700 p-4 rounded-xl shadow-xl w-80">
                <div className="flex justify-between">
                  <span className="font-semibold">{name}</span>
                  <span>HP: {hp}</span>
                </div>
                <div>Position: ({x.toFixed(1)}, {y.toFixed(1)})</div>
              </div>
            ))}
          </div>

          {/* Game Actions */}
          <div className="flex justify-center">
            <button
              onClick={() => socket.emit("disconnect")}
              className="btn btn-warning mb-4"
            >
              Leave Room
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard fixed right */}
      <div className="fixed right-0 top-0 w-64 bg-gray-800 text-white p-4 rounded-l-xl shadow-xl h-full overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
        <div className="space-y-2">{renderLeaderboard()}</div>
      </div>
    </div>
  );
};

export default Game;
