import React, { useState } from "react";

const Join = ({ onJoin }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const handleJoin = () => {
    if (name.trim() && room.trim()) {
      if (name.length > 20 || room.length > 20) {
        alert("Name and room must be 20 characters or less.");
        return;
      }
      onJoin(name.trim(), room.trim());
    } else {
      alert("Please enter a name and room.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="card bg-gray-800 p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4 text-white">Join the Game</h2>
        <div className="mb-4">
          <label className="block text-white mb-2">Your Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Room</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room name"
            maxLength={20}
          />
        </div>
        <button onClick={handleJoin} className="btn btn-primary w-full">
          Join Game
        </button>
      </div>
    </div>
  );
};

export default Join;