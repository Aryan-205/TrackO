"use client"
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MdOutlineLocationOn } from "react-icons/md";
import { TbLocation } from "react-icons/tb";
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Room() {

  const router = useRouter()
  const { data: session, status } = useSession()

  const userId = useMemo(() => (session?.user as any)?.id, [session]);
  
  const params = useParams();
  const currentRoomId = params.roomId as string | undefined;
  
  const [roomName, setRoomName] = useState("")
  const [flyKey, setFlyKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false)
  const [share, setShare] = useState(false);
  const [accessKey, setAccessKey] = useState(null) 
  const [accessKeyGranted, setAccessKeyGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequest, setNewRequest] = useState(false) 

  const [ws, setWs] = useState<WebSocket | null>(null);

  let userIsAdmin:boolean = false;

  // Fetch Room Details
  useEffect(() => {
    // Redirect if unauthenticated
    if (status === 'unauthenticated') {
      router.push('/')
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
          setAccessKey(roomData.accessKey);
          setRoomName(roomData.slug);

          userIsAdmin = roomData.adminId === Number(userId);
          setIsAdmin(userIsAdmin);

          if (userIsAdmin) {
            setAccessKeyGranted(true);
          }
          setIsLoading(false)

        } catch (error) {
          console.error('Error fetching room:', error);
          setIsLoading(false); // Stop loading regardless of error
          router.push('/'); 
        }
      };

      fetchRoomDetails();
    }
  }, [currentRoomId, userId, status, router]);

  // WebSocket Connection and Cleanup
  useEffect(() => {
    if (isLoading || !currentRoomId) return;

    // Check if an instance already exists to prevent re-creation
    if (ws) return; 

    console.log("Attempting to connect to WebSocket...");
    const newWs = new WebSocket("ws://localhost:8080");

    newWs.onopen = () => {
        console.log("WebSocket connected.");
        setWs(newWs); 

        newWs.send(JSON.stringify({
            action: 'JOIN_ROOM',
            roomId: currentRoomId, 
            accessKey: userIsAdmin ? accessKey : null, 
            isCreator: isAdmin,
            userId,
            requesterName: session?.user?.name
        }));
    };

    newWs.onclose = () => {
        console.log("WebSocket disconnected.");
        setWs(null);
    };

    // Cleanup function for when the component unmounts
    return () => {
        if (newWs.readyState === WebSocket.OPEN) {
            newWs.close();
        }
    };
  }, [isLoading, currentRoomId, userId, isAdmin, session, accessKeyGranted, ws]);

  // WebSocket Message Handling
  useEffect(() => {
    if (!ws || accessKeyGranted) return; // Only listen if connected and access is NOT granted

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
        }
    };

  }, [ws, accessKeyGranted, router]);

  function handleExit(){
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'LEAVING_ROOM', roomId: currentRoomId, requesterId: userId }))
        ws.close();
    }
    router.push("/")
  }

  function AccessPopup(){ 

    const [request, setRequest] = useState(false)
    
    const requestPermission = useCallback(() => {
      if (!ws) {
          alert("Connection not established. Please try refreshing.");
          return;
      }
      ws.send(JSON.stringify({ action: 'REQUEST_PERMISSION', roomId: currentRoomId, requesterId: userId }));
      
      setRequest(true)
  
    }, [ws]);
  
    return (
      <>
      <div className="w-full h-screen inset-0 fixed flex-center z-[999] bg-white/30">
        <div className="md:w-[20%] w-[60%] bg-white rounded-2xl p-4 flex-center gap-2 flex-col relative">
          <p>Request Permission</p>
          <p>Admin: <span className='text-blue-500'>{session?.user?.name}</span></p>
          <div className='flex justify-around w-full'>
            <button
              onClick={requestPermission}
              className="border px-4 py-2 rounded-xl w-fit hover:bg-black hover:text-white"
              >
              {request ? "Sent" : "Request"}
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
      </>
    )
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

  function AdminPopup(){

    const accessApproved = useCallback(() => {
      if (!ws) {
          alert("Connection not established. Please try refreshing.");
          return;
      }
      ws.send(JSON.stringify({ approved:true, roomId: currentRoomId, requesterId: userId }));
      setNewRequest(false)
    }, [ws]);

    const accessDenied = useCallback(() => {
      if (!ws) {
          alert("Connection not established. Please try refreshing.");
          return;
      }
      ws.send(JSON.stringify({ approved:false, roomId: currentRoomId, requesterId: userId }));
      setNewRequest(false)
    }, [ws]);

    return (
      <div className='fixed z-[999] top-18 right-12 bg-white rounded-xl p-8 border text-center flex flex-col gap-2'>
        <p className='bg-blue-500'>{session?.user?.name || userId}</p>
        <p>requests to join the room</p>
        <div className='flex gap-4 w-full'>
          <button onClick={accessApproved} className='border px-4 py-2 rounded-lg'>Accept</button>
          <button onClick={accessDenied} className='border px-4 py-2 rounded-lg'>Decline</button>
        </div>
      </div>
    )
  }

  if (isLoading) return <div>Loading room details...</div>;

  return (
    <>
    <div className='h-screen w-full flex-center flex-col relative bg-white md:px-8 px-2 md:pb-8 pb-4 '>
      {
        !accessKeyGranted && <AccessPopup/> 
      }
      {
        newRequest && <AdminPopup/>
      }
      <div className='w-full sm:px-4 text-black text-4xl font-light py-2 flex justify-between items-center'>
        <p>TrackO</p>
        <div className='flex-center gap-2'>
          <p className='text-black'>{roomName}</p>
          <MdOutlineLocationOn />
        </div>
      </div>
      <Map flyKey={flyKey} />
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
