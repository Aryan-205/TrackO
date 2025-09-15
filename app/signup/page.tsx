"use client"
import { useRouter } from "next/navigation"
import { useState } from "react";

export default function Signup(){

  const router = useRouter()

  const [isLogin, setLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(null)

  async function handleSignup(){
    setLogin(!isLogin)

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

    if(success == true) router.push("/signin")
  }


  return (
    <div className="flex-center h-screen w-full bg-black">
      <div className="md:w-[60%] md:h-[80%] flex-center bg-white/90 p-4 rounded-3xl">
        <div className="w-full h-full p-8 rounded-2xl md:rounded-l-2xl md:rounded-r-none border-2 flex-center flex-col gap-8">
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
            <button onClick={handleSignup} className="w-full h-12 border rounded-xl text-white bg-black hover:bg-white hover:text-black">Signup</button>
            <button
              onClick={()=>router.push("/signin")}
              className="text-black w-full text-center"
            >
              Already have an account? Login
            </button>
            {
              !success && <p className="text-red-400 text-center w-full">{message}</p>
            }
          </div>
        </div>
        <div className="h-full w-full hidden md:flex">
          <img src="Piano.png" className="object-fill rounded-r-2xl w-full h-full" alt="" />
        </div>
      </div>
    </div>
  )
}