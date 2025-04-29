import React, { useEffect, useState } from "react";
import socket from "../socket";

const Game = ({ player, onLeave }) => {
  const [players, setPlayers] = useState({});
  const [bullets, setBullets] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [position, setPosition] = useState({ x: 400, y: 300 }); // Center of 800x600
  const [hp, setHp] = useState(100);

  useEffect(() => {
    // Socket event listeners
    socket.on("player_positions", (positions) => {
      setPlayers(positions);
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

    socket.on("error", ({ message }) => {
      alert(`Error: ${message}`);
    });

    socket.on("connect_error", () => {
      alert("Failed to connect to server");
    });

    return () => {
      socket.off("player_positions");
      socket.off("player_damaged");
      socket.off("player_dead");
      socket.off("bullet_fired");
      socket.off("leaderboard_update");
      socket.off("error");
      socket.off("connect_error");
    };
  }, []);

  // Handle player movement
  const handleKeyDown = (e) => {
    const step = 5;
    if (gameOver) return;

    let newPosition = { ...position };
    if (e.key === "w" && newPosition.y > 0) newPosition.y -= step;
    if (e.key === "s" && newPosition.y < 600) newPosition.y += step;
    if (e.key === "a" && newPosition.x > 0) newPosition.x -= step;
    if (e.key === "d" && newPosition.x < 800) newPosition.x += step;

    setPosition(newPosition);
    socket.emit("move", { position: newPosition, room: player.room });
  };
  useEffect(() => {
    console.log("PLAYERS: ", players)
  }, [players])
  // Handle mouse movement for aiming
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Handle shooting
  const handleSpaceKey = (e) => {
    if (e.code === "Space" && !gameOver) {
      const direction = {
        x: (mousePos.x - position.x) / 100, // Normalize
        y: (mousePos.y - position.y) / 100,
      };
      socket.emit("fire", { direction, room: player.room });
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleSpaceKey);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleSpaceKey);
    };
  }, [mousePos, position, gameOver]);

  // Update bullet positions
  useEffect(() => {
    const interval = setInterval(() => {
      setBullets((prev) =>
        prev
          .map((bullet) => ({
            ...bullet,
            x: bullet.x + bullet.direction.x * 10,
            y: bullet.y + bullet.direction.y * 10,
          }))
          .filter(
            (bullet) =>
              bullet.x >= 0 &&
              bullet.x <= 800 &&
              bullet.y >= 0 &&
              bullet.y <= 600
          )
      );
    }, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, []);

  // Handle play again
  const handlePlayAgain = () => {
    setGameOver(false);
    setPosition({ x: 400, y: 300 });
    setHp(100);
    socket.emit("join_room", { name: player.name, room: player.room });
  };

  // Render leaderboard
  const renderLeaderboard = () => {
    return leaderboard.map(({ id, name, score }) => (
      <div key={id} className="flex justify-between p-2 border-b">
        <div>{name || "Unknown"}</div>
        <div>{score ?? 0}</div>
      </div>
    ));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 relative">
      {gameOver ? (
        <div className="card bg-red-800 p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Game Over</h2>
          <button
            onClick={handlePlayAgain}
            className="btn btn-success w-full mb-2"
          >
            Play Again
          </button>
          <button onClick={onLeave} className="btn btn-warning w-full">
            Leave Game
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4">{player.name}'s Game</h1>

          {/* Game Area */}
          <div className="relative w-[800px] h-[600px] bg-gray-200 border-2 border-gray-700">
            {/* Players */}
            {Object.entries(players).map(([id, { name, position, hp }]) => (
              <div
                key={id}
                className="absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"
                style={{ left: position.x - 16, top: position.y - 16 }}
              >
                {name[0]}
                <div className="absolute -top-6 text-xs">HP: {hp}</div>
              </div>
            ))}
            {/* Bullets */}
            {bullets.map((bullet, index) => (
              <div
                key={index}
                className="absolute w-4 h-4 bg-red-500 rounded-full"
                style={{ left: bullet.x - 8, top: bullet.y - 8 }}
              />
            ))}
          </div>

          {/* Player Info */}
          <div className="mt-4">
            <div>Your HP: {hp}</div>
            <div>
              Position: ({position.x.toFixed(1)}, {position.y.toFixed(1)})
            </div>
          </div>

          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="btn btn-warning mt-4"
          >
            Leave Game
          </button>
        </div>
      )}

      {/* Leaderboard */}
      <div className="fixed right-0 top-0 w-64 bg-gray-800 text-white p-4 rounded-l-xl shadow-xl h-full overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
        <div className="space-y-2">{renderLeaderboard()}</div>
      </div>
    </div>
  );
};

export default Game;