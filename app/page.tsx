"use client"
import dynamic from 'next/dynamic';
import { useState } from 'react';
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {

  const [flyKey, setFlyKey] = useState(0);

  function handleLocate() {
    setFlyKey(prev => prev + 1);
  }

  return (
    <>
    <div className='h-screen w-full flex-center realtive bg-black'>
      <Map show={true} flyKey={flyKey} />
      <div className='w-full h-20 flex-center fixed bottom-0 z-[999]'>
        <button 
          onClick={handleLocate} 
          className='text-white font-extralight gap-4 shadow-2xl text-2xl bg-[#323233] border border-white px-8 py-2 rounded-3xl flex-center hover:bg-black active:bg-gray-800'
          >
            Locate <img src="/location.png" className='w-8 h-8' alt="" />
        </button>
      </div>
    </div>
    </>
  )
}
