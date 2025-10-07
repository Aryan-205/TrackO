"use client";

import { ReactEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Signin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false); 

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true); 

    const result = await signIn("credentials", {
      redirect: false, 
      email,
      password,
    });

    setLoading(false); 


    if (result && result.error) {

      setError("Invalid email or password. Please try again.");
      console.log(result.error)
    } else if (result && result.ok) {

      router.push("/");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen w-full bg-black">
      <div className="md:w-[60%] md:h-[80%] flex justify-center items-center bg-white/90 p-4 rounded-3xl">
        <form
          className="w-full h-full p-8 rounded-2xl md:rounded-l-2xl md:rounded-r-none border-2 flex justify-center items-center flex-col gap-8"
          onSubmit={handleSignin}
        >
          <p className="text-4xl font-semibold">Welcome Back</p>
          <div className="w-full grid gap-4">
            <div className="w-full">
              <p>Email</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="rounded-xl border w-full h-12 px-4"
                placeholder="Enter Email"
                required
              />
            </div>
            <div className="w-full">
              <p>Password</p>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="rounded-xl border w-full h-12 px-4"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 border rounded-xl text-white bg-black hover:bg-white hover:text-black disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="text-gray-500 w-full text-center cursor-pointer"
            >
              Need an account?<span className="text-blue-500"> Sign up</span>
            </button>
            
            {/* THIS IS WHERE ERROR MESSAGES WILL SHOW */}
            {error && (
              <p className="text-red-500 text-center w-full bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
          </div>
        </form>
        <div className="h-full w-full hidden md:flex">
          <img
            src="/Piano.png"
            className="object-fill rounded-r-2xl w-full h-full"
            alt="A piano"
          />
        </div>
      </div>
    </div>
  );
}
