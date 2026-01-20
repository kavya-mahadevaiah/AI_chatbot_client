import { useState, useRef, useEffect } from "react";
import { getToken, removeToken } from "../utils/auth";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/api";

function ChatBubble({ sender, text }) {
  const isUser = sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-5`}>
      <div
        className={`p-3 max-w-2xl text-sm shadow-md rounded-xl break-words font-medium whitespace-pre-wrap transition-all duration-300 ${
          isUser
            ? "bg-[#21262D] text-[#C9D1D9] rounded-br-none"
            : "bg-[#21262D] text-[#C9D1D9] rounded-bl-none"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [isBusy, setIsBusy] = useState(false); // disable controls
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) router.push("/login");
  }, [router]);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const sessions = await fetchChats();
        const savedId = sessionStorage.getItem("currentChatId");

        if (sessions.length > 0) {
          const initialId =
            savedId && sessions.find((s) => s._id === savedId)
              ? savedId
              : sessions[0]._id;
          sessionStorage.setItem("currentChatId", initialId);
          await loadChat(initialId);
        } else {
          const newId = await createNewChat("New Chat");
          if (newId) await loadChat(newId);
        }
      } catch (e) {
        console.error("Failed to initialize chat:", e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  // ---- helpers ----
  const fetchChats = async () => {
    try {
      const res = await api.get("/api/chats");
      const data = Array.isArray(res.data) ? res.data : res.data.chats || [];
      setChatSessions(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch chats:", err?.response?.data || err?.message);
      setChatSessions([]);
      return [];
    }
  };

  const loadChat = async (id) => {
    if (!id || isBusy) return;
    try {
      const res = await api.get(`/api/chats/${id}`);
      const data = res.data;
      setChatId(data._id);
      setMessages(data.messages || []);
      sessionStorage.setItem("currentChatId", data._id);
    } catch (err) {
      console.error("Failed to load chat:", err?.response?.data || err?.message);
    }
  };

  const createNewChat = async (title = "New Chat") => {
    if (isBusy) return null;
    try {
      const res = await api.post("/api/chats", { title });
      const data = res.data;
      setChatId(data._id);
      setMessages([]);
      sessionStorage.setItem("currentChatId", data._id);
      await fetchChats();
      return data._id;
    } catch (err) {
      console.error("Error creating chat:", err?.response?.data || err?.message);
      toast.error("Could not create chat.");
      return null;
    }
  };

  const deleteChat = async (id) => {
    if (isBusy) return;
    try {
      await api.delete(`/api/chats/${id}`);
      setChatSessions((list) => list.filter((c) => c._id !== id));

      if (chatId === id) {
        sessionStorage.removeItem("currentChatId");
        setMessages([]);
        setChatId(null);

        const updated = await fetchChats();
        if (updated.length > 0) {
          const nextId = updated[0]._id;
          sessionStorage.setItem("currentChatId", nextId);
          await loadChat(nextId);
        } else {
          const newId = await createNewChat("New Chat");
          if (newId) await loadChat(newId);
        }
      } else {
        await fetchChats();
      }
    } catch (err) {
      console.error("Failed to delete chat:", err?.response?.data || err?.message);
      toast.error("Failed to delete chat.");
    }
  };

  // ---- send ----
  const handleSend = async () => {
    if (isBusy) return;
    const text = input.trim();
    if (!text) return;

    let id = chatId;
    if (!id) {
      const newId = await createNewChat(text.slice(0, 30) || "New Chat");
      if (!newId) return;
      id = newId;
    }

    const wasEmpty = messages.length === 0;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      setIsBusy(true);

      if (wasEmpty) {
        try {
          await api.put(`/api/chats/${id}`, {
            title: text.slice(0, 30) || "Untitled Chat",
          });
        } catch {}
      }

      const res = await api.post("/api/chat", { chatId: id, message: text });
      const botReply = res?.data?.reply || "No reply.";
      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch () {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      try {
        await fetchChats();
      } catch {}
      setIsBusy(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="min-h-screen flex bg-[#0D1117] text-[#C9D1D9] font-sans">
        {/* Sidebar */}
        <div className="w-64 bg-[#161B22] p-4 border-r border-gray-700 flex flex-col justify-between">
          <div>
            <button
              onClick={() => createNewChat("New Chat")}
              className={`w-full text-white py-1 mb-4 rounded ${
                isBusy ? "bg-cyan-600/50 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
              }`}
              disabled={isBusy}
            >
              + New Chat
            </button>
            <ul className="space-y-2">
              {chatSessions.map((chat) => (
                <li
                  key={chat._id}
                  className={`flex justify-between items-center p-2 rounded ${
                    chat._id === chatId
                      ? "bg-[#21262D] font-bold text-cyan-400"
                      : "hover:bg-[#21262D]"
                  } ${isBusy ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`flex-1 ${isBusy ? "pointer-events-none" : "cursor-pointer"}`}
                    onClick={() => !isBusy && loadChat(chat._id)}
                  >
                    {chat.title}
                  </span>
                  <button
                    onClick={() => !isBusy && deleteChat(chat._id)}
                    className={`ml-2 text-sm ${
                      isBusy ? "text-red-500/50 cursor-not-allowed" : "text-red-500"
                    }`}
                    disabled={isBusy}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              if (isBusy) return;
              removeToken();
              router.push("/login");
              sessionStorage.removeItem("currentChatId");
            }}
            className={`text-white text-sm px-4 py-1 rounded ${
              isBusy ? "bg-red-600/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={isBusy}
          >
            Logout
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex items-center justify-center p-2">
          <div className="w-full max-w-6xl bg-[#161B22] rounded-xl shadow-lg p-4">
            <h1 className="text-2xl font-bold text-cyan-400 text-center mb-4">
              AI ChatBot
            </h1>

            <div className="h-[32rem] overflow-y-auto space-y-3 mb-4">
              {messages.map((msg, i) => (
                <ChatBubble key={i} sender={msg.role} text={msg.text} />
              ))}
              {isBusy && (
                <p className="text-sm text-cyan-500 px-5">Thinking...</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex">
              <input
                className={`flex-1 p-2 bg-[#0D1117] text-white border border-gray-700 rounded-l-lg focus:outline-none ${
                  isBusy ? "opacity-60 cursor-not-allowed" : ""
                }`}
                value={input}
                onChange={(e) => !isBusy && setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isBusy && handleSend()}
                placeholder={isBusy ? "Please wait..." : "Type something..."}
                disabled={isBusy}
              />
              <button
                onClick={handleSend}
                className={`px-4 rounded-r-lg text-white ${
                  isBusy
                    ? "bg-cyan-600/50 cursor-not-allowed"
                    : "bg-cyan-600 hover:bg-cyan-700"
                }`}
                disabled={isBusy}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
