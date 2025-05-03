import { io } from "socket.io-client";
const socket = io("http://192.168.80.128:3001");
export default socket;
