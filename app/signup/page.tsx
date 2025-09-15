"use client"
import { useState } from "react";

export default async function Signup(){

  
  const [isLogin, setLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(null)

  try {
    const response = await fetch(
      `/api/auth/signup/`,
      {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
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

  return (
    <div className="flex-center h-screen w-full bg-black">
      <div className="w-[60%] h-[80%] flex-center bg-white/90 p-4 rounded-3xl">
        <div className="w-full h-full p-8 rounded-l-2xl border-2 flex-center flex-col gap-8">
          <p className="text-4xl font-semibold">Create Account</p>
          <div className="w-full grid gap-4">
            <div className="w-full">
              <p>Name</p>
              <input value={name} onChange={(e)=>setName(e.target.value)} type="text" className="rounded-xl border w-full h-12 px-4" placeholder="Enter Full Name" />
            </div>
            <div className="w-full">
              <p>Email</p>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} type="text" className="rounded-xl border w-full h-12 px-4" placeholder="Enter Email" />
            </div>
            <div className="w-full">
              <p>Password</p>
              <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="rounded-xl border w-full h-12 px-4" placeholder="Enter password" />
            </div>
            <button className="w-full h-12 border rounded-xl text-white bg-black hover:bg-white hover:text-black">Signup</button>
            <button
              onClick={() => setLogin(!isLogin)}
              className="text-black w-full text-center"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Login"}
            </button>
            {
              success && <p className="text-white text-center w-full">{message}</p>
            }
          </div>
        </div>
        <div className="h-full w-full">
          <img src="Piano.png" className="object-fill rounded-r-2xl w-full h-full" alt="" />
        </div>
      </div>
    </div>
  )
}