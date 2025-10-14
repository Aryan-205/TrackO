"use client"
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MdOutlineLocationOn } from 'react-icons/md';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Room() {

  const router = useRouter()
  const {data:session, status} = useSession()

  const userId = (session?.user as any)?.id
  
  const params = useParams();
  const currentRoomId = params.id;
  
  const [flyKey, setFlyKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false)
  const [share, setShare] = useState(false);
  const [accessKey, setAccessKey] = useState(false)
  const [accessKeyGranted, setAccessKeyGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentRoomId && userId) {
      const fetchRoomDetails = async () => {
        try {
          const res = await fetch(`/api/room/${currentRoomId}`);
          if (!res.ok) throw new Error('Failed to fetch room details');

          const roomData = await res.json();
          setAccessKey(roomData.accessKey);

          const userIsAdmin = roomData.adminId === Number(userId);
          setIsAdmin(userIsAdmin);

          if (userIsAdmin) {
            setAccessKeyGranted(true);
          }

        } catch (error) {
          console.error('Error fetching room:', error);
          router.push('/'); // Redirect on error
        } finally {
          setIsLoading(false);
        }
      };

      fetchRoomDetails();
    } else if (status === 'unauthenticated') {
        // Handle unauthenticated user if necessary, e.g., redirect to login
        setIsLoading(false);
    }
  }, [currentRoomId, session, status, router]);
  
  function handleExit(){
    router.push("/")
  }

  function AccessPopup(){
  
  
    function requestPermission() {
      const ws = new WebSocket("ws://localhost:8080");
  
      ws.onopen = () => {
        ws.send(JSON.stringify({
          action: 'JOIN_ROOM',
          roomId: currentRoomId, 
          accessKey: null,       
          isCreator: false,
          // Include user ID to identify the requester to the admin
          requesterId: userId,
          requesterName: session?.user?.name
        }));
      };
  
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
  
        if (data.action === 'ACCESS_DENIED') {
          alert("Access denied by admin");
        }
  
        if (data.action === 'JOIN_SUCCESS') {
          alert("Access granted!");
          setAccessKeyGranted(true); 
        }
  
        if (data.action === 'MEMBER_JOINED') {
          console.log("A member joined:", data.memberId);
        }
      };
    }
  
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
              Request
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

  if (isLoading) return <div>Loading room details...</div>;

  return (
    <>
    <div className='h-screen w-full flex-center flex-col relative bg-white md:px-8 px-2 md:pb-8 pb-4 '>
      {
        !accessKeyGranted && <AccessPopup/> 
      }
      <div className='w-full sm:px-4 text-black text-4xl font-light py-2 flex justify-between items-center'>
        <p>TrackO</p>
        <div className='flex-center gap-2'>
          <MdOutlineLocationOn />
          <p className='text-black'>{currentRoomId?.toString()}</p>
        </div>
      </div>
      <Map flyKey={flyKey} />
      <div className='w-full h-20 flex-center md:gap-20 gap-8 fixed bottom-10 z-[999]'>
        <button 
          onClick={handleLocate} 
          className='text-black font-extralight gap-4 shadow-2xl md:text-2xl text-lg bg-white px-8 py-2 rounded-xl flex-center hover:text-white hover:border-white border hover:bg-white/30 active:bg-white active:text-black'
          >
            Locate <img src="/location2.png" className='md:w-8 w-4 md:h-8 h-4' alt="" />
        </button>
        <button 
          onClick={handleShare}
          className='text-black font-extralight gap-4 shadow-2xl md:text-2xl text-lg bg-white px-8 py-2 rounded-xl flex-center hover:text-white hover:border-white border hover:bg-white/30 active:bg-white active:text-black'
          >
            {share ? ( "Copied" ) : ( <> <p>Share Link</p> <img src="/send.png" className="md:w-8 w-4 md:h-8 h-4" alt="" /> </> ) }
        </button>
      </div>
    </div>
    </>
  )
}
