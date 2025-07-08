import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { saveToken } from "../utils/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    debugger;
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
        { userId, password }
      );
      saveToken(res.data.token);
      // setTimeout(() => {
        router.push("/chat");
      // }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117] text-[#C9D1D9]">
        <div className="w-full max-w-sm bg-[#161B22] p-6 rounded-xl shadow-xl">
          <h2 className="text-3xl font-bold text-cyan-400 text-center mb-6"> Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 bg-[#0D1117] text-white border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-[#0D1117] text-white border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded transition">
              Login
            </button>
          </form>
          <button onClick={() => {router.push("/register")}}>Create a new account</button>
        </div>
      </div>
    </>
  );
}
