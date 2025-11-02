"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sender] = useState("user_" + Math.floor(Math.random() * 1000));

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected to Gateway");
    });

    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send_message", {
      room_id: "general",
      sender,
      content: input,
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto p-4">
      <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`my-1 ${msg.sender === sender ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block px-3 py-2 rounded-2xl ${
                msg.sender === sender ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
              }`}
            >
              <strong>{msg.sender}: </strong>
              {msg.content}
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
