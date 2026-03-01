import { io } from "socket.io-client";

const baseURL = import.meta.env.VITE_API_URL;

export const socket = io(baseURL, {
  autoConnect: false,
  withCredentials: true,
});