"use client";
import { useState } from "react";

export default function Auth() {
  const [isLogin, setLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(null)

  async function handleAuth() {

    try {
      const response = await fetch(
        `/api/auth/${isLogin ? "login" : "signup"}/`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();
      setMessage(result.message || "No message returned");
      setSuccess(result.success)

      console.log("Status:", result.status);
      console.log("Result:", result);
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong");
    }
  }

  return (
    <div className="bg-black h-screen w-full flex-center">
      <div className="w-[70%] h-[40rem] border border-white">
        <div className="w-full h-full flex bg-[#323233]">
          <div className="h-full w-[50%] flex justify-center items-center flex-col p-8 gap-8">
            <p className="text-white text-5xl font-extralight">
              {isLogin ? "Login" : "Create Account"}
            </p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" w-full h-12 p-2 border border-white text-white"
              type="text"
              placeholder="Email"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=" w-full h-12 p-2 border border-white text-white"
              type="password"
              placeholder="Password"
            />
            <button
              onClick={handleAuth}
              className="text-white hover:bg-black border border-white p-2 w-full h-12"
            >
              {isLogin ? "Login" : "Create Account"}
            </button>
            <button
              onClick={() => setLogin(!isLogin)}
              className="text-white w-full text-center"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Login"}
            </button>
            {
              success && <p className="text-white text-center w-full">{message}</p>
            }
          </div>
          <div className="h-full w-[50%]">
            <img src="/Piano.png" className="h-full w-full" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
