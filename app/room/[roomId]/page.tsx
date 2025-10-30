"use client"
import AccessPopup from '@/components/AccessPopup';
import AdminPopup from '@/components/AdminPopup';
import RoomMap from '@/components/RoomMap';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MdOutlineLocationOn } from "react-icons/md";
import { TbLocation } from "react-icons/tb";
import { store } from "@/lib/store"

export default function Room() {

  const router = useRouter()
  const { data: session, status } = useSession()

  const userId = useMemo(() => (session?.user)?.id, [session]);
  
  const params = useParams();
  const currentRoomId = params.roomId as string | undefined;
  
  const [roomName, setRoomName] = useState("")
  const [flyKey, setFlyKey] = useState(0);
  const [memberLocations, setMemberLocations] = useState<{ [userId: string]: { lat: number, lng: number, name: string } }>({});

  const [isAdmin, setIsAdmin] = useState(false)
  const [share, setShare] = useState(false);
  const [accessKeyGranted, setAccessKeyGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequest, setNewRequest] = useState(false) 
  const [pendingRequest, setPendingRequest] = useState<{ id: string, name: string } | null>(null);

  const [ws, setWs] = useState<WebSocket | null>(null);

  const setLastUrl = store((state) => state.setLastUrl);

  // Fetch Room Details
  useEffect(() => {
    let userIsAdmin:boolean = false;
    if (status === 'unauthenticated') {
      setLastUrl(window.location.pathname)
      router.push(`/signin`)
      setIsLoading(false);
      return;
    }

    if (currentRoomId && userId) {
      const fetchRoomDetails = async () => {
        try {
          const res = await fetch(`/api/room/?roomId=${currentRoomId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          
          if (!res.ok) {
            throw new Error('Failed to fetch room details');
          }

          const roomData = await res.json();
          setRoomName(roomData.slug);

          userIsAdmin = roomData.adminId === Number(userId);
          setIsAdmin(userIsAdmin);

          if (userIsAdmin) {
            setAccessKeyGranted(true);
          }
          setIsLoading(false)

        } catch (error) {
          console.error('Error fetching room:', error);
          setIsLoading(false);
          router.push('/'); 
        }
      };

      fetchRoomDetails();
    }
  }, [currentRoomId, userId, status, router]);

  // WebSocket Connection and Cleanup
  useEffect(() => {
    if (isLoading || !currentRoomId) return;

    if (ws) return; 

    console.log("Attempting to connect to WebSocket...");
    const newWs = new WebSocket("ws://localhost:8080");

    newWs.onopen = () => {
        console.log("WebSocket connected.");
        setWs(newWs); 

        newWs.send(JSON.stringify({
            action: 'JOIN_ROOM',
            roomId: currentRoomId,  
            isCreator: isAdmin,
            userId,
            requesterName: session?.user?.name
        }));
    };

    newWs.onclose = () => {
        console.log("WebSocket disconnected.");
        setWs(null);
    };

    return () => {
        if (newWs.readyState === WebSocket.OPEN) {
            console.log("WebSocket cleanup: closing connection.");
            newWs.send(JSON.stringify({ 
                action: 'LEAVING_ROOM', 
                roomId: currentRoomId, 
                userId
            }));
            newWs.close();
        }
    };
  }, [isLoading, currentRoomId, userId, isAdmin, session, accessKeyGranted, ws]);

  // WebSocket Message Handling
  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        console.log("WS Message received:", data.action);

        if (data.action === 'ACCESS_DENIED') {
            alert("Access denied by admin");
            router.push('/'); 
        }

        if (data.action === 'JOIN_SUCCESS') {
            setAccessKeyGranted(true); 
        }

        if (data.action === 'MEMBER_JOINED') {
            console.log("A member joined:", data.memberId);
        }

        if (data.action === 'NEW_REQUEST') {
          setNewRequest(true)
          setPendingRequest({ id: data.requesterId, name: data.requesterName });
        }

        // ✅ Handle new server-side messages
        if (data.action === 'ADMIN_DENIED') {
            alert("Admin already exists for this room. You're joining as a guest.");
            setIsAdmin(false);
            setAccessKeyGranted(false);
        }

        if (data.action === 'LOCATION_UPDATE') {
            const { userId, location, requesterName } = data;

            setMemberLocations(prev => ({
                ...prev,
                [userId]: {
                    lat: location.lat,
                    lng: location.lng,
                    name: requesterName || 'Unknown User' // Use requesterName from server or a default
                }
            }));
        }
        
        // 🗑️ Handle member leaving (optional, but recommended for cleanup)
        if (data.action === 'MEMBER_LEFT' || data.action === 'LEAVING_ROOM') {
            const leavingUserId = data.userId;
            setMemberLocations(prev => {
                const newState = { ...prev };
                delete newState[leavingUserId];
                return newState;
            });
        }

        if (data.action === 'REQUEST_QUEUED') {
            alert("Admin is offline. Your request is queued and will be processed when they reconnect.");
        }

        if (data.action === 'ERROR') {
            console.error("Server error:", data.message);
            alert(data.message || "Unexpected server error occurred.");
        }
    };

  }, [ws, accessKeyGranted, router]);

  //Sending location
  useEffect(() => {

      if (!ws || !accessKeyGranted || !currentRoomId) return;

      const sendCurrentLocation = () => {
          navigator.geolocation.getCurrentPosition(
              (position: GeolocationPosition) => {
                  const locationData = {
                      action: 'LOCATION_UPDATE',
                      roomId: currentRoomId,
                      location: {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                      }
                  };
                  ws.send(JSON.stringify(locationData));
              },
              (error) => {
                  console.error("Geolocation Error:", error.message);
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
      };

      const intervalId = setInterval(sendCurrentLocation, 5000);

      return () => {
          clearInterval(intervalId);
      };

  }, [ws, accessKeyGranted, currentRoomId]);

  function handleExit(){
      if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
              action: 'LEAVING_ROOM', 
              roomId: currentRoomId, 
              userId
          })) 
          ws.close();
      }
      router.push("/")
  }

  function handleLocate() {
    setFlyKey(prev => prev + 1);
  }

  async function handleShare() {
    setShare(prev => !prev);

    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.log(err)
    }
  }

  if (isLoading) return <div>Loading room details...</div>;

  return (
    <>
    <div className='h-screen w-full flex-center flex-col relative bg-white md:px-8 px-2 md:pb-8 pb-4 '>
      {
        // 🚀 3. Call the imported component and pass props
        !accessKeyGranted && (
            <AccessPopup
                ws={ws}
                currentRoomId={currentRoomId}
                userId={userId}
                session={session}
                handleExit={handleExit}
            />
        )
      }
      {
        newRequest && (
            <AdminPopup
                ws={ws}
                currentRoomId={currentRoomId}
                pendingRequest={pendingRequest}
                setNewRequest={setNewRequest}
                setPendingRequest={setPendingRequest}
            />
        )
      }
      <div className='w-full sm:px-4 text-black text-4xl font-light py-2 flex justify-between items-center'>
        <p>TrackO</p>
        <div className='flex-center gap-2'>
          <p className='text-black'>{roomName}</p>
          <MdOutlineLocationOn />
        </div>
      </div>
      <RoomMap memberLocations={memberLocations} flyKey={flyKey} />
      <div className='w-full h-20 flex-center md:gap-20 gap-8 fixed bottom-10 z-[999]'>
        <button 
          onClick={handleLocate} 
          className='text-black font-extralight gap-4 shadow-2xl md:text-2xl text-lg bg-white px-8 py-2 rounded-xl flex-center hover:text-white hover:border-white border hover:bg-white/30 active:bg-white active:text-black'
          >
            Locate <MdOutlineLocationOn />
        </button>
        <button 
          onClick={handleShare}
          className='text-black font-extralight gap-4 shadow-2xl md:text-2xl text-lg bg-white px-8 py-2 rounded-xl flex-center hover:text-white hover:border-white border hover:bg-white/30 active:bg-white active:text-black'
          >
            {share ? ( "Copied" ) : ( <> <p>Share Link</p> <TbLocation /> </> ) }
        </button>
      </div>
    </div>
    </>
  )
}