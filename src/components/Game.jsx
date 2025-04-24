import { useEffect, useState } from "react";
import socket from "../socket";

const speed = 5;

export default function Game({ player }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [others, setOthers] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      let newX = position.x;
      let newY = position.y;

      if (e.key === "w") newY -= speed;
      if (e.key === "s") newY += speed;
      if (e.key === "a") newX -= speed;
      if (e.key === "d") newX += speed;

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

  return (
    <div className="w-screen h-screen bg-base-200 relative overflow-hidden">
      <div
        className="absolute w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center"
        style={{ left: position.x, top: position.y }}
      >
        🧍
      </div>

      {Object.entries(others).map(([id, pos]) => (
        <div
          key={id}
          className="absolute w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center"
          style={{ left: pos.x, top: pos.y }}
        >
          👾
        </div>
      ))}
    </div>
  );
}
