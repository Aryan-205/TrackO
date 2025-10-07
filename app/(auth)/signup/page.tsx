"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false); 

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSuccess(null);
    setLoading(true); 

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      setMessage(result.message || (response.ok ? "Signup successful!" : "Signup failed!"));
      setSuccess(response.ok);
      setLoading(false); 

      if (response.ok) {
        router.push("/signin");
      }
    } catch (error) {
      setMessage("An unexpected error occurred during signup.");
      setSuccess(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen w-full bg-black">
      <div className="md:w-[60%] md:h-[80%] flex justify-center items-center bg-white/90 p-4 rounded-3xl">
        <form
          className="w-full h-full p-8 rounded-2xl md:rounded-l-2xl md:rounded-r-none border-2 flex justify-center items-center flex-col gap-8"
          onSubmit={handleSignup}
        >
          <p className="text-4xl font-semibold">Create Account</p>
          <div className="w-full grid gap-4">
            <div className="w-full">
              <p>Name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="rounded-xl border w-full h-12 px-4"
                placeholder="Enter Name"
                required
              />
            </div>
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
                placeholder="Choose password"
                required
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full h-12 border rounded-xl text-white bg-black hover:bg-white hover:text-black"
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="text-gray-500 w-full text-center cursor-pointer"
            >
              Already have an account?<span className="text-blue-500"> Sign in</span>
            </button>
            {message && (
              <p className={success ? "text-green-600 text-center w-full" : "text-red-400 text-center w-full"}>
                {message}
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
