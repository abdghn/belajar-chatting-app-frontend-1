"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

interface ChatMessage {
  room_id: string;
  sender: string;
  content: string;
  timestamp?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sender] = useState("user_" + Math.floor(Math.random() * 1000));
  const roomId = "general";

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected to Gateway");
      socket.emit("join_room", { room_id: roomId });
    });

    socket.on("joined_room", (data) => {
      console.log("👥 Joined room:", data.room_id);
    });

    // ✅ Dengerin pesan yang dikirim dari gateway (termasuk browser lain)
    socket.on("chat_message", (msg: ChatMessage) => {
      console.log("💬 Received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Gateway");
    });

    return () => {
      socket.off("connect");
      socket.off("joined_room");
      socket.off("chat_message");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

const sendMessage = () => {
  if (!input.trim()) return;

  const msg: ChatMessage = {
    room_id: roomId,
    sender,
    content: input,
    timestamp: Date.now(),
  };

  // ✅ Kirim ke server aja, biar semua broadcast dari server
  socket.emit("send_message", msg);

  // ❌ Jangan tambah ke state langsung
  setInput("");
};


  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto p-4">
      <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-1 ${msg.sender === sender ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-2xl ${
                msg.sender === sender
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              <strong>{msg.sender}: </strong>
              {msg.content}
              <div className="text-xs opacity-60">
                {new Date(msg.timestamp || 0).toLocaleTimeString()}
              </div>
            </span>
          </div>
        ))}
      </div>

      <div className="flex mt-4">
        <input
          className="flex-1 border rounded-l-lg p-2 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
