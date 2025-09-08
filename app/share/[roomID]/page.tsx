"use client"
import dynamic from 'next/dynamic';
import { useState } from 'react';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default async function Room({params}:{params:String}) {

  const roomId = (await params).roomID

  const [flyKey, setFlyKey] = useState(0);

  function handleLocate() {
    setFlyKey(prev => prev + 1);
  }

  return (
    
  )
}
