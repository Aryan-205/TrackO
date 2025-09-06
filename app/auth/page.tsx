"use client"
import Signup from "./signup/page"
import Login from "./Login/page"
import { useState } from "react"

export default function Auth(){

  const [isLogin, setLogin] = useState(false)

  return (
    <div className="bg-black h-screen w-full flex-center">
      <div className="w-[70%] h-[40rem] border border-white">
        <div className="w-full h-full flex bg-[#323233]">
          <div className="h-full w-[50%] flex justify-center items-center flex-col p-8 gap-8">
            <p className="text-white text-5xl font-extralight">{isLogin ? "Create Account" : "Login"}</p>
            <input className=" w-full h-12 p-2 border border-white text-white" type="text" placeholder="Email"  />
            <input className=" w-full h-12 p-2 border border-white text-white" type="password" placeholder="Password" />
            <button className="text-white hover:bg-black border border-white p-2 w-full h-12">{isLogin ? "Create Account" : "Login"}</button>
          </div>
          <div className="h-full w-[50%]">
            <img src="/Piano.png" className="h-full w-full" alt="" />
          </div>
        </div>
      </div>
    </div>
  )
}