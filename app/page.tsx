"use client"
import LinkPopup from '@/components/LinkPopup';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MdOutlineLocationOn } from "react-icons/md";
import { TbLocation } from "react-icons/tb";
import { useSession, signIn, signOut } from 'next-auth/react'; 
import { useRouter } from 'next/navigation'; 

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {

  const { data: session, status } = useSession(); 
  const isLoading = status === 'loading';
  const router = useRouter(); 

  const handleSignup = () => {
    router.push('/signup'); 
  };

  const [flyKey, setFlyKey] = useState(0);
  const [share, setShare] = useState(false);

  function handleLocate() {
    setFlyKey(prev => prev + 1);
  }

  async function handleShare(){
    if (!session) {
      signIn(); 
      return; 
    }
  
    setShare(prev => !prev)
  }

  const renderAuthButton = () => {
    if (isLoading) {
      return <p className='px-4 py-2 rounded-xl bg-white text-xl border'>Loading...</p>;
    }

    if (session) {
      return (
        <div className='flex items-center gap-2 text-sm'>
            <p className='px-4 py-2 rounded-xl bg-white text-xl underline'>
              {session.user?.name || "User"}
            </p>
            <button 
                onClick={() => signOut()}
                className='px-4 py-2 rounded-xl text-black border hover:bg-red-500 hover:text-white'
            >
                Logout
            </button>
        </div>
      );
    }
  
    return (
        <button 
            onClick={handleSignup} 
            className='px-4 py-2 rounded-xl bg-white text-xl border'
        >
            Signup
        </button>
    );
  };


  return (
    <>
    <div className='h-screen w-full flex-center flex-col realtive bg-white md:px-8 px-2 md:pb-8 pb-4 '>
      {
        share && <LinkPopup/>
      }
      <div className='w-full sm:px-4 text-black text-4xl font-light py-2 flex justify-between items-center'>
        <p>TrackO</p>
        <div className='flex gap-2 justify-center items-center'>
          {renderAuthButton()}
          <MdOutlineLocationOn />
        </div>
      </div>
      <Map flyKey={flyKey} />
      <div className='w-full h-20 flex-center md:gap-20 gap-2 fixed bottom-10 z-[999]'>
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
            {share ? ( "Cancel  X" ) : ( <> Create Room <TbLocation /> </> ) }
        </button>
      </div>
    </div>
    </>
  )
}