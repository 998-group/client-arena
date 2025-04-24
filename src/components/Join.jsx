import { useState } from "react";
import socket from "../socket";

export default function JoinRoom({ setInGame, setPlayer }) {
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");

    const handleJoin = () => {
        if (name && room) {
            socket.emit("join_room", { name, room });
            setPlayer({ name, room });
            setInGame(true);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl mb-4">Battle Arena</h1>
            <input placeholder="Ismingiz" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Xona ID" value={room} onChange={e => setRoom(e.target.value)} />
            <button onClick={handleJoin}>Kirish</button>
        </div>
    );
}
