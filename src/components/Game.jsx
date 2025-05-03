import React, { useEffect, useState } from "react";
import socket from "../socket";
import { IoExitOutline } from "react-icons/io5";

const Game = ({ player, onLeave }) => {
  const [players, setPlayers] = useState({});
  const [bullets, setBullets] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [position, setPosition] = useState({ x: 400, y: 300 }); // Center of 800x600
  const [hp, setHp] = useState(100);
  const [role, setRole] = useState(""); // Store the player's role (Red or Blue)

  useEffect(() => {
    socket.on("player_positions", (positions) => {
      setPlayers(positions);
    });

    socket.on("game_start", () => {
      alert("Game started!");
    });

    socket.on("player_damaged", ({ id, hp }) => {
      if (id === socket.id) setHp(hp);
    });

    socket.on("player_dead", (id) => {
      if (id === socket.id) {
        setGameOver(true);
      }
      setPlayers((prevPlayers) => {
        const newPlayers = { ...prevPlayers };
        delete newPlayers[id];
        return newPlayers;
      });
    });

    socket.on("bullet_fired", ({ id, x, y, direction }) => {
      setBullets((prev) => [...prev, { id, x, y, direction }]);
    });

    socket.on("leaderboard_update", (leaderboardData) => {
      setLeaderboard(
        leaderboardData.map(({ id, name, score }) => ({
          id,
          name,
          score,
        }))
      );
    });

    socket.on("player_joined", ({ role }) => {
      setRole(role);
    });

    socket.on("error", ({ message }) => {
      alert(`Error: ${message}`);
    });

    socket.on("connect_error", () => {
      alert("Failed to connect to server");
    });

    return () => {
      socket.off("player_positions");
      socket.off("game_start");
      socket.off("player_damaged");
      socket.off("player_dead");
      socket.off("bullet_fired");
      socket.off("leaderboard_update");
      socket.off("player_joined");
      socket.off("error");
      socket.off("connect_error");
    };
  }, []);

  // Handle player movement and actions...

  return (
    <div className="bg-gray-900 text-white min-h-screen overflow-hidden flex flex-col items-center relative">
      {gameOver ? (
        <div className="card bg-red-800 p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Game Over</h2>
          <button
            onClick={() => {
              setGameOver(false);
              setPosition({ x: 400, y: 300 });
              setHp(100);
              // Call socket.emit to restart or leave game
            }}
            className="btn btn-success w-full mb-2"
          >
            Play Again
          </button>
          <button onClick={onLeave} className="btn btn-warning w-full">
            Leave Game
          </button>
        </div>
      ) : (
        <div className="flex flex-1 w-full items-center">
          {/* Display Role */}
          <div className="p-4 flex-1 left-0 bg-base-300 h-screen">
            <div className="text-xs font-bold text-center mb-4">{`You are ${role}`}</div>
            {/* Other game elements... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
