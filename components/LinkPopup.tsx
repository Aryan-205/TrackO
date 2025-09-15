"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LinkPopup() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createRoom() {
    const adminId = null
    if (!roomName || !adminId) return;

    setLoading(true);

    const response = await fetch("/api/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, adminId })
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      router.push(data.link);
    } else {
      alert(data.message || "Error creating room");
    }
  }

  return (
    <div className="w-full h-screen absolute flex-center z-[999] bg-white/10">
      <div className="md:w-[20%] w-[60%] bg-white rounded-2xl p-4 flex-center gap-2 flex-col relative">
        <p>Room Name</p>
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          type="text"
          placeholder="Enter Room Name"
          className="w-full border rounded-xl p-2"
        />
        <button
          onClick={createRoom}
          disabled={loading}
          className="border p-2 w-full rounded-xl"
        >
          {loading ? "Creating..." : "Share"}
        </button>
      </div>
    </div>
  );
}