// ./components/AccessPopup.tsx

"use client"
import { useCallback, useState } from 'react';
import { Session } from 'next-auth'; // Import Session type

// Define the required props interface
interface AccessPopupProps {
    ws: WebSocket | null;
    currentRoomId: string | undefined;
    userId: string | undefined;
    session: Session | null;
    handleExit: () => void;
}

export default function AccessPopup({ 
    ws, 
    currentRoomId, 
    userId, 
    session, 
    handleExit 
}: AccessPopupProps) {

    // Hooks are called unconditionally at the top level of this component
    const [requestStatus, setRequestStatus] = useState<"idle" | "sent" | "queued">("idle");

    const requestPermission = useCallback(() => {
      if (!ws) {
          alert("Connection not established. Please try refreshing.");
          return;
      }
      ws.send(JSON.stringify({ 
          action: 'REQUEST_PERMISSION', 
          roomId: currentRoomId, 
          userId, 
          requesterName: session?.user.name 
      }));
      
      setRequestStatus("sent");
    }, [ws, currentRoomId, userId, session?.user.name]);
  
    return (
      <div className="w-full h-screen inset-0 fixed flex-center z-[999] bg-white/30">
        <div className="md:w-[20%] w-[60%] bg-white rounded-2xl p-4 flex-center gap-2 flex-col relative">
          <p>Request Permission</p>
          {/* Note: session.user.name is now type-safe if you added the type declaration file */}
          <p>Admin: <span className='text-blue-500'>{session?.user.name}</span></p> 
          <div className='flex justify-around w-full'>
            <button
              onClick={requestPermission}
              className="border px-4 py-2 rounded-xl w-fit hover:bg-black hover:text-white"
              >
              {requestStatus === "idle" && "Request"}
              {requestStatus === "sent" && "Sent (Waiting for admin)"}
              {requestStatus === "queued" && "Queued (Admin offline)"}
            </button>
            <button
              className="border px-4 py-2 w-fit rounded-xl bg-red-400 hover:bg-red-400/80"
              onClick={handleExit}
              >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
}