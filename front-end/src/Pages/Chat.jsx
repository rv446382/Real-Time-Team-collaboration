import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import axios from "axios";

// ✅ Backend URL from env
const baseURL = import.meta.env.VITE_API_URL;

// ✅ Socket using live backend
const socket = io(baseURL, {
  withCredentials: true,
});

const Chat = ({ projectId, teamId, receiverId }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!user?._id) return;

    // Setup socket
    socket.emit("setup", user._id);

    if (projectId) socket.emit("joinProject", projectId);
    else if (teamId) socket.emit("joinTeam", teamId);

    // Fetch Chat History
    const fetchMessages = async () => {
      try {
        let url = `${baseURL}/api/chat/messages?`;

        if (projectId) url += `projectId=${projectId}`;
        else if (teamId) url += `teamId=${teamId}`;
        else if (receiverId)
          url += `receiverId=${receiverId}&senderId=${user._id}`;

        const res = await axios.get(url, { withCredentials: true });

        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    // Real-time listener
    socket.on("receiveMessage", (receivedData) => {
      const isRelevant =
        (projectId && receivedData.projectId === projectId) ||
        (teamId && receivedData.teamId === teamId) ||
        (receiverId &&
          (receivedData.sender._id === receiverId ||
            receivedData.receiverId === user._id));

      if (isRelevant) {
        setMessages((prev) => [...prev, receivedData]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [projectId, teamId, receiverId, user?._id]);

  const sendMessage = () => {
    if (!user || !newMessage.trim()) return;

    const messageData = {
      projectId,
      teamId,
      receiverId,
      message: newMessage,
      senderId: user._id,
    };

    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  if (!user) return <div className="p-4 text-center">Connecting...</div>;

  return (
    <div className="flex flex-col h-[500px] border rounded-lg shadow-lg bg-white overflow-hidden">
      <div className="p-3 border-b bg-blue-600 text-white flex justify-between items-center">
        <span className="font-bold">
          {projectId
            ? "Project Chat"
            : teamId
              ? "Team Chat"
              : "Direct Message"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => {
          const text = msg.content || msg.message;
          const senderObj = msg.sender || {};
          const isMe = (senderObj._id || senderObj) === user._id;

          return (
            <div
              key={idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${isMe
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border rounded-tl-none"
                  }`}
              >
                {!isMe && (
                  <div className="text-[10px] font-black uppercase mb-1 text-blue-500">
                    {senderObj.name || "User"}
                  </div>
                )}
                <div className="text-sm">{text}</div>
                <div className="text-[9px] mt-1 opacity-60 text-right">
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          placeholder="Write a message..."
          className="flex-1 border rounded-full px-4 py-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;