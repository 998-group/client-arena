import { useState } from "react";
import JoinRoom from "./components/Join";
import Game from "./components/Game";

function App() {
  const [inGame, setInGame] = useState(false);
  const [player, setPlayer] = useState({ name: "", room: "" });

  return inGame ? (
    <Game player={player} />
  ) : (
    <JoinRoom setInGame={setInGame} setPlayer={setPlayer} />
  );
}

export default App;
