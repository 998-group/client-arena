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
        <div className="flex justify-center items-center h-screen">
            <div className="shadow-xl shadow-primary rounded-xl">
                <div className="p-4 flex flex-col gap-1 w-96 border shadow-inner shadow-primary rounded-xl">
                    <h1 className="text-xl mb-4 font-mono text-pretty text-primary text-center tracking-widest font-black">⚔️Battle Arena⚔️</h1>
                    <input className="input input-primary w-full" placeholder="Ismingiz" value={name} onChange={e => setName(e.target.value)} />
                    <input className="input input-primary w-full" placeholder="Xona ID" value={room} onChange={e => setRoom(e.target.value)} />
                    <button onClick={handleJoin} className="btn btn-primary">Kirish</button>
                </div>
            </div>
        </div>
    );
}
