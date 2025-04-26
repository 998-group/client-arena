import React, { useState } from "react";
import Join from "./components/Join";
import Game from "./components/Game";

const App = () => {
  const [player, setPlayer] = useState(null);

  const handleJoin = (name, room) => {
    setPlayer({ name, room });
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