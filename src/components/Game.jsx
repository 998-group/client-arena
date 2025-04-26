import { useEffect, useState } from "react";
import socket from "../socket";

const speed = 5;

export default function Game({ player }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [others, setOthers] = useState({});
  const [hp, setHp] = useState(100);

  useEffect(() => {
    const handleKeyDown = (e) => {
      let newX = position.x;
      let newY = position.y;

      if (e.key === "w") newY -= speed;
      if (e.key === "s") newY += speed;
      if (e.key === "a") newX -= speed;
      if (e.key === "d") newX += speed;
      if (e.code === "Space") {
        console.log("ATTACK:")
        socket.emit("attack", { room: player.room });
      }
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      socket.emit("move", { room: player.room, position: newPos });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [position, player.room]);

  useEffect(() => {
    socket.on("player_move", ({ id, position }) => {
      setOthers(prev => ({ ...prev, [id]: position }));
    });

    socket.on("player_left", (id) => {
      setOthers(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    return () => {
      socket.off("player_move");
      socket.off("player_left");
    };
  }, []);

  useEffect(() => {
    socket.on("player_attacked", ({ id }) => {
      // Masalan, boshqa o‘yinchining yaqinida bo‘lsa, zarba beramiz:
      const target = others[id];
      if (target && isNearby(position, target)) {
        socket.emit("damage", { targetId: id, amount: 20 });
      }
    });

    socket.on("player_damaged", ({ id, hp }) => {
      setOthers((prev) => ({
        ...prev,
        [id]: { ...prev[id], hp },
      }));
    });

    socket.on("player_dead", (id) => {
      setOthers((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });
  }, [position, others]);

  function isNearby(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy) < 50;
  }

  return (
    <div className="w-screen h-screen bg-base-200 relative overflow-hidden">
      <div
        className="absolute w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center"
        style={{ left: position.x, top: position.y }}
      >
        🧍
      </div>

      {Object.entries(others).map(([id, data]) => (
        <div
          key={id}
          className="absolute w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center"
          style={{ left: data.x, top: data.y }}
        >
          👾
          <div className="absolute -top-5 text-xs bg-red-500 px-1 rounded">
            <p>{data.name}</p>
            <p>{data.hp || 100} HP</p>
          </div>
        </div>
      ))}
    </div>
  );
}
