import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    const user = userId.trim();
    const pass = password.trim();
    const repass = repassword.trim();

    if (!user || !pass || !repass) return;
    if (pass !== repass) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        userId: user,
        password: pass,
      });
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117] text-[#C9D1D9]">
        <div className="w-full max-w-sm bg-[#161B22] p-6 rounded-xl shadow-xl">
          <h2 className="text-3xl font-bold text-cyan-400 text-center mb-6">📝 Register</h2>

          <form onSubmit={handleRegister} className="space-y-4">
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

            <input
              type="password"
              placeholder="Re-enter Password"
              value={repassword}
              onChange={(e) => setRepassword(e.target.value)}
              className="w-full p-2 bg-[#0D1117] text-white border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            />

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded transition"
            >
              Register
            </button>

            {/* FIX: prevent form submit */}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full text-sm text-cyan-400 hover:text-cyan-300 mt-2"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
