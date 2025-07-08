import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getToken, removeToken } from "../utils/auth";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ChatBubble({ sender, text }) {
  const isUser = sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-5`}>
      <div
        className={`p-3 max-w-2xl text-sm shadow-md rounded-xl break-words font-medium whitespace-pre-wrap transition-all duration-300 ${
          isUser ? "bg-[#21262D] text-[#C9D1D9] rounded-br-none" : "bg-[#21262D] text-[#C9D1D9] rounded-bl-none"
        }`}>
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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    const initializeChat = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const sessionData = await fetchChats();
        const savedChatId = sessionStorage.getItem("currentChatId");

        if (sessionData.length > 0) {
          const finalChatId = savedChatId || sessionData[0]._id;
          sessionStorage.setItem("currentChatId", finalChatId);
          await loadChat(finalChatId);
        } else {
          await createNewChat();
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats`,
        { headers: getAuthHeaders() }
      );
      const data = Array.isArray(res.data) ? res.data : res.data.chats || [];
      setChatSessions(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch chats:", err.response?.data || err.message);
      setChatSessions([]);
      return [];
    }
  };

  const loadChat = async (id) => {
    if (!id) return;
    debugger;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${id}`,
        { headers: getAuthHeaders() }
      );
      const data = res.data;
      setChatId(data._id);
      setMessages(data.messages || []);
      sessionStorage.setItem("currentChatId", data._id);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats`,
        { title: "New Chat" },
        { headers: getAuthHeaders() }
      );
      const data = res.data;
      setChatId(data._id);
      setMessages([]);
      sessionStorage.setItem("currentChatId", data._id);
      await fetchChats();
      return data._id;
    } catch (err) {
      console.error("Error creating chat:", err.response?.data || err.message);
      return null;
    }
  };

  const deleteChat = async (id) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${id}`,
        { headers: getAuthHeaders() }
      );
      if (chatId === id) {
        setChatId(null);
        setMessages([]);
        sessionStorage.removeItem("currentChatId");
      }
      await fetchChats();
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let currentChatId = chatId;

    // Create chat if it doesn't exist
    if (!currentChatId) {
      const newId = await createNewChat();
      if (!newId) return;
      currentChatId = newId;
    }
    debugger;
    const userMessage = { role: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    // Set chat title on first message
    if (updatedMessages.length === 1) {
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${currentChatId}`,
          { title: input.slice(0, 30) },
          { headers: getAuthHeaders() }
        );
      } catch (err) {
        console.error("Failed to update chat title:", err);
      }
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
        { message: input, chatId: currentChatId },
        { headers: getAuthHeaders() }
      );

      const botReply = res.data.reply || "No reply.";
      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);

      await fetchChats();
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="min-h-screen flex bg-[#0D1117] text-[#C9D1D9] font-sans">
        <div className="w-64 bg-[#161B22] p-4 border-r border-gray-700 flex flex-col justify-between">
          <div>
            {/* <h2 className="text-cyan-400 font-bold text-lg mb-4">Chats</h2> */}
            <button
              onClick={createNewChat}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-1 mb-4 rounded"
            >
              + New Chat
            </button>
            <ul className="space-y-2">
              {chatSessions.map((chat) => (
                <li
                  key={chat._id}
                  className={`flex justify-between items-center p-2 rounded hover:bg-[#21262D] ${
                    chat._id === chatId ? "bg-[#21262D] font-bold text-cyan-400" : ""
                  }`}
                >
                  <span
                    className="cursor-pointer flex-1"
                    onClick={() => loadChat(chat._id)}
                  >
                    {chat.title}
                  </span>
                  <button
                    onClick={() => deleteChat(chat._id)}
                    className="text-red-500 ml-2 text-sm"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => {
              removeToken();
              router.push("/login");
              sessionStorage.removeItem("currentChatId");
            }}
            className="bg-red-600 text-white text-sm px-4 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-2">
          <div className="w-full max-w-6xl bg-[#161B22] rounded-xl shadow-lg p-4">
            <h1 className="text-2xl font-bold text-cyan-400 text-center mb-4"> AI ChatBot</h1>
            <div className="h-[32rem] overflow-y-auto space-y-3 space-x-3 mb-4">
              {messages.map((msg, i) => (
                <ChatBubble key={i} sender={msg.role} text={msg.text} />
              ))}
              {isLoading && (
                <p className="text-sm text-cyan-500">Thinking...</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex">
              <input
                className="flex-1 p-2 bg-[#0D1117] text-white border border-gray-700 rounded-l-lg focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type something..."
              />
              <button
                onClick={handleSend}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 rounded-r-lg"
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
