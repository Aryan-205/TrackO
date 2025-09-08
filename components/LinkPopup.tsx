import { prisma } from "@/db/prisma"
import { useState } from "react"

export default function LinkPopup(){

  const [roomName, setRoomName] = useState('')

  return (
    <>
    <div className="w-full h-screen absolute flex-center z-[999] bg-white/10"> 
      <div className="md:w-[20%] w-[60%] bg-white rounded-2xl p-4 flex-center gap-2 flex-col relative">
        <p>Room Name</p>
        <input value={roomName} onChange={(e)=>setRoomName(e.target.value)} type="text" placeholder="Enter Room Name" className="w-full border rounded-xl p-2" name="" id="" />
        <button className="border p-2 w-full rounded-xl">Share</button>
      </div>
    </div>
    </>
  )
}