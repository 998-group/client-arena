import React, { useState } from "react";
import Join from "./components/Join";
import Game from "./components/Game";

const App = () => {
  const [player, setPlayer] = useState(null);

  const handleJoin = (name, room) => {
    setPlayer({ name, room });
  };

  return (
    <div className="App">
      {!player ? (
        <Join onJoin={handleJoin} />
      ) : (
        <Game player={player} />
      )}
    </div>
  );
};

export default App;
