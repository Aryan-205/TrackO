import { useCallback } from "react";

// Add this interface above the Room component, or in a separate types file
interface AdminPopupProps {
    ws: WebSocket | null;
    currentRoomId: string | undefined;
    pendingRequest: { id: string, name: string } | null;
    setNewRequest: React.Dispatch<React.SetStateAction<boolean>>;
    setPendingRequest: React.Dispatch<React.SetStateAction<{ id: string, name: string } | null>>;
}

// 🚀 MOVE THIS FUNCTION OUTSIDE of the 'export default function Room() {' block
export default function AdminPopup({ 
    ws, 
    currentRoomId, 
    pendingRequest, 
    setNewRequest, 
    setPendingRequest 
}: AdminPopupProps) {
    
    const guestId = pendingRequest?.id;
    const guestName = pendingRequest?.name;

    if (!guestId) return null; // Conditional return is fine here

    // Now useCallback is called unconditionally within this component
    const accessApproved = useCallback(() => {
      if (!ws) {
          alert("Connection not established. Please try refreshing.");
          return;
      }
      ws.send(JSON.stringify({ 
          action: 'ADMIN_RESPONSE', 
          approved: true, 
          roomId: currentRoomId, 
          targetId: guestId 
      }));
      setNewRequest(false);
      setPendingRequest(null); 
    }, [ws, guestId, currentRoomId, setNewRequest, setPendingRequest]); // Added setters to dependencies

    const accessDenied = useCallback(() => {
      if (!ws) {
          alert("Connection not established. Please try refreshing.");
          return;
      }
      ws.send(JSON.stringify({ 
          action: 'ADMIN_RESPONSE', 
          approved: false, 
          roomId: currentRoomId, 
          targetId: guestId 
      }));
      setNewRequest(false);
      setPendingRequest(null);
    }, [ws, guestId, currentRoomId, setNewRequest, setPendingRequest]); // Added setters to dependencies

    return (
      <div className='fixed z-[999] top-18 right-12 bg-white rounded-xl p-8 border text-center flex flex-col gap-2 shadow-2xl'>
        <p className='font-semibold text-lg'>{guestName || guestId}</p>
        <p>requests to join the room</p>
        <div className='flex gap-4 w-full'>
          <button onClick={accessApproved} className='border px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition'>Accept</button>
          <button onClick={accessDenied} className='border px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition'>Decline</button>
        </div>
      </div>
    )
}

// ... rest of the file starts here (export default function Room() { ... } )