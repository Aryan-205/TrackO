import dynamic from 'next/dynamic';
import { useState } from 'react';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default async function Room({params}:{params:String}) {

  //const roomId = (await params).slug

  const [flyKey, setFlyKey] = useState(0);

  function handleLocate() {
    setFlyKey(prev => prev + 1);
  }

  return (
    <>
    <div className='h-screen w-full flex-center flex-col realtive bg-white md:px-8 px-2 md:pb-8 pb-4 '>
      {/* {
        share && <LinkPopup/>
      } */}
      <div className='w-full sm:px-4 text-black text-2xl font-light py-2 flex justify-between items-center'>
        <p>TrackO</p>
        <img src="/location2.png" className='md:w-8 w-6 md:h-8 h-auto' alt="" />
      </div>
      <Map flyKey={flyKey} />
      <div className='w-full h-20 flex-center md:gap-20 gap-8 fixed bottom-10 z-[999]'>
        <button 
          onClick={handleLocate} 
          className='text-black font-extralight gap-4 shadow-2xl md:text-2xl text-lg bg-white px-8 py-2 rounded-xl flex-center hover:text-white hover:border-white border hover:bg-white/30 active:bg-white active:text-black'
          >
            Locate <img src="/location2.png" className='md:w-8 w-4 md:h-8 h-4' alt="" />
        </button>
      </div>
    </div>
    </>
  )
}
