import React, { useState } from "react";
import Join from "./components/Join";
import Game from "./components/Game";
import socket from "./socket";

const App = () => {
  const [player, setPlayer] = useState(null);

  const handleJoin = (name, room) => {
    setPlayer({ name, room });
    socket.emit("join_room", { name, room });
  };


  const handleLeave = () => {
    setPlayer(null);
  };

  return (
    <div className="App">
      {!player ? (
        <Join onJoin={handleJoin} />
      ) : (
        <Game player={player} onLeave={handleLeave} />
      )}
    </div>
  );
};

export default App;